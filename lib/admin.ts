import { createServerClient } from "@supabase/ssr"

export interface UserRole {
  id: string
  user_id: string
  role: "admin" | "customer"
  created_at: string
  updated_at: string
}

/**
 * Create a Supabase admin client using the service role key.
 * This bypasses RLS and can read user_roles safely.
 */
function getServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => { } } }
  )
}

/**
 * Server-side check: is the given userId an admin?
 * Uses service role client to bypass RLS on user_roles.
 */
export async function requireAdmin(userId: string): Promise<boolean> {
  try {
    const supabaseAdmin = getServiceClient()
    const { data, error } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single()

    if (error || !data) return false
    return data.role === "admin"
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

/**
 * Get admin user's email from profiles table using service role.
 */
export async function getAdminEmail(userId: string): Promise<string | null> {
  try {
    const supabaseAdmin = getServiceClient()
    const { data } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("id", userId)
      .single()

    return data?.email ?? null
  } catch {
    return null
  }
}

/**
 * Get user role using service role client (server-side only).
 */
export async function getUserRole(userId: string): Promise<string | null> {
  try {
    const supabaseAdmin = getServiceClient()
    const { data, error } = await supabaseAdmin
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
