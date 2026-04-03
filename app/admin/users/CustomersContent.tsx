"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User } from "lucide-react";
import { UserProfile } from "@/types/supabase";
import {
    AdminCard,
    AdminPageHeader,
    AdminTableHeader,
    AdminTableRow,
    AdminSearchInput
} from "@/components/admin/AdminUI";
import { cn } from "@/lib/utils";

export default function CustomersContent() {
    const searchParams = useSearchParams();
    const [customers, setCustomers] = useState<UserProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState(searchParams.get("email") || "")

    useEffect(() => {
        async function fetchCustomers() {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, email, full_name, created_at, role')
                .order('created_at', { ascending: false })

            if (!error) {
                setCustomers(data || [])
            }
            setLoading(false)
        }
        fetchCustomers()
    }, [])

    const filteredCustomers = customers.filter(c =>
        (c.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-6 pb-12">
            <div className="mb-2">
                <AdminPageHeader
                    title="Customers"
                    subtitle={`${customers.length} registered customers.`}
                />
            </div>

            <AdminCard className="overflow-hidden">
                {/* Search Bar */}
                <div
                    className="px-6 py-6 bg-[var(--bg-elevated)]/20 border-b border-[var(--border)]"
                >
                    <AdminSearchInput
                        placeholder="Search customers by name or email..."
                        value={searchQuery}
                        onChange={setSearchQuery}
                        onClear={() => setSearchQuery("")}
                        className="max-w-md"
                    />
                </div>

                <div className="p-2">
                    <AdminTableHeader cols="grid-cols-[2fr_2fr_1fr_1fr] border-none !bg-transparent">
                        <div className="pl-4">Customer</div>
                        <div>Email Address</div>
                        <div>Access Level</div>
                        <div className="pr-4 text-right">Joined</div>
                    </AdminTableHeader>

                    <div className="divide-y divide-[var(--border)]/50">
                        {loading ? (
                            [...Array(6)].map((_, i) => (
                                <div key={i} className="px-6 py-6 flex items-center justify-between gap-4 animate-pulse">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[var(--bg-elevated)]/50" />
                                        <div className="h-4 w-32 rounded bg-[var(--bg-elevated)]/50" />
                                    </div>
                                    <div className="h-4 w-48 rounded bg-[var(--bg-elevated)]/50" />
                                    <div className="h-6 w-16 rounded-lg bg-[var(--bg-elevated)]/50" />
                                    <div className="h-4 w-24 rounded bg-[var(--bg-elevated)]/50 ml-auto" />
                                </div>
                            ))
                        ) : customers.length === 0 ? (
                            <div className="text-center py-24 px-6">
                                <div
                                    style={{ border: "1px solid var(--border)" }}
                                    className="w-16 h-16 rounded-2xl bg-[var(--bg-elevated)]/50 flex items-center justify-center mx-auto mb-4"
                                >
                                    <User size={32} className="text-[var(--text-3)] opacity-20" />
                                </div>
                                <h3 className="text-[var(--text)] font-black uppercase tracking-tight text-lg italic">No Customers Found</h3>
                                <p className="text-[var(--text-3)] text-[10px] font-black uppercase tracking-widest mt-2 max-w-[280px] mx-auto opacity-40">You do not have any registered customers yet.</p>
                            </div>
                        ) : filteredCustomers.length === 0 ? (
                            <div className="text-center py-24 px-6">
                                <p className="text-[var(--text-3)] text-[10px] font-black uppercase tracking-[0.2em] opacity-40 italic">No customers match your search for "{searchQuery}"</p>
                            </div>
                        ) : (
                            filteredCustomers.map(c => (
                                <AdminTableRow
                                    key={c.id}
                                    cols="grid-cols-[2fr_2fr_1fr_1fr]"
                                    className="py-4 hover:bg-white/[0.02]"
                                >
                                    <div className="flex items-center gap-4 pl-4">
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs border border-[var(--border)] transition-all group-hover:border-[var(--accent)]"
                                            style={{ background: "var(--bg-elevated)", color: "var(--accent)" }}
                                        >
                                            {(c.full_name || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-black uppercase tracking-tight truncate">{c.full_name || 'Guest User'}</p>
                                            <p className="text-[8px] font-black text-[var(--text-3)] opacity-40 uppercase tracking-[0.2em]">Customer</p>
                                        </div>
                                    </div>
                                    <div className="text-[11px] font-bold text-[var(--text-3)] font-mono opacity-80">{c.email}</div>
                                    <div>
                                        <span
                                            className={cn(
                                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border",
                                                c.role === 'admin'
                                                    ? "text-[var(--accent)] bg-[var(--accent)]/10 border-[var(--accent)]/30"
                                                    : "text-[var(--text-3)] bg-[var(--bg-elevated)] border-[var(--border)]"
                                            )}
                                        >
                                            <span className={cn("w-1 h-1 rounded-full mr-1.5", c.role === 'admin' ? "bg-[var(--accent)] animate-pulse" : "bg-[var(--text-3)] opacity-40")} />
                                            {c.role || 'customer'}
                                        </span>
                                    </div>
                                    <div className="text-[10px] font-black text-[var(--text-3)] font-mono text-right pr-4 opacity-60">
                                        {new Date(c.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                                    </div>
                                </AdminTableRow>
                            ))
                        )}
                    </div>
                </div>
            </AdminCard>
        </div>
    )
}

