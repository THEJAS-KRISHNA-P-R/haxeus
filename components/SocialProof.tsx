"use client"

import { useEffect, useState } from "react"
import { Star } from "lucide-react"
import { useTheme } from "@/components/ThemeProvider"
import { cn } from "@/lib/utils"
import { Product } from "@/types/supabase"
import type { ProductReviewSummary } from "@/types/reviews"

interface SocialProofProps {
  product: Product
  reviewSummary: ProductReviewSummary | null
}

export function SocialProof({ product, reviewSummary }: SocialProofProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isDark = !mounted ? true : theme === "dark"

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
  if (!product.is_preorder && reviewSummary && reviewSummary.totalReviews > 0) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map(star => (
            <Star
              key={star}
              size={14}
              className={
                star <= Math.round(reviewSummary.averageRating)
                  ? "text-[#e7bf04] fill-[#e7bf04]"
                  : isDark ? "text-white/20 fill-transparent" : "text-black/20 fill-transparent"
              }
            />
          ))}
        </div>
        <span className={cn("text-sm", isDark ? "text-white/60" : "text-black/60")}>
          <span className="font-bold">{reviewSummary.averageRating}</span>{" "}
          ({reviewSummary.totalReviews} {reviewSummary.totalReviews === 1 ? "review" : "reviews"})
        </span>
      </div>
    )
  }

  // ── No reviews yet — invite first review ───────────────────────────────────
  if (!product.is_preorder && (!reviewSummary || reviewSummary.totalReviews === 0)) {
    return (
      <div className="flex items-center gap-2 py-1">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-theme-2/10 border border-theme-2/25 shadow-sm shadow-theme-2/5">
          <Star size={12} className="text-theme-2 fill-theme-2 animate-pulse" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-2/90">
           Be the 1st to review this item
        </span>
      </div>
    )
  }

  return null
}
