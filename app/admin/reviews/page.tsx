"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Star, CheckCircle, XCircle, Trash2 } from "lucide-react"

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
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Reviews</h1>
                    <p className="text-white/40 text-sm mt-1">{reviews.length} total customer reviews</p>
                </div>
            </div>

            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
                <div className="grid grid-cols-5 gap-4 px-6 py-3 text-xs font-medium text-white/30 uppercase tracking-wider border-b border-white/[0.06]">
                    <span>Product</span>
                    <span>Rating</span>
                    <span className="col-span-2">Comment</span>
                    <span className="text-right">Actions</span>
                </div>

                {loading ? (
                    [...Array(4)].map((_, i) => (
                        <div key={i} className="h-14 mx-4 my-2 rounded-lg bg-white/[0.03] animate-pulse" />
                    ))
                ) : reviews.length === 0 ? (
                    <div className="text-center py-16 text-white/30">
                        <Star className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p>No reviews yet</p>
                    </div>
                ) : (
                    reviews.map(r => (
                        <div key={r.id} className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors text-sm">
                            <span className="text-white font-medium truncate">{r.products?.name || 'Unknown Product'}</span>
                            <span className="flex items-center gap-1 text-[#e7bf04]">
                                {r.rating} <Star className="h-3 w-3 fill-current" />
                            </span>
                            <span className="col-span-2 text-white/50">{r.comment || 'No comment provided.'}</span>
                            <div className="flex items-center justify-end gap-2">
                                <button title="Approve" className="p-2 rounded-lg hover:bg-green-500/10 text-white/30 hover:text-green-400 transition-colors">
                                    <CheckCircle size={14} />
                                </button>
                                <button title="Reject" className="p-2 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-colors">
                                    <XCircle size={14} />
                                </button>
                                <button title="Delete" className="p-2 rounded-lg hover:bg-white/[0.05] text-white/30 hover:text-red-500 transition-colors">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
