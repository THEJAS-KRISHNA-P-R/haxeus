"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Download, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
    AdminCard,
    AdminPageHeader,
    AdminTableHeader,
    AdminTableRow,
    AdminSearchInput,
    AdminButton
} from "@/components/admin/AdminUI";

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
    paid:       { label: "Paid",       color: "text-emerald-500", dot: "bg-emerald-500" },
    confirmed:  { label: "Confirmed",  color: "text-emerald-500", dot: "bg-emerald-500" },
    pending:    { label: "Pending",    color: "text-orange-500",  dot: "bg-orange-500"  },
    preorder:   { label: "Pre-Order",  color: "text-yellow-400",  dot: "bg-yellow-400"  },
    processing: { label: "Processing", color: "text-blue-400",    dot: "bg-blue-400"    },
    shipped:    { label: "Shipped",    color: "text-blue-500",    dot: "bg-blue-500"    },
    delivered:  { label: "Delivered",  color: "text-emerald-500", dot: "bg-emerald-500" },
    cancelled:  { label: "Cancelled",  color: "text-rose-500",    dot: "bg-rose-500"    },
    refunded:   { label: "Refunded",   color: "text-orange-400",  dot: "bg-orange-400"  },
};

export default function OrdersContent() {
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

    async function updateOrderStatus(orderId: string, newStatus: string) {
        try {
            const isDelivered = newStatus === "delivered";
            const confirmDelivered = isDelivered
                ? window.confirm("Mark this order as delivered only after India Post / post-office confirmation. Continue?")
                : true;

            if (!confirmDelivered) {
                return;
            }

            const timestamp = new Date().toISOString();
            const { error } = await supabase
                .from("orders")
                .update({
                    status: newStatus,
                    delivered_at: isDelivered ? timestamp : null,
                    updated_at: timestamp,
                })
                .eq("id", orderId);
            if (!error) {
                setOrders(prev => prev.map(o => o.id === orderId ? {
                    ...o,
                    status: newStatus,
                    delivered_at: isDelivered ? timestamp : null,
                    updated_at: timestamp,
                } : o));
            }
        } catch (err) {
            console.error("Error updating order status:", err);
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
        const status = o.status ?? "pending";
        const matchSearch =
            o.id.toLowerCase().includes(search.toLowerCase()) ||
            (o.order_number ?? "").toLowerCase().includes(search.toLowerCase()) ||
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
                <AdminButton onClick={exportCSV} variant="outline" icon={Download}>
                    Export CSV
                </AdminButton>
            </div>

            <AdminCard>
                {/* Search + filter bar */}
                <div
                    style={{ borderBottom: "1px solid var(--border)" }}
                    className="flex flex-wrap items-center gap-4 px-6 py-4"
                >
                    <AdminSearchInput
                        placeholder="Search order ID, customer..."
                        value={search}
                        onChange={setSearch}
                        onClear={() => setSearch("")}
                        className="flex-1 max-w-sm"
                    />
                    <div
                        style={{
                            background: "var(--bg-elevated)",
                            border: "1px solid var(--border)",
                        }}
                        className="flex gap-1 p-1 rounded-full w-fit"
                    >
                    {["all", "pending", "confirmed", "preorder", "processing", "shipped", "delivered", "cancelled"].map((s) => (
                            <button
                                key={s}
                                onClick={() => setFilter(s)}
                                className={cn(
                                    "px-5 py-2 rounded-full text-[9px] font-bold uppercase tracking-[0.05em] transition-all duration-200",
                                    filter === s
                                        ? "bg-[var(--text)] text-[var(--bg)] shadow-lg"
                                        : "text-[var(--text-3)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]"
                                )}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                    <p style={{ color: "var(--text-3)" }} className="w-full text-[10px] font-bold uppercase tracking-[0.12em]">
                        Mark delivered only after India Post or post-office confirmation. Delivered orders unlock verified product reviews.
                    </p>
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
                        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                            <div className="min-w-[800px]">
                            <AdminTableHeader cols="grid-cols-[1.5fr_2fr_1.5fr_1fr_1.2fr_1.2fr_1fr] !py-4">
                                <div>Order</div>
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
                                            <AdminTableRow cols="grid-cols-[1.5fr_2fr_1.5fr_1fr_1.2fr_1.2fr_1fr]" className="items-center py-4">
                                                    <div style={{ color: "var(--text)" }} className="font-bold text-xs font-mono">
                                                        {order.order_number ?? `#${order.id.slice(-8).toUpperCase()}`}
                                                    </div>
                                                    <div>
                                                        <div style={{ color: "var(--text)" }} className="font-bold text-xs truncate max-w-[180px]">{order.shipping_name ?? "—"}</div>
                                                        <div style={{ color: "var(--text-3)" }} className="text-[10px] truncate max-w-[180px]">{order.shipping_email ?? ""}</div>
                                                        {order.is_preorder && (
                                                            <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold tracking-wider uppercase bg-yellow-400/20 text-yellow-400">
                                                                PRE-ORDER
                                                            </span>
                                                        )}
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
                                                                background: `color-mix(in srgb, ${s.color.includes('rose') ? '#f43f5e' : s.color.includes('emerald') ? '#10b981' : s.color.includes('orange') ? '#f59e0b' : s.color.includes('yellow') ? '#facc15' : '#3b82f6'} 10%, transparent)`,
                                                                borderColor: `color-mix(in srgb, ${s.color.includes('rose') ? '#f43f5e' : s.color.includes('emerald') ? '#10b981' : s.color.includes('orange') ? '#f59e0b' : s.color.includes('yellow') ? '#facc15' : '#3b82f6'} 20%, transparent)`
                                                            }}
                                                        >
                                                            <div className={cn("w-1 h-1 rounded-full", s.dot)} />
                                                            {s.label}
                                                        </span>
                                                    </div>
                                                    {/* Status update dropdown */}
                                                    <div className="text-right flex items-center justify-end gap-1">
                                                        <select
                                                            value={order.status ?? "pending"}
                                                            onChange={e => updateOrderStatus(order.id, e.target.value)}
                                                            className="text-[9px] font-bold uppercase tracking-wider bg-transparent border border-[var(--border)] rounded-lg px-2 py-1 cursor-pointer text-[var(--text-3)] hover:text-[var(--text)] transition-colors"
                                                            style={{ background: "var(--bg-elevated)" }}
                                                        >
                                                            {["pending","confirmed","preorder","processing","shipped","delivered","cancelled","refunded"].map(st => (
                                                                <option key={st} value={st}>{st}</option>
                                                            ))}
                                                        </select>
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
                        </div>
                    )}
                </div>

                {/* Status summary footer */}
                <div
                    style={{ borderTop: "1px solid var(--border)" }}
                    className="flex flex-wrap divide-x"
                >
                {["all", "pending", "confirmed", "preorder", "processing", "shipped", "delivered", "cancelled"].map((s) => {
                        const count = s === "all"
                            ? orders.length
                            : orders.filter((o) => (o.status ?? "pending") === s).length;
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

