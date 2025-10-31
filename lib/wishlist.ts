import { supabase } from "./supabase"

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

    console.log("Adding to wishlist:", { userId: user.id, productId })

    const { data, error } = await supabase.from("wishlist").insert([
      {
        user_id: user.id,
        product_id: productId,
      },
    ]).select()

    if (error) {
      console.error("Supabase error adding to wishlist:", error)
      return false
    }

    console.log("Successfully added to wishlist:", data)
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

    console.log("Removing from wishlist:", { userId: user.id, productId })

    const { data, error } = await supabase
      .from("wishlist")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .select()

    if (error) {
      console.error("Supabase error removing from wishlist:", error)
      return false
    }

    console.log("Successfully removed from wishlist:", data)
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
      .single()

    return !error && !!data
  } catch (error) {
    return false
  }
}

/**
 * Get user's wishlist
 */
export async function getWishlist() {
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
        product:products (
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

    return data || []
  } catch (error) {
    console.error("Error getting wishlist:", error)
    return []
  }
}
