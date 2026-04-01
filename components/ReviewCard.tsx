import type { ProductReviewViewModel } from "@/types/reviews"
import { ReviewStars } from "@/components/ReviewStars"

interface ReviewCardProps {
  review: ProductReviewViewModel
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <article
      className="rounded-[28px] border p-5"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ReviewStars value={review.rating} size="sm" />
            {review.verified_purchase && (
              <span
                className="rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.22em]"
                style={{ background: "color-mix(in srgb, var(--color-success) 15%, transparent)", color: "var(--color-success)" }}
              >
                Verified
              </span>
            )}
          </div>
          <p className="mt-2 text-sm font-semibold">{review.title || review.authorLabel}</p>
        </div>
        <time className="text-xs" style={{ color: "var(--color-foreground-subtle)" }}>
          {new Date(review.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </time>
      </div>
      <p className="mt-3 text-sm leading-6" style={{ color: "var(--color-foreground-muted)" }}>
        {review.body}
      </p>
      <p className="mt-4 text-xs font-medium uppercase tracking-[0.2em]" style={{ color: "var(--color-foreground-subtle)" }}>
        {review.authorLabel}
      </p>
    </article>
  )
}
