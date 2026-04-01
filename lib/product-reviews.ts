import "server-only"

import { createClient } from "@/lib/supabase-server"
import type { ProductReviewRecord, ProductReviewSummary, ProductReviewViewModel } from "@/types/reviews"

export function mapReviewRecord(review: ProductReviewRecord): ProductReviewViewModel {
  return {
    ...review,
    authorLabel: review.verified_purchase ? "Verified buyer" : "HAXEUS customer",
  }
}

export async function getProductReviews(productId: number): Promise<ProductReviewViewModel[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("reviews")
      .select("id, product_id, order_id, user_id, rating, title, body, verified_purchase, created_at")
      .eq("product_id", productId)
      .order("created_at", { ascending: false })

    if (error || !data) {
      return []
    }

    return (data as ProductReviewRecord[]).map(mapReviewRecord)
  } catch {
    return []
  }
}

export function summarizeReviews(reviews: ProductReviewRecord[]): ProductReviewSummary | null {
  if (reviews.length === 0) {
    return null
  }

  const totalReviews = reviews.length
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews

  return {
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews,
  }
}
