import { cache } from "react"
import { createClient } from "@/lib/supabase-server"

export const fetchProductById = cache(async (id: number) => {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("products")
      .select(`
        id, name, price, description, tagline, front_image, category,
        is_preorder, preorder_status, expected_date,
        max_preorders, preorder_count,
        product_images (image_url, is_primary, display_order),
        product_inventory (size, stock_quantity, color, reserved_quantity)
      `)
      .eq("id", id)
      .maybeSingle()
    
    if (error) {
      console.error(`[fetchProductById] Supabase error for ID ${id}:`, error.message)
      return null
    }
    
    return data
  } catch (err) {
    console.error(`[fetchProductById] Unexpected error for ID ${id}:`, err)
    return null
  }
})
