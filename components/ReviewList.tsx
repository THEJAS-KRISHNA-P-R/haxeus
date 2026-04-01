"use client"

import type { ProductReviewViewModel } from "@/types/reviews"
import { ReviewCard } from "@/components/ReviewCard"
import { ReviewStars } from "@/components/ReviewStars"

interface ReviewListProps {
  reviews: ProductReviewViewModel[]
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <section className="space-y-3">
        <h2 className="text-2xl font-bold tracking-tight">Customer Reviews</h2>
        <p className="text-sm leading-6" style={{ color: "var(--color-foreground-muted)" }}>
          No reviews yet. Be the first to share how this piece fits, feels, and lands in real life.
        </p>
      </section>
    )
  }

  const averageRating = Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length) * 10) / 10

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 rounded-[28px] border p-5 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: "var(--color-border)", background: "var(--color-surface-muted)" }}>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Customer Reviews</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--color-foreground-muted)" }}>
            {reviews.length} review{reviews.length === 1 ? "" : "s"} from the HAXEUS community.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ReviewStars value={Math.round(averageRating)} />
          <div>
            <p className="text-xl font-bold">{averageRating.toFixed(1)}</p>
            <p className="text-xs uppercase tracking-[0.2em]" style={{ color: "var(--color-foreground-subtle)" }}>Average rating</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </section>
  )
}
