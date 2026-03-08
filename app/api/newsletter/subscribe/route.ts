import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { rateLimit } from "@/lib/redis"
import { sanitizeEmail } from "@/lib/utils"
import { sendNewsletterWelcomeEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            req.headers.get("x-real-ip") ||
            "127.0.0.1"

        // Relax rate limits in development for testing
        const isDev = process.env.NODE_ENV === "development"
        const limit = isDev ? 100 : 5
        const { limited } = await rateLimit(`newsletter:ip:${ip}`, limit, 3600) // 5 per hour (100 in dev)

        if (limited) {
            console.warn(`[newsletter_subscribe] Rate limit exceeded for IP: ${ip}`)
            return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })
        }

        const { email } = await req.json()

        if (!email) {
            return NextResponse.json({ error: "Email is required." }, { status: 400 })
        }

        const cleanEmail = sanitizeEmail(email)

        if (!cleanEmail) {
            return NextResponse.json({ error: "Invalid email address format." }, { status: 400 })
        }

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { cookies: { getAll: () => [] } }
        )

        const { error } = await supabase.from("newsletter_subscribers").insert({
            email: cleanEmail,
        })

        if (error) {
            if (error.code === "23505") {
                return NextResponse.json({ error: "already_subscribed" }, { status: 400 })
            }
            console.error("[newsletter_subscribe] Database insertion error:", error)
            return NextResponse.json({ error: "Failed to subscribe. Please try again later." }, { status: 500 })
        }

        // Send newsletter welcome email
        await sendNewsletterWelcomeEmail(cleanEmail)

        return NextResponse.json({ success: true, message: "Subscribed successfully!" })
    } catch (error) {
        console.error("[newsletter_subscribe] Internal API error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
