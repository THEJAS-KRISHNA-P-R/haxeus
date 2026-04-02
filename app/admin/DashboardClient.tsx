"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    ShoppingBag, Users, DollarSign, Clock,
    CheckCircle, TrendingUp, ShoppingCart
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
    AdminCard,
    AdminPageHeader,
    AdminButton
} from "@/components/admin/AdminUI";
import { Order } from "@/types/supabase";

interface DashboardStats {
    totalRevenue: number
    totalOrders: number
    totalCustomers: number
    pendingOrders: number
    recentOrders: Partial<Order>[]
    topProducts: Array<{
        id: string | number
        name: string
        image_url: string | null
        sales: number
    }>
}

async function fetchDashboardStats(period: "7d" | "30d" | "90d") {
    const res = await fetch(`/api/admin/stats?period=${period}`);
    if (!res.ok) throw new Error("Failed to fetch stats");
    return res.json();
}

export default function DashboardClient() {
    const [period, setPeriod] = useState<"7d" | "30d" | "90d">("7d");
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetchDashboardStats(period).then(data => {
            setStats(data);
            setLoading(false);
        });
    }, [period]);

    if (loading || !stats) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const statCards = [
        { label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, sub: `+12% from last ${period}`, icon: DollarSign, color: "var(--accent-yellow)" },
        { label: "Orders", value: stats.totalOrders, sub: "New orders this period", icon: ShoppingBag, color: "var(--accent-cyan)" },
        { label: "Customers", value: stats.totalCustomers, sub: "Active users in period", icon: Users, color: "var(--accent-pink)" },
        { label: "Pending", value: stats.pendingOrders, sub: "Awaiting payment", icon: Clock, color: "var(--accent)" },
    ];

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <AdminPageHeader
                    title="Engine Overview"
                    subtitle="Real-time performance monitoring and commerce analytics"
                />

                {/* Period Selector */}
                <div className="flex bg-[var(--bg-elevated)] p-1 rounded-2xl border border-[var(--border)] self-start md:self-auto">
                    {["7d", "30d", "90d"].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p as any)}
                            className={cn(
                                "px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                                period === p
                                    ? "bg-[var(--text)] text-[var(--bg)] shadow-lg"
                                    : "text-[var(--text-3)] hover:text-[var(--text)]"
                            )}
                        >
                            Last {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, i) => (
                    <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <AdminCard className="p-6 relative group overflow-hidden h-full">
                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-4">
                                    <div
                                        className="p-3 rounded-xl transition-transform group-hover:scale-110"
                                        style={{ background: `${card.color}10`, color: card.color }}
                                    >
                                        <card.icon size={20} />
                                    </div>
                                    <div className="text-[10px] font-black py-1 px-2 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-3)]">
                                        LIVE
                                    </div>
                                </div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-3)] mb-1">
                                    {card.label}
                                </p>
                                <p className="text-3xl font-black tracking-tighter text-[var(--text)]">
                                    {card.value}
                                </p>
                                <p className="text-[10px] font-bold text-[var(--text-3)] mt-2 flex items-center gap-1 opacity-60">
                                    {card.sub}
                                </p>
                            </div>

                            {/* Decorative Background Icon */}
                            <card.icon
                                className="absolute -right-4 -bottom-4 opacity-[0.03] rotate-12 transition-transform group-hover:scale-125"
                                size={120}
                            />
                        </AdminCard>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders */}
                <AdminCard className="lg:col-span-2 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-elevated)]/30">
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                <ShoppingCart size={16} className="text-[var(--accent)]" />
                                Recent Orders
                            </h3>
                            <p className="text-[10px] text-[var(--text-3)] font-bold mt-0.5">LATEST TRANSACTIONS IN ENGINE</p>
                        </div>
                        <AdminButton variant="outline" className="h-8" href="/admin/orders">
                            View All
                        </AdminButton>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-[var(--border)] text-[var(--text-3)]">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">ID</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Customer</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Amount</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {stats.recentOrders.map((o) => (
                                    <tr key={o.id} className="hover:bg-[var(--bg-elevated)] transition-colors group cursor-pointer" onClick={() => (window.location.href = `/admin/orders?id=${o.id}`)}>
                                        <td className="px-6 py-4 font-mono text-[10px] text-[var(--text-3)]">
                                            #{o.id?.toString().slice(-8).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs font-bold">{o.shipping_name || "Guest User"}</p>
                                            <p className="text-[10px] text-[var(--text-3)]">{o.created_at ? new Date(o.created_at).toLocaleDateString() : 'N/A'}</p>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-black">₹{o.total_amount}</td>
                                        <td className="px-6 py-4 text-xs">
                                            {o.payment_status === "paid" ? (
                                                <span className="flex items-center gap-1.5 text-emerald-500 font-bold uppercase tracking-wider text-[9px]">
                                                    <CheckCircle size={10} /> PAID
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-amber-500 font-bold uppercase tracking-wider text-[9px]">
                                                    <Clock size={10} /> PENDING
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </AdminCard>

                {/* Top Sellers */}
                <AdminCard className="overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-[var(--border)] bg-[var(--bg-elevated)]/30">
                        <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp size={16} className="text-[var(--accent-yellow)]" />
                            Top Sellers
                        </h3>
                        <p className="text-[10px] text-[var(--text-3)] font-bold mt-0.5">MOST DEMANDED PRODUCTS</p>
                    </div>
                    <div className="p-4 space-y-3 flex-1">
                        {stats.topProducts.map((p, i: number) => (
                            <div
                                key={p.id}
                                className="flex items-center gap-4 p-3 rounded-2xl bg-[var(--bg-elevated)]/50 border border-[var(--border)] hover:border-[var(--text-3)] transition-all cursor-pointer group"
                                onClick={() => (window.location.href = `/admin/products/${p.id}`)}
                            >
                                <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-[var(--border)]">
                                    <img src={p.image_url || "/placeholder.svg"} alt={p.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                    <div className="absolute top-0 left-0 w-full h-full bg-black/20" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black truncate">{p.name}</p>
                                    <p className="text-[9px] font-bold text-[var(--accent-yellow)] uppercase tracking-widest">{p.sales} SALES GENERATED</p>
                                </div>
                                <div className="text-[14px] font-black opacity-10 italic group-hover:opacity-30 group-hover:text-[var(--accent)] transition-all">
                                    RANK {i + 1}
                                </div>
                            </div>
                        ))}
                    </div>
                </AdminCard>
            </div>
        </div>
    );
}

