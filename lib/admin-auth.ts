import { createServerClient } from "@supabase/ssr"
import { SupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { redis } from "@/lib/redis"
import crypto from "crypto"
import { cache } from "react"

// TTL for the admin role cache in seconds.
const ADMIN_CACHE_TTL = 300  // 5 minutes
const CACHE_PREFIX = "admin:role:"

function makeCacheKey(userId: string): string {
  const secret = process.env.ADMIN_CACHE_SECRET
  if (!secret) throw new Error("ADMIN_CACHE_SECRET is not set")
  const hmac = crypto.createHmac("sha256", secret).update(userId).digest("hex")
  return `${CACHE_PREFIX}${hmac}`
}

export interface AdminAuthResult {
  authorized: boolean
  userId: string | null
  error: string | null
  status: number
}

/**
 * Core authentication logic that works in both Middleware and API/Server Components.
 */
export async function verifyUserAdmin(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const secret = process.env.ADMIN_CACHE_SECRET;
  const hasRedis = !!process.env.REDIS_URL && !!secret;

  if (hasRedis) {
    try {
      const cacheKey = makeCacheKey(userId)
      const cached = await redis.get(cacheKey)
      if (cached === "1") return true
      if (cached === "0") return false
    } catch (err: unknown) {
      console.error("[admin-auth] Redis error:", err instanceof Error ? err.message : "Unknown error")
    }
  }

  // Fallback to DB
  const { data: roleData, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle()

  const isAdmin = !roleError && roleData !== null

  // Update cache if possible
  if (hasRedis) {
    try {
      const cacheKey = makeCacheKey(userId)
      // ioredis uses positional arguments for EX
      await (redis as { set(k: string, v: string, m: string, t: number): Promise<unknown> }).set(cacheKey, isAdmin ? "1" : "0", "EX", ADMIN_CACHE_TTL)
    } catch (err: unknown) {
      console.error("[admin-auth] Redis write error:", err instanceof Error ? err.message : "Unknown error")
    }
  }

  return isAdmin
}

/**
 * Internal verification logic for API Routes and Server Components.
 */
async function verifyAdminRequestInternal(): Promise<AdminAuthResult> {
  const cookieStore = await cookies()

  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()

  if (authError || !user) {
    return { authorized: false, userId: null, error: "Unauthorized", status: 401 }
  }

  const isAdmin = await verifyUserAdmin(supabaseAuth, user.id)

  if (!isAdmin) {
    return { authorized: false, userId: null, error: "Forbidden", status: 403 }
  }

  return { authorized: true, userId: user.id, error: null, status: 200 }
}

/**
 * High-level verification for API Routes and Server Components.
 * Wrapped in React cache() to deduplicate hits across a single request lifecycle.
 */
export const verifyAdminRequest = cache(verifyAdminRequestInternal)

/**
 * Immediately evicts the admin role cache for a specific user.
 */
export async function evictAdminCache(userId: string): Promise<void> {
  try {
    const cacheKey = makeCacheKey(userId)
    await redis.del(cacheKey)
  } catch (err: unknown) {
    console.error(`[admin-auth] Failed to evict cache for user ${userId}`, err instanceof Error ? err.message : "Unknown error")
  }
}
