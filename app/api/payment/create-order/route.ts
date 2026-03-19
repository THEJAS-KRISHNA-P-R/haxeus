import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { razorpay } from "@/lib/razorpay"
import { rateLimit } from "@/lib/redis"
import { validateCoupon } from "@/lib/coupons"
import { sanitizeText } from "@/lib/utils"

const COUPON_RE = /^[A-Z0-9_-]{1,50}$/i

export async function POST(req: NextRequest) {
  try {
    // CSRF check
    const origin = req.headers.get("origin")
    const host = req.headers.get("host")
    if (origin && host && !origin.includes(host)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Rate limiting
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
    const { limited: ipLimited } = await rateLimit(`create-order:ip:${ip}`, 5, 60, { failClosed: true })
    if (ipLimited) {
      return NextResponse.json({ error: "Too many requests. Please wait." }, { status: 429 })
    }

    // Auth
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll() } }
    )
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
    }

    // Per-user rate limit
    const { limited: userLimited } = await rateLimit(`create-order:user:${user.id}`, 10, 300, { failClosed: true })
    if (userLimited) {
      return NextResponse.json({ error: "Too many orders attempted. Please wait." }, { status: 429 })
    }

    // Parse body
    let body: any
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    // Accept either inline address object OR a saved shippingAddressId
    const { items, couponCode, shippingAddressId, address: inlineAddress, save_address } = body

    // Cart validation
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }
    if (items.length > 50) {
      return NextResponse.json({ error: "Cart too large (max 50 items)" }, { status: 400 })
    }
    for (const item of items) {
      const pid = item?.productId
      if (!pid && pid !== 0) {
        return NextResponse.json({ error: "Missing product ID in cart item" }, { status: 400 })
      }
      const qty = Number(item?.quantity)
      if (!Number.isInteger(qty) || qty < 1 || qty > 100) {
        return NextResponse.json({ error: "Invalid cart item: quantity must be 1–100" }, { status: 400 })
      }
    }

    if (couponCode !== undefined && couponCode !== null && couponCode !== "") {
      if (typeof couponCode !== "string" || !COUPON_RE.test(couponCode)) {
        return NextResponse.json({ error: "Invalid coupon code format" }, { status: 400 })
      }
    }

    // ── Service-role client for DB writes ──────────────────────────────────────
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    )

    // ── Fetch products from DB — never trust client price ──────────────────────
    const productIds = items.map((i: any) => i.productId)
    const { data: products, error: productError } = await supabaseAdmin
      .from("products")
      .select("id, price, name, front_image, is_preorder, preorder_status, expected_date")
      .in("id", productIds)

    if (productError || !products?.length) {
      return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
    }

    // ── Stock + preorder availability check ────────────────────────────────────
    for (const item of items) {
      const product = products.find((p) => String(p.id) === String(item.productId))
      if (!product) {
        return NextResponse.json({ error: `Product not found` }, { status: 404 })
      }

      if (product.is_preorder) {
        // Check preorder is still active
        if (product.preorder_status !== "active") {
          return NextResponse.json(
            { error: `${product.name} pre-order is no longer available` },
            { status: 409 }
          )
        }
      } else {
        // Check physical stock
        const { data: inventory } = await supabaseAdmin
          .from("product_inventory")
          .select("stock_quantity")
          .eq("product_id", item.productId)
          .eq("size", item.size ?? "")
          .maybeSingle()

        const stock = inventory?.stock_quantity ?? 0
        if (item.quantity > stock) {
          return NextResponse.json({
            error: `"${product.name}" (${item.size}) only has ${stock} left in stock`,
            outOfStock: true,
          }, { status: 400 })
        }
      }
    }

    // ── Calculate subtotal from DB prices ──────────────────────────────────────
    let subtotal = 0
    let orderIsPreorder = true // true if ALL items are preorders
    const orderItems = items.map((item: any) => {
      const product = products.find((p) => String(p.id) === String(item.productId))!
      const lineTotal = product.price * item.quantity
      subtotal += lineTotal
      if (!product.is_preorder) orderIsPreorder = false
      return {
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: product.price,
        size: item.size ?? null,
        color: item.color ?? null,
        product_name: product.name,
        product_image: product.front_image,
        is_preorder: product.is_preorder,
        preorder_expected_date: product.expected_date ?? null,
      }
    })
    // If cart has mixed items, mark as non-preorder order
    if (items.length === 0) orderIsPreorder = false

    // ── Shipping fee from store_settings ───────────────────────────────────────
    let shippingRate = 150
    let freeShippingThreshold = 2000
    try {
      const { data: settings } = await supabaseAdmin
        .from("store_settings")
        .select("key, value")
        .in("key", ["shipping_rate", "free_shipping_above"])

      if (settings) {
        for (const s of settings) {
          const val = typeof s.value === "string" ? Number(JSON.parse(s.value)) : Number(s.value)
          if (s.key === "shipping_rate" && !isNaN(val)) shippingRate = val
          if (s.key === "free_shipping_above" && !isNaN(val)) freeShippingThreshold = val
        }
      }
    } catch {
      // Fallback to defaults
    }
    const shippingFeeINR = subtotal >= freeShippingThreshold ? 0 : shippingRate

    // ── Coupon validation ──────────────────────────────────────────────────────
    let discountAmount = 0
    let validatedCouponId: string | null = null
    if (couponCode) {
      const validation = await validateCoupon(couponCode, subtotal, user.id)
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 })
      }
      discountAmount = validation.discountAmount ?? 0
      validatedCouponId = validation.coupon?.id ?? null
    }

    const totalINR = subtotal - discountAmount + shippingFeeINR
    const totalPaise = Math.round(totalINR * 100)
    if (totalPaise < 100) {
      return NextResponse.json({ error: "Order total too low (minimum ₹1)" }, { status: 400 })
    }

    // ── Resolve shipping address ───────────────────────────────────────────────
    let resolvedAddress: {
      full_name: string
      phone: string
      address_line1: string
      address_line2: string | null
      city: string
      state: string
      pincode: string
      country: string
    } | null = null

    if (shippingAddressId) {
      // Saved address from user_addresses
      const { data: addr } = await supabaseAdmin
        .from("user_addresses")
        .select("*")
        .eq("id", shippingAddressId)
        .eq("user_id", user.id)
        .maybeSingle()

      if (addr) {
        resolvedAddress = {
          full_name: sanitizeText(addr.full_name ?? ""),
          phone: sanitizeText(addr.phone ?? ""),
          address_line1: sanitizeText(addr.address_line1 ?? ""),
          address_line2: addr.address_line2 ? sanitizeText(addr.address_line2) : null,
          city: sanitizeText(addr.city ?? ""),
          state: sanitizeText(addr.state ?? ""),
          pincode: sanitizeText(addr.pincode ?? ""),
          country: sanitizeText(addr.country ?? "India"),
        }
      }
    } else if (inlineAddress) {
      // Inline address from checkout form
      resolvedAddress = {
        full_name: sanitizeText(inlineAddress.full_name ?? ""),
        phone: sanitizeText(inlineAddress.phone ?? ""),
        address_line1: sanitizeText(inlineAddress.address_line1 ?? ""),
        address_line2: inlineAddress.address_line2 ? sanitizeText(inlineAddress.address_line2) : null,
        city: sanitizeText(inlineAddress.city ?? ""),
        state: sanitizeText(inlineAddress.state ?? ""),
        pincode: sanitizeText(inlineAddress.pincode ?? ""),
        country: sanitizeText(inlineAddress.country ?? "India"),
      }

      // Save address if requested
      if (save_address && resolvedAddress.full_name && resolvedAddress.address_line1) {
        try {
          // Set other addresses to non-default first
          await supabaseAdmin
            .from("user_addresses")
            .update({ is_default: false })
            .eq("user_id", user.id)

          await supabaseAdmin.from("user_addresses").insert({
            user_id: user.id,
            full_name: resolvedAddress.full_name,
            phone: resolvedAddress.phone,
            address_line1: resolvedAddress.address_line1,
            address_line2: resolvedAddress.address_line2,
            city: resolvedAddress.city,
            state: resolvedAddress.state,
            pincode: resolvedAddress.pincode,
            country: resolvedAddress.country,
            is_default: true,
          })
        } catch (saveErr) {
          console.error("[create-order] Save address failed (non-fatal):", saveErr)
        }
      }
    }

    // ── Create Razorpay order ──────────────────────────────────────────────────
    const razorpayOrder = await razorpay.orders.create({
      amount: totalPaise,
      currency: "INR",
      receipt: `haxeus_${Date.now()}`,
      notes: { user_id: user.id },
    })

    // ── Create pending order in DB ─────────────────────────────────────────────
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: user.id,
        status: "pending",
        payment_status: "pending",
        total_amount: totalINR,
        subtotal_amount: subtotal,
        shipping_amount: shippingFeeINR,
        discount_amount: discountAmount,
        is_preorder: orderIsPreorder,
        // Flat shipping columns
        shipping_name: resolvedAddress?.full_name ?? null,
        shipping_phone: resolvedAddress?.phone ?? null,
        shipping_address_1: resolvedAddress?.address_line1 ?? null,
        shipping_address_2: resolvedAddress?.address_line2 ?? null,
        shipping_city: resolvedAddress?.city ?? null,
        shipping_state: resolvedAddress?.state ?? null,
        shipping_pincode: resolvedAddress?.pincode ?? null,
        shipping_country: resolvedAddress?.country ?? "India",
        // Also keep legacy JSON blob for compatibility
        shipping_address: resolvedAddress ?? null,
        shipping_email: user.email ?? null,
        coupon_code: couponCode ? couponCode.toUpperCase().trim() : null,
        razorpay_order_id: razorpayOrder.id,
        payment_method: "razorpay",
      })
      .select("id")
      .maybeSingle()

    if (orderError || !order) {
      console.error("[create-order] DB insert failed:", {
        message: orderError?.message,
        code: orderError?.code,
      })
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
    }

    // Insert order items
    const { error: itemsError } = await supabaseAdmin.from("order_items").insert(
      orderItems.map((item: any) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        price: item.unit_price, // legacy compat
        size: item.size,
        color: item.color,
        product_name: item.product_name,
        product_image: item.product_image,
        is_preorder: item.is_preorder,
        preorder_expected_date: item.preorder_expected_date,
      }))
    )
    if (itemsError) {
      console.error("[create-order] Order items insert failed:", itemsError?.message ?? itemsError?.code)
    }

    return NextResponse.json({
      orderId: order.id,
      razorpayOrderId: razorpayOrder.id,
      amount: totalPaise,
      currency: "INR",
      discount: discountAmount,
      shipping: shippingFeeINR,
    })
  } catch (err) {
    console.error("[create-order]", {
      message: err instanceof Error ? err.message : "Unknown error",
      code: (err as any)?.code,
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
