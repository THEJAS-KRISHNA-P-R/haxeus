"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Star, CheckCircle, XCircle, Trash2, Search, Loader2 } from "lucide-react";
import {
    AdminCard,
    AdminPageHeader,
    AdminTableHeader,
    AdminTableRow,
    AdminButton,
    AdminSearchInput
} from "@/components/admin/AdminUI";
import { cn } from "@/lib/utils";

export default function ReviewsContent() {
    const [reviews, setReviews] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")

    async function fetchReviews() {
        setLoading(true)
        const { data, error } = await supabase
            .from('product_reviews')
            .select('*, products(name)')
            .order('created_at', { ascending: false })

        if (!error) {
            setReviews(data || [])
        }
        setLoading(false)
    }

    useEffect(() => { fetchReviews() }, [])

    const updateStatus = async (id: string, status: string) => {
        const { error } = await supabase
            .from('product_reviews')
            .update({ status })
            .eq('id', id)
        if (!error) fetchReviews()
    }

    const deleteReview = async (id: string) => {
        const { error } = await supabase
            .from('product_reviews')
            .delete()
            .eq('id', id)
        if (!error) fetchReviews()
    }

    const getStatusBadge = (status: string) => {
        if (status === 'approved') return { color: 'text-emerald-500', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' }
        if (status === 'rejected') return { color: 'text-rose-500', bg: 'rgba(244,63,94,0.1)', border: 'rgba(244,63,94,0.2)' }
        return { color: 'text-orange-500', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' }
    }

    const filtered = reviews.filter(r =>
        (r.products?.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (r.comment || "").toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Reviews"
                subtitle={`${reviews.length} customer reviews pending moderation.`}
            />

            <AdminCard>
                <div style={{ borderBottom: "1px solid var(--border)" }} className="px-6 py-4">
                    <AdminSearchInput
                        placeholder="Search reviews by user or product..."
                        value={search}
                        onChange={setSearch}
                        onClear={() => setSearch("")}
                        className="max-w-sm"
                    />
                </div>

                <div className="overflow-x-auto">
                    <AdminTableHeader cols="grid-cols-[1.5fr_0.8fr_2fr_0.7fr_1fr]" className="px-6 py-4">
                        <span>Product Name</span>
                        <span>Rating Score</span>
                        <span>Customer Comment</span>
                        <span>Status</span>
                        <span className="text-right">Manage</span>
                    </AdminTableHeader>

                    <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-20 px-6">
                                <div
                                    style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-3)" }}
                                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                                >
                                    <Star size={32} className="opacity-20" />
                                </div>
                                <p style={{ color: "var(--text)" }} className="font-bold text-lg">
                                    {reviews.length === 0 ? "No reviews yet" : "No matching reviews"}
                                </p>
                            </div>
                        ) : (
                            filtered.map(r => {
                                const badge = getStatusBadge(r.status || 'pending')
                                return (
                                    <AdminTableRow key={r.id} cols="grid-cols-[1.5fr_0.8fr_2fr_0.7fr_1fr]" className="px-6 py-5 items-center">
                                        <div className="pr-4">
                                            <span style={{ color: "var(--text)" }} className="font-bold text-xs truncate block">
                                                {r.products?.name || 'Unknown Product'}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border w-fit"
                                                style={{
                                                    background: "color-mix(in srgb, #e7bf04 10%, transparent)",
                                                    borderColor: "color-mix(in srgb, #e7bf04 20%, transparent)",
                                                    color: "#e7bf04"
                                                }}
                                            >
                                                <span className="font-bold text-[10px]">{r.rating?.toFixed(1)}</span>
                                                <Star className="h-2.5 w-2.5 fill-current" />
                                            </div>
                                        </div>
                                        <div className="pr-6">
                                            <p style={{ color: "var(--text-2)" }} className="text-[11px] font-medium leading-relaxed italic line-clamp-2">
                                                &quot;{r.comment || 'No comment provided.'}&quot;
                                            </p>
                                        </div>
                                        <div>
                                            <span
                                                className={cn("inline-flex items-center px-2.5 py-1 rounded-lg text-[8px] font-bold uppercase tracking-wider border", badge.color)}
                                                style={{ background: badge.bg, borderColor: badge.border }}
                                            >
                                                {r.status || 'pending'}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {r.status === 'pending' && (
                                                    <>
                                                        <AdminButton
                                                            variant="outline"
                                                            onClick={() => updateStatus(r.id, 'approved')}
                                                            className="px-3 py-1.5 h-8"
                                                        >
                                                            Approve
                                                        </AdminButton>
                                                        <AdminButton
                                                            variant="danger"
                                                            onClick={() => updateStatus(r.id, 'rejected')}
                                                            className="px-3 py-1.5 h-8"
                                                        >
                                                            Reject
                                                        </AdminButton>
                                                    </>
                                                )}
                                                <button
                                                    title="Delete"
                                                    onClick={() => deleteReview(r.id)}
                                                    className="p-2 rounded-xl hover:bg-rose-500/10 text-[var(--text-3)] hover:text-rose-500 transition-all border border-transparent hover:border-rose-500/20"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </AdminTableRow>
                                )
                            })
                        )}
                    </div>
                </div>
            </AdminCard>
        </div>
    )
}
