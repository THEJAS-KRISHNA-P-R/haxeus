"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Ticket, Plus, Trash2, Edit } from "lucide-react";
import {
    AdminCard,
    AdminPageHeader,
    AdminTableHeader,
    AdminTableRow
} from "@/components/admin/AdminUI";
import { cn } from "@/lib/utils";

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchCoupons() {
            const { data, error } = await supabase
                .from('coupons')
                .select('*')
                .order('created_at', { ascending: false })

            if (!error) {
                setCoupons(data || [])
            }
            setLoading(false)
        }
        fetchCoupons()
    }, [])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
                <AdminPageHeader
                    title="Coupons"
                    subtitle={`${coupons.length} active promotion codes found in the system.`}
                />
                <button className="flex items-center gap-2 bg-[var(--accent)] text-white px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider hover:brightness-110 transition-all shadow-lg shadow-red-500/20">
                    <Plus size={16} /> Create Coupon
                </button>
            </div>

            <AdminCard>
                <AdminTableHeader cols="grid-cols-[1.5fr_1.5fr_1fr_1fr_0.8fr]" className="px-6 py-4">
                    <span>Coupon Code</span>
                    <span>Discount Value</span>
                    <span>Status</span>
                    <span>Usage Count</span>
                    <span className="text-right">Actions</span>
                </AdminTableHeader>

                <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                    {loading ? (
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="px-6 py-5 flex items-center justify-between gap-4">
                                <div style={{ background: "var(--bg-elevated)" }} className="h-4 w-24 rounded animate-pulse" />
                                <div style={{ background: "var(--bg-elevated)" }} className="h-4 w-32 rounded animate-pulse" />
                                <div style={{ background: "var(--bg-elevated)" }} className="h-6 w-16 rounded-full animate-pulse" />
                                <div style={{ background: "var(--bg-elevated)" }} className="h-4 w-20 rounded animate-pulse" />
                            </div>
                        ))
                    ) : coupons.length === 0 ? (
                        <div className="text-center py-20 px-6">
                            <div
                                style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-3)" }}
                                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                            >
                                <Ticket size={32} className="opacity-20" />
                            </div>
                            <p style={{ color: "var(--text)" }} className="font-bold text-lg">No active coupons</p>
                            <p style={{ color: "var(--text-3)" }} className="text-sm mt-1">Create your first promotion code to start attracting more customers.</p>
                        </div>
                    ) : (
                        coupons.map(c => (
                            <AdminTableRow key={c.id} cols="grid-cols-[1.5fr_1.5fr_1fr_1fr_0.8fr]" className="px-6 py-5 items-center">
                                <div>
                                    <span style={{ color: "var(--text)", background: "var(--bg-elevated)", borderColor: "var(--border)" }} className="font-mono font-bold tracking-widest text-xs px-2 py-1 border rounded-lg">
                                        {c.code}
                                    </span>
                                </div>
                                <div>
                                    <span style={{ color: "var(--text)" }} className="font-bold text-sm">
                                        {c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${c.discount_value}`} OFF
                                    </span>
                                </div>
                                <div>
                                    <span
                                        className={cn(
                                            "inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border",
                                            c.active ? "text-emerald-500" : "text-rose-500"
                                        )}
                                        style={{
                                            background: c.active
                                                ? "color-mix(in srgb, #10b981 10%, transparent)"
                                                : "color-mix(in srgb, #f43f5e 10%, transparent)",
                                            borderColor: c.active
                                                ? "color-mix(in srgb, #10b981 20%, transparent)"
                                                : "color-mix(in srgb, #f43f5e 20%, transparent)"
                                        }}
                                    >
                                        {c.active ? 'Active' : 'Paused'}
                                    </span>
                                </div>
                                <div>
                                    <span style={{ color: "var(--text-2)" }} className="text-xs font-bold tabular-nums">
                                        {c.usage_count || 0} <span style={{ color: "var(--text-3)" }} className="font-medium">/ {c.max_usage || '∞'}</span>
                                    </span>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <button
                                            style={{ color: "var(--text-3)" }}
                                            className="p-2 hover:bg-[var(--bg-elevated)] hover:text-[var(--text)] transition-all rounded-xl"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            className="p-2 hover:bg-rose-500/10 text-[var(--accent)] transition-all rounded-xl"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </AdminTableRow>
                        ))
                    )}
                </div>
            </AdminCard>
        </div>
    )
}
