"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Copy, Download, Eye, RotateCcw, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import {
    AdminCard,
    AdminPageHeader,
    AdminTableHeader,
    AdminTableRow,
    AdminSearchInput,
    AdminButton
} from "@/components/admin/AdminUI";
import { PaymentStatusBadge } from "@/components/PaymentStatusBadge";
import { toast } from "sonner";

export default function OrdersContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
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

            if (!confirmDelivered) return;

            const res = await fetch(`/api/admin/orders/${orderId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) throw new Error("Failed to update status");

            const data = await res.json();
            
            setOrders(prev => prev.map(o => o.id === orderId ? {
                ...o,
                status: newStatus,
                delivered_at: data.delivered_at || o.delivered_at,
                updated_at: new Date().toISOString(),
            } : o));
            
            toast.success(`Order marked as ${newStatus}`);
        } catch (err) {
            console.error("Error updating order status:", err);
            toast.error("Failed to update order status");
        }
    }

    async function handleRefund(orderId: string) {
        if (!window.confirm("Are you sure you want to refund this order? This will trigger a real refund in Razorpay and cannot be undone.")) {
            return;
        }

        try {
            const res = await fetch(`/api/admin/orders/${orderId}/refund`, {
                method: "POST"
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Refund failed");

            setOrders(prev => prev.map(o => o.id === orderId ? {
                ...o,
                status: "refunded",
                updated_at: new Date().toISOString(),
            } : o));

            toast.success("Refund processed successfully");
        } catch (err: any) {
            console.error("Refund error:", err);
            toast.error(err.message || "Failed to process refund");
        }
    }

    async function handleResendEmail(orderId: string) {
        if (!window.confirm("Resend the order confirmation email to the customer?")) return;

        try {
            const res = await fetch(`/api/admin/orders/${orderId}/resend-email`, {
                method: "POST"
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Resend failed");

            setOrders(prev => prev.map(o => o.id === orderId ? {
                ...o,
                confirmation_email_sent: true,
                confirmation_email_sent_at: new Date().toISOString(),
            } : o));

            toast.success("Confirmation email resent!");
        } catch (err: any) {
            console.error("Resend error:", err);
            toast.error(err.message || "Failed to resend email");
        }
    }

    function exportCSV() {
        const cols = ["ID", "Customer", "Email", "Date", "Total", "Status"];
        const rows = filtered.map((o: any) => [
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

    const filtered = useMemo(() => {
        return orders.filter((o) => {
            const status = o.status ?? "pending";
            const matchSearch =
                o.id.toLowerCase().includes(search.toLowerCase()) ||
                (o.order_number ?? "").toLowerCase().includes(search.toLowerCase()) ||
                (o.shipping_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
                (o.shipping_email ?? "").toLowerCase().includes(search.toLowerCase());
            const matchFilter = filter === "all" || status === filter;
            return matchSearch && matchFilter;
        });
    }, [orders, search, filter]);

    function copyToClipboard(text: string, label: string) {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard`);
    }

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
                        Mark delivered only after India Post or post-office confirmation.
                    </p>
                </div>

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
                                <AdminTableHeader cols="grid-cols-[1.2fr_1.8fr_1.2fr_0.6fr_1fr_0.8fr_1.2fr_0.8fr_1.5fr] !py-4">
                                    <div>Order</div>
                                    <div>Customer</div>
                                    <div>Date</div>
                                    <div>Items</div>
                                    <div>Total</div>
                                    <div>Method</div>
                                    <div>Status</div>
                                    <div>Email</div>
                                    <div className="text-right">Action</div>
                                </AdminTableHeader>

                                <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                                    {filtered.length === 0 ? (
                                        <div style={{ color: "var(--text-3)" }} className="px-6 py-16 text-center text-sm font-medium">
                                            {orders.length === 0 ? "No orders found." : "No orders match your current filters."}
                                        </div>
                                    ) : (
                                        filtered.map((order: any, i: number) => (
                                            <motion.div
                                                key={order.id}
                                                initial={{ opacity: 0, x: -4 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.02 }}
                                                whileHover={{ x: 2 }}
                                                className="group transition-all duration-300"
                                            >
                                                <AdminTableRow 
                                                    cols="grid-cols-[1.2fr_1.8fr_1.2fr_0.6fr_1fr_0.8fr_1.2fr_0.8fr_1.5fr]" 
                                                    className="items-center py-4 border-l-2 border-transparent hover:border-[var(--accent)] hover:bg-white/[0.02]"
                                                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                                                >
                                                    <div style={{ color: "var(--text)" }} className="font-bold text-xs font-mono flex items-center gap-1.5 group/id min-w-0">
                                                        <span className="truncate">
                                                            {order.order_number ?? `#${order.id.slice(-8).toUpperCase()}`}
                                                        </span>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); copyToClipboard(order.id, "Order ID"); }}
                                                            className="opacity-0 group-hover/id:opacity-100 p-1 hover:bg-[var(--accent)]/10 rounded-md transition-all text-[var(--accent)] shrink-0"
                                                        >
                                                            <Copy size={10} />
                                                        </button>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div style={{ color: "var(--text)" }} className="font-black text-xs truncate uppercase tracking-tight">
                                                            {order.shipping_name ?? "—"}
                                                        </div>
                                                        <div style={{ color: "var(--text-3)" }} className="text-[10px] font-bold truncate opacity-80 uppercase tracking-widest">
                                                            {order.shipping_email ?? ""}
                                                        </div>
                                                        {order.is_preorder && (
                                                            <span className="inline-block mt-1 px-1.5 py-0.5 rounded-md text-[8px] font-black tracking-widest uppercase bg-yellow-400/10 text-yellow-500 border border-yellow-400/20">
                                                                PRE-ORDER
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div style={{ color: "var(--text-3)" }} className="text-[10px] font-bold uppercase tracking-widest">
                                                        {new Date(order.created_at).toLocaleDateString("en-IN", {
                                                            day: '2-digit',
                                                            month: 'short',
                                                        })}
                                                    </div>
                                                    <div style={{ color: "var(--text-3)" }} className="text-xs font-black">
                                                        {order.order_items?.length ?? 0}
                                                    </div>
                                                    <div style={{ color: "var(--text)" }} className="font-black text-sm tabular-nums tracking-tighter">
                                                        ₹{Number(order.total_amount).toLocaleString("en-IN")}
                                                    </div>
                                                    <div className="flex items-center">
                                                        <span className={cn(
                                                            "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                                                            order.payment_method === 'online' 
                                                                ? "bg-blue-400/10 text-blue-400 border-blue-400/20" 
                                                                : "bg-orange-400/10 text-orange-400 border-orange-400/20"
                                                        )}>
                                                            {order.payment_method ?? 'online'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <PaymentStatusBadge status={order.status} />
                                                    </div>
                                                    <div className="flex items-center justify-center">
                                                        <div 
                                                            className={cn(
                                                                "w-1.5 h-1.5 rounded-full",
                                                                order.confirmation_email_sent 
                                                                    ? "bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.6)]" 
                                                                    : "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]"
                                                            )}
                                                            title={order.confirmation_email_sent ? `Confirmed at ${new Date(order.confirmation_email_sent_at).toLocaleString()}` : "Pending email dispatch"}
                                                        />
                                                    </div>
                                                    <div className="text-right flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                                                        <select
                                                            value={order.status ?? "pending"}
                                                            onChange={e => updateOrderStatus(order.id, e.target.value)}
                                                            className="text-[9px] font-black uppercase tracking-widest bg-transparent border border-[var(--border)] rounded-lg px-2.5 py-1.5 cursor-pointer text-[var(--text-3)] hover:text-[var(--text)] transition-all hover:border-[var(--text-3)] outline-none"
                                                            style={{ background: "rgba(var(--bg-rgb), 0.5)" }}
                                                        >
                                                            {["pending","confirmed","preorder","processing","shipped","delivered","cancelled","refunded"].map(st => (
                                                                <option key={st} value={st} className="bg-[var(--bg)]">{st}</option>
                                                            ))}
                                                        </select>
                                                        
                                                        {(order.status === 'confirmed' || order.status === 'delivered') && order.payment_method === 'online' && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleRefund(order.id); }}
                                                                title="Process Refund"
                                                                className="p-2 text-rose-500 hover:bg-rose-500/10 transition-all rounded-xl border border-transparent hover:border-rose-500/20"
                                                            >
                                                                <RotateCcw size={14} />
                                                            </button>
                                                        )}
                                                        {order.status !== 'cancelled' && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleResendEmail(order.id); }}
                                                                title="Trigger Manual Receipt Dispatch"
                                                                className="p-2 text-blue-400 hover:bg-blue-400/10 transition-all rounded-xl border border-transparent hover:border-blue-400/20"
                                                            >
                                                                <Mail size={14} />
                                                            </button>
                                                        )}
                                                        <div className="p-2 text-[var(--text-3)] opacity-30 group-hover:opacity-100 transition-opacity">
                                                            <Eye size={14} />
                                                        </div>
                                                    </div>
                                                </AdminTableRow>
                                            </motion.div>
                                        ))
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

