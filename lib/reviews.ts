import { supabase, Product } from "./supabase"

interface BasicReviewRecord {
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

export async function getProductReviews(
  productId: number,
  options?: { limit?: number; offset?: number; sortBy?: "recent" | "helpful" | "rating" }
): Promise<{ reviews: BasicReviewRecord[]; totalCount: number }> {
  let query = supabase.from("reviews").select("*", { count: "exact" }).eq("product_id", productId)

  if (options?.sortBy === "rating") {
    query = query.order("rating", { ascending: false })
  } else {
    query = query.order("created_at", { ascending: false })
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data, error, count } = await query

  if (error) {
    console.error("Error fetching reviews:", error)
    return { reviews: [], totalCount: 0 }
  }

  return { reviews: (data as BasicReviewRecord[] | null) ?? [], totalCount: count || 0 }
}

export async function getProductRatingsSummary(productId: number) {
  const { data, error } = await supabase.from("reviews").select("rating").eq("product_id", productId)

  if (error || !data) {
    return { averageRating: 0, totalReviews: 0, ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } }
  }

  const totalReviews = data.length
  const sumRatings = data.reduce((sum, review) => sum + review.rating, 0)
  const averageRating = totalReviews > 0 ? sumRatings / totalReviews : 0
  const ratingDistribution = data.reduce((acc, review) => {
    acc[review.rating] = (acc[review.rating] || 0) + 1
    return acc
  }, {} as Record<number, number>)

  for (let rating = 1; rating <= 5; rating += 1) {
    if (!ratingDistribution[rating]) {
      ratingDistribution[rating] = 0
    }
  }

  return {
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews,
    ratingDistribution,
  }
}

export async function createReview(review: {
  productId: number
  orderId?: string
  rating: number
  title?: string
  comment?: string
}): Promise<{ success: boolean; reviewId?: string; error?: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "You must be logged in to leave a review" }
  }

  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("product_id", review.productId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (existingReview) {
    return { success: false, error: "You have already reviewed this product" }
  }

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      product_id: review.productId,
      order_id: review.orderId ?? null,
      user_id: user.id,
      rating: review.rating,
      title: review.title ?? null,
      body: review.comment ?? null,
      verified_purchase: Boolean(review.orderId),
    })
    .select("id")
    .single()

  if (error || !data) {
    console.error("Error creating review:", error)
    return { success: false, error: "Failed to create review" }
  }

  return { success: true, reviewId: data.id }
}

export async function getUserReviews(
  userId: string
): Promise<(BasicReviewRecord & { products?: Pick<Product, "id" | "name" | "front_image"> })[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*, products(id, name, front_image)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching user reviews:", error)
    return []
  }

  return ((data as (BasicReviewRecord & { products?: Pick<Product, "id" | "name" | "front_image"> })[] | null) ?? [])
}

export async function canUserReviewProduct(
  userId: string,
  productId: number
): Promise<{ canReview: boolean; reason?: string }> {
  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("product_id", productId)
    .eq("user_id", userId)
    .maybeSingle()

  if (existingReview) {
    return { canReview: false, reason: "You have already reviewed this product" }
  }

  const { data: orderItem } = await supabase
    .from("order_items")
    .select("id, orders!inner(status, delivered_at, user_id)")
    .eq("product_id", productId)
    .eq("orders.user_id", userId)
    .eq("orders.status", "delivered")
    .not("orders.delivered_at", "is", null)
    .maybeSingle()

  if (!orderItem) {
    return { canReview: false, reason: "Review becomes available after delivery." }
  }

  return { canReview: true }
}
