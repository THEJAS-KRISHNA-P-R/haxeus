import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import crypto from "crypto"
import { rateLimit } from "@/lib/redis"

// Disable Next.js body parsing — we need raw body for signature verification
export const runtime = "nodejs"

export async function POST(req: NextRequest) {
    try {
        // ── Body size guard before reading (#16.4) ─────────────────────────────
        const contentLength = req.headers.get("content-length")
        if (contentLength && parseInt(contentLength, 10) > 65536) {
            return NextResponse.json({ error: "Payload too large" }, { status: 413 })
        }

        // ── Rate limiting (#16.3) ──────────────────────────────────────────────
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
        const { limited } = await rateLimit(`webhook:ip:${ip}`, 100, 60)
        if (limited) {
            return new Response("", { status: 429 })
        }

        const rawBody = await req.text()
        const signature = req.headers.get("x-razorpay-signature")

        if (!signature) {
            return NextResponse.json({ error: "Missing signature" }, { status: 400 })
        }

        // ── Verify webhook signature ───────────────────────────────────────────
        const expectedSig = crypto
            .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
            .update(rawBody)
            .digest("hex")

        // Constant-time comparison to prevent timing attacks
        const sigBuffer = Buffer.from(signature, "hex")
        const expBuffer = Buffer.from(expectedSig, "hex")
        const sigValid =
            sigBuffer.length === expBuffer.length &&
            crypto.timingSafeEqual(sigBuffer, expBuffer)

        if (!sigValid) {
            console.error("[webhook] Invalid Razorpay webhook signature", { ip })
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
        }

        let event: any
        try {
            event = JSON.parse(rawBody)
        } catch {
            return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
        }

        // ── Use service role key for webhooks (bypasses RLS) ──────────────────
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { cookies: { getAll: () => [] } }
        )

        const { event: eventType, payload } = event

        switch (eventType) {
            case "payment.captured": {
                const payment = payload?.payment?.entity
                if (!payment?.order_id) break
                await supabase
                    .from("orders")
                    .update({
                        status: "confirmed",
                        razorpay_payment_id: payment.id,
                        payment_verified_at: new Date().toISOString(),
                    })
                    .eq("razorpay_order_id", payment.order_id)
                    .eq("status", "pending") // Idempotency guard
                break
            }

            case "payment.failed": {
                const payment = payload?.payment?.entity
                if (!payment?.order_id) break
                await supabase
                    .from("orders")
                    .update({ status: "payment_failed" })
                    .eq("razorpay_order_id", payment.order_id)
                    .eq("status", "pending")
                break
            }

            case "refund.created":
            case "refund.processed": {
                const refund = payload?.refund?.entity
                if (!refund?.payment_id) break
                await supabase
                    .from("orders")
                    .update({ status: "refunded" })
                    .eq("razorpay_payment_id", refund.payment_id)
                break
            }

            default:
                break;
        }

        return NextResponse.json({ received: true })
    } catch (err) {
        console.error("[razorpay-webhook]", {
            message: err instanceof Error ? err.message : "Unknown error",
        })
        return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
    }
}
