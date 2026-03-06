import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redis, cached } from "@/lib/redis"
import { CK, TTL } from "@/lib/cache-keys"

export async function POST(req: NextRequest) {
    const { code, cartTotal } = await req.json()
    const ip = req.headers.get("x-forwarded-for") ?? "unknown"
    const rlKey = CK.rateLimitCoupon(ip)

    // Rate limit: max 10 coupon attempts per minute per IP
    const attempts = await redis.incr(rlKey)
    if (attempts === 1) await redis.expire(rlKey, TTL.RATE_LIMIT)
    if (attempts > 10) {
        return NextResponse.json({ valid: false, error: "Too many attempts. Wait a minute." }, { status: 429 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
                    } catch { }
                },
            },
        }
    )

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
    if (cartTotal < coupon.minimum_amount)
        return NextResponse.json({ valid: false, error: `Min order ₹${coupon.minimum_amount} required` })

    const discount = coupon.discount_type === "percentage"
        ? (cartTotal * coupon.discount_value) / 100
        : coupon.discount_value

    return NextResponse.json({ valid: true, discount: Math.min(discount, cartTotal), coupon })
}
