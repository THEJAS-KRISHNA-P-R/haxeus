import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import crypto from "crypto"
import { rateLimit } from "@/lib/redis"

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const RAZORPAY_ORDER_RE = /^order_[a-zA-Z0-9]+$/
const RAZORPAY_PAY_RE = /^pay_[a-zA-Z0-9]+$/

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
    const { limited: ipLimited } = await rateLimit(`verify:ip:${ip}`, 10, 60, { failClosed: true })
    if (ipLimited) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
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

    // Parse body
    let body: any
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = body

    // Input validation
    if (!orderId || !UUID_RE.test(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
    }
    if (!razorpay_order_id || !RAZORPAY_ORDER_RE.test(razorpay_order_id)) {
      return NextResponse.json({ error: "Invalid Razorpay order ID" }, { status: 400 })
    }
    if (!razorpay_payment_id || !RAZORPAY_PAY_RE.test(razorpay_payment_id)) {
      return NextResponse.json({ error: "Invalid payment ID" }, { status: 400 })
    }
    if (!razorpay_signature || typeof razorpay_signature !== "string" || razorpay_signature.length > 256) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    // Per-order rate limit
    const { limited: orderLimited } = await rateLimit(`verify:order:${orderId}`, 3, 300, { failClosed: true })
    if (orderLimited) {
      return NextResponse.json({ error: "Too many verification attempts for this order" }, { status: 429 })
    }

    // ── Verify Razorpay signature — NEVER skip this ────────────────────────────
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex")

    // Constant-time comparison (prevents timing attacks)
    const sigBuffer = Buffer.from(razorpay_signature, "hex")
    const expBuffer = Buffer.from(expectedSignature, "hex")
    const sigMatch =
      sigBuffer.length === expBuffer.length &&
      crypto.timingSafeEqual(sigBuffer, expBuffer)

    if (!sigMatch) {
      console.error("[verify] Signature mismatch", { ip, orderId })
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 })
    }

    // ── Fetch the order, verify it belongs to this user ────────────────────────
    const { data: order } = await supabase
      .from("orders")
      .select(`
        id, user_id, status, coupon_code, discount_amount,
        shipping_email, shipping_name, shipping_phone,
        shipping_address_1, shipping_address_2,
        shipping_city, shipping_state, shipping_pincode,
        shipping_address, total_amount, subtotal_amount,
        shipping_amount, order_number, is_preorder
      `)
      .eq("id", orderId)
      .eq("razorpay_order_id", razorpay_order_id)
      .maybeSingle()

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }
    if (order.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    if (order.status !== "pending") {
      // Already processed — idempotent
      return NextResponse.json({ success: true, orderId: order.id, order_number: order.order_number })
    }

    // Duplicate payment check
    const { data: existingPayment } = await supabase
      .from("orders")
      .select("id")
      .eq("razorpay_payment_id", razorpay_payment_id)
      .neq("id", orderId)
      .maybeSingle()

    if (existingPayment) {
      console.error("[verify] Duplicate payment ID", { razorpay_payment_id, orderId })
      return NextResponse.json({ error: "Payment already processed" }, { status: 400 })
    }

    // ── Service-role client for DB writes ──────────────────────────────────────
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    )

    // ── Fetch order items with product metadata ────────────────────────────────
    const { data: orderItems } = await supabaseAdmin
      .from("order_items")
      .select(`
        id, product_id, quantity, size, color,
        unit_price, price, product_name, product_image,
        is_preorder, preorder_expected_date,
        products(name, is_preorder, expected_date)
      `)
      .eq("order_id", orderId)

    // Determine final order status based on items
    const hasPreorder = orderItems?.some(item => item.is_preorder) ?? false
    const hasNormal = orderItems?.some(item => !item.is_preorder) ?? false
    // If ALL items are preorders → 'preorder'; else → 'confirmed'
    const finalStatus = hasPreorder && !hasNormal ? "preorder" : "confirmed"

    // ── Update order status ────────────────────────────────────────────────────
    await supabaseAdmin
      .from("orders")
      .update({
        status: finalStatus,
        payment_status: "paid",
        razorpay_payment_id,
        payment_verified_at: new Date().toISOString(),
        is_preorder: hasPreorder && !hasNormal,
      })
      .eq("id", orderId)

    // ── Coupon usage ───────────────────────────────────────────────────────────
    if (order.coupon_code) {
      try {
        await supabaseAdmin.rpc("increment_coupon_usage", { p_coupon_code: order.coupon_code })
      } catch {
        const { data: coupon } = await supabaseAdmin
          .from("coupons").select("id, used_count").eq("code", order.coupon_code).maybeSingle()
        if (coupon) {
          await supabaseAdmin.from("coupons")
            .update({ used_count: (coupon.used_count ?? 0) + 1 }).eq("id", coupon.id)
        }
      }

      const { data: couponData } = await supabaseAdmin
        .from("coupons").select("id").eq("code", order.coupon_code).maybeSingle()
      if (couponData) {
        await supabaseAdmin.from("coupon_usage").insert({
          coupon_id: couponData.id,
          user_id: user.id,
          order_id: order.id,
          discount_amount: order.discount_amount || 0,
        })
      }
    }

    // ── Inventory: decrement normal items, reserve preorder items ──────────────
    if (orderItems?.length) {
      for (const item of orderItems) {
        if (item.is_preorder) {
          // Increment reserved_quantity for preorders
          try {
            const { data: inv } = await supabaseAdmin
              .from("product_inventory")
              .select("id, reserved_quantity")
              .eq("product_id", item.product_id)
              .eq("size", item.size ?? "")
              .maybeSingle()

            if (inv) {
              await supabaseAdmin
                .from("product_inventory")
                .update({ reserved_quantity: (inv.reserved_quantity ?? 0) + item.quantity })
                .eq("id", inv.id)
            }

            // Increment preorder_count on product
            const { data: prod } = await supabaseAdmin
              .from("products")
              .select("id, preorder_count")
              .eq("id", item.product_id)
              .maybeSingle()
            if (prod) {
              await supabaseAdmin
                .from("products")
                .update({ preorder_count: (prod.preorder_count ?? 0) + item.quantity })
                .eq("id", item.product_id)
            }
          } catch (preorderErr) {
            console.error("[verify] Preorder reservation failed (non-fatal):", preorderErr)
          }
        } else {
          // Decrement stock for normal items
          try {
            await supabaseAdmin.rpc("decrement_inventory_rpc", {
              p_product_id: item.product_id,
              p_size: item.size ?? "",
              p_quantity: item.quantity,
            })
          } catch {
            const { data: inv } = await supabaseAdmin
              .from("product_inventory")
              .select("id, stock_quantity, sold_quantity")
              .eq("product_id", item.product_id)
              .eq("size", item.size ?? "")
              .maybeSingle()

            if (inv) {
              await supabaseAdmin
                .from("product_inventory")
                .update({
                  stock_quantity: Math.max(0, (inv.stock_quantity ?? 0) - item.quantity),
                  sold_quantity: (inv.sold_quantity ?? 0) + item.quantity,
                })
                .eq("id", inv.id)
            }
          }
        }
      }
    }

    // ── Send confirmation email (fire-and-forget, never fail the response) ─────
    const userEmail = order.shipping_email ?? user.email
    if (userEmail && orderItems?.length) {
      import("@/lib/email").then(({ sendOrderConfirmationEmail }) => {
        sendOrderConfirmationEmail({
          orderId: order.order_number || order.id,
          customerEmail: userEmail,
          customerName: order.shipping_name || "Customer",
          items: orderItems.map((item: any) => ({
            name: item.product_name || item.products?.name || "Product",
            size: item.size,
            quantity: item.quantity,
            price: item.unit_price ?? item.price,
            is_preorder: item.is_preorder,
            expected_date: item.preorder_expected_date ?? item.products?.expected_date ?? null,
          })),
          totalAmount: order.total_amount || 0,
          shipping: order.shipping_amount ?? 0,
          shippingAddress: {
            fullName: order.shipping_name || "",
            phone: order.shipping_phone || "",
            addressLine1: order.shipping_address_1 || (order.shipping_address as any)?.address_line1 || "",
            addressLine2: order.shipping_address_2 || (order.shipping_address as any)?.address_line2 || "",
            city: order.shipping_city || (order.shipping_address as any)?.city || "",
            state: order.shipping_state || (order.shipping_address as any)?.state || "",
            pincode: order.shipping_pincode || (order.shipping_address as any)?.pincode || "",
          },
          isPreorder: hasPreorder && !hasNormal,
        }).catch(err => console.error("[verify] Email send failed:", err))
      })
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      order_number: order.order_number,
    })
  } catch (err) {
    console.error("[verify-payment]", {
      message: err instanceof Error ? err.message : "Unknown error",
      code: (err as any)?.code,
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
