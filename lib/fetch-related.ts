import { cache } from "react"
import { createClient } from "@/lib/supabase-server"

export const fetchRelatedProducts = cache(async (productId: number, category: string) => {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("category", category)
      .neq("id", productId)
      .limit(10)
    
    if (error) {
      console.error(`[fetchRelatedProducts] Supabase error:`, error.message)
      return []
    }
    
    return data || []
  } catch (err) {
    console.error(`[fetchRelatedProducts] Unexpected error:`, err)
    return []
  }
})
