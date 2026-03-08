import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { razorpay } from "@/lib/razorpay"
import { rateLimit } from "@/lib/redis"
import { validateCoupon } from "@/lib/coupons"
import { sanitizeText } from "@/lib/utils"

// ─── Validation helpers ──────────────────────────────────────────────────────
const COUPON_RE = /^[A-Z0-9_-]{1,50}$/i

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
            const pid = item?.productId
            if (!pid && pid !== 0) {
                return NextResponse.json(
                    { error: "Missing product ID in cart item" },
                    { status: 400 }
                )
            }
            const qty = Number(item?.quantity)
            if (!Number.isInteger(qty) || qty < 1 || qty > 100) {
                return NextResponse.json(
                    { error: "Invalid cart item: quantity must be 1–100" },
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

        // Shipping address validation (#17.3)
        if (shippingAddressId !== undefined && shippingAddressId !== null) {
            if (typeof shippingAddressId !== "string" || shippingAddressId.trim() === "") {
                return NextResponse.json({ error: "Invalid address ID" }, { status: 400 })
            }
        }

        // ── Server-side price calculation — never trust client amounts ─────────
        const productIds = items.map((i: any) => i.productId)
        const { data: products, error: productError } = await supabase
            .from("products")
            .select("id, price, name, front_image")
            .in("id", productIds)

        if (productError || !products?.length) {
            return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
        }

        // Stock validation — query product_inventory by product_id AND size
        for (const item of items) {
            const product = products.find((p) => String(p.id) === String(item.productId))
            if (!product) {
                return NextResponse.json({ error: `Product not found` }, { status: 400 })
            }
            const { data: inventory } = await supabase
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

        // Calculate subtotal from DB prices (all in INR)
        let subtotal = 0
        const orderItems = items.map((item: any) => {
            const product = products.find((p) => String(p.id) === String(item.productId))!
            const lineTotal = product.price * item.quantity
            subtotal += lineTotal
            return {
                product_id: item.productId,
                quantity: item.quantity,
                price: product.price,
                size: item.size ?? null,
                product_name: product.name,
                product_image: product.front_image,
            }
        })

        // ── Shipping fee from store_settings (with fallback defaults) ──────────
        let shippingRate = 150
        let freeShippingThreshold = 2000
        try {
            const { data: settings } = await supabase
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
            // Fallback to defaults if store_settings read fails
        }
        const shippingFeeINR = subtotal >= freeShippingThreshold ? 0 : shippingRate

        // ── Coupon validation (#5.3: consolidated to lib/coupons.ts) ─────────
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

        // ── Total calculation — all arithmetic in INR, convert once (#20.5) ───
        const totalINR = subtotal - discountAmount + shippingFeeINR
        const totalPaise = Math.round(totalINR * 100)

        if (totalPaise < 100) {
            return NextResponse.json({ error: "Order total too low (minimum ₹1)" }, { status: 400 })
        }


        // ── Fetch address to build shipping_address JSON blob ──────────────────
        let shippingAddress: any = null
        if (shippingAddressId) {
            const { data: addr } = await supabase
                .from("user_addresses")
                .select("*")
                .eq("id", shippingAddressId)
                .eq("user_id", user.id)
                .single()
            if (addr) {
                shippingAddress = {
                    full_name: sanitizeText(addr.full_name ?? ""),
                    phone: sanitizeText(addr.phone ?? ""),
                    address_line1: sanitizeText(addr.address_line1 ?? ""),
                    address_line2: sanitizeText(addr.address_line2 ?? ""),
                    city: sanitizeText(addr.city ?? ""),
                    state: sanitizeText(addr.state ?? ""),
                    pincode: sanitizeText(addr.pincode ?? ""),
                }
            }
        }

        // ── Create Razorpay order ──────────────────────────────────────────────
        const razorpayOrder = await razorpay.orders.create({
            amount: totalPaise,
            currency: "INR",
            receipt: `haxeus_${Date.now()}`,
            notes: { user_id: user.id },
        })

        // ── Use service-role client for DB writes (RLS enabled) ────────────────
        const supabaseAdmin = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { cookies: { getAll: () => [], setAll: () => { } } }
        )

        // ── Create pending order in DB ─────────────────────────────────────────
        const { data: order, error: orderError } = await supabaseAdmin
            .from("orders")
            .insert({
                user_id: user.id,
                status: "pending",
                payment_status: "pending",
                total_amount: totalINR,
                discount_amount: discountAmount,
                shipping_address: shippingAddress,
                shipping_name: shippingAddress?.full_name ?? null,
                shipping_email: user.email ?? null,
                order_number: `HX-${Date.now().toString(36).toUpperCase()}`,
                coupon_code: couponCode ? couponCode.toUpperCase().trim() : null,
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
        const { error: itemsError } = await supabaseAdmin.from("order_items").insert(
            orderItems.map((item: any) => ({ ...item, order_id: order.id }))
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
