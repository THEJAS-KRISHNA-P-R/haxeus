import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServerClient } from '@supabase/ssr';
import { completeOrder } from '@/lib/order-completion';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const rawBody = Buffer.from(await req.arrayBuffer());
    const signature = req.headers.get('x-razorpay-signature') ?? '';
    const eventId = req.headers.get('x-razorpay-event-id') ?? '';

    if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

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

        // Fetch intent for metadata
        const { data: intent, error: intentError } = await supabaseAdmin
          .from('payment_intents')
          .select('*')
          .eq('razorpay_order_id', razorpayOrderId)
          .maybeSingle();

        if (intentError || !intent) {
          console.error('[webhook] Intent logic failed', { razorpayOrderId });
          break;
        }

        // Idempotency and Atomic Fulfillment handled inside completeOrder
        await completeOrder({
          intentData: intent,
          razorpayOrderId: razorpayOrderId,
          razorpayPaymentId: payment.id,
          razorpaySignature: signature,
          supabaseAdmin: supabaseAdmin,
          eventId: eventId,
        });
        break;
      }

      default: break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[webhook] Global error:', err);
    return NextResponse.json({ received: true });
  }
}
