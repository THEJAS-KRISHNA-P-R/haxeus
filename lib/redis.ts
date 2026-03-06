import { Redis } from "@upstash/redis"

// Singleton — reused across requests
export const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// TTL constants
export const TTL = {
    ANALYTICS: 60 * 5,      //  5 minutes
    PRODUCTS: 60 * 10,     // 10 minutes
    PRODUCT: 60 * 5,      //  5 minutes
    SETTINGS: 60 * 60,     //  1 hour
    COUPON: 60 * 2,      //  2 minutes
    RATE_LIMIT: 60,          //  1 minute window
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
