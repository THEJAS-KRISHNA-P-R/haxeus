import { supabase, Product, ProductRelation } from './supabase'

/**
 * Product Recommendations Engine
 * - "You may also like" (similar products)
 * - "Frequently bought together"
 * - "Complete the look"
 * - Personalized recommendations based on browsing history
 */

export async function getRelatedProducts(
  productId: number,
  relationType: 'similar' | 'frequently_bought_together' | 'complete_the_look' = 'similar',
  limit: number = 4
): Promise<Product[]> {
  const { data, error } = await supabase
    .from('product_relations')
    .select(`
      related_product_id,
      products!product_relations_related_product_id_fkey (*)
    `)
    .eq('product_id', productId)
    .eq('relation_type', relationType)
    .order('score', { ascending: false })
    .limit(limit)

  if (error || !data) {
    console.error('Error fetching related products:', error)
    return []
  }

  return data.map((item: any) => item.products).filter(Boolean)
}

export async function getFrequentlyBoughtTogether(
  productId: number,
  limit: number = 3
): Promise<Product[]> {
  return getRelatedProducts(productId, 'frequently_bought_together', limit)
}

export async function getSimilarProducts(productId: number, limit: number = 4): Promise<Product[]> {
  // First try explicit relations
  const explicitRelations = await getRelatedProducts(productId, 'similar', limit)

  if (explicitRelations.length >= limit) {
    return explicitRelations
  }

  // Fall back to same category
  const { data: currentProduct } = await supabase
    .from('products')
    .select('category')
    .eq('id', productId)
    .single()

  if (!currentProduct?.category) return explicitRelations

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', currentProduct.category)
    .neq('id', productId)
    .limit(limit - explicitRelations.length)

  if (error || !data) return explicitRelations

  return [...explicitRelations, ...data]
}

export async function getCompleteTheLook(productId: number, limit: number = 3): Promise<Product[]> {
  return getRelatedProducts(productId, 'complete_the_look', limit)
}

export async function trackProductView(productId: number, userId?: string, sessionId?: string) {
  await supabase
    .from('product_views')
    .insert({
      product_id: productId,
      user_id: userId || null,
      session_id: sessionId || null
    })
}

export async function getPersonalizedRecommendations(
  userId: string,
  limit: number = 8
): Promise<Product[]> {
  // Get user's recently viewed products
  const { data: recentViews } = await supabase
    .from('product_views')
    .select('product_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)

  if (!recentViews || recentViews.length === 0) {
    // Return trending products if no history
    return getTrendingProducts(limit)
  }

  const viewedProductIds = recentViews.map(v => v.product_id)

  // Get products related to what they've viewed
  const { data, error } = await supabase
    .from('product_relations')
    .select(`
      related_product_id,
      score,
      products!product_relations_related_product_id_fkey (*)
    `)
    .in('product_id', viewedProductIds)
    .order('score', { ascending: false })
    .limit(limit * 2)

  if (error || !data) {
    return getTrendingProducts(limit)
  }

  // Remove duplicates and products already viewed
  const uniqueProducts = new Map<number, Product>()
  
  data.forEach((item: any) => {
    const product = item.products
    if (
      product &&
      !viewedProductIds.includes(product.id) &&
      !uniqueProducts.has(product.id)
    ) {
      uniqueProducts.set(product.id, product)
    }
  })

  const recommendations = Array.from(uniqueProducts.values()).slice(0, limit)

  // Fill remaining slots with trending products
  if (recommendations.length < limit) {
    const trending = await getTrendingProducts(limit - recommendations.length)
    recommendations.push(...trending)
  }

  return recommendations
}

export async function getTrendingProducts(limit: number = 8): Promise<Product[]> {
  // Get products with most views in last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('product_views')
    .select('product_id')
    .gte('created_at', sevenDaysAgo)

  if (error || !data) {
    // Fallback: newest products
    const { data: newProducts } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    return newProducts || []
  }

  // Count views per product
  const viewCounts: Record<number, number> = {}
  data.forEach(view => {
    viewCounts[view.product_id] = (viewCounts[view.product_id] || 0) + 1
  })

  // Get top products
  const topProductIds = Object.entries(viewCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => parseInt(id))

  if (topProductIds.length === 0) {
    const { data: newProducts } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    return newProducts || []
  }

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .in('id', topProductIds)

  return products || []
}

export async function getNewArrivals(limit: number = 8): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching new arrivals:', error)
    return []
  }

  return data || []
}

export async function getBestSellers(limit: number = 8): Promise<Product[]> {
  const { data, error } = await supabase
    .from('top_selling_products')
    .select(`
      id,
      name,
      total_sold,
      products (*)
    `)
    .limit(limit)

  if (error || !data) {
    console.error('Error fetching best sellers:', error)
    return []
  }

  return data.map((item: any) => item.products).filter(Boolean)
}

// Admin function to generate product relations
export async function generateProductRelations() {
  // This should be run periodically (e.g., daily) to update relations

  // 1. Similar products (same category)
  const { data: products } = await supabase.from('products').select('id, category')

  if (!products) return

  const relations: Array<{
    product_id: number
    related_product_id: number
    relation_type: string
    score: number
  }> = []

  products.forEach(product => {
    const similar = products.filter(
      p => p.category === product.category && p.id !== product.id
    )

    similar.forEach(s => {
      relations.push({
        product_id: product.id,
        related_product_id: s.id,
        relation_type: 'similar',
        score: 0.7
      })
    })
  })

  // 2. Frequently bought together (from order history)
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('order_id, product_id')

  if (orderItems) {
    const orderGroups: Record<string, number[]> = {}

    orderItems.forEach(item => {
      if (!orderGroups[item.order_id]) {
        orderGroups[item.order_id] = []
      }
      orderGroups[item.order_id].push(item.product_id)
    })

    Object.values(orderGroups).forEach(productIds => {
      if (productIds.length > 1) {
        productIds.forEach(productId => {
          productIds.forEach(relatedId => {
            if (productId !== relatedId) {
              relations.push({
                product_id: productId,
                related_product_id: relatedId,
                relation_type: 'frequently_bought_together',
                score: 0.9
              })
            }
          })
        })
      }
    })
  }

  // Insert relations (ignore conflicts)
  if (relations.length > 0) {
    await supabase
      .from('product_relations')
      .upsert(relations, { onConflict: 'product_id,related_product_id,relation_type' })
  }
}
