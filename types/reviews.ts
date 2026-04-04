export interface ProductReviewRecord {
  id: string
  product_id: number
  order_id: string | null
  user_id: string | null
  rating: number
  title: string | null
  body: string | null
  verified_purchase: boolean
  image_urls?: string[] | null
  created_at: string
  profiles?: {
    full_name: string | null
  } | {
    full_name: string | null
  }[] | null
}

export interface ProductReviewViewModel extends ProductReviewRecord {
  authorLabel: string
}

export interface ProductReviewSummary {
  averageRating: number
  totalReviews: number
}
