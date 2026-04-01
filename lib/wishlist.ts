import { supabase } from "./supabase"
import { WishlistItem, Product } from "@/types/supabase"

/**
 * Add product to wishlist
 */
export async function addToWishlist(productId: number): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.error("No user logged in")
      return false
    }


    const { error } = await supabase.from("wishlist").insert([
      {
        user_id: user.id,
        product_id: productId,
      },
    ]).select()

    if (error) {
      console.error("Supabase error adding to wishlist:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error adding to wishlist:", error)
    return false
  }
}

/**
 * Remove product from wishlist
 */
export async function removeFromWishlist(productId: number): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.error("No user logged in")
      return false
    }


    const { error } = await supabase
      .from("wishlist")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .select()

    if (error) {
      console.error("Supabase error removing from wishlist:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error removing from wishlist:", error)
    return false
  }
}

/**
 * Check if product is in wishlist
 */
export async function isInWishlist(productId: number): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return false
    }

    const { data, error } = await supabase
      .from("wishlist")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .maybeSingle()
    
    if (error) {
      if (error.code.startsWith('4')) {
        console.warn("[wishlist] client error on check:", error.message)
        return false
      }
      console.error("[wishlist] check error:", error.message)
      return false
    }

    return !!data
  } catch (error) {
    return false
  }
}

/**
 * Get user's wishlist
 */
export async function getWishlist(): Promise<(WishlistItem & { products?: Pick<Product, 'id' | 'name' | 'price' | 'front_image' | 'available_sizes'> })[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return []
    }

    const { data, error } = await supabase
      .from("wishlist")
      .select(
        `
        *,
        products (
          id,
          name,
          price,
          front_image,
          available_sizes
        )
      `
      )
      .eq("user_id", user.id)

    if (error) throw error

    return (data as unknown as (WishlistItem & { products: Pick<Product, 'id' | 'name' | 'price' | 'front_image' | 'available_sizes'> })[]) || []
  } catch (error) {
    console.error("Error getting wishlist:", error)
    return []
  }
}
