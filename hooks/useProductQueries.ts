"use client"

import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import type { Product, ProductInventory, ProductReview } from "@/lib/supabase"

// Query Keys - centralized for easy invalidation
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: string) => [...productKeys.lists(), { filters }] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => ["products", "detail", id] as const,
  inventory: (id: string) => ["products", "detail", id, "inventory"] as const,
  reviews: (id: string) => ["products", "detail", id, "reviews"] as const,
  related: (id: string, category: string) => ["products", "detail", id, "related", category] as const,
  preorders: () => ["preorders"] as const
}

/**
 * Fetch a single product by ID
 */
export function useProduct(id: string, options: any = {}) {
  return useQuery<Product, Error>({
    queryKey: productKeys.detail(id),
    queryFn: async () => {
      // Safety check for invalid IDs
      if (!id || id === "undefined" || id === "NaN") {
        throw new Error("Invalid product ID")
      }

      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          product_images (
            image_url,
            is_primary,
            display_order
          )
        `)
        .eq("id", id)
        .single()
      
      if (error) throw error
      return data as Product
    },
    enabled: !!id && id !== "undefined" && id !== "NaN",
    ...options
  })
}

/**
 * Fetch inventory for a specific product
 */
export function useProductInventory(productId: string, options: any = {}) {
  return useQuery<ProductInventory[], Error>({
    queryKey: productKeys.inventory(productId),
    queryFn: async () => {
      if (!productId || productId === "undefined" || productId === "NaN") {
        throw new Error("Invalid product ID")
      }
      const { data, error } = await supabase
        .from("product_inventory")
        .select("*")
        .eq("product_id", productId)
      
      if (error) throw error
      return data as ProductInventory[]
    },
    enabled: !!productId && productId !== "undefined" && productId !== "NaN",
    ...options
  })
}

/**
 * Fetch reviews for a specific product
 */
export function useProductReviews(productId: string, options: any = {}) {
  return useQuery<ProductReview[], Error>({
    queryKey: productKeys.reviews(productId),
    queryFn: async () => {
      if (!productId || productId === "undefined" || productId === "NaN") {
        throw new Error("Invalid product ID")
      }
      const { data, error } = await supabase
        .from("product_reviews")
        .select("*")
        .eq("product_id", productId)
      
      if (error) throw error
      return data as ProductReview[]
    },
    enabled: !!productId && productId !== "undefined" && productId !== "NaN",
    ...options
  })
}

/**
 * Fetch products list with optional search/filter
 */
export function useProducts(search?: string, options: any = {}) {
  return useQuery<Product[], Error>({
    queryKey: productKeys.list(search || ""),
    queryFn: async () => {
      let query = supabase.from("products").select("*")
      
      if (search) {
        query = query.ilike("name", `%${search}%`)
      }
      
      const { data, error } = await query
      if (error) throw error
      return data as Product[]
    },
    ...options
  })
}

/**
 * Fetch related products (same category, excluding current)
 */
export function useRelatedProducts(productId: string, category: string, options: any = {}) {
  return useQuery<Product[], Error>({
    queryKey: productKeys.related(productId, category),
    queryFn: async () => {
      if (!productId || productId === "undefined" || productId === "NaN") {
        throw new Error("Invalid product ID")
      }
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category", category)
        .neq("id", productId)
        .limit(10)
      
      if (error) throw error
      return data as Product[]
    },
    enabled: !!productId && productId !== "undefined" && productId !== "NaN" && !!category,
    ...options
  })
}

/**
 * Fetch active preorders
 */
export function usePreorderProducts(options: any = {}) {
  return useQuery<Product[], Error>({
    queryKey: productKeys.preorders(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_preorder", true)
        .eq("preorder_status", "active")
      
      if (error) throw error
      return data as Product[]
    },
    ...options
  })
}
