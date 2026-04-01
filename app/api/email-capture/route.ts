import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"
import { rateLimit } from "@/lib/redis"
import { sanitizeEmail } from "@/lib/utils"

function resolveDiscountCode(code: string | null | undefined) {
  return code && code.trim().length > 0 ? code.trim().toUpperCase() : "WELCOME10"
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

    const { data: coupon } = await supabaseAdmin
      .from("coupons")
      .select("code")
      .eq("is_active", true)
      .eq("code", "WELCOME10")
      .maybeSingle()

    const discountCode = resolveDiscountCode(coupon?.code)

    const { error } = await supabaseAdmin
      .from("email_subscribers")
      .upsert(
        {
          email,
          subscribed_at: new Date().toISOString(),
          source: "popup",
          discount_code: discountCode,
        },
        { onConflict: "email" }
      )

    if (error) {
      return NextResponse.json({ error: "Unable to save your email right now." }, { status: 500 })
    }

    return NextResponse.json({ success: true, discountCode })
  } catch (error) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 })
  }
}

