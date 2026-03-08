import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://haxeus.in"
const INDEXNOW_KEY = process.env.INDEXNOW_KEY

const INDEXNOW_ENGINES = [
    "https://api.indexnow.org/indexnow",
    "https://www.bing.com/indexnow",
]

async function pingIndexNow(urls: string[]): Promise<void> {
    if (!INDEXNOW_KEY) {
        console.warn("[indexnow] INDEXNOW_KEY not set — skipping ping")
        return
    }

    const payload = {
        host: SITE_URL.replace("https://", ""),
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: urls,
    }

    await Promise.allSettled(
        INDEXNOW_ENGINES.map((engine) =>
            fetch(engine, {
                method: "POST",
                headers: { "Content-Type": "application/json; charset=utf-8" },
                body: JSON.stringify(payload),
            })
        )
    )
}

// POST /api/indexnow — admin only, triggers IndexNow ping for given URLs
export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { cookies: { getAll: () => cookieStore.getAll() } }
        )

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        const { data: roleRow } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .maybeSingle()

        if (roleRow?.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const body = await req.json()
        const { urls } = body

        if (!Array.isArray(urls) || !urls.length || urls.length > 10_000) {
            return NextResponse.json({ error: "Invalid URL list" }, { status: 400 })
        }

        // Only allow URLs on our own domain
        const validUrls = urls.filter((u: unknown) => {
            if (typeof u !== "string") return false
            try {
                return new URL(u).hostname === SITE_URL.replace("https://", "")
            } catch { return false }
        })

        if (!validUrls.length) {
            return NextResponse.json({ error: "No valid URLs provided" }, { status: 400 })
        }

        await pingIndexNow(validUrls)

        return NextResponse.json({ success: true, pinged: validUrls.length, urls: validUrls })
    } catch (err) {
        console.error("[indexnow]", err)
        return NextResponse.json({ error: "Failed to ping IndexNow" }, { status: 500 })
    }
}
