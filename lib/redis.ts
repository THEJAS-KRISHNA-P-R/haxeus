import { Redis } from "@upstash/redis"

// Singleton — reused across requests
export const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// TTL constants
export const TTL = {
    ANALYTICS: 60 * 5,      //  5 minutes
    PRODUCTS: 60 * 10,      // 10 minutes
    PRODUCT: 60 * 5,        //  5 minutes
    SETTINGS: 60 * 60,      //  1 hour
    COUPON: 60 * 2,         //  2 minutes
    RATE_LIMIT: 60,         //  1 minute window
} as const

// Generic get-or-set with automatic JSON serialization
export async function cached<T>(
    key: string,
    ttl: number,
    fetcher: () => Promise<T>
): Promise<T> {
    try {
        const hit = await redis.get<T>(key)
        if (hit !== null) return hit
    } catch {
        // Redis down — fall through to DB
    }
    const fresh = await fetcher()
    try {
        await redis.set(key, fresh, { ex: ttl })
    } catch {
        // Redis down — serve fresh data without caching
    }
    return fresh
}

// Invalidate a key or pattern
export async function invalidate(...keys: string[]) {
    if (keys.length === 0) return
    try {
        await redis.del(...keys)
    } catch { }
}

/**
 * Sliding window rate limiter using Redis INCR + EXPIRE.
 * Returns { limited: true } if the caller has exceeded `limit` requests
 * in the last `windowSecs` seconds.
 *
 * Fails open by default. Set `failClosed: true` on security-sensitive
 * endpoints (payment, auth) so requests are blocked when Redis is unavailable.
 */
export async function rateLimit(
    key: string,
    limit: number,
    windowSecs: number,
    { failClosed = false }: { failClosed?: boolean } = {}
): Promise<{ limited: boolean; remaining: number; reset: number }> {
    try {
        const redisKey = `rl:${key}`
        const count = await redis.incr(redisKey)

        // Set expiry only on first increment
        if (count === 1) {
            await redis.expire(redisKey, windowSecs)
        }

        const remaining = Math.max(0, limit - count)
        const reset = Math.floor(Date.now() / 1000) + windowSecs

        return {
            limited: count > limit,
            remaining,
            reset,
        }
    } catch {
        // Redis down — fail closed on sensitive endpoints, open otherwise
        return { limited: failClosed, remaining: failClosed ? 0 : limit, reset: 0 }
    }
}
