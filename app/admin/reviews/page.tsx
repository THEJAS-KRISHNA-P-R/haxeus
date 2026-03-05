"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Star, CheckCircle, XCircle, Trash2 } from "lucide-react";
import {
    AdminCard,
    AdminPageHeader,
    AdminTableHeader,
    AdminTableRow
} from "@/components/admin/AdminUI";
import { cn } from "@/lib/utils";

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchReviews() {
            const { data, error } = await supabase
                .from('reviews')
                .select('*, products(name)')
                .order('created_at', { ascending: false })

            if (!error) {
                setReviews(data || [])
            }
            setLoading(false)
        }
        fetchReviews()
    }, [])

    return (
        <div className="space-y-6">
            <div className="mb-2">
                <AdminPageHeader
                    title="Reviews"
                    subtitle={`${reviews.length} total customer reviews found in the database.`}
                />
            </div>

            <AdminCard>
                <AdminTableHeader cols="grid-cols-[1.5fr_1fr_2fr_0.8fr]" className="px-6 py-4">
                    <span>Product Name</span>
                    <span>Rating Score</span>
                    <span>Customer Comment</span>
                    <span className="text-right">Manage</span>
                </AdminTableHeader>

                <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                    {loading ? (
                        [...Array(5)].map((_, i) => (
                            <div key={i} className="px-6 py-5 flex items-center justify-between gap-4">
                                <div style={{ background: "var(--bg-elevated)" }} className="h-4 w-32 rounded animate-pulse" />
                                <div style={{ background: "var(--bg-elevated)" }} className="h-4 w-16 rounded animate-pulse" />
                                <div style={{ background: "var(--bg-elevated)" }} className="h-4 w-48 rounded animate-pulse" />
                                <div style={{ background: "var(--bg-elevated)" }} className="h-6 w-20 rounded-xl animate-pulse" />
                            </div>
                        ))
                    ) : reviews.length === 0 ? (
                        <div className="text-center py-20 px-6">
                            <div
                                style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-3)" }}
                                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                            >
                                <Star size={32} className="opacity-20" />
                            </div>
                            <p style={{ color: "var(--text)" }} className="font-bold text-lg">No reviews yet</p>
                            <p style={{ color: "var(--text-3)" }} className="text-sm mt-1">Once customers start reviewing your products, they will appear here for moderation.</p>
                        </div>
                    ) : (
                        reviews.map(r => (
                            <AdminTableRow key={r.id} cols="grid-cols-[1.5fr_1fr_2fr_0.8fr]" className="px-6 py-5 items-center">
                                <div className="pr-4">
                                    <span style={{ color: "var(--text)" }} className="font-bold text-sm truncate block">
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
                                        <span className="font-bold text-xs">{r.rating?.toFixed(1)}</span>
                                        <Star className="h-3 w-3 fill-current" />
                                    </div>
                                </div>
                                <div className="pr-6">
                                    <p style={{ color: "var(--text-2)" }} className="text-xs font-medium leading-relaxed italic line-clamp-2">
                                        "{r.comment || 'No comment provided.'}"
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <button title="Approve" className="p-2 rounded-xl hover:bg-emerald-500/10 text-[var(--text-3)] hover:text-emerald-500 transition-all">
                                            <CheckCircle size={16} />
                                        </button>
                                        <button title="Reject" className="p-2 rounded-xl hover:bg-rose-500/10 text-[var(--text-3)] hover:text-rose-500 transition-all">
                                            <XCircle size={16} />
                                        </button>
                                        <button title="Delete" className="p-2 rounded-xl hover:bg-[var(--bg-elevated)] text-[var(--text-3)] hover:text-[var(--text)] transition-all">
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
