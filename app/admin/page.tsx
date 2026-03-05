"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShoppingBag, Users, DollarSign, Clock,
  CheckCircle, XCircle, ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

async function fetchDashboardStats(period: "7d" | "30d" | "90d") {
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const since = new Date(Date.now() - days * 86_400_000).toISOString();

  const [ordersRes, customersRes, recentRes, topRes] = await Promise.all([
    supabase.from("orders").select("id, total_amount, payment_status, created_at").gte("created_at", since),
    supabase.from("orders").select("user_id").gte("created_at", since),
    supabase.from("orders")
      .select("id, created_at, total_amount, payment_status, shipping_name")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("order_items").select("product_id, products(id, name, front_image)").limit(200),
  ]);

  const orders = ordersRes.data ?? [];
  const unique = new Set((customersRes.data ?? []).map((o: any) => o.user_id));

  // tally top products by sales count
  const tally: Record<string, { id: string; name: string; image_url: string; sales: number }> = {};
  for (const item of (topRes.data ?? []) as any[]) {
    const p = item.products;
    if (!p) continue;
    if (!tally[p.id]) tally[p.id] = { id: p.id, name: p.name, image_url: p.front_image ?? "", sales: 0 };
    tally[p.id].sales++;
  }
  const topProducts = Object.values(tally).sort((a, b) => b.sales - a.sales).slice(0, 5);

  return {
    totalRevenue: orders.reduce((s: number, o: any) => s + Number(o.total_amount), 0),
    totalOrders: orders.length,
    totalCustomers: unique.size,
    pendingOrders: orders.filter((o: any) => o.payment_status === "pending").length,
    recentOrders: recentRes.data ?? [],
    topProducts,
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");

  useEffect(() => {
    fetchDashboardStats(period).then(setStats);
  }, [period]);

  const statCards = [
    { label: "Total Revenue", value: stats?.totalRevenue ?? 0, prefix: "₹", icon: DollarSign, delta: "+12%", color: "text-emerald-400", bg: "from-emerald-500/10" },
    { label: "Total Orders", value: stats?.totalOrders ?? 0, prefix: "", icon: ShoppingBag, delta: "+8%", color: "text-blue-400", bg: "from-blue-500/10" },
    { label: "Customers", value: stats?.totalCustomers ?? 0, prefix: "", icon: Users, delta: "+23%", color: "text-violet-400", bg: "from-violet-500/10" },
    { label: "Pending Orders", value: stats?.pendingOrders ?? 0, prefix: "", icon: Clock, delta: null, color: "text-orange-400", bg: "from-orange-500/10" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Overview</h1>
          <p className="text-sm text-white/40 mt-0.5">Welcome back. Here&apos;s what&apos;s happening.</p>
        </div>
        <div className="flex gap-1 p-1 bg-white/[0.04] rounded-xl border border-white/[0.06]">
          {(["7d", "30d", "90d"] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={cn("px-4 py-1.5 text-xs font-semibold rounded-lg transition-all",
                period === p ? "bg-white text-black" : "text-white/40 hover:text-white")}>
              {p === "7d" ? "7 days" : p === "30d" ? "30 days" : "90 days"}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-start justify-between mb-4">
                <div className={cn("p-2.5 rounded-xl bg-gradient-to-br to-transparent border border-white/[0.06]", card.bg)}>
                  <card.icon size={16} className={card.color} />
                </div>
                {card.delta && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                    <ArrowUpRight size={12} />{card.delta}
                  </span>
                )}
              </div>
              <div className="space-y-0.5">
                <div className="text-2xl font-bold text-white tabular-nums">
                  {stats
                    ? `${card.prefix}${card.value.toLocaleString("en-IN")}`
                    : <span className="animate-pulse text-white/20">—</span>}
                </div>
                <div className="text-xs text-white/35 font-medium">{card.label}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent orders + top products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h2 className="font-semibold text-white">Recent Orders</h2>
              <a href="/admin/orders" className="text-xs text-white/40 hover:text-white transition-colors flex items-center gap-1">
                View all <ArrowUpRight size={12} />
              </a>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {(stats?.recentOrders ?? Array(5).fill(null)).map((order: any, i: number) => (
                <OrderRow key={order?.id ?? i} order={order} loading={!stats} />
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <h2 className="font-semibold text-white">Top Products</h2>
            <a href="/admin/products" className="text-xs text-white/40 hover:text-white transition-colors">Manage</a>
          </div>
          <div className="divide-y divide-white/[0.04] p-2">
            {(stats?.topProducts ?? Array(5).fill(null)).map((product: any, i: number) => (
              <TopProductRow key={product?.id ?? i} product={product} rank={i + 1} loading={!stats} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderRow({ order, loading }: { order: any; loading: boolean }) {
  if (loading) return (
    <div className="flex items-center gap-4 px-6 py-3.5">
      <div className="w-8 h-8 rounded-lg bg-white/[0.05] animate-pulse" />
      <div className="flex-1 space-y-1.5">
        <div className="w-32 h-3 bg-white/[0.05] rounded animate-pulse" />
        <div className="w-24 h-2.5 bg-white/[0.04] rounded animate-pulse" />
      </div>
      <div className="w-16 h-3 bg-white/[0.05] rounded animate-pulse" />
    </div>
  );
  const statusMap: Record<string, { color: string; Icon: any }> = {
    paid: { color: "text-emerald-400", Icon: CheckCircle },
    pending: { color: "text-orange-400", Icon: Clock },
    cancelled: { color: "text-red-400", Icon: XCircle },
  };
  const s = statusMap[order.payment_status] ?? statusMap.pending;
  return (
    <div className="flex items-center gap-4 px-6 py-3.5 hover:bg-white/[0.02] transition-colors">
      <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center text-xs font-bold text-white/50 border border-white/[0.08]">
        {order.id?.slice(-2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white truncate">#{order.id?.slice(-8).toUpperCase()}</div>
        <div className="text-xs text-white/30">{new Date(order.created_at).toLocaleDateString("en-IN")}</div>
      </div>
      <div className="flex items-center gap-2">
        <s.Icon size={13} className={s.color} />
        <span className="text-sm font-semibold text-white">₹{order.total_amount?.toLocaleString("en-IN")}</span>
      </div>
    </div>
  );
}

function TopProductRow({ product, rank, loading }: { product: any; rank: number; loading: boolean }) {
  if (loading) return (
    <div className="flex items-center gap-3 p-3">
      <div className="w-6 text-center text-xs text-white/20">{rank}</div>
      <div className="w-9 h-9 rounded-lg bg-white/[0.05] animate-pulse flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="w-28 h-3 bg-white/[0.05] rounded animate-pulse" />
        <div className="w-16 h-2.5 bg-white/[0.04] rounded animate-pulse" />
      </div>
    </div>
  );
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors">
      <div className="w-6 text-center text-xs font-bold text-white/20">{rank}</div>
      <div className="w-9 h-9 rounded-lg overflow-hidden bg-white/[0.05] flex-shrink-0">
        {product?.image_url && (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-white truncate">{product?.name}</div>
        <div className="text-[10px] text-white/30">{product?.sales ?? 0} sold</div>
      </div>
    </div>
  );
}