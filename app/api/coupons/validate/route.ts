import { NextRequest, NextResponse } from "next/server"
import { redis, cached } from "@/lib/redis"
import { CK, TTL } from "@/lib/cache-keys"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export async function POST(req: NextRequest) {
    let body: any
    try { body = await req.json() } catch {
        return NextResponse.json({ valid: false, error: "Invalid request" }, { status: 400 })
    }
    const { code, cartTotal } = body

    if (!code || typeof code !== 'string' || typeof cartTotal !== 'number' || cartTotal < 0) {
        return NextResponse.json({ valid: false, error: "Invalid input" }, { status: 400 })
    }

    const ip = req.headers.get("x-forwarded-for") ?? "unknown"
    const rlKey = CK.rateLimitCoupon(ip)

    // Rate limit: max 10 coupon attempts per minute per IP
    const attempts = await redis.incr(rlKey)
    if (attempts === 1) await redis.expire(rlKey, TTL.RATE_LIMIT)
    if (attempts > 10) {
        return NextResponse.json({ valid: false, error: "Too many attempts. Wait a minute." }, { status: 429 })
    }

    const supabase = getSupabaseAdmin()

    const coupon = await cached(CK.coupon(code), TTL.COUPON, async () => {
        const { data } = await supabase
            .from("coupons")
            .select("*")
            .eq("code", code.toUpperCase())
            .eq("is_active", true)
            .maybeSingle()
        return data
    })

    if (!coupon) return NextResponse.json({ valid: false, error: "Invalid coupon code" })

    const now = new Date()
    if (new Date(coupon.valid_until) < now) return NextResponse.json({ valid: false, error: "Coupon expired" })
    if (new Date(coupon.valid_from) > now) return NextResponse.json({ valid: false, error: "Coupon not yet active" })
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit)
        return NextResponse.json({ valid: false, error: "Coupon usage limit reached" })
    if (cartTotal < coupon.min_purchase_amount)
        return NextResponse.json({ valid: false, error: `Min order ₹${coupon.min_purchase_amount} required` })

    const discount = coupon.discount_type === "percentage"
        ? (cartTotal * coupon.discount_value) / 100
        : coupon.discount_value

    return NextResponse.json({
        valid: true,
        discount: Math.min(discount, cartTotal),
        coupon: {
            discount_type: coupon.discount_type,
            discount_value: coupon.discount_value,
            code: coupon.code,
        },
    })
}
