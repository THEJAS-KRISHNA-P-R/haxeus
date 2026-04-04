import "server-only"

import { createClient } from "@/lib/supabase-server"
import type { ProductReviewRecord, ProductReviewSummary, ProductReviewViewModel } from "@/types/reviews"

export function mapReviewRecord(review: ProductReviewRecord): ProductReviewViewModel {
  const profile = Array.isArray(review.profiles) ? review.profiles[0] : review.profiles
  const name = profile?.full_name

  return {
    ...review,
    authorLabel: name || (review.verified_purchase ? "Verified buyer" : "HAXEUS customer"),
  }
}

export async function getProductReviews(productId: number): Promise<ProductReviewViewModel[]> {
  try {
    const supabase = await createClient()
    
    // Attempt join for author names
    const { data, error } = await supabase
      .from("reviews")
      .select("id, product_id, order_id, user_id, rating, title, body, verified_purchase, image_urls, created_at, profiles(full_name)")
      .eq("product_id", productId)
      .order("created_at", { ascending: false })

    if (error) {
      // Fallback: Fetch without join if SQL has not been updated yet
      const { data: fallbackData } = await supabase
        .from("reviews")
        .select("id, product_id, order_id, user_id, rating, title, body, verified_purchase, image_urls, created_at")
        .eq("product_id", productId)
        .order("created_at", { ascending: false })
      
      return (fallbackData as ProductReviewRecord[] ?? []).map(mapReviewRecord)
    }

    return (data as ProductReviewRecord[] ?? []).map(mapReviewRecord)
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
