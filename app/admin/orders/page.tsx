"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Download, Eye, Clock, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  AdminCard,
  AdminPageHeader,
  AdminTableHeader,
  AdminTableRow
} from "@/components/admin/AdminUI";

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  paid: { label: "Paid", color: "text-emerald-500", dot: "bg-emerald-500" },
  pending: { label: "Pending", color: "text-orange-500", dot: "bg-orange-500" },
  shipped: { label: "Shipped", color: "text-blue-500", dot: "bg-blue-500" },
  delivered: { label: "Delivered", color: "text-emerald-500", dot: "bg-emerald-500" },
  cancelled: { label: "Cancelled", color: "text-rose-500", dot: "bg-rose-500" },
};

export default function AdminOrdersPage() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("id") || "");
  const [filter, setFilter] = useState("all");

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
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <AdminPageHeader
          title="Orders"
          subtitle={`${orders.length} total orders recorded.`}
        />
        <button
          onClick={exportCSV}
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-2)" }}
          className="flex items-center gap-2 px-4 py-2 text-[11px] font-bold uppercase tracking-wider rounded-xl hover:bg-[var(--bg-elevated)] hover:text-[var(--text)] transition-all"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      <AdminCard>
        {/* Search + filter bar */}
        <div
          style={{ borderBottom: "1px solid var(--border)" }}
          className="flex flex-wrap items-center gap-4 px-6 py-4"
        >
          <div className="relative flex-1 min-w-[240px] max-w-sm">
            <Search size={14} style={{ color: "var(--text-3)" }} className="absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order ID, customer..."
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                color: "var(--text)",
              }}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl focus:outline-none focus:border-[var(--accent)] transition-all placeholder:opacity-30"
            />
          </div>
          <div
            style={{
              background: "rgba(0,0,0,0.025)",
              border: "1px solid var(--border)",
            }}
            className="flex gap-1 p-1 rounded-full w-fit"
          >
            {["all", "pending", "paid", "shipped", "delivered", "cancelled"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={cn(
                  "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.1em] transition-all duration-200",
                  filter === s
                    ? "bg-[#000000] text-white"
                    : "text-[#a1a1aa] hover:text-[#18181b] hover:bg-black/5"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-4">
              <div
                style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }}
                className="w-8 h-8 rounded-full border-2 animate-spin"
              />
              <p style={{ color: "var(--text-3)" }} className="text-[10px] font-bold uppercase tracking-widest">Loading Orders...</p>
            </div>
          ) : (
            <div className="min-w-[800px]">
              <AdminTableHeader cols="grid-cols-[1.5fr_2fr_1.5fr_1fr_1.2fr_1.2fr_0.5fr] !py-4">
                <div>Order ID</div>
                <div>Customer</div>
                <div>Date</div>
                <div>Items</div>
                <div>Total</div>
                <div>Status</div>
                <div className="text-right">Action</div>
              </AdminTableHeader>

              <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                {filtered.length === 0 ? (
                  <div style={{ color: "var(--text-3)" }} className="px-6 py-16 text-center text-sm font-medium">
                    {orders.length === 0 ? "No orders found." : "No orders match your current filters."}
                  </div>
                ) : (
                  filtered.map((order, i) => {
                    const status = order.payment_status ?? order.status ?? "pending";
                    const s = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.02 }}
                      >
                        <AdminTableRow cols="grid-cols-[1.5fr_2fr_1.5fr_1fr_1.2fr_1.2fr_0.5fr]" className="items-center py-4">
                          <div style={{ color: "var(--text)" }} className="font-bold text-xs font-mono">
                            #{order.id.slice(-8).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ color: "var(--text)" }} className="font-bold text-xs truncate max-w-[180px]">{order.shipping_name ?? "—"}</div>
                            <div style={{ color: "var(--text-3)" }} className="text-[10px] truncate max-w-[180px]">{order.shipping_email ?? ""}</div>
                          </div>
                          <div style={{ color: "var(--text-2)" }} className="text-xs font-medium">
                            {new Date(order.created_at).toLocaleDateString("en-IN", {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                          <div style={{ color: "var(--text-3)" }} className="text-xs font-bold">
                            {order.order_items?.length ?? 0} items
                          </div>
                          <div style={{ color: "var(--text)" }} className="font-bold text-sm tabular-nums">
                            ₹{Number(order.total_amount).toLocaleString("en-IN")}
                          </div>
                          <div>
                            <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border", s.color)}
                              style={{
                                background: `color-mix(in srgb, ${s.color.includes('rose') ? '#f43f5e' : s.color.includes('emerald') ? '#10b981' : s.color.includes('orange') ? '#f59e0b' : '#3b82f6'} 10%, transparent)`,
                                borderColor: `color-mix(in srgb, ${s.color.includes('rose') ? '#f43f5e' : s.color.includes('emerald') ? '#10b981' : s.color.includes('orange') ? '#f59e0b' : '#3b82f6'} 20%, transparent)`
                              }}
                            >
                              <div className={cn("w-1 h-1 rounded-full", s.dot)} />
                              {s.label}
                            </span>
                          </div>
                          <div className="text-right">
                            <Link href={`/admin/orders/${order.id}`}>
                              <button
                                style={{ color: "var(--text-3)" }}
                                className="p-2 hover:bg-[var(--bg-elevated)] hover:text-[var(--text)] transition-all rounded-xl"
                              >
                                <Eye size={16} />
                              </button>
                            </Link>
                          </div>
                        </AdminTableRow>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Status summary footer */}
        <div
          style={{ borderTop: "1px solid var(--border)" }}
          className="flex flex-wrap divide-x"
        >
          {["all", "pending", "paid", "shipped", "delivered", "cancelled"].map((s) => {
            const count = s === "all"
              ? orders.length
              : orders.filter((o) => (o.payment_status ?? o.status) === s).length;
            const config = STATUS_CONFIG[s] || { color: "var(--text-3)" };
            const isActive = filter === s;

            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                style={{
                  background: isActive ? "var(--bg-elevated)" : "transparent",
                  borderColor: "var(--border)"
                }}
                className="flex-1 min-w-[100px] py-4 flex flex-col items-center gap-1 transition-all hover:bg-[var(--bg-elevated)]"
              >
                <span
                  style={{ color: isActive ? "var(--text)" : "var(--text-2)" }}
                  className="text-xl font-display font-bold tabular-nums"
                >
                  {count}
                </span>
                <span
                  style={{ color: isActive ? "var(--text)" : "var(--text-3)" }}
                  className="text-[9px] font-bold uppercase tracking-widest"
                >
                  {s}
                </span>
              </button>
            );
          })}
        </div>
      </AdminCard>
    </div>
  );
}