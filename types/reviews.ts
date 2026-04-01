export interface ProductReviewRecord {
  id: string
  product_id: number
  order_id: string | null
  user_id: string | null
  rating: number
  title: string | null
  body: string | null
  verified_purchase: boolean
  created_at: string
}

export interface ProductReviewViewModel extends ProductReviewRecord {
  authorLabel: string
}

export interface ProductReviewSummary {
  averageRating: number
  totalReviews: number
}
