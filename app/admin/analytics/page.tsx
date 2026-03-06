"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { ShoppingBag, DollarSign, Users, TrendingUp, Loader2 } from "lucide-react"

interface Stats {
    totalOrders: number
    totalRevenue: number
    totalCustomers: number
    avgOrderValue: number
    pendingOrders: number
    deliveredOrders: number
    topProducts: { name: string; total_sold: number; revenue: number }[]
    revenueByDay: { date: string; revenue: number; orders: number }[]
    ordersByStatus: { status: string; count: number }[]
    recentOrders: { id: string; order_number: string; email: string; total_amount: number; status: string; created_at: string }[]
}

export default function AnalyticsPage() {
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)
    const [range, setRange] = useState<7 | 30 | 90>(30)

    useEffect(() => {
        fetchStats(range)
    }, [range])

    const fetchStats = async (days: number) => {
        setLoading(true)
        const since = new Date()
        since.setDate(since.getDate() - days)
        const sinceISO = since.toISOString()

        // Run all queries in parallel
        const [
            ordersRes,
            allOrdersRes,
            customersRes,
            orderItemsRes,
            recentRes,
        ] = await Promise.all([
            // Orders in range
            supabase
                .from("orders")
                .select("id, total_amount, status, created_at, email")
                .gte("created_at", sinceISO)
                .order("created_at", { ascending: true }),

            // All orders for status counts
            supabase
                .from("orders")
                .select("status"),

            // Customer count (user_roles)
            supabase
                .from("user_roles")
                .select("user_id", { count: "exact", head: true }),

            // Order items for top products
            supabase
                .from("order_items")
                .select("product_name, quantity, total_price, order_id")
                .gte("created_at", sinceISO),

            // Recent 5 orders
            supabase
                .from("orders")
                .select("id, order_number, email, total_amount, status, created_at")
                .order("created_at", { ascending: false })
                .limit(5),
        ])

        const orders = ordersRes.data || []
        const allOrders = allOrdersRes.data || []
        const orderItems = orderItemsRes.data || []

        // Revenue calculations
        const paidOrders = orders.filter(o => ["paid", "shipped", "delivered"].includes(o.status))
        const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
        const totalOrders = orders.length
        const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0

        // Status distribution
        const statusCounts = allOrders.reduce((acc: Record<string, number>, o) => {
            acc[o.status] = (acc[o.status] || 0) + 1
            return acc
        }, {})
        const ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({ status, count }))

        // Revenue by day
        const dayMap: Record<string, { revenue: number; orders: number }> = {}
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date()
            d.setDate(d.getDate() - i)
            const key = d.toISOString().slice(0, 10)
            dayMap[key] = { revenue: 0, orders: 0 }
        }
        orders.forEach(o => {
            const key = o.created_at.slice(0, 10)
            if (dayMap[key]) {
                dayMap[key].orders++
                if (["paid", "shipped", "delivered"].includes(o.status)) {
                    dayMap[key].revenue += o.total_amount || 0
                }
            }
        })
        const revenueByDay = Object.entries(dayMap).map(([date, v]) => ({ date, ...v }))

        // Top products
        const productMap: Record<string, { name: string; total_sold: number; revenue: number }> = {}
        orderItems.forEach(item => {
            if (!productMap[item.product_name]) {
                productMap[item.product_name] = { name: item.product_name, total_sold: 0, revenue: 0 }
            }
            productMap[item.product_name].total_sold += item.quantity
            productMap[item.product_name].revenue += item.total_price || 0
        })
        const topProducts = Object.values(productMap)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5)

        setStats({
            totalOrders,
            totalRevenue,
            totalCustomers: customersRes.count || 0,
            avgOrderValue,
            pendingOrders: statusCounts["pending"] || 0,
            deliveredOrders: statusCounts["delivered"] || 0,
            topProducts,
            revenueByDay,
            ordersByStatus,
            recentOrders: recentRes.data || [],
        })
        setLoading(false)
    }

    const fmt = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`
    const maxRev = stats ? Math.max(...stats.revenueByDay.map(d => d.revenue), 1) : 1

    if (loading) return (
        <div className="p-8 flex items-center justify-center min-h-[60vh]">
            <Loader2 size={32} style={{ color: "var(--accent)" }} className="animate-spin" />
        </div>
    )

    return (
        <div className="p-8 space-y-6">
            {/* Header + range selector */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 style={{ color: "var(--text)" }} className="text-2xl font-bold">Analytics</h1>
                    <p style={{ color: "var(--text-2)" }} className="text-sm mt-1">
                        Real-time store performance data
                    </p>
                </div>
                <div
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "0.75rem" }}
                    className="flex p-1 gap-1"
                >
                    {([7, 30, 90] as const).map(d => (
                        <button
                            key={d}
                            onClick={() => setRange(d)}
                            style={{
                                background: range === d ? "var(--accent)" : "transparent",
                                color: range === d ? "#fff" : "var(--text-2)",
                                borderRadius: "0.5rem",
                                padding: "0.375rem 0.875rem",
                                fontSize: "0.8125rem",
                                fontWeight: 500,
                                transition: "all 0.15s",
                            }}
                        >
                            {d}d
                        </button>
                    ))}
                </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "TOTAL ORDERS", value: stats!.totalOrders, icon: ShoppingBag, color: "var(--accent-cyan, #07e4e1)" },
                    { label: "TOTAL REVENUE", value: fmt(stats!.totalRevenue), icon: DollarSign, color: "var(--accent-yellow, #e7bf04)" },
                    { label: "CUSTOMERS", value: stats!.totalCustomers, icon: Users, color: "var(--accent-pink, #c03c9d)" },
                    { label: "AVG ORDER VALUE", value: fmt(stats!.avgOrderValue), icon: TrendingUp, color: "var(--accent)" },
                ].map(s => (
                    <div
                        key={s.label}
                        style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "1rem" }}
                        className="p-5"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div
                                style={{ background: `${s.color}18`, borderRadius: "0.5rem", padding: "0.5rem" }}
                            >
                                <s.icon size={18} style={{ color: s.color }} />
                            </div>
                        </div>
                        <p style={{ color: "var(--text)" }} className="text-2xl font-bold">{s.value}</p>
                        <p style={{ color: "var(--text-3)" }} className="text-xs font-medium mt-1 tracking-wider">{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue chart */}
                <div
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "1rem" }}
                    className="lg:col-span-2 p-6"
                >
                    <h2 style={{ color: "var(--text)" }} className="text-sm font-semibold mb-4 tracking-wider uppercase">
                        Revenue — Last {range} Days
                    </h2>
                    {stats!.revenueByDay.every(d => d.revenue === 0) ? (
                        <div className="flex items-center justify-center h-40">
                            <p style={{ color: "var(--text-3)" }} className="text-sm">No revenue data for this period</p>
                        </div>
                    ) : (
                        <div className="flex items-end gap-1 h-40">
                            {stats!.revenueByDay.map((d, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                                    <div
                                        className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--bg-elevated)] px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
                                        style={{ color: "var(--text)", border: "1px solid var(--border)" }}
                                    >
                                        {fmt(d.revenue)}
                                    </div>
                                    <div
                                        style={{
                                            height: `${(d.revenue / maxRev) * 100}%`,
                                            minHeight: d.revenue > 0 ? "4px" : "2px",
                                            background: d.revenue > 0 ? "var(--accent)" : "var(--border)",
                                            borderRadius: "3px 3px 0 0",
                                            width: "100%",
                                            opacity: d.revenue > 0 ? 1 : 0.3,
                                            transition: "height 0.3s ease",
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex justify-between mt-2">
                        <span style={{ color: "var(--text-3)" }} className="text-xs">
                            {stats!.revenueByDay[0]?.date}
                        </span>
                        <span style={{ color: "var(--text-3)" }} className="text-xs">
                            {stats!.revenueByDay[stats!.revenueByDay.length - 1]?.date}
                        </span>
                    </div>
                </div>

                {/* Order status breakdown */}
                <div
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "1rem" }}
                    className="p-6"
                >
                    <h2 style={{ color: "var(--text)" }} className="text-sm font-semibold mb-4 tracking-wider uppercase">
                        Order Status
                    </h2>
                    {stats!.ordersByStatus.length === 0 ? (
                        <p style={{ color: "var(--text-3)" }} className="text-sm">No orders yet</p>
                    ) : (
                        <div className="space-y-3">
                            {stats!.ordersByStatus.map(s => {
                                const total = stats!.ordersByStatus.reduce((sum, x) => sum + x.count, 0)
                                const pct = total > 0 ? Math.round((s.count / total) * 100) : 0
                                const colors: Record<string, string> = {
                                    pending: "var(--accent-yellow, #e7bf04)",
                                    paid: "var(--accent-cyan, #07e4e1)",
                                    shipped: "var(--accent-pink, #c03c9d)",
                                    delivered: "#22c55e",
                                    cancelled: "var(--accent)",
                                }
                                return (
                                    <div key={s.status}>
                                        <div className="flex justify-between mb-1">
                                            <span style={{ color: "var(--text-2)" }} className="text-xs capitalize">{s.status}</span>
                                            <span style={{ color: "var(--text)" }} className="text-xs font-medium">{s.count} ({pct}%)</span>
                                        </div>
                                        <div style={{ background: "var(--bg-elevated)", borderRadius: "4px", height: "6px" }}>
                                            <div style={{
                                                width: `${pct}%`, height: "100%",
                                                background: colors[s.status] || "var(--accent)",
                                                borderRadius: "4px", transition: "width 0.5s ease",
                                            }} />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Top products + Recent orders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top products */}
                <div
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "1rem" }}
                    className="p-6"
                >
                    <h2 style={{ color: "var(--text)" }} className="text-sm font-semibold mb-4 tracking-wider uppercase">
                        Top Products
                    </h2>
                    {stats!.topProducts.length === 0 ? (
                        <p style={{ color: "var(--text-3)" }} className="text-sm">No sales data yet</p>
                    ) : (
                        <div className="space-y-3">
                            {stats!.topProducts.map((p, i) => (
                                <div key={p.name} className="flex items-center gap-3">
                                    <span style={{ color: "var(--text-3)" }} className="text-xs w-4">{i + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <p style={{ color: "var(--text)" }} className="text-sm truncate">{p.name}</p>
                                        <p style={{ color: "var(--text-3)" }} className="text-xs">{p.total_sold} units sold</p>
                                    </div>
                                    <span style={{ color: "var(--accent)" }} className="text-sm font-semibold">{fmt(p.revenue)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent orders */}
                <div
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "1rem" }}
                    className="p-6"
                >
                    <h2 style={{ color: "var(--text)" }} className="text-sm font-semibold mb-4 tracking-wider uppercase">
                        Recent Orders
                    </h2>
                    {stats!.recentOrders.length === 0 ? (
                        <p style={{ color: "var(--text-3)" }} className="text-sm">No orders yet</p>
                    ) : (
                        <div className="space-y-3">
                            {stats!.recentOrders.map(o => (
                                <div key={o.id} className="flex items-center justify-between">
                                    <div>
                                        <p style={{ color: "var(--text)" }} className="text-sm font-mono">
                                            #{o.order_number || o.id.slice(0, 8)}
                                        </p>
                                        <p style={{ color: "var(--text-3)" }} className="text-xs truncate max-w-[160px]">{o.email}</p>
                                    </div>
                                    <div className="text-right">
                                        <p style={{ color: "var(--text)" }} className="text-sm font-medium">{fmt(o.total_amount)}</p>
                                        <span style={{
                                            color: o.status === "delivered" ? "#22c55e" : o.status === "cancelled" ? "var(--accent)" : "var(--accent-yellow, #e7bf04)",
                                            fontSize: "0.7rem",
                                            fontWeight: 600,
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em",
                                        }}>
                                            {o.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
