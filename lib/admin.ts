import { supabase } from "./supabase"

export interface UserRole {
  id: string
  user_id: string
  role: "admin" | "customer"
  created_at: string
  updated_at: string
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return false

    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single()

    if (error || !data) return false

    return data.role === "admin"
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

/**
 * Get user role
 */
export async function getUserRole(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single()

    if (error || !data) return null

    return data.role
  } catch (error) {
    console.error("Error getting user role:", error)
    return null
  }
}

/**
 * Make a user an admin (only callable by existing admins)
 */
export async function makeAdmin(userId: string): Promise<boolean> {
  try {
    // Check if current user is admin
    const currentUserIsAdmin = await isAdmin()
    if (!currentUserIsAdmin) {
      console.error("Only admins can make other users admins")
      return false
    }

    const { error } = await supabase.from("user_roles").upsert({
      user_id: userId,
      role: "admin",
      updated_at: new Date().toISOString(),
    })

    return !error
  } catch (error) {
    console.error("Error making user admin:", error)
    return false
  }
}
