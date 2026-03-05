"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { TrendingUp, ShoppingBag, Users, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    AdminCard,
    AdminPageHeader
} from "@/components/admin/AdminUI";

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
        { icon: ShoppingBag, label: "Total Orders", value: stats.orders, color: "var(--accent)", trend: "+12%" },
        { icon: DollarSign, label: "Total Revenue", value: `₹${stats.revenue.toLocaleString('en-IN')}`, color: "#e7bf04", trend: "+8%" },
        { icon: Users, label: "Customers", value: stats.customers, color: "#c03c9d", trend: "+5%" },
        { icon: TrendingUp, label: "Avg Order Value", value: `₹${stats.avgOrder}`, color: "#07e4e1", trend: "-2%" },
    ]

    return (
        <div className="space-y-6">
            <div className="mb-2">
                <AdminPageHeader
                    title="Analytics"
                    subtitle="Comprehensive overview of your store's performance and growth metrics."
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map(card => (
                    <AdminCard key={card.label} className="p-5 flex flex-col justify-between min-h-[140px]">
                        <div className="flex items-center justify-between mb-4">
                            <div
                                className="p-2.5 rounded-xl border"
                                style={{
                                    background: `color-mix(in srgb, ${card.color.startsWith('var') ? 'var(--accent)' : card.color} 10%, transparent)`,
                                    borderColor: `color-mix(in srgb, ${card.color.startsWith('var') ? 'var(--accent)' : card.color} 20%, transparent)`
                                }}
                            >
                                <card.icon className="h-4 w-4" style={{ color: card.color.startsWith('var') ? 'var(--accent)' : card.color }} />
                            </div>
                            <div className={cn(
                                "flex items-center gap-0.5 text-[9px] font-bold px-2 py-1 rounded-lg border",
                                card.trend.startsWith('+') ? "text-emerald-500" : "text-rose-500"
                            )}
                                style={{
                                    background: card.trend.startsWith('+')
                                        ? "color-mix(in srgb, #10b981 10%, transparent)"
                                        : "color-mix(in srgb, #f43f5e 10%, transparent)",
                                    borderColor: card.trend.startsWith('+')
                                        ? "color-mix(in srgb, #10b981 20%, transparent)"
                                        : "color-mix(in srgb, #f43f5e 20%, transparent)"
                                }}>
                                {card.trend.startsWith('+') ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                {card.trend}
                            </div>
                        </div>
                        <div>
                            {loading ? (
                                <div style={{ background: "var(--bg-elevated)" }} className="h-8 w-24 animate-pulse rounded-lg" />
                            ) : (
                                <p style={{ color: "var(--text)" }} className="text-2xl font-bold tracking-tight">{card.value}</p>
                            )}
                            <p style={{ color: "var(--text-3)" }} className="text-[10px] font-bold uppercase tracking-widest mt-1">{card.label}</p>
                        </div>
                    </AdminCard>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <AdminCard className="lg:col-span-2 p-8 h-[350px] flex flex-col justify-center items-center text-center">
                    <div
                        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-3)" }}
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                    >
                        <TrendingUp size={32} className="opacity-20" />
                    </div>
                    <p style={{ color: "var(--text)" }} className="font-bold text-lg">Revenue Visualization</p>
                    <p style={{ color: "var(--text-3)" }} className="text-sm mt-1 max-w-sm">Detailed charts and graphs showing your store's financial growth over time will be rendered here.</p>
                </AdminCard>

                <AdminCard className="p-6">
                    <h3 style={{ color: "var(--text)" }} className="text-xs font-bold uppercase tracking-widest mb-6">Top Categories</h3>
                    <div className="space-y-6">
                        {['Streetwear', 'Accessories', 'Limited Edition'].map((cat, i) => (
                            <div key={cat} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span style={{ color: "var(--text-2)" }} className="text-[10px] font-bold uppercase tracking-wider">{cat}</span>
                                    <span style={{ color: "var(--text-3)" }} className="text-[10px] font-bold">{85 - i * 15}%</span>
                                </div>
                                <div style={{ background: "var(--bg-elevated)" }} className="h-1.5 w-full rounded-full overflow-hidden">
                                    <div className="h-full bg-[var(--accent)]" style={{ width: `${85 - i * 15}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </AdminCard>
            </div>
        </div>
    )
}
