import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { completeOrder } from '@/lib/order-completion';
import { sendOrderConfirmationEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_db_id } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_db_id) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // ── 1. Authentication ────────────────────────────────────────────────────
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── 2. Verify Razorpay Signature ─────────────────────────────────────────
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    if (expected !== razorpay_signature) {
      console.error('[verify] Signature Mismatch');
      return NextResponse.json({ error: 'INVALID_SIGNATURE' }, { status: 400 });
    }

    // ── 3. Initial Validation ───────────────────────────────────────────────
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, status')
      .eq('id', order_db_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 400 });
    }

    if (order.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (order.status !== 'pending') {
      return NextResponse.json({ success: true, already_confirmed: true });
    }

    // ── 4. Complete Order ────────────────────────────────────────────────────
    // Using service role for the fulfillment actions (stock, coupons, status)
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [] } }
    );

    try {
      const { order: completedOrder } = await completeOrder({
        orderId: order_db_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        supabaseAdmin: supabaseAdmin,
      });

      // ── B3. Redundant Email Trigger ───────────────────────────────────────
      // Check if webhook already sent it (race condition)
      const { data: orderEmailStatus } = await supabaseAdmin
        .from('orders')
        .select('confirmation_email_sent, shipping_email, user_id')
        .eq('id', order_db_id)
        .single();

      if (orderEmailStatus && !orderEmailStatus.confirmation_email_sent) {
        // Fetch customer email from auth.users via service role
        const { data: { user: authUser } } = await supabaseAdmin.auth.admin.getUserById(orderEmailStatus.user_id);
        const customerEmail = authUser?.email || orderEmailStatus.shipping_email;

        if (customerEmail) {
          const emailResult = await sendOrderConfirmationEmail({
            to: customerEmail,
            orderId: order_db_id,
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

          if (emailResult.success) {
            await supabaseAdmin.from('orders').update({
              confirmation_email_sent: true,
              confirmation_email_sent_at: new Date().toISOString(),
              confirmation_email_resend_id: emailResult.id,
            }).eq('id', order_db_id);
          }
        }
      }

      return NextResponse.json({ success: true, order_id: order_db_id });
    } catch (completeErr) {
      console.error('[verify] Completion Logic Failed:', completeErr);
      // Since payment is confirmed by signature, we still return success to the client
      // but ensure this is logged for manual ops.
      return NextResponse.json({ 
        success: true, 
        order_id: order_db_id,
        note: 'Payment verified, but fulfillment needs manual sync.' 
      });
    }

  } catch (err) {
    console.error('[verify] Fatal Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
