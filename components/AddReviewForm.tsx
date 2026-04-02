"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { ReviewStars } from "@/components/ReviewStars"
import type { ProductReviewViewModel } from "@/types/reviews"

interface AddReviewFormProps {
  productId: number
  isAuthenticated: boolean
  onReviewCreated: (review: ProductReviewViewModel) => void
}

export function AddReviewForm({ productId, isAuthenticated, onReviewCreated }: AddReviewFormProps) {
  const { toast } = useToast()
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, title, body }),
      })

      const result = await response.json()

      if (!response.ok || !result.review) {
        toast({
          title: "Review not submitted",
          description: result.error || "Please try again in a moment.",
          variant: "destructive",
        })
        return
      }

      onReviewCreated(result.review as ProductReviewViewModel)
      setTitle("")
      setBody("")
      setRating(5)
      toast({ title: "Review submitted", description: "Thanks for sharing your feedback." })
    } catch {
      toast({
        title: "Review not submitted",
        description: "Please try again in a moment.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="rounded-[28px] border p-5 sm:p-6" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
      <div className="mb-4">
        <h2 className="text-xl font-bold tracking-tight">Write a Review</h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-foreground-muted)" }}>
          Help other shoppers choose the right fit and feel.
        </p>
        <p className="mt-4 text-xs font-small tracking-[0.01em]" style={{ color: "var(--color-accent-warm)" }}>
          You can write a review once your order is delivered.
        </p>
      </div>

      {!isAuthenticated ? (
        <p className="text-sm leading-6" style={{ color: "var(--color-foreground-muted)" }}>
          <Link href={`/auth?redirect=/products/${productId}`} className="font-semibold underline underline-offset-4" style={{ color: "var(--color-accent)" }}>
            Sign in
          </Link>{" "}
          to leave a review for this product.
        </p>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--color-foreground-muted)" }}>
              Rating
            </label>
            <ReviewStars value={rating} onChange={setRating} />
          </div>

          <div>
            <label htmlFor="review-title" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--color-foreground-muted)" }}>
              Title
            </label>
            <input
              id="review-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={120}
              placeholder="Short headline"
              className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
              style={{ borderColor: "var(--color-border)", background: "var(--color-surface-muted)", color: "var(--color-foreground)" }}
            />
          </div>

          <div>
            <label htmlFor="review-body" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--color-foreground-muted)" }}>
              Your review
            </label>
            <textarea
              id="review-body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              minLength={12}
              rows={5}
              placeholder="Tell us about the fit, quality, and overall feel."
              className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
              style={{ borderColor: "var(--color-border)", background: "var(--color-surface-muted)", color: "var(--color-foreground)" }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: "var(--color-accent)" }}
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      )}
    </section>
  )
}
