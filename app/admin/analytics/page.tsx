"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { TrendingUp, ShoppingBag, Users, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AnalyticsPage() {
    const [stats, setStats] = useState({ orders: 0, revenue: 0, customers: 0, avgOrder: 0 })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            const [{ count: orders }, { data: orderData }, { count: customers }] = await Promise.all([
                supabase.from('orders').select('*', { count: 'exact', head: true }),
                supabase.from('orders').select('total_amount').eq('status', 'paid'),
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
            ])

            const revenue = (orderData || []).reduce((sum, o) => sum + (o.total_amount || 0), 0)
            setStats({
                orders: orders || 0,
                revenue,
                customers: customers || 0,
                avgOrder: orders ? Math.round(revenue / orders) : 0
            })
            setLoading(false)
        }
        load()
    }, [])

    const cards = [
        { icon: ShoppingBag, label: "Total Orders", value: stats.orders, color: "#e93a3a", trend: "+12%" },
        { icon: DollarSign, label: "Total Revenue", value: `₹${stats.revenue.toLocaleString('en-IN')}`, color: "#e7bf04", trend: "+8%" },
        { icon: Users, label: "Customers", value: stats.customers, color: "#c03c9d", trend: "+5%" },
        { icon: TrendingUp, label: "Avg Order Value", value: `₹${stats.avgOrder}`, color: "#07e4e1", trend: "-2%" },
    ]

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Analytics</h1>
                <p className="text-white/40 text-sm mt-1">Store performance and growth overview</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {cards.map(card => (
                    <div key={card.label} className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 rounded-lg" style={{ background: `${card.color}15` }}>
                                <card.icon className="h-4 w-4" style={{ color: card.color }} />
                            </div>
                            <div className={cn(
                                "flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                                card.trend.startsWith('+') ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                            )}>
                                {card.trend.startsWith('+') ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                {card.trend}
                            </div>
                        </div>
                        {loading ? (
                            <div className="h-8 w-24 bg-white/[0.05] animate-pulse rounded-md" />
                        ) : (
                            <p className="text-2xl font-bold text-white">{card.value}</p>
                        )}
                        <p className="text-xs text-white/40 mt-1">{card.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6 h-[300px] flex flex-col justify-center items-center text-white/20">
                    <p className="text-sm">Revenue Visualization Placeholder</p>
                    <p className="text-xs">(Requires Chart.js or Recharts implementation)</p>
                </div>
                <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6">
                    <h3 className="text-sm font-bold text-white mb-4">Top Categories</h3>
                    <div className="space-y-4">
                        {['Streetwear', 'Accessories', 'Limited Edition'].map((cat, i) => (
                            <div key={cat} className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-white/60">{cat}</span>
                                    <span className="text-white/40">{85 - i * 15}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
                                    <div className="h-full bg-[#e93a3a]" style={{ width: `${85 - i * 15}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
