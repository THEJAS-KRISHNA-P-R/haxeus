"use client"

import { useEffect, useState } from "react"
import { Loader2, ShieldCheck, Star, Trash2 } from "lucide-react"
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
        title="Reviews"
        subtitle={`${reviews.length} delivered-customer reviews in the live storefront feed.`}
      />

      <AdminCard>
        <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <p className="mb-3 text-xs uppercase tracking-[0.22em]" style={{ color: "var(--text-3)" }}>
            Reviews are auto-published only after delivery confirmation.
          </p>
          <AdminSearchInput
            placeholder="Search reviews by product or content..."
            value={search}
            onChange={setSearch}
            onClear={() => setSearch("")}
            className="max-w-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <AdminTableHeader cols="grid-cols-[1.35fr_0.7fr_2fr_0.9fr_1fr]" className="px-6 py-4">
            <span>Product Name</span>
            <span>Rating</span>
            <span>Customer Review</span>
            <span>Purchase</span>
            <span className="text-right">Manage</span>
          </AdminTableHeader>

          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="px-6 py-20 text-center">
                <div
                  className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                  style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-3)" }}
                >
                  <Star size={32} className="opacity-20" />
                </div>
                <p className="text-lg font-bold" style={{ color: "var(--text)" }}>
                  {reviews.length === 0 ? "No reviews yet" : "No matching reviews"}
                </p>
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
