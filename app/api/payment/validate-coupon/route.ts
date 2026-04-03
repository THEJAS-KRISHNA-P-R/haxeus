import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { coupon_code, subtotal } = await req.json();

    if (!coupon_code) {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
    }

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

    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', coupon_code.toUpperCase())
      .eq('is_active', true)
      .maybeSingle();

    if (error || !coupon) {
      return NextResponse.json({ error: 'Invalid coupon code' }, { status: 400 });
    }

    // 1. Date validation
    if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
      return NextResponse.json({ error: 'Coupon has expired' }, { status: 400 });
    }

    // 2. Usage validation
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 });
    }

    // 3. Min purchase validation
    if (subtotal < Number(coupon.min_purchase_amount || 0)) {
      return NextResponse.json({ 
        error: `Minimum order of \u20B9${coupon.min_purchase_amount} required` 
      }, { status: 400 });
    }

    // 4. Calculate discount
    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = (subtotal * Number(coupon.discount_value)) / 100;
      if (coupon.max_discount_amount) {
        discountAmount = Math.min(discountAmount, Number(coupon.max_discount_amount));
      }
    } else {
      discountAmount = Number(coupon.discount_value);
    }

    return NextResponse.json({
      success: true,
      coupon_code: coupon.code,
      discount_amount: discountAmount,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value
    });

  } catch (err) {
    console.error('[validate-coupon] Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
