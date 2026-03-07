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
            .select("id, user_id, status, coupon_id")
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

        // ── Mark order as paid ─────────────────────────────────────────────────
        await supabase
            .from("orders")
            .update({
                status: "confirmed",
                razorpay_payment_id,
                payment_verified_at: new Date().toISOString(),
            })
            .eq("id", orderId)

        // ── Increment coupon usage & record redemption (#20.1, #20.4) ──────────
        if (order.coupon_id) {
            await supabase.rpc("increment_coupon_usage", { coupon_id: order.coupon_id })

            // Record per-user redemption to enforce one-per-user limit
            try {
                await supabase.from("coupon_redemptions").insert({
                    coupon_id: order.coupon_id,
                    user_id: user.id,
                    order_id: order.id,
                })
            } catch {
                // Non-fatal: redemption record may already exist from a concurrent call
            }
        }

        // ── Decrement inventory for each item (#20.2) ──────────────────────────
        const { data: orderItems } = await supabase
            .from("order_items")
            .select("product_id, quantity")
            .eq("order_id", orderId)

        if (orderItems?.length) {
            for (const item of orderItems) {
                const { error: invError } = await supabase.rpc("decrement_inventory", {
                    p_product_id: item.product_id,
                    p_quantity: item.quantity,
                })
                if (invError) {
                    // Log but don't fail — webhook will catch and can trigger manual review
                    console.error("[verify] Inventory decrement failed", {
                        product_id: item.product_id,
                        message: invError.message,
                    })
                }
            }
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
