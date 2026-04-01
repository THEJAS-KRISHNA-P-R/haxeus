"use client"

import { useEffect } from "react"
import { useProductHistory } from "@/lib/stores/product-history"
import { Product } from "@/types/supabase"
import { gaCommerceEvents } from "@/lib/ga-events"

export function TrackProductView({ product }: { product: Product }) {
  const { addViewed } = useProductHistory()

  useEffect(() => {
    // 1. Local history
    addViewed(product)
    
    // 2. GA4 Tracking
    gaCommerceEvents.viewItem(
      product.id.toString(),
      product.name,
      product.price,
      product.category || "Streetwear"
    )
  }, [product.id, addViewed])  // only re-track if product ID changes

  return null  // renders nothing
}
