import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
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

        // 1. Deliverability Verification (API)
        try {
            const verifierUrl = `https://rapid-email-verifier.fly.dev/api/validate?email=${encodeURIComponent(cleanEmail)}`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3500);

            const vRes = await fetch(verifierUrl, {
                signal: controller.signal,
                headers: { 'Accept': 'application/json' }
            });
            clearTimeout(timeoutId);

            if (vRes.ok) {
                const vResult = await vRes.json();
                const isAcceptable = vResult.status === "VALID" && vResult.validations?.mx_records;
                
                if (!isAcceptable) {
                    return NextResponse.json({ error: "This email inbox does not exist or cannot receive mail." }, { status: 400 });
                }
            }
        } catch (vErr) {
            console.warn("[newsletter_subscribe] Verification service unavailable. Falling back to local.", vErr);
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
              auth: {
                autoRefreshToken: false,
                persistSession: false
              }
            }
        )

        // 1. Check if they already exist and are currently subscribed
        const { data: existing } = await supabase
            .from("newsletter_subscribers")
            .select("subscribed")
            .eq("email", cleanEmail)
            .maybeSingle()

        if (existing?.subscribed) {
            return NextResponse.json({ error: "already_subscribed" }, { status: 400 })
        }

        // 2. Either insert new or re-activate existing unsubscribed record
        const { error } = await supabase
            .from("newsletter_subscribers")
            .upsert({
                email: cleanEmail,
                subscribed: true,
                unsubscribed_at: null,
            }, {
                onConflict: 'email'
            })

        if (error) {
            console.error("[newsletter_subscribe] Database subscription error:", error)
            return NextResponse.json({ error: "Failed to subscribe. Please try again later." }, { status: 500 })
        }

        // Send newsletter welcome email (re-send if they re-join)
        await sendNewsletterWelcomeEmail(cleanEmail)

        return NextResponse.json({ success: true, message: "Subscribed successfully!" })
    } catch (error) {
        console.error("[newsletter_subscribe] Internal API error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
