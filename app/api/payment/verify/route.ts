import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import crypto from "crypto"
import { rateLimit } from "@/lib/redis"

// ─── Validation helpers ──────────────────────────────────────────────────────
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const RAZORPAY_ORDER_RE = /^order_[a-zA-Z0-9]+$/
const RAZORPAY_PAY_RE = /^pay_[a-zA-Z0-9]+$/

export async function POST(req: NextRequest) {
    try {
        // ── CSRF origin check (#3.1) ───────────────────────────────────────────
        const origin = req.headers.get("origin")
        const host = req.headers.get("host")
        if (origin && host && !origin.includes(host)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        // ── Rate limiting (#16.2) ──────────────────────────────────────────────
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
        const { limited: ipLimited } = await rateLimit(`verify:ip:${ip}`, 10, 60)
        if (ipLimited) {
            return NextResponse.json({ error: "Too many requests" }, { status: 429 })
        }

        // ── Auth — use getUser() not getSession() (#4.1) ───────────────────────
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

        // ── Parse body ─────────────────────────────────────────────────────────
        let body: any
        try {
            body = await req.json()
        } catch {
            return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
        }

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = body

        // ── Input validation (#17.4) ───────────────────────────────────────────
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

        // Per-order rate limit — prevent brute-force signature guessing (#16.2)
        const { limited: orderLimited } = await rateLimit(`verify:order:${orderId}`, 3, 300)
        if (orderLimited) {
            return NextResponse.json({ error: "Too many verification attempts for this order" }, { status: 429 })
        }

        // ── Verify Razorpay signature — CRITICAL security step ─────────────────
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex")

        // Constant-time comparison to prevent timing attacks
        const sigBuffer = Buffer.from(razorpay_signature, "hex")
        const expBuffer = Buffer.from(expectedSignature, "hex")
        const sigMatch =
            sigBuffer.length === expBuffer.length &&
            crypto.timingSafeEqual(sigBuffer, expBuffer)

        if (!sigMatch) {
            console.error("[verify] Signature mismatch", { ip, orderId })
            return NextResponse.json({ error: "Payment verification failed" }, { status: 400 })
        }

        // ── Confirm the order belongs to this user (#6.1 partial) ─────────────
        const { data: order } = await supabase
            .from("orders")
            .select("id, user_id, status, coupon_code, discount_amount, shipping_email, shipping_name, shipping_address, total_amount, order_number")
            .eq("id", orderId)
            .eq("razorpay_order_id", razorpay_order_id)
            .single()

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }
        if (order.user_id !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }
        if (order.status !== "pending") {
            // Already processed — idempotent response
            return NextResponse.json({ success: true, orderId: order.id })
        }

        // ── Duplicate payment prevention — check this payment ID isn't already used
        const { data: existingPayment } = await supabase
            .from("orders")
            .select("id")
            .eq("razorpay_payment_id", razorpay_payment_id)
            .neq("id", orderId)
            .maybeSingle()

        if (existingPayment) {
            console.error("[verify] Duplicate payment ID detected", { razorpay_payment_id, orderId })
            return NextResponse.json({ error: "Payment already processed" }, { status: 400 })
        }

        // ── Use service-role client for DB writes (RLS enabled) ────────────────
        const supabaseAdmin = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { cookies: { getAll: () => [], setAll: () => { } } }
        )

        // ── Mark order as paid ─────────────────────────────────────────────────
        await supabaseAdmin
            .from("orders")
            .update({
                status: "confirmed",
                payment_status: "paid",
                razorpay_payment_id,
                payment_verified_at: new Date().toISOString(),
            })
            .eq("id", orderId)

        // ── Increment coupon usage & record redemption ─────────────────────────
        if (order.coupon_code) {
            // Atomic increment via RPC
            try {
                await supabaseAdmin.rpc("increment_coupon_usage", { p_coupon_code: order.coupon_code })
            } catch (rpcErr) {
                console.error("[verify] Coupon RPC failed, falling back:", rpcErr)
                // Fallback: non-atomic increment
                const { data: coupon } = await supabaseAdmin
                    .from("coupons")
                    .select("id, used_count")
                    .eq("code", order.coupon_code)
                    .single()
                if (coupon) {
                    await supabaseAdmin
                        .from("coupons")
                        .update({ used_count: (coupon.used_count ?? 0) + 1 })
                        .eq("id", coupon.id)
                }
            }

            // Always record per-user coupon redemption
            const { data: couponData } = await supabaseAdmin
                .from("coupons")
                .select("id")
                .eq("code", order.coupon_code)
                .single()

            if (couponData) {
                await supabaseAdmin.from("coupon_usage").insert({
                    coupon_id: couponData.id,
                    user_id: user.id,
                    order_id: order.id,
                    discount_amount: order.discount_amount || 0,
                })
            }
        }

        // ── Decrement inventory for each item ──────────────────────────────────
        const { data: orderItems } = await supabaseAdmin
            .from("order_items")
            .select("product_id, quantity, size, price, products(name)")
            .eq("order_id", orderId)

        if (orderItems?.length) {
            for (const item of orderItems) {
                // Use RPC for atomic inventory decrement
                try {
                    await supabaseAdmin.rpc("decrement_inventory_rpc", {
                        p_product_id: item.product_id,
                        p_size: item.size ?? "",
                        p_quantity: item.quantity,
                    })
                } catch (rpcErr) {
                    // Fallback: direct update if RPC fails
                    const { data: inv } = await supabaseAdmin
                        .from("product_inventory")
                        .select("id, stock_quantity, sold_quantity")
                        .eq("product_id", item.product_id)
                        .eq("size", item.size ?? "")
                        .maybeSingle()

                    if (inv) {
                        const { error: invError } = await supabaseAdmin
                            .from("product_inventory")
                            .update({
                                stock_quantity: Math.max(0, (inv.stock_quantity ?? 0) - item.quantity),
                                sold_quantity: (inv.sold_quantity ?? 0) + item.quantity,
                            })
                            .eq("id", inv.id)

                        if (invError) {
                            console.error("[verify] Inventory decrement failed", {
                                product_id: item.product_id,
                                size: item.size,
                                message: invError.message,
                            })
                        }
                    }
                }
            }
        }

        // ── Send Order Confirmation Email ──────────────────────────────────────
        if (order.shipping_email && orderItems?.length) {
            import("@/lib/email").then(({ sendOrderConfirmationEmail }) => {
                const formattedItems = orderItems.map((item: any) => ({
                    name: item.products?.name || "Product",
                    size: item.size,
                    quantity: item.quantity,
                    price: item.price,
                }))

                sendOrderConfirmationEmail({
                    orderId: order.order_number || order.id,
                    customerEmail: order.shipping_email,
                    customerName: order.shipping_name || "Customer",
                    items: formattedItems,
                    totalAmount: order.total_amount || 0,
                    shippingAddress: order.shipping_address as any,
                }).catch(err => console.error("[verify] Email send failed:", err))
            })
        }

        return NextResponse.json({ success: true, orderId: order.id })
    } catch (err) {
        console.error("[verify-payment]", {
            message: err instanceof Error ? err.message : "Unknown error",
            code: (err as any)?.code,
        })
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
