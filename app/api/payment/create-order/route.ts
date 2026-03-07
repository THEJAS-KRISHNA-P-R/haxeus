import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { razorpay } from "@/lib/razorpay"
import { rateLimit } from "@/lib/redis"

// ─── Validation helpers ──────────────────────────────────────────────────────
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const COUPON_RE = /^[A-Z0-9_-]{1,50}$/i

function isValidUUID(v: unknown): v is string {
    return typeof v === "string" && UUID_RE.test(v)
}

export async function POST(req: NextRequest) {
    try {
        // ── CSRF origin check (#3.1) ───────────────────────────────────────────
        const origin = req.headers.get("origin")
        const host = req.headers.get("host")
        if (origin && host && !origin.includes(host)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        // ── Rate limiting (#16.1) ──────────────────────────────────────────────
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
        const { limited: ipLimited } = await rateLimit(`create-order:ip:${ip}`, 5, 60)
        if (ipLimited) {
            return NextResponse.json({ error: "Too many requests. Please wait." }, { status: 429 })
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

        // Per-user rate limit (#16.1)
        const { limited: userLimited } = await rateLimit(`create-order:user:${user.id}`, 10, 300)
        if (userLimited) {
            return NextResponse.json({ error: "Too many orders attempted. Please wait." }, { status: 429 })
        }

        // ── Parse & validate body (#17.1, #17.2, #17.3) ───────────────────────
        let body: any
        try {
            body = await req.json()
        } catch {
            return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
        }

        const { items, couponCode, shippingAddressId } = body

        // Cart validation
        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
        }
        if (items.length > 50) {
            return NextResponse.json({ error: "Cart too large (max 50 items)" }, { status: 400 })
        }
        for (const item of items) {
            if (
                !isValidUUID(item?.productId) ||
                !Number.isInteger(item?.quantity) ||
                item.quantity < 1 ||
                item.quantity > 100
            ) {
                return NextResponse.json(
                    { error: "Invalid cart item: quantity must be 1–100 and productId must be a valid UUID" },
                    { status: 400 }
                )
            }
        }

        // Coupon validation (#17.2)
        if (couponCode !== undefined && couponCode !== null && couponCode !== "") {
            if (typeof couponCode !== "string" || !COUPON_RE.test(couponCode)) {
                return NextResponse.json({ error: "Invalid coupon code format" }, { status: 400 })
            }
        }

        // Shipping address UUID validation (#17.3)
        if (shippingAddressId !== undefined && shippingAddressId !== null) {
            if (!isValidUUID(shippingAddressId)) {
                return NextResponse.json({ error: "Invalid address ID" }, { status: 400 })
            }
        }

        // ── Server-side price calculation — never trust client amounts ─────────
        const productIds = items.map((i: any) => i.productId)
        const { data: products, error: productError } = await supabase
            .from("products")
            .select("id, price, name, inventory:product_inventory(quantity)")
            .in("id", productIds)

        if (productError || !products?.length) {
            return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
        }

        // Stock validation
        for (const item of items) {
            const product = products.find((p) => p.id === item.productId)
            if (!product) {
                return NextResponse.json({ error: `Product not found` }, { status: 400 })
            }
            const stock = (product.inventory as any)?.[0]?.quantity ?? 0
            if (item.quantity > stock) {
                return NextResponse.json({
                    error: `"${product.name}" only has ${stock} in stock`,
                    outOfStock: true,
                }, { status: 400 })
            }
        }

        // Calculate subtotal from DB prices (all in INR)
        let subtotal = 0
        const orderItems = items.map((item: any) => {
            const product = products.find((p) => p.id === item.productId)!
            const lineTotal = product.price * item.quantity
            subtotal += lineTotal
            return {
                product_id: item.productId,
                quantity: item.quantity,
                unit_price: product.price,
                size: item.size ?? null,
            }
        })

        // ── Shipping fee (#20.5 fix: subtotal is in INR, threshold is ₹999) ───
        const FREE_SHIPPING_THRESHOLD = 999   // INR
        const SHIPPING_FEE = 99              // INR
        const shippingFeeINR = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE

        // ── Coupon validation (#5.3: explicit column list, #17.6: cap at 100%) ─
        let discountAmount = 0
        let validatedCouponId: string | null = null

        if (couponCode) {
            const normalised = couponCode.toUpperCase().trim()

            const { data: coupon } = await supabase
                .from("coupons")
                .select("id, code, discount_type, discount_value, usage_limit, usage_count, valid_from, valid_until, is_active, min_order_amount")
                .eq("code", normalised)
                .eq("is_active", true)
                .maybeSingle()

            if (coupon) {
                const now = new Date()
                const isExpired =
                    (coupon.valid_from && new Date(coupon.valid_from) > now) ||
                    (coupon.valid_until && new Date(coupon.valid_until) < now)
                const usageLimitReached =
                    coupon.usage_limit !== null && coupon.usage_count >= coupon.usage_limit

                if (!isExpired && !usageLimitReached) {
                    // ── Per-user coupon redemption check (#20.4) ───────────────────
                    const { data: alreadyUsed } = await supabase
                        .from("coupon_redemptions")
                        .select("id")
                        .eq("coupon_id", coupon.id)
                        .eq("user_id", user.id)
                        .maybeSingle()

                    if (alreadyUsed) {
                        // Coupon already used by this user — silently skip (or return error)
                        return NextResponse.json({ error: "You have already used this coupon" }, { status: 400 })
                    }

                    if (coupon.discount_type === "percentage") {
                        // Cap percentage at 100% (#17.6)
                        const pct = Math.min(coupon.discount_value, 100)
                        discountAmount = Math.round((subtotal * pct) / 100)
                    } else {
                        discountAmount = Math.min(coupon.discount_value, subtotal)
                    }
                    validatedCouponId = coupon.id
                }
            }
        }

        // ── Total calculation — all arithmetic in INR, convert once (#20.5) ───
        const totalINR = subtotal - discountAmount + shippingFeeINR
        const totalPaise = Math.round(totalINR * 100)

        if (totalPaise < 100) {
            return NextResponse.json({ error: "Order total too low (minimum ₹1)" }, { status: 400 })
        }

        // ── Shipping address ownership check (#6.2) ────────────────────────────
        if (shippingAddressId) {
            const { data: addressCheck } = await supabase
                .from("user_addresses")
                .select("id")
                .eq("id", shippingAddressId)
                .eq("user_id", user.id)
                .maybeSingle()

            if (!addressCheck) {
                return NextResponse.json({ error: "Invalid shipping address" }, { status: 400 })
            }
        }

        // ── Create Razorpay order ──────────────────────────────────────────────
        const razorpayOrder = await razorpay.orders.create({
            amount: totalPaise,
            currency: "INR",
            receipt: `haxeus_${Date.now()}`,
            notes: { user_id: user.id },
        })

        // ── Create pending order in DB ─────────────────────────────────────────
        const { data: order, error: orderError } = await supabase
            .from("orders")
            .insert({
                user_id: user.id,
                status: "pending",
                subtotal_amount: subtotal,
                discount_amount: discountAmount,
                shipping_amount: shippingFeeINR,
                total_amount: totalINR,
                coupon_id: validatedCouponId,
                shipping_address_id: shippingAddressId ?? null,
                razorpay_order_id: razorpayOrder.id,
                payment_method: "razorpay",
            })
            .select("id")
            .single()

        if (orderError || !order) {
            console.error("[create-order] DB insert failed:", {
                message: orderError?.message,
                code: orderError?.code,
            })
            return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
        }

        // Insert order items
        await supabase.from("order_items").insert(
            orderItems.map((item: any) => ({ ...item, order_id: order.id }))
        )

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
