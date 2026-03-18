import { cache } from "react"
import { supabase } from "@/lib/supabase"

export const fetchProductById = cache(async (id: number) => {
  const { data } = await supabase
    .from("products")
    .select(`
      id, name, price, description, tagline, front_image, category,
      is_preorder, preorder_status, expected_date,
      max_preorders, preorder_count,
      product_images (image_url, is_primary, display_order),
      product_inventory (size, quantity)
    `)
    .eq("id", id)
    .maybeSingle()
  return data
})
