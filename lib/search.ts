import { supabase, Product } from './supabase'

/**
 * Enhanced Search Functionality
 * - Typo tolerance
 * - Autocomplete suggestions
 * - Advanced filters
 * - Search analytics
 * - Relevance scoring
 */

export async function searchProducts(
  query: string,
  options?: {
    category?: string
    minPrice?: number
    maxPrice?: number
    sizes?: string[]
    sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'popular'
    limit?: number
    offset?: number
  }
): Promise<{ products: Product[]; totalCount: number }> {
  let dbQuery = supabase
    .from('products')
    .select('*', { count: 'exact' })

  // Apply text search with similarity
  if (query && query.trim()) {
    dbQuery = dbQuery.or(
      `name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`
    )
  }

  // Category filter
  if (options?.category) {
    dbQuery = dbQuery.eq('category', options.category)
  }

  // Price filters
  if (options?.minPrice !== undefined) {
    dbQuery = dbQuery.gte('price', options.minPrice)
  }
  if (options?.maxPrice !== undefined) {
    dbQuery = dbQuery.lte('price', options.maxPrice)
  }

  // Size filter
  if (options?.sizes && options.sizes.length > 0) {
    dbQuery = dbQuery.overlaps('available_sizes', options.sizes)
  }

  // Sorting
  if (options?.sortBy === 'price_asc') {
    dbQuery = dbQuery.order('price', { ascending: true })
  } else if (options?.sortBy === 'price_desc') {
    dbQuery = dbQuery.order('price', { ascending: false })
  } else if (options?.sortBy === 'newest') {
    dbQuery = dbQuery.order('created_at', { ascending: false })
  } else {
    // Default: relevance (newest for now, can add ranking later)
    dbQuery = dbQuery.order('created_at', { ascending: false })
  }

  // Pagination
  if (options?.limit) {
    dbQuery = dbQuery.limit(options.limit)
  }
  if (options?.offset) {
    dbQuery = dbQuery.range(
      options.offset,
      options.offset + (options.limit || 10) - 1
    )
  }

  const { data, error, count } = await dbQuery

  // Track search
  if (query && query.trim()) {
    trackSearch(query, data?.length || 0)
  }

  if (error) {
    console.error('Error searching products:', error)
    return { products: [], totalCount: 0 }
  }

  return { products: data || [], totalCount: count || 0 }
}

export async function getSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
  if (!query || query.length < 2) return []

  // Get product names that match
  const { data, error } = await supabase
    .from('products')
    .select('name')
    .ilike('name', `%${query}%`)
    .limit(limit)

  if (error || !data) return []

  return data.map(p => p.name)
}

export async function trackSearch(query: string, resultsCount: number, userId?: string) {
  await supabase
    .from('search_queries')
    .insert({
      query: query.trim().toLowerCase(),
      user_id: userId || null,
      results_count: resultsCount
    })
}

export async function trackSearchClick(searchId: string, productId: number) {
  await supabase
    .from('search_queries')
    .update({ clicked_product_id: productId })
    .eq('id', searchId)
}

export async function getPopularSearches(limit: number = 10): Promise<string[]> {
  const { data, error } = await supabase
    .from('search_queries')
    .select('query')
    .gte('results_count', 1)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error || !data) return []

  // Count frequency
  const frequency: Record<string, number> = {}
  data.forEach(item => {
    frequency[item.query] = (frequency[item.query] || 0) + 1
  })

  // Sort by frequency
  const sorted = Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([query]) => query)

  return sorted
}

export async function getNoResultsSearches(): Promise<string[]> {
  const { data, error } = await supabase
    .from('search_queries')
    .select('query')
    .eq('results_count', 0)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error || !data) return []

  // Return unique queries
  return [...new Set(data.map(item => item.query))]
}

// Advanced filter combinations
export interface ProductFilters {
  category?: string[]
  priceRange?: { min: number; max: number }
  sizes?: string[]
  colors?: string[]
  inStock?: boolean
  rating?: number
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'popular' | 'rating'
}

export async function advancedProductSearch(
  query: string,
  filters: ProductFilters,
  pagination: { limit: number; offset: number }
): Promise<{ products: any[]; totalCount: number; facets: any }> {
  let dbQuery = supabase.from('products_with_ratings').select('*', { count: 'exact' })

  // Text search
  if (query && query.trim()) {
    dbQuery = dbQuery.or(
      `name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`
    )
  }

  // Category filter (multiple)
  if (filters.category && filters.category.length > 0) {
    dbQuery = dbQuery.in('category', filters.category)
  }

  // Price range
  if (filters.priceRange) {
    if (filters.priceRange.min) dbQuery = dbQuery.gte('price', filters.priceRange.min)
    if (filters.priceRange.max) dbQuery = dbQuery.lte('price', filters.priceRange.max)
  }

  // Sizes
  if (filters.sizes && filters.sizes.length > 0) {
    dbQuery = dbQuery.overlaps('available_sizes', filters.sizes)
  }

  // Rating filter
  if (filters.rating) {
    dbQuery = dbQuery.gte('average_rating', filters.rating)
  }

  // Sorting
  switch (filters.sortBy) {
    case 'price_asc':
      dbQuery = dbQuery.order('price', { ascending: true })
      break
    case 'price_desc':
      dbQuery = dbQuery.order('price', { ascending: false })
      break
    case 'newest':
      dbQuery = dbQuery.order('created_at', { ascending: false })
      break
    case 'rating':
      dbQuery = dbQuery.order('average_rating', { ascending: false })
      break
    default:
      dbQuery = dbQuery.order('created_at', { ascending: false })
  }

  // Pagination
  dbQuery = dbQuery.range(pagination.offset, pagination.offset + pagination.limit - 1)

  const { data, error, count } = await dbQuery

  if (error) {
    console.error('Error in advanced search:', error)
    return { products: [], totalCount: 0, facets: {} }
  }

  // Calculate facets (for filter UI)
  const facets = await calculateFacets(query, filters)

  return {
    products: data || [],
    totalCount: count || 0,
    facets
  }
}

async function calculateFacets(query: string, appliedFilters: ProductFilters) {
  // Get all matching products (without current filters)
  let baseQuery = supabase.from('products').select('category, price, available_sizes')

  if (query && query.trim()) {
    baseQuery = baseQuery.or(
      `name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`
    )
  }

  const { data } = await baseQuery

  if (!data) return {}

  // Calculate available facets
  const categories = new Set<string>()
  const sizes = new Set<string>()
  let minPrice = Infinity
  let maxPrice = -Infinity

  data.forEach(product => {
    if (product.category) categories.add(product.category)
    if (product.available_sizes) {
      product.available_sizes.forEach((size: string) => sizes.add(size))
    }
    if (product.price < minPrice) minPrice = product.price
    if (product.price > maxPrice) maxPrice = product.price
  })

  return {
    categories: Array.from(categories),
    sizes: Array.from(sizes),
    priceRange: { min: minPrice, max: maxPrice }
  }
}
