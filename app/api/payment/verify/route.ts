import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { completeOrder } from '@/lib/order-completion';

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
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

    // ── 3. Fetch Intent Metadata ───────────────────────────────────────────
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [] } }
    );

    const { data: intent, error: intentError } = await supabaseAdmin
      .from('payment_intents')
      .select('*')
      .eq('razorpay_order_id', razorpay_order_id)
      .maybeSingle();

    if (intentError || !intent) {
      console.error('[verify] Intent not found', { razorpay_order_id });
      return NextResponse.json({ error: 'Payment context lost' }, { status: 400 });
    }

    if (intent.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // ── 4. Create and Complete Order ─────────────────────────────────────────
    try {
      const { order: completedOrder } = await completeOrder({
        intentData: intent,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        supabaseAdmin: supabaseAdmin,
      });

      return NextResponse.json({ success: true, order_id: completedOrder.id });
    } catch (completeErr) {
      console.error('[verify] Completion failed:', completeErr);
      return NextResponse.json({ 
        success: false, 
        error: 'Order could not be finalized. Please contact support.' 
      }, { status: 500 });
    }

  } catch (err) {
    console.error('[verify] Fatal Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
