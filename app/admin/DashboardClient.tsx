"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    ShoppingBag, Users, DollarSign, Clock,
    CheckCircle, TrendingUp, ShoppingCart
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
    AdminCard,
    AdminPageHeader,
    AdminButton,
    AdminTableHeader,
    AdminTableRow
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
    const router = useRouter();
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
                <div 
                    style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }}
                    className="w-8 h-8 rounded-full border-2 animate-spin" 
                />
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
                <div className="flex bg-[var(--bg-elevated)] p-1 rounded-2xl border border-[var(--border)] self-start md:self-auto overflow-hidden">
                    {["7d", "30d", "90d"].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p as any)}
                            className={cn(
                                "px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300",
                                period === p
                                    ? "bg-[var(--text)] text-[var(--bg)] shadow-lg scale-100"
                                    : "text-[var(--text-3)] hover:text-[var(--text)] hover:bg-white/[0.05]"
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
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <AdminCard className="p-6 relative group overflow-hidden h-full border border-transparent hover:border-[var(--border-hover)] transition-all">
                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-4">
                                    <div
                                        className="p-3 rounded-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-inner"
                                        style={{ background: `${card.color}10`, color: card.color, border: `1px solid ${card.color}20` }}
                                    >
                                        <card.icon size={20} strokeWidth={2.5} />
                                    </div>
                                    <div className="text-[9px] font-black py-1 px-2.5 rounded-md bg-[var(--bg-elevated)] text-[var(--accent-glow)] border border-[var(--border)] tracking-widest">
                                        LIVE
                                    </div>
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--text-3)] mb-1 opacity-60">
                                    {card.label}
                                </p>
                                <p className="text-3xl font-black tracking-tight text-[var(--text)] font-display">
                                    {card.value}
                                </p>
                                <div className="flex items-center gap-1.5 mt-2">
                                    <div className="w-1 h-1 rounded-full bg-[var(--accent)] animate-pulse" />
                                    <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-3)] opacity-40">
                                        {card.sub}
                                    </p>
                                </div>
                            </div>

                            {/* Decorative Background Icon */}
                            <card.icon
                                className="absolute -right-6 -bottom-6 opacity-[0.02] rotate-12 transition-all duration-700 group-hover:scale-125 group-hover:-rotate-12 group-hover:opacity-[0.05]"
                                size={140}
                            />
                        </AdminCard>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders */}
                <AdminCard className="lg:col-span-2 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-elevated)]/20">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                <ShoppingCart size={14} className="text-[var(--accent)]" />
                                Recent Transactions
                            </h3>
                            <p className="text-[9px] text-[var(--text-3)] font-black mt-0.5 opacity-50 uppercase tracking-widest">REAL-TIME INVENTORY THROUGHPUT</p>
                        </div>
                        <AdminButton variant="outline" className="h-8 !text-[9px]" onClick={() => router.push("/admin/orders")}>
                            Full Ledger
                        </AdminButton>
                    </div>
                    <div className="overflow-x-auto flex-1 p-2">
                        <div className="min-w-[600px]">
                            <AdminTableHeader cols="grid-cols-[1fr_2fr_1fr_1.2fr] !bg-transparent border-none">
                                <div className="pl-4">ID</div>
                                <div>Customer</div>
                                <div>Total</div>
                                <div className="pr-4">Status</div>
                            </AdminTableHeader>
                            <div className="divide-y divide-[var(--border)]/50">
                                {stats.recentOrders.map((o: Partial<Order>) => (
                                    <AdminTableRow 
                                        key={o.id} 
                                        cols="grid-cols-[1fr_2fr_1fr_1.2fr]"
                                        className="py-3.5 hover:bg-white/[0.02]"
                                        onClick={() => router.push(`/admin/orders?id=${o.id}`)}
                                    >
                                        <div className="pl-4 font-mono text-[10px] font-black text-[var(--text-3)] opacity-40 uppercase tracking-tighter">
                                            #{o.id?.toString().slice(-8).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black uppercase tracking-tight">{o.shipping_name || "GUEST PROTOCOL"}</p>
                                            <p className="text-[9px] font-bold text-[var(--text-3)] opacity-50 uppercase tracking-widest">
                                                {o.created_at ? new Date(o.created_at).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' }) : 'N/A'}
                                            </p>
                                        </div>
                                        <div className="text-xs font-black tracking-tight">₹{Number(o.total_amount).toLocaleString()}</div>
                                        <div className="pr-4">
                                            {o.payment_status === "paid" ? (
                                                <span className="inline-flex items-center gap-1.5 font-black uppercase tracking-widest text-[9px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
                                                    <CheckCircle size={10} /> PAID
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 font-black uppercase tracking-widest text-[9px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                    <Clock size={10} /> PENDING
                                                </span>
                                            )}
                                        </div>
                                    </AdminTableRow>
                                ))}
                            </div>
                        </div>
                    </div>
                </AdminCard>

                {/* Top Sellers */}
                <AdminCard className="overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-[var(--border)] bg-[var(--bg-elevated)]/20">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                            <TrendingUp size={14} className="text-[var(--accent-yellow)]" />
                            Top Velocity
                        </h3>
                        <p className="text-[9px] text-[var(--text-3)] font-black mt-0.5 opacity-50 uppercase tracking-widest">MARKET DEMAND CLASSIFICATION</p>
                    </div>
                    <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[500px]">
                        {stats.topProducts.map((p: any, i: number) => (
                            <div
                                key={p.id}
                                className="flex items-center gap-4 p-3 rounded-2xl bg-[var(--bg-elevated)]/30 border border-[var(--border)] hover:border-[var(--text-3)] transition-all cursor-pointer group"
                                onClick={() => router.push(`/admin/products/${p.id}`)}
                            >
                                <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-[var(--border)] bg-black/40">
                                    <img 
                                        src={p.image_url || "/placeholder.svg"} 
                                        alt={p.name} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-125" 
                                    />
                                    <div className="absolute top-0 left-0 w-full h-full bg-black/10 transition-opacity group-hover:opacity-0" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-black uppercase tracking-tight truncate">{p.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-yellow)] animate-pulse" />
                                        <p className="text-[8px] font-black text-[var(--accent-yellow)] uppercase tracking-[0.15em]">{p.sales} UNITS SHIPPED</p>
                                    </div>
                                </div>
                                <div className="text-[12px] font-black opacity-10 italic group-hover:opacity-50 group-hover:text-[var(--accent)] transition-all uppercase tracking-widest font-mono">
                                    #{i + 1}
                                </div>
                            </div>
                        ))}
                    </div>
                </AdminCard>
            </div>
        </div>
    );
}

