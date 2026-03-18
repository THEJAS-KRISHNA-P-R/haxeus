import { createServerClient } from "@supabase/ssr"

/**
 * Service role client for server-side admin operations.
 * Bypasses RLS. NEVER expose to client. NEVER use for auth checks.
 *
 * Use verifyAdminRequest() from lib/admin-auth.ts to verify the caller
 * is an admin BEFORE using this client for any operation.
 */
export function getSupabaseAdmin() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )
}
