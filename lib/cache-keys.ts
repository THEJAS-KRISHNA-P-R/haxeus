// Centralized cache key registry — prevents typos and makes invalidation easy
export const CK = {
    analytics: (days: number) => `analytics:${days}d`,
    products: () => `products:all`,
    product: (id: number) => `product:${id}`,
    settings: () => `settings:store`,
    coupon: (code: string) => `coupon:${code.toUpperCase()}`,
    rateLimitCoupon: (ip: string) => `rl:coupon:${ip}`,
    rateLimitAuth: (ip: string) => `rl:auth:${ip}`,
}

// Re-export TTL from redis for convenient single-import in API routes
export { TTL } from "@/lib/redis"
