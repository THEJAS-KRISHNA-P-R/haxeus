"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Download, Eye } from "lucide-react";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  paid:      { label: "Paid",      color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
  pending:   { label: "Pending",   color: "bg-orange-500/15  text-orange-400  border-orange-500/20"  },
  shipped:   { label: "Shipped",   color: "bg-blue-500/15    text-blue-400    border-blue-500/20"    },
  delivered: { label: "Delivered", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
  cancelled: { label: "Cancelled", color: "bg-red-500/15     text-red-400     border-red-500/20"     },
};

export default function AdminOrdersPage() {
  const [orders,  setOrders]  = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("all");

  useEffect(() => { loadOrders(); }, []);

  async function loadOrders() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`*, order_items(product:products(name))`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setOrders(data ?? []);
    } catch (err) {
      console.error("Error loading orders:", err);
    } finally {
      setLoading(false);
    }
  }

  function exportCSV() {
    const cols = ["ID", "Customer", "Email", "Date", "Total", "Status"];
    const rows = filtered.map((o) => [
      o.id.slice(-8).toUpperCase(),
      o.shipping_name ?? "",
      o.shipping_email ?? "",
      new Date(o.created_at).toLocaleDateString("en-IN"),
      o.total_amount,
      o.payment_status ?? o.status ?? "pending",
    ]);
    const csv = [cols, ...rows].map((r) => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "orders.csv";
    a.click();
  }

  const filtered = orders.filter((o) => {
    const status = o.payment_status ?? o.status ?? "pending";
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      (o.shipping_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (o.shipping_email ?? "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-sm text-white/40 mt-0.5">{orders.length} total orders</p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/60 hover:text-white bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] rounded-lg transition-all"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      <SpotlightCard className="p-0 overflow-hidden">
        {/* Search + filter bar */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order ID, customer..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/70 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {["all", "pending", "paid", "shipped", "delivered", "cancelled"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all",
                  filter === s ? "bg-white text-black" : "text-white/40 hover:text-white bg-white/[0.04]"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white/50 animate-spin" />
            </div>
          ) : (
            <table data-testid="orders-table" className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {["Order", "Customer", "Date", "Items", "Total", "Status", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-sm text-white/25">
                      {orders.length === 0 ? "No orders yet" : "No orders match your filters"}
                    </td>
                  </tr>
                ) : (
                  filtered.map((order, i) => {
                    const status = order.payment_status ?? order.status ?? "pending";
                    const s = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
                    return (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="group hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-5 py-3.5 text-sm font-mono font-medium text-white/80">
                          #{order.id.slice(-8).toUpperCase()}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="text-sm text-white/80">{order.shipping_name ?? "—"}</div>
                          <div className="text-xs text-white/30">{order.shipping_email ?? ""}</div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-white/40">
                          {new Date(order.created_at).toLocaleDateString("en-IN")}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-white/60">
                          {order.order_items?.length ?? "—"} items
                        </td>
                        <td className="px-5 py-3.5 text-sm font-semibold text-white">
                          ₹{Number(order.total_amount).toLocaleString("en-IN")}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={cn("inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold border", s.color)}>
                            {s.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <Link href={`/admin/orders/${order.id}`}>
                            <button className="opacity-0 group-hover:opacity-100 p-1.5 text-white/30 hover:text-white transition-all rounded-lg hover:bg-white/[0.06]">
                              <Eye size={14} />
                            </button>
                          </Link>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Status summary footer */}
        <div className="flex flex-wrap gap-px border-t border-white/[0.06]">
          {["all", "pending", "paid", "shipped", "delivered", "cancelled"].map((s) => {
            const count = s === "all"
              ? orders.length
              : orders.filter((o) => (o.payment_status ?? o.status) === s).length;
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={cn(
                  "flex-1 min-w-[80px] py-3 flex flex-col items-center gap-0.5 transition-colors",
                  filter === s ? "bg-white/[0.04]" : "hover:bg-white/[0.02]"
                )}
              >
                <span className="text-lg font-bold text-white tabular-nums">{count}</span>
                <span className="text-[10px] text-white/30 capitalize">{s}</span>
              </button>
            );
          })}
        </div>
      </SpotlightCard>
    </div>
  );
}