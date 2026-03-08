// lib/indexnow.ts
// Import this server-side to instantly notify search engines of new/updated content.
//
// Usage (e.g. after creating a product in your admin API route):
//   import { notifySearchEngines, notifyProductUpdate } from '@/lib/indexnow'
//   await notifySearchEngines([`https://haxeus.in/products/${product.slug}`])

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://haxeus.in"
const INDEXNOW_KEY = process.env.INDEXNOW_KEY

const ENGINES = [
    "https://api.indexnow.org/indexnow",
    "https://www.bing.com/indexnow",
]

export async function notifySearchEngines(urls: string[]): Promise<void> {
    if (!INDEXNOW_KEY) return // Silently skip if not configured

    const payload = {
        host: SITE_URL.replace("https://", ""),
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: urls.slice(0, 10_000), // IndexNow max
    }

    // Fire-and-forget — don't block product saves on SEO ping
    void Promise.allSettled(
        ENGINES.map((engine) =>
            fetch(engine, {
                method: "POST",
                headers: { "Content-Type": "application/json; charset=utf-8" },
                body: JSON.stringify(payload),
            }).catch(() => { })
        )
    )
}

export async function notifyProductUpdate(slugOrId: string): Promise<void> {
    await notifySearchEngines([`${SITE_URL}/products/${slugOrId}`])
}
