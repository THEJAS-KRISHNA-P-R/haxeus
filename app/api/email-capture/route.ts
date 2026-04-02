import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"
import { rateLimit } from "@/lib/redis"
import { sanitizeEmail } from "@/lib/utils"

async function resolveDynamicDiscount(supabase: any) {
  try {
    // 1. Get the configured coupon ID from settings
    const { data: setting } = await supabase
      .from("store_settings")
      .select("value")
      .eq("key", "email_popup_coupon_id")
      .maybeSingle()

    if (!setting?.value) return "WELCOME10"

    const couponId = JSON.parse(setting.value)
    if (!couponId) return "WELCOME10"

    // 2. Fetch the actual coupon code and check if it's active
    const { data: coupon } = await supabase
      .from("coupons")
      .select("code, is_active")
      .eq("id", couponId)
      .maybeSingle()

    if (!coupon || !coupon.is_active) {
      throw new Error("COUPON_INACTIVE")
    }

    return coupon.code
  } catch (err) {
    if (err instanceof Error && err.message === "COUPON_INACTIVE") throw err
    return "WELCOME10" // Safe fallback
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1"
    const { limited } = await rateLimit(`email-capture:ip:${ip}`, 5, 3600)

    if (limited) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })
    }

    const body = await req.json()
    const email = sanitizeEmail(String(body?.email ?? ""))

    const supabaseAdmin = getSupabaseAdmin()

    // Resolve the code dynamically with integrity check
    let discountCode: string
    try {
      discountCode = await resolveDynamicDiscount(supabaseAdmin)
    } catch (err) {
      return NextResponse.json({ error: "This promotion is no longer active." }, { status: 400 })
    }

    // Check if they are already on the list
    const { data: existing } = await supabaseAdmin
      .from("email_subscribers")
      .select("id")
      .eq("email", email)
      .maybeSingle()

    const alreadySubscribed = !!existing

    const { error } = await supabaseAdmin
      .from("email_subscribers")
      .upsert(
        {
          email,
          subscribed_at: alreadySubscribed ? undefined : new Date().toISOString(), // Only set if new
          source: "popup",
          discount_code: discountCode,
        },
        { onConflict: "email" }
      )

    if (error) {
      console.error("EmailCapture: Upsert error:", error)
      return NextResponse.json({ error: "Unable to save your email right now." }, { status: 500 })
    }

    return NextResponse.json({ success: true, discountCode, alreadySubscribed })
  } catch (error) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 })
  }
}

