"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { ShoppingBag, DollarSign, Users, TrendingUp, Loader2, BarChart3, PieChart, Activity } from "lucide-react"
import {
    AdminCard,
    AdminPageHeader,
    AdminButton
} from "@/components/admin/AdminUI"
import { cn } from "@/lib/utils"

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
    recentOrders: { id: string; order_number: string; shipping_email: string; total_amount: number; status: string; payment_status: string; created_at: string }[]
}

export default function AnalyticsContent() {
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)
    const [range, setRange] = useState<7 | 30 | 90>(30)

    const fetchStats = async (days: number) => {
        setLoading(true)
        const since = new Date()
        since.setDate(since.getDate() - days)
        const sinceISO = since.toISOString()

        const [
            ordersRes,
            allOrdersRes,
            customersRes,
            orderItemsRes,
            recentRes,
        ] = await Promise.all([
            supabase.from("orders").select("id, total_amount, status, payment_status, created_at, shipping_email").gte("created_at", sinceISO).order("created_at", { ascending: true }),
            supabase.from("orders").select("status, payment_status"),
            supabase.from("user_roles").select("user_id", { count: "exact", head: true }),
            supabase.from("order_items").select("quantity, price, order_id, product_id, products(name)").gte("created_at", sinceISO),
            supabase.from("orders").select("id, order_number, shipping_email, total_amount, status, payment_status, created_at").order("created_at", { ascending: false }).limit(5),
        ])

        const orders = ordersRes.data || []
        const allOrders = allOrdersRes.data || []
        const orderItems = orderItemsRes.data || []

        const paidOrders = orders.filter(o => o.payment_status === "paid")
        const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
        const totalOrders = orders.length
        const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0

        const statusCounts = allOrders.reduce((acc: Record<string, number>, o) => {
            acc[o.status] = (acc[o.status] || 0) + 1
            return acc
        }, {})
        const ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({ status, count }))

        const pendingOrders = allOrders.filter(o => o.payment_status === "pending").length

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
                if (o.payment_status === "paid") {
                    dayMap[key].revenue += o.total_amount || 0
                }
            }
        })
        const revenueByDay = Object.entries(dayMap).map(([date, v]) => ({ date, ...v }))

        const productMap: Record<string, { name: string; total_sold: number; revenue: number }> = {}
        orderItems.forEach((item: any) => {
            const productName = item.products?.name || 'Unknown'
            if (!productMap[productName]) productMap[productName] = { name: productName, total_sold: 0, revenue: 0 }
            productMap[productName].total_sold += item.quantity
            productMap[productName].revenue += (item.price * item.quantity) || 0
        })
        const topProducts = Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5)

        setStats({
            totalOrders, totalRevenue, totalCustomers: customersRes.count || 0,
            avgOrderValue, pendingOrders,
            deliveredOrders: statusCounts["delivered"] || 0,
            topProducts, revenueByDay, ordersByStatus, recentOrders: (recentRes.data || []).map(o => ({
                ...o,
                shipping_email: o.shipping_email || 'No email'
            })),
        })
        setLoading(false)
    }

    useEffect(() => {
        fetchStats(range)
    }, [range])

    const fmt = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`
    const maxRev = stats ? Math.max(...stats.revenueByDay.map(d => d.revenue), 1) : 1

    if (loading || !stats) return (
        <div className="p-8 flex items-center justify-center min-h-[60vh]">
            <Loader2 size={32} style={{ color: "var(--accent)" }} className="animate-spin" />
        </div>
    )

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex items-start justify-between">
                <AdminPageHeader
                    title="Analytics"
                    subtitle="Real-time performance metrics and revenue tracking."
                />
                <div className="flex bg-[var(--bg-elevated)] p-1 rounded-full border border-[var(--border)]">
                    {([7, 30, 90] as const).map(d => (
                        <button
                            key={d}
                            onClick={() => setRange(d)}
                            className={cn(
                                "px-5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                                range === d
                                    ? "bg-[var(--text)] text-[var(--bg)] shadow-lg"
                                    : "text-[var(--text-3)] hover:text-[var(--text)]"
                            )}
                        >
                            {d} Days
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBag, color: "var(--accent)" },
                    { label: "Revenue", value: fmt(stats.totalRevenue), icon: DollarSign, color: "#3b82f6" },
                    { label: "Customers", value: stats.totalCustomers, icon: Users, color: "#8b5cf6" },
                    { label: "Avg Ticket", value: fmt(stats.avgOrderValue), icon: TrendingUp, color: "#f59e0b" },
                ].map((s, i) => (
                    <AdminCard key={i} className="p-6 relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-4">
                            <div
                                style={{ background: `color-mix(in srgb, ${s.color} 10%, transparent)`, borderColor: `color-mix(in srgb, ${s.color} 20%, transparent)` }}
                                className="p-3 rounded-2xl border"
                            >
                                <s.icon size={18} style={{ color: s.color }} />
                            </div>
                        </div>
                        <h4 style={{ color: "var(--text)" }} className="text-2xl font-bold tracking-tight mb-1">{s.value}</h4>
                        <span style={{ color: "var(--text-3)" }} className="text-[10px] font-bold uppercase tracking-widest">{s.label}</span>
                    </AdminCard>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <AdminCard className="lg:col-span-2 p-8">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <SectionTitle icon={BarChart3} title="Revenue Stream" />
                            <p style={{ color: "var(--text-3)" }} className="text-[10px] mt-1 font-medium">Daily transaction volume per {range} days.</p>
                        </div>
                    </div>
                    {stats.revenueByDay.every(d => d.revenue === 0) ? (
                        <div className="h-56 flex items-center justify-center opacity-30 italic text-sm">No activity recorded.</div>
                    ) : (
                        <div className="flex items-end gap-1.5 h-56 pt-4">
                            {stats.revenueByDay.map((d, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[var(--bg-card)] border border-[var(--border)] px-3 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-20 shadow-xl scale-90 group-hover:scale-100">
                                        <span style={{ color: "var(--text)" }}>{fmt(d.revenue)}</span>
                                        <div style={{ color: "var(--text-3)" }} className="text-[8px] font-medium">{d.date}</div>
                                    </div>
                                    <div
                                        style={{
                                            height: `${(d.revenue / maxRev) * 100}%`,
                                            minHeight: d.revenue > 0 ? "4px" : "1px",
                                            background: d.revenue > 0 ? "var(--accent)" : "var(--bg-elevated)",
                                            borderRadius: "4px 4px 1px 1px",
                                            width: "100%",
                                            transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                                        }}
                                        className="group-hover:brightness-125"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </AdminCard>

                <AdminCard className="p-8">
                    <SectionTitle icon={PieChart} title="Status Mix" />
                    <p style={{ color: "var(--text-3)" }} className="text-[10px] mt-1 mb-8 font-medium">Distribution of all-time orders.</p>
                    <div className="space-y-5">
                        {stats.ordersByStatus.map(s => {
                            const total = stats.ordersByStatus.reduce((sum, x) => sum + x.count, 0)
                            const pct = total > 0 ? Math.round((s.count / total) * 100) : 0
                            const colors: Record<string, string> = {
                                pending: "#f59e0b", paid: "#07e4e1", shipped: "#c03c9d", delivered: "#22c55e", cancelled: "var(--accent)"
                            }
                            return (
                                <div key={s.status} className="group">
                                    <div className="flex justify-between items-end mb-1.5">
                                        <span style={{ color: "var(--text-2)" }} className="text-[10px] uppercase font-bold tracking-wider">{s.status}</span>
                                        <span style={{ color: "var(--text)" }} className="text-[10px] font-bold">{s.count} <span className="opacity-40 font-medium">({pct}%)</span></span>
                                    </div>
                                    <div style={{ background: "var(--bg-elevated)", borderRadius: "10px", height: "4px", overflow: "hidden" }}>
                                        <div style={{ width: `${pct}%`, height: "100%", background: colors[s.status] || "var(--accent)", transition: "width 0.8s ease-out" }} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </AdminCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <AdminCard className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <SectionTitle icon={TrendingUp} title="Best-Selling Products" />
                    </div>
                    <div className="space-y-4">
                        {stats.topProducts.map((p, i) => (
                            <div key={p.name} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-[var(--bg-elevated)] transition-all">
                                <span style={{ color: "var(--text-3)" }} className="text-[10px] font-bold w-4 text-center">{i + 1}</span>
                                <div className="flex-1">
                                    <p style={{ color: "var(--text)" }} className="text-xs font-bold">{p.name}</p>
                                    <p style={{ color: "var(--text-3)" }} className="text-[10px] font-medium tracking-tight">{p.total_sold} units moved</p>
                                </div>
                                <div className="text-right">
                                    <p style={{ color: "var(--text)" }} className="text-xs font-bold leading-tight">{fmt(p.revenue)}</p>
                                    <p className="text-[8px] font-bold text-emerald-500 tracking-widest uppercase">Volume Top</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </AdminCard>

                <AdminCard className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <SectionTitle icon={Activity} title="Live Activity Log" />
                        <AdminButton variant="outline" className="px-3 h-7 text-[8px]" href="/admin/orders">Audit Full History</AdminButton>
                    </div>
                    <div className="space-y-1">
                        {stats.recentOrders.map(o => (
                            <div key={o.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-[var(--bg-elevated)] transition-all group">
                                <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }} className="w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-bold text-[var(--text-3)] group-hover:text-[var(--text)]">#{o.id.slice(-4).toUpperCase()}</div>
                                <div className="flex-1">
                                    <p style={{ color: "var(--text)" }} className="text-xs font-bold leading-tight truncate">#{o.order_number || o.id.slice(-8).toUpperCase()}</p>
                                    <p style={{ color: "var(--text-3)" }} className="text-[9px] font-medium truncate max-w-[180px]">{o.shipping_email}</p>
                                </div>
                                <div className="text-right">
                                    <p style={{ color: "var(--text)" }} className="text-xs font-bold leading-tight">{fmt(o.total_amount)}</p>
                                    <div className="flex flex-col items-end gap-1 mt-1">
                                        {o.payment_status === "paid" ? (
                                            <span style={{ color: "var(--color-success, #16a34a)" }} className="text-[8px] font-black uppercase tracking-[0.15em]">PAID</span>
                                        ) : (
                                            <span style={{ color: "var(--accent-yellow, #f59e0b)" }} className="text-[8px] font-black uppercase tracking-[0.15em]">UNPAID</span>
                                        )}
                                        <span style={{ color: o.status === "delivered" ? "var(--color-success, #16a34a)" : "var(--text-3)" }} className="text-[8px] font-black uppercase tracking-[0.15em]">{o.status}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </AdminCard>
            </div>
        </div>
    )
}

function SectionTitle({ icon: Icon, title }: { icon: any; title: string }) {
    return (
        <div className="flex items-center gap-2 group">
            <div style={{ background: "color-mix(in srgb, var(--accent) 10%, transparent)" }} className="p-1.5 rounded-lg border border-[var(--border)] group-hover:border-[var(--accent)] transition-colors">
                <Icon size={14} className="text-[var(--accent)]" />
            </div>
            <h3 style={{ color: "var(--text)" }} className="text-xs font-black uppercase tracking-[0.2em]">{title}</h3>
        </div>
    )
}

