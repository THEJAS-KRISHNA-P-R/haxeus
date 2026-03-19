import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { verifyAdminRequest } from "@/lib/admin-auth"

export async function GET(req: Request) {
  try {
    const auth = await verifyAdminRequest()
    if (!auth.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const q = searchParams.get("q") || ""
    const term = q.trim().toLowerCase()

    if (term.length < 2) {
      return NextResponse.json({ results: [] })
    }

    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    )

    const safeTerm = term.replace(/[(),]/g, "")
    const statuses = ["paid", "pending", "shipped", "delivered", "cancelled"]
    const matchedStatus = statuses.find(s => s.startsWith(safeTerm))

    const [ordersRes, productsRes, couponsRes, customersRes] = await Promise.all([
      supabaseAdmin.from("orders")
        .select("id, shipping_email, total_amount, status")
        .or(matchedStatus ? `status.eq.${matchedStatus}` : `shipping_email.ilike.%${safeTerm}%,id.ilike.%${safeTerm}%`)
        .limit(matchedStatus ? 8 : 4),
      supabaseAdmin.from("products")
        .select("id, name, price, is_active")
        .ilike("name", `%${safeTerm}%`)
        .limit(4),
      supabaseAdmin.from("coupons")
        .select("id, code, discount_type, discount_value, is_active")
        .ilike("code", `%${safeTerm}%`)
        .limit(3),
      supabaseAdmin.from("profiles")
        .select("id, full_name, email")
        .or(`full_name.ilike.%${safeTerm}%,email.ilike.%${safeTerm}%`)
        .limit(4)
    ])

    const results: any[] = []

    ordersRes.data?.forEach(o => results.push({
      type: "order",
      id: o.id,
      title: `Order #${o.id.slice(-8).toUpperCase()}`,
      subtitle: `${o.shipping_email} · ₹${o.total_amount} · ${o.status.toUpperCase()}`,
      href: `/admin/orders?id=${o.id}`,
    }))

    productsRes.data?.forEach(p => results.push({
      type: "product",
      id: String(p.id),
      title: p.name,
      subtitle: `₹${p.price} · ${p.is_active ? "Active" : "Inactive"}`,
      href: `/admin/products/${p.id}`,
    }))

    customersRes.data?.forEach(c => results.push({
      type: "customer",
      id: c.id,
      title: c.full_name || "Unknown Customer",
      subtitle: c.email,
      href: `/admin/users?email=${encodeURIComponent(c.email)}`,
    }))

    couponsRes.data?.forEach(c => results.push({
      type: "coupon",
      id: String(c.id),
      title: c.code,
      subtitle: `${c.discount_type === "percentage" ? c.discount_value + "% off" : "₹" + c.discount_value + " off"} · ${c.is_active ? "Active" : "Paused"}`,
      href: `/admin/coupons`,
    }))

    return NextResponse.json({ results })
  } catch (err) {
    console.error("[api/admin/search]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
