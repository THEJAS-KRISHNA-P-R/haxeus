"use client"

import { useEffect, useState } from "react"
import { ShieldCheck, Star, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import {
  AdminCard,
  AdminPageHeader,
  AdminSearchInput,
  AdminTableHeader,
  AdminTableRow,
} from "@/components/admin/AdminUI"
import { cn } from "@/lib/utils"

interface AdminReviewRecord {
  id: string
  product_id: number
  order_id: string | null
  user_id: string | null
  rating: number
  title: string | null
  body: string | null
  verified_purchase: boolean
  created_at: string
  products?: Array<{ name: string | null }> | null
}

export default function ReviewsContent() {
  const [reviews, setReviews] = useState<AdminReviewRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    void fetchReviews()
  }, [])

  async function fetchReviews() {
    setLoading(true)

    const { data, error } = await supabase
      .from("reviews")
      .select("id, product_id, order_id, user_id, rating, title, body, verified_purchase, created_at, products(name)")
      .order("created_at", { ascending: false })

    if (!error) {
      setReviews((data as unknown as AdminReviewRecord[] | null) ?? [])
    }

    setLoading(false)
  }

  async function deleteReview(id: string) {
    const { error } = await supabase.from("reviews").delete().eq("id", id)

    if (!error) {
      await fetchReviews()
    }
  }

  const filteredReviews = reviews.filter((review) =>
      [review.products?.[0]?.name ?? "", review.title ?? "", review.body ?? ""].some((value) =>
      value.toLowerCase().includes(search.toLowerCase())
    )
  )

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Engine Pulse"
        subtitle={`${reviews.length} authenticated customer signals captured in the primary feedback loop.`}
      />

      <AdminCard className="overflow-hidden">
        <div className="px-6 py-6 border-b border-[var(--border)] bg-[var(--bg-elevated)]/20">
          <p className="mb-4 text-[9px] font-black uppercase tracking-[0.25em] text-[var(--accent-glow)] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
            Signals auto-published after delivery protocol confirmation.
          </p>
          <AdminSearchInput
            placeholder="Query pulses by product or signal content..."
            value={search}
            onChange={setSearch}
            onClear={() => setSearch("")}
            className="max-w-md"
          />
        </div>

        <div className="p-2">
          <AdminTableHeader cols="grid-cols-[1.35fr_0.7fr_2fr_0.9fr_1fr] border-none !bg-transparent">
            <div className="pl-4">Target Asset</div>
            <div>Magnitude</div>
            <div>Transmission Content</div>
            <div>Origin Status</div>
            <div className="pr-4 text-right">System Management</div>
          </AdminTableHeader>

          <div className="divide-y divide-[var(--border)]/50">
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <div 
                    style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }}
                    className="w-8 h-8 rounded-full border-2 animate-spin" 
                />
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="px-6 py-32 text-center">
                <div
                  className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)]/50"
                  style={{ color: "var(--text-3)" }}
                >
                  <Star size={32} className="opacity-20" />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight italic" style={{ color: "var(--text)" }}>
                  {reviews.length === 0 ? "Zero pulses detected" : "No signals match query"}
                </h3>
                <p className="text-[10px] font-black uppercase tracking-widest mt-2 opacity-40">System feedback loop is currently dormant.</p>
              </div>
            ) : (
              filteredReviews.map((review) => (
                <AdminTableRow
                  key={review.id}
                  cols="grid-cols-[1.35fr_0.7fr_2fr_0.9fr_1fr]"
                  className="items-center px-6 py-5"
                >
                  <div className="pr-4">
                    <span className="block truncate text-xs font-bold" style={{ color: "var(--text)" }}>
                      {review.products?.[0]?.name || "Unknown Product"}
                    </span>
                    {review.title && (
                      <p className="mt-1 text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--text-3)" }}>
                        {review.title}
                      </p>
                    )}
                  </div>

                  <div>
                    <div
                      className="flex w-fit items-center gap-1.5 rounded-lg border px-2.5 py-1"
                      style={{
                        background: "color-mix(in srgb, #e7bf04 10%, transparent)",
                        borderColor: "color-mix(in srgb, #e7bf04 20%, transparent)",
                        color: "#e7bf04",
                      }}
                    >
                      <span className="text-[10px] font-bold">{review.rating.toFixed(1)}</span>
                      <Star className="h-2.5 w-2.5 fill-current" />
                    </div>
                  </div>

                  <div className="pr-6">
                    <p className="line-clamp-2 text-[11px] font-medium italic leading-relaxed" style={{ color: "var(--text-2)" }}>
                      &quot;{review.body || "No review text provided."}&quot;
                    </p>
                  </div>

                  <div>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider",
                        review.verified_purchase ? "text-emerald-500" : "text-white/50"
                      )}
                      style={{
                        background: review.verified_purchase ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.03)",
                        borderColor: review.verified_purchase ? "rgba(16,185,129,0.2)" : "var(--border)",
                      }}
                    >
                      <ShieldCheck size={10} />
                      {review.verified_purchase ? "Delivered buyer" : "Unverified"}
                    </span>
                  </div>

                  <div className="text-right">
                    <button
                      title="Delete"
                      onClick={() => void deleteReview(review.id)}
                      className="rounded-xl border border-transparent p-2 text-[var(--text-3)] transition-all hover:border-rose-500/20 hover:bg-rose-500/10 hover:text-rose-500"
                    >
                      <Trash2 size={16} />
                    </button>
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

