"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShoppingBag, Users, DollarSign, Clock,
  CheckCircle, XCircle, ArrowUpRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import {
  AdminCard,
  AdminPageHeader
} from "@/components/admin/AdminUI";

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
    { label: "Total Revenue", value: stats?.totalRevenue ?? 0, prefix: "₹", icon: DollarSign, delta: "+12%", color: "var(--accent)" },
    { label: "Total Orders", value: stats?.totalOrders ?? 0, prefix: "", icon: ShoppingBag, delta: "+8%", color: "#3b82f6" },
    { label: "Customers", value: stats?.totalCustomers ?? 0, prefix: "", icon: Users, delta: "+23%", color: "#8b5cf6" },
    { label: "Pending Orders", value: stats?.pendingOrders ?? 0, prefix: "", icon: Clock, delta: null, color: "#f59e0b" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <AdminPageHeader
          title="Overview"
          subtitle="Welcome back. Here's what's happening."
        />
        <div
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
          }}
          className="flex items-center gap-1 rounded-full p-1"
        >
          {(["7d", "30d", "90d"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={period === p ? {
                background: "var(--text)",
                color: "var(--bg)",
                fontWeight: 600,
              } : {
                color: "var(--text-2)",
                background: "transparent",
              }}
              className="px-4 py-1.5 rounded-full text-[11px] transition-all duration-200 hover:text-[var(--text)]"
            >
              {p === "7d" ? "7 days" : p === "30d" ? "30 days" : "90 days"}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <AdminCard
              className="p-5 group"
              style={{
                boxShadow: "var(--shadow)",
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  style={{
                    background: `color-mix(in srgb, ${card.color} 10%, transparent)`,
                    borderColor: `color-mix(in srgb, ${card.color} 20%, transparent)`
                  }}
                  className="p-2.5 rounded-xl border"
                >
                  <card.icon size={16} style={{ color: card.color }} />
                </div>
                {card.delta && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                    <ArrowUpRight size={10} />{card.delta}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <div style={{ color: "var(--text)" }} className="text-2xl font-display font-bold tabular-nums">
                  {stats
                    ? `${card.prefix}${card.value.toLocaleString("en-IN")}`
                    : <span style={{ color: "var(--text-3)" }} className="animate-pulse">—</span>}
                </div>
                <div style={{ color: "var(--text-3)" }} className="text-[10px] uppercase tracking-wider font-bold">{card.label}</div>
              </div>
            </AdminCard>
          </motion.div>
        ))}
      </div>

      {/* Recent orders + top products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AdminCard>
            <div
              style={{ borderBottom: "1px solid var(--border)" }}
              className="flex items-center justify-between px-6 py-4"
            >
              <h2 style={{ color: "var(--text)" }} className="font-bold text-sm uppercase tracking-wide">Recent Orders</h2>
              <a href="/admin/orders"
                style={{ color: "var(--text-3)" }}
                className="text-[10px] font-bold uppercase tracking-wider hover:text-[var(--accent)] transition-colors flex items-center gap-1.5"
              >
                View all <ArrowUpRight size={12} />
              </a>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {(stats?.recentOrders ?? Array(5).fill(null)).map((order: any, i: number) => (
                <OrderRow key={order?.id ?? i} order={order} loading={!stats} />
              ))}
            </div>
          </AdminCard>
        </div>

        <div>
          <AdminCard>
            <div
              style={{ borderBottom: "1px solid var(--border)" }}
              className="flex items-center justify-between px-6 py-4"
            >
              <h2 style={{ color: "var(--text)" }} className="font-bold text-sm uppercase tracking-wide">Top Products</h2>
              <a href="/admin/products"
                style={{ color: "var(--text-3)" }}
                className="text-[10px] font-bold uppercase tracking-wider hover:text-[var(--accent)] transition-colors"
              >
                Manage
              </a>
            </div>
            <div className="p-2 space-y-1">
              {(stats?.topProducts ?? Array(5).fill(null)).map((product: any, i: number) => (
                <TopProductRow key={product?.id ?? i} product={product} rank={i + 1} loading={!stats} />
              ))}
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}

function OrderRow({ order, loading }: { order: any; loading: boolean }) {
  if (loading) return (
    <div className="flex items-center gap-4 px-6 py-4">
      <div style={{ background: "var(--bg-elevated)" }} className="w-8 h-8 rounded-lg animate-pulse" />
      <div className="flex-1 space-y-2">
        <div style={{ background: "var(--bg-elevated)" }} className="w-24 h-3 rounded animate-pulse" />
        <div style={{ background: "var(--bg-elevated)" }} className="w-16 h-2 rounded animate-pulse" />
      </div>
      <div style={{ background: "var(--bg-elevated)" }} className="w-16 h-4 rounded animate-pulse" />
    </div>
  );

  const statusMap: Record<string, { color: string; Icon: any }> = {
    paid: { color: "text-emerald-500", Icon: CheckCircle },
    pending: { color: "var(--accent)", Icon: Clock },
    cancelled: { color: "text-rose-500", Icon: XCircle },
  };
  const s = statusMap[order.payment_status] ?? statusMap.pending;

  return (
    <div
      className="flex items-center gap-4 px-6 py-4 hover:bg-[var(--bg-elevated)] transition-colors"
    >
      <div
        style={{ border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--text-3)" }}
        className="w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-bold"
      >
        {order.id?.slice(-2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div style={{ color: "var(--text)" }} className="text-sm font-bold truncate">#{order.id?.slice(-8).toUpperCase()}</div>
        <div style={{ color: "var(--text-3)" }} className="text-[10px] font-medium">{new Date(order.created_at).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' })}</div>
      </div>
      <div className="text-right">
        <div style={{ color: "var(--text)" }} className="text-sm font-bold tabular-nums">₹{order.total_amount?.toLocaleString("en-IN")}</div>
        <div className={cn("text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 justify-end", s.color)}>
          <s.Icon size={10} /> {order.payment_status}
        </div>
      </div>
    </div>
  );
}

function TopProductRow({ product, rank, loading }: { product: any; rank: number; loading: boolean }) {
  if (loading) return (
    <div className="flex items-center gap-3 p-3">
      <div style={{ color: "var(--text-3)" }} className="w-6 text-center text-[10px] font-bold">{rank}</div>
      <div style={{ background: "var(--bg-elevated)" }} className="w-10 h-10 rounded-xl animate-pulse flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div style={{ background: "var(--bg-elevated)" }} className="w-full h-3 rounded animate-pulse" />
        <div style={{ background: "var(--bg-elevated)" }} className="w-1/2 h-2 rounded animate-pulse" />
      </div>
    </div>
  );

  return (
    <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--bg-elevated)] transition-colors group">
      <div style={{ color: "var(--text-3)" }} className="w-6 text-center text-[10px] font-bold group-hover:text-[var(--text)] transition-colors">{rank}</div>
      <div
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
        className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 p-1"
      >
        {product?.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-contain" />
        ) : (
          <div className="w-full h-full bg-theme opacity-10" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div style={{ color: "var(--text)" }} className="text-[11px] font-bold truncate">{product?.name}</div>
        <div style={{ color: "var(--text-3)" }} className="text-[9px] font-bold uppercase tracking-wider">{product?.sales ?? 0} units sold</div>
      </div>
    </div>
  );
}