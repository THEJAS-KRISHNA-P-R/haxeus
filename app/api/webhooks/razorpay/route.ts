import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServerClient } from '@supabase/ssr';
import { completeOrder } from '@/lib/order-completion';
import { sendOrderConfirmationEmail } from '@/lib/email';

// Disable Next.js body parsing — we need raw body for signature verification
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const rawBody = Buffer.from(await req.arrayBuffer());
    const signature = req.headers.get('x-razorpay-signature') ?? '';
    const eventId = req.headers.get('x-razorpay-event-id') ?? '';

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // ── 1. Verify Webhook Signature ───────────────────────────────────────────
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(rawBody)
      .digest('hex');

    if (expected !== signature) {
      console.error('[webhook] Invalid signature', { eventId });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const body = JSON.parse(rawBody.toString());
    const { event, payload } = body;

    // ── 2. Initialize Supabase Admin ────────────────────────────────────────
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [] } }
    );

    // ── 3. Handle Events ─────────────────────────────────────────────────────
    switch (event) {
      case 'payment.captured':
      case 'order.paid': {
        const payment = payload?.payment?.entity;
        const razorpayOrderId = payment?.order_id;
        
        if (!razorpayOrderId) break;

        // Idempotency: Check if this event was already processed
        if (eventId) {
          const { data: existing } = await supabaseAdmin
            .from('orders')
            .select('id')
            .eq('razorpay_event_id', eventId)
            .maybeSingle();

          if (existing) {
            return NextResponse.json({ received: true, note: 'duplicate' });
          }
        }

        // Find the order by razorpay_order_id
        const { data: order, error: orderError } = await supabaseAdmin
          .from('orders')
          .select('id, status, user_id, shipping_email')
          .eq('razorpay_order_id', razorpayOrderId)
          .single();

        if (orderError || !order) {
          console.error('[webhook] Order not found', { razorpayOrderId });
          break;
        }

        // Only complete if still pending (backup to verify route)
        if (order.status === 'pending') {
          const { order: completedOrder } = await completeOrder({
            orderId: order.id,
            razorpayPaymentId: payment.id,
            razorpaySignature: signature,
            supabaseAdmin: supabaseAdmin,
            eventId: eventId,
          });

          // ── B2. Send Guaranteed Order Confirmation Email ───────────────────
          try {
            // Fetch customer email from auth.users via service role
            const { data: { user: authUser } } = await supabaseAdmin.auth.admin.getUserById(payment.notes?.user_id || order.user_id);
            const customerEmail = authUser?.email || payment.email || order.shipping_email;

            if (customerEmail) {
              const emailResult = await sendOrderConfirmationEmail({
                to: customerEmail,
                orderId: order.id,
                displayOrderId: completedOrder.order_number,
                orderItems: (completedOrder.order_items || []).map((i: any) => ({
                  name: i.product?.name || "HAXEUS Piece",
                  size: i.size,
                  quantity: i.quantity,
                  price: i.unit_price,
                })),
                subtotal: completedOrder.subtotal_amount ?? completedOrder.total_amount,
                shipping: completedOrder.shipping_amount ?? 0,
                discount: completedOrder.discount_amount ?? 0,
                total: completedOrder.total_amount,
                shippingAddress: {
                  name: completedOrder.shipping_name,
                  addressLine1: completedOrder.shipping_address?.address_1 || "",
                  city: completedOrder.shipping_address?.city || "",
                  pincode: completedOrder.shipping_address?.pincode || "",
                },
              });

              // Update DB with email send status only on success to prevent overwriting 
              // successful sends from concurrent triggers (Webhook vs Verify route)
              if (emailResult.success) {
                await supabaseAdmin.from('orders').update({
                  confirmation_email_sent: true,
                  confirmation_email_sent_at: new Date().toISOString(),
                  confirmation_email_resend_id: emailResult.id ?? null,
                }).eq('id', order.id);
              } else {
                console.error('[webhook] email failed for order:', order.id, emailResult.error);
              }
            }
          } catch (emailErr) {
            console.error('[webhook] secondary email trigger failed:', emailErr);
          }
        }
        break;
      }

      case 'payment.failed': {
        const payment = payload?.payment?.entity;
        const razorpayOrderId = payment?.order_id;
        
        if (razorpayOrderId) {
          await supabaseAdmin
            .from('orders')
            .update({ 
              status: 'payment_failed',
              razorpay_event_id: eventId 
            })
            .eq('razorpay_order_id', razorpayOrderId)
            .eq('status', 'pending');
        }
        break;
      }

      default:
        // Ignore unhandled events
        break;
    }

    // Always return 200 to prevent retries
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[webhook] Global error:', err);
    // Return 200 even on catch to stop Razorpay retries
    return NextResponse.json({ received: true, error: 'Internal failure processed' });
  }
}
