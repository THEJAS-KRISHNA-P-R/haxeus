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
          setAll: (cookiesToSet) => {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

      // Check stock for the specific size
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
        unit_price: Number(product.price),
      });
    }

    // ── 4. Calculate Discounts & Shipping ───────────────────────────────────
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

    const shipping = subtotal >= 999 ? 0 : 99;
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

    // ── 6. Insert Order into Supabase ───────────────────────────────────────
    // Using service role client to bypass RLS for order creation
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [] } }
    );

    const { data: dbOrder, error: dbError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: user.id,
        status: 'pending',
        subtotal_amount: subtotal,
        shipping_amount: shipping,
        discount_amount: discount,
        total_amount: total,
        coupon_code: discount > 0 ? coupon_code : null,
        shipping_address: shipping_address,
        razorpay_order_id: razorpayOrder.id,
        payment_method: 'online',
      })
      .select('id')
      .single();

    if (dbError) {
      console.error('Order insertion failed but Razorpay order was created:', razorpayOrder.id, dbError);
      return NextResponse.json({ error: 'Failed to create order in database' }, { status: 500 });
    }

    // Insert order items
    const { error: itemsError } = await supabaseAdmin.from('order_items').insert(
      validatedItems.map((item) => ({
        order_id: dbOrder.id,
        product_id: item.product_id,
        quantity: item.quantity,
        size: item.size,
        price: item.unit_price, // Stores unit price in INR
      }))
    );

    if (itemsError) {
      console.error('Failed to insert order items:', itemsError);
      // We don't fail the whole request since the order row exists, 
      // but this is a critical data integrity issue.
    }

    // ── 7. Return Result ─────────────────────────────────────────────────────
    return NextResponse.json({
      razorpay_order_id: razorpayOrder.id,
      amount_paise: Math.round(total * 100),
      currency: 'INR',
      order_db_id: dbOrder.id,
    });
  } catch (err) {
    console.error('[create-order] Fatal Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
