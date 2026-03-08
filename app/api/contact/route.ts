import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { rateLimit } from "@/lib/redis"
import { sanitizeText, sanitizeEmail } from "@/lib/utils"

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            req.headers.get("x-real-ip") ||
            "127.0.0.1"

        // Relax rate limits in development for testing
        const isDev = process.env.NODE_ENV === "development"
        const limit = isDev ? 100 : 3
        const { limited } = await rateLimit(`contact_form:ip:${ip}`, limit, 3600) // 3 req per hour (100 in dev)

        if (limited) {
            console.warn(`[contact_form] Rate limit exceeded for IP: ${ip}`)
            return NextResponse.json({ error: "Too many messages sent. Please try again later." }, { status: 429 })
        }

        const { name, email, subject, message } = await req.json()

        if (!name || !email || !message) {
            return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 })
        }

        const cleanName = sanitizeText(name)
        const cleanEmail = sanitizeEmail(email)
        const cleanSubject = subject ? sanitizeText(subject) : ""
        const cleanMessage = sanitizeText(message)

        if (!cleanEmail) {
            return NextResponse.json({ error: "Invalid email address format." }, { status: 400 })
        }

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { cookies: { getAll: () => [] } }
        )

        const { error } = await supabase.from("contact_messages").insert({
            name: cleanName,
            email: cleanEmail,
            subject: cleanSubject,
            message: cleanMessage,
            status: "unread",
        })

        if (error) {
            console.error("[contact_form] Database insertion error:", error)
            return NextResponse.json({ error: "Failed to send message. Please try again later." }, { status: 500 })
        }

        // Send auto-reply
        import("@/lib/email").then(({ sendContactAutoReply }) => {
            sendContactAutoReply(cleanEmail, cleanName).catch(err =>
                console.error("[contact_form] Failed to send auto-reply email:", err)
            )
        })

        return NextResponse.json({ success: true, message: "Message sent! We'll get back to you within 24 hours." })
    } catch (error) {
        console.error("[contact_form] Internal API error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
