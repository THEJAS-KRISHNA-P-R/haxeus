"use client"

import { useEffect, useState } from "react"
import { Star } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useTheme } from "@/components/ThemeProvider"
import { cn } from "@/lib/utils"

interface ReviewSummary {
  count: number
  average: number
}

interface SocialProofProps {
  product: any
}

export function SocialProof({ product }: SocialProofProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [reviews, setReviews] = useState<ReviewSummary | null>(null)

  useEffect(() => setMounted(true), [])

  const isDark = !mounted ? true : theme === "dark"

  useEffect(() => {
    if (product.is_preorder) return // preorders use preorder_count

    supabase
      .from("product_reviews")
      .select("rating")
      .eq("product_id", product.id)
      .then(({ data }) => {
        if (!data || data.length === 0) return
        const avg = data.reduce((sum: number, r: any) => sum + r.rating, 0) / data.length
        setReviews({ count: data.length, average: Math.round(avg * 10) / 10 })
      })
  }, [product.id, product.is_preorder])

  if (!mounted) return null

  // ── Preorder social proof ────────────────────────────────────────────────────
  if (product.is_preorder && (product.preorder_count ?? 0) > 0) {
    const slotsLeft = product.max_preorders
      ? product.max_preorders - (product.preorder_count ?? 0)
      : null

    return (
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="text-base">🔥</span>
          <span className={cn("text-sm font-medium", isDark ? "text-white/70" : "text-black/70")}>
            <span className="font-bold text-[#e7bf04]">{product.preorder_count}</span>{" "}
            {product.preorder_count === 1 ? "person has" : "people have"} pre-ordered
          </span>
        </div>
        {slotsLeft !== null && slotsLeft > 0 && (
          <>
            <span className={cn("text-xs", isDark ? "text-white/20" : "text-black/20")}>·</span>
            <span className="text-xs font-bold text-[#e93a3a]">{slotsLeft} slots left</span>
          </>
        )}
      </div>
    )
  }

  // ── Normal product reviews ───────────────────────────────────────────────────
  if (!product.is_preorder && reviews && reviews.count > 0) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map(star => (
            <Star
              key={star}
              size={14}
              className={
                star <= Math.round(reviews.average)
                  ? "text-[#e7bf04] fill-[#e7bf04]"
                  : isDark ? "text-white/20 fill-transparent" : "text-black/20 fill-transparent"
              }
            />
          ))}
        </div>
        <span className={cn("text-sm", isDark ? "text-white/60" : "text-black/60")}>
          <span className="font-bold">{reviews.average}</span>{" "}
          ({reviews.count} {reviews.count === 1 ? "review" : "reviews"})
        </span>
      </div>
    )
  }

  // Nothing to show — render null cleanly (never show 0)
  return null
}
