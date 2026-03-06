import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { cached } from "@/lib/redis"
import { CK, TTL } from "@/lib/cache-keys"

export async function GET(req: NextRequest) {
    const days = Number(req.nextUrl.searchParams.get("days") ?? "30")
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

    // Auth check
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { data: role } = await supabase.from("user_roles").select("role")
        .eq("user_id", session.user.id).single()
    if (role?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const data = await cached(CK.analytics(days), TTL.ANALYTICS, async () => {
        const since = new Date()
        since.setDate(since.getDate() - days)
        const sinceISO = since.toISOString()

        const [ordersRes, customersRes] = await Promise.all([
            supabase.from("orders").select("id, total_amount, status, created_at").gte("created_at", sinceISO),
            supabase.from("user_roles").select("user_id", { count: "exact", head: true }),
        ])

        const orders = ordersRes.data || []
        const paid = orders.filter((o: any) => ["paid", "shipped", "delivered"].includes(o.status))
        const revenue = paid.reduce((s: number, o: any) => s + (o.total_amount || 0), 0)

        return {
            totalOrders: orders.length,
            totalRevenue: revenue,
            totalCustomers: customersRes.count || 0,
            avgOrderValue: paid.length > 0 ? revenue / paid.length : 0,
            cachedAt: new Date().toISOString(),
        }
    })

    return NextResponse.json(data)
}
