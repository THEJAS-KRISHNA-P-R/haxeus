import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { verifyAdminRequest } from "@/lib/admin-auth"

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest()
    if (!auth.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const period = (searchParams.get("period") || "7d") as "7d" | "30d" | "90d"
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90
    const since = new Date(Date.now() - days * 86_400_000).toISOString()

    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    )

    const [ordersRes, customersRes, recentRes, topRes] = await Promise.all([
      supabaseAdmin.from("orders").select("id, total_amount, payment_status, created_at").gte("created_at", since),
      supabaseAdmin.from("orders").select("user_id").gte("created_at", since),
      supabaseAdmin.from("orders")
        .select("id, created_at, total_amount, payment_status, shipping_name")
        .order("created_at", { ascending: false })
        .limit(5),
      supabaseAdmin.from("order_items").select("product_id, products(id, name, front_image)").limit(200),
    ])

    const orders = ordersRes.data ?? []
    const unique = new Set((customersRes.data ?? []).map((o: any) => o.user_id))

    const tally: Record<string, { id: string; name: string; image_url: string; sales: number }> = {}
    for (const item of (topRes.data ?? []) as any[]) {
      const p = item.products
      if (!p) continue
      if (!tally[p.id]) tally[p.id] = { id: p.id, name: p.name, image_url: p.front_image ?? "", sales: 0 }
      tally[p.id].sales++
    }
    const topProducts = Object.values(tally).sort((a, b) => b.sales - a.sales).slice(0, 5)

    return NextResponse.json({
      totalRevenue: orders.filter((o: any) => o.payment_status === "paid").reduce((s: number, o: any) => s + Number(o.total_amount), 0),
      totalOrders: orders.length,
      totalCustomers: unique.size,
      pendingOrders: orders.filter((o: any) => o.payment_status === "pending").length,
      recentOrders: recentRes.data ?? [],
      topProducts,
    })
  } catch (err) {
    console.error("[api/admin/stats]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
