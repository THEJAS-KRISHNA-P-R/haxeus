import { Redis } from "ioredis"

// ── Type-safe no-op stub for when Redis is unavailable ──────────────
// Used when REDIS_URL is not set (e.g. local dev without Redis).
// All methods return safe empty values so callers don't crash.
// This is NOT a real Redis client — it silently no-ops every operation.

class RedisNoOpStub {
  // Read operations return null/empty — cache miss on every call
  async get(_key: string): Promise<null> { return null }
  async mget(..._keys: string[]): Promise<null[]> { return _keys.map(() => null) }
  async keys(_pattern: string): Promise<string[]> { return [] }
  async ttl(_key: string): Promise<number> { return -2 }
  async exists(..._keys: string[]): Promise<number> { return 0 }

  // Write operations succeed silently
  async set(_key: string, _value: unknown, ..._args: unknown[]): Promise<"OK"> { return "OK" }
  async del(..._keys: string[]): Promise<number> { return 0 }
  async incr(_key: string): Promise<number> { return 0 }
  async expire(_key: string, _seconds: number): Promise<number> { return 0 }
  async hset(_key: string, ..._args: unknown[]): Promise<number> { return 0 }
  async hget(_key: string, _field: string): Promise<null> { return null }
  async hgetall(_key: string): Promise<Record<string, string>> { return {} }

  // Pipeline/multi — return stub that resolves to empty
  pipeline() { return this }
  multi() { return this }
  async exec(): Promise<null> { return null }
}

// ── Redis client factory ─────────────────────────────────────────────

function createRedisClient(): Redis | RedisNoOpStub {
  const url = process.env.REDIS_URL

  if (!url) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[redis] REDIS_URL not set — using no-op stub. Caching disabled.")
    }
    return new RedisNoOpStub()
  }

  const client = new Redis(url, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
    lazyConnect: true,
  })

  client.on("error", (err) => {
    // Log connection errors but don't crash the app
    console.error("[redis] Connection error:", err.message)
  })

  return client
}

export const redis = createRedisClient()

// TTL constants
export const TTL = {
    ANALYTICS: 60 * 5,      //  5 minutes
    PRODUCTS: 60 * 10,      // 10 minutes
    PRODUCT: 60 * 5,        //  5 minutes
    SETTINGS: 60 * 60,      //  1 hour
    COUPON: 60 * 2,         //  2 minutes
    RATE_LIMIT: 60,         //  1 minute window
} as const

// ── Helper: cached fetch ─────────────────────────────────────────────
// Keeps existing cached() and invalidate() helpers working unchanged.

export async function cached<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  try {
    const hit = await redis.get(key)
    if (hit) return JSON.parse(hit as string) as T
  } catch {
    // Cache read failed — fall through to fetcher
  }

  const data = await fetcher()

  try {
    await redis.set(key, JSON.stringify(data), "EX", ttlSeconds)
  } catch {
    // Cache write failed — data still returned to caller
  }

  return data
}

export async function invalidate(...keys: string[]): Promise<void> {
  if (keys.length === 0) return
  try {
    await redis.del(...keys)
  } catch {
    // Invalidation failed — cache expires naturally via TTL
  }
}

export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
  { failClosed = false }: { failClosed?: boolean } = {}
): Promise<{ limited: boolean; remaining: number; reset: number }> {
  try {
    const current = await redis.incr(key)
    if (current === 1) {
      await redis.expire(key, windowSeconds)
    }
    const reset = Math.floor(Date.now() / 1000) + windowSeconds
    return { 
      limited: current > limit, 
      remaining: Math.max(0, limit - current),
      reset 
    }
  } catch {
    // Rate limiter unavailable — fail closed on sensitive endpoints, open otherwise
    return { 
      limited: failClosed, 
      remaining: failClosed ? 0 : limit, 
      reset: 0 
    }
  }
}
