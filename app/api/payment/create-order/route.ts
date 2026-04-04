import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { razorpay } from '@/lib/razorpay';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
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

    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [] } }
    );

    // ── 2. Parse Body ────────────────────────────────────────────────────────
    const { cart_items, coupon_code, shipping_address } = await req.json();

    if (!cart_items || !Array.isArray(cart_items) || cart_items.length === 0) {
      return NextResponse.json({ error: 'Invalid cart items' }, { status: 400 });
    }

    // ── 3. Validate Prices & Inventory ───────────────────────────────────────
    const productIds = cart_items.map((item) => item.product_id);
    
    // Fetch products to verify pricing
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, name, price')
      .in('id', productIds);

    if (productError || !products) {
      return NextResponse.json({ error: 'Failed to fetch product data' }, { status: 500 });
    }

    // Fetch inventory to verify stock
    const { data: inventory, error: invError } = await supabase
      .from('product_inventory')
      .select('product_id, size, stock_quantity')
      .in('product_id', productIds);

    if (invError || !inventory) {
      return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
    }

    let subtotal = 0;
    const validatedItems = [];

    for (const cartItem of cart_items) {
      const product = products.find((p) => String(p.id) === String(cartItem.product_id));
      if (!product) {
        return NextResponse.json({ error: `Product ${cartItem.product_id} not found` }, { status: 400 });
      }

      const stock = inventory.find(
        (inv) => String(inv.product_id) === String(cartItem.product_id) && inv.size === cartItem.size
      );

      if (!stock || stock.stock_quantity < cartItem.quantity) {
        return NextResponse.json(
          { error: 'OUT_OF_STOCK', product_id: cartItem.product_id, size: cartItem.size },
          { status: 400 }
        );
      }

      const itemTotal = Number(product.price) * cartItem.quantity;
      subtotal += itemTotal;
      validatedItems.push({
        product_id: product.id,
        name: product.name,
        quantity: cartItem.quantity,
        size: cartItem.size,
        price: Number(product.price),
      });
    }

    // ── 4. Calculate Discounts & Shipping ───────────────────────────────────
    const { data: settingsData } = await supabaseAdmin
      .from('store_settings')
      .select('key, value')
      .in('key', ['free_shipping_above', 'shipping_rate']);

    const settings = { free_shipping_above: 999, shipping_rate: 99 };
    if (settingsData) {
      for (const row of settingsData) {
         try {
           const val = typeof row.value === 'string' ? Number(JSON.parse(row.value)) : Number(row.value);
           if (!isNaN(val)) {
             if (row.key === 'free_shipping_above') settings.free_shipping_above = val;
             if (row.key === 'shipping_rate') settings.shipping_rate = val;
           }
         } catch { /* use defaults */ }
      }
    }

    let discount = 0;
    if (coupon_code) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', coupon_code)
        .eq('is_active', true)
        .maybeSingle();

      if (coupon && (!coupon.valid_until || new Date(coupon.valid_until) > new Date())) {
        if (!coupon.usage_limit || coupon.used_count < coupon.usage_limit) {
          if (subtotal >= Number(coupon.min_purchase_amount || 0)) {
            if (coupon.discount_type === 'percentage') {
              discount = (subtotal * Number(coupon.discount_value)) / 100;
              if (coupon.max_discount_amount) {
                discount = Math.min(discount, Number(coupon.max_discount_amount));
              }
            } else {
              discount = Number(coupon.discount_value);
            }
          }
        }
      }
    }

    const shipping = subtotal >= settings.free_shipping_above ? 0 : settings.shipping_rate;
    const total = subtotal + shipping - discount;

    // ── 5. Create Razorpay Order ───────────────────────────────────────────
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(total * 100), // convert to paise
      currency: 'INR',
      receipt: `haxeus_${Date.now()}`,
      notes: {
        user_id: user.id,
        items_count: String(validatedItems.length),
      },
    });

    // ── 6. Save Payment Intent (Metadata Holding) ───────────────────────────
    const { error: intentError } = await supabaseAdmin
      .from('payment_intents')
      .insert({
        razorpay_order_id: razorpayOrder.id,
        user_id: user.id,
        order_data: {
          items: validatedItems,
          subtotal,
          shipping,
          discount,
          total,
          coupon_code: discount > 0 ? coupon_code : null,
          shipping_address,
        },
        status: 'pending',
      });

    if (intentError) {
      console.error('[create-order] Intent Save Failed:', intentError);
      return NextResponse.json({ error: 'Failed to initialize payment session' }, { status: 500 });
    }

    // ── 7. Return Result ─────────────────────────────────────────────────────
    return NextResponse.json({
      razorpay_order_id: razorpayOrder.id,
      amount_paise: Math.round(total * 100),
      currency: 'INR',
    });
  } catch (err) {
    console.error('[create-order] Fatal Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
