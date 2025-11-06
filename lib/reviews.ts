import { supabase, ProductReview, ReviewImage } from './supabase'

/**
 * Product Reviews & Ratings System
 * - Star ratings (1-5)
 * - Verified purchase badges
 * - Image uploads
 * - Helpful/Not Helpful voting
 */

export async function getProductReviews(
  productId: number,
  options?: { limit?: number; offset?: number; sortBy?: 'recent' | 'helpful' | 'rating' }
): Promise<{ reviews: ProductReview[]; totalCount: number }> {
  let query = supabase
    .from('product_reviews')
    .select('*, review_images(*)', { count: 'exact' })
    .eq('product_id', productId)
    .eq('is_approved', true)

  // Sort
  if (options?.sortBy === 'helpful') {
    query = query.order('helpful_count', { ascending: false })
  } else if (options?.sortBy === 'rating') {
    query = query.order('rating', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  // Pagination
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching reviews:', error)
    return { reviews: [], totalCount: 0 }
  }

  return { reviews: data || [], totalCount: count || 0 }
}

export async function getProductRatingsSummary(productId: number) {
  const { data, error } = await supabase
    .from('product_reviews')
    .select('rating')
    .eq('product_id', productId)
    .eq('is_approved', true)

  if (error || !data) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    }
  }

  const totalReviews = data.length
  const sumRatings = data.reduce((sum, review) => sum + review.rating, 0)
  const averageRating = totalReviews > 0 ? sumRatings / totalReviews : 0

  const ratingDistribution = data.reduce((acc, review) => {
    acc[review.rating] = (acc[review.rating] || 0) + 1
    return acc
  }, {} as Record<number, number>)

  // Ensure all ratings 1-5 exist
  for (let i = 1; i <= 5; i++) {
    if (!ratingDistribution[i]) ratingDistribution[i] = 0
  }

  return {
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews,
    ratingDistribution
  }
}

export async function createReview(review: {
  productId: number
  userId: string
  orderId?: string
  rating: number
  title?: string
  comment?: string
  images?: File[]
}): Promise<{ success: boolean; reviewId?: string; error?: string }> {
  // Check if user already reviewed this product
  const { data: existingReview } = await supabase
    .from('product_reviews')
    .select('id')
    .eq('product_id', review.productId)
    .eq('user_id', review.userId)
    .single()

  if (existingReview) {
    return { success: false, error: 'You have already reviewed this product' }
  }

  // Check if verified purchase
  let verifiedPurchase = false
  if (review.orderId) {
    const { data: orderItem } = await supabase
      .from('order_items')
      .select('id')
      .eq('order_id', review.orderId)
      .eq('product_id', review.productId)
      .single()

    verifiedPurchase = !!orderItem
  }

  // Insert review
  const { data: newReview, error: reviewError } = await supabase
    .from('product_reviews')
    .insert({
      product_id: review.productId,
      user_id: review.userId,
      order_id: review.orderId,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      verified_purchase: verifiedPurchase
    })
    .select()
    .single()

  if (reviewError || !newReview) {
    console.error('Error creating review:', reviewError)
    return { success: false, error: 'Failed to create review' }
  }

  // Upload images if provided
  if (review.images && review.images.length > 0) {
    await uploadReviewImages(newReview.id, review.images)
  }

  return { success: true, reviewId: newReview.id }
}

export async function uploadReviewImages(reviewId: string, images: File[]): Promise<string[]> {
  const uploadedUrls: string[] = []

  for (const image of images) {
    const fileExt = image.name.split('.').pop()
    const fileName = `${reviewId}-${Date.now()}.${fileExt}`
    const filePath = `review-images/${fileName}`

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, image)

    if (!error && data) {
      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      if (publicUrlData) {
        uploadedUrls.push(publicUrlData.publicUrl)

        // Save to database
        await supabase
          .from('review_images')
          .insert({
            review_id: reviewId,
            image_url: publicUrlData.publicUrl
          })
      }
    }
  }

  return uploadedUrls
}

export async function voteOnReview(
  reviewId: string,
  userId: string,
  isHelpful: boolean
): Promise<boolean> {
  // Check if user already voted
  const { data: existingVote } = await supabase
    .from('review_votes')
    .select('id, is_helpful')
    .eq('review_id', reviewId)
    .eq('user_id', userId)
    .single()

  if (existingVote) {
    // Update existing vote
    await supabase
      .from('review_votes')
      .update({ is_helpful: isHelpful })
      .eq('id', existingVote.id)

    // Update counts
    if (existingVote.is_helpful !== isHelpful) {
      if (isHelpful) {
        await supabase.rpc('increment_helpful_count', { review_id: reviewId })
        await supabase.rpc('decrement_not_helpful_count', { review_id: reviewId })
      } else {
        await supabase.rpc('decrement_helpful_count', { review_id: reviewId })
        await supabase.rpc('increment_not_helpful_count', { review_id: reviewId })
      }
    }
  } else {
    // Insert new vote
    const { error } = await supabase
      .from('review_votes')
      .insert({
        review_id: reviewId,
        user_id: userId,
        is_helpful: isHelpful
      })

    if (error) return false

    // Update counts
    if (isHelpful) {
      await supabase.rpc('increment_helpful_count', { review_id: reviewId })
    } else {
      await supabase.rpc('increment_not_helpful_count', { review_id: reviewId })
    }
  }

  return true
}

export async function getUserReviews(userId: string): Promise<ProductReview[]> {
  const { data, error } = await supabase
    .from('product_reviews')
    .select(`
      *,
      review_images(*),
      products(id, name, front_image)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user reviews:', error)
    return []
  }

  return data || []
}

export async function canUserReviewProduct(
  userId: string,
  productId: number
): Promise<{ canReview: boolean; reason?: string }> {
  // Check if already reviewed
  const { data: existingReview } = await supabase
    .from('product_reviews')
    .select('id')
    .eq('product_id', productId)
    .eq('user_id', userId)
    .single()

  if (existingReview) {
    return { canReview: false, reason: 'You have already reviewed this product' }
  }

  // Check if user purchased this product
  const { data: orderItem } = await supabase
    .from('order_items')
    .select('id, orders(status)')
    .eq('product_id', productId)
    .eq('orders.user_id', userId)
    .eq('orders.status', 'delivered')
    .single()

  if (!orderItem) {
    return { canReview: true, reason: 'Purchase not required, but review won\'t be verified' }
  }

  return { canReview: true }
}
