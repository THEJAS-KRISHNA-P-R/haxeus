"use client"

import { useEffect } from "react"
import { useProductHistory } from "@/lib/stores/product-history"
import type { Product } from "@/lib/supabase"

export function TrackProductView({ product }: { product: Product }) {
  const { addViewed } = useProductHistory()

  useEffect(() => {
    addViewed(product)
  }, [product.id, addViewed])  // only re-track if product ID changes

  return null  // renders nothing
}
