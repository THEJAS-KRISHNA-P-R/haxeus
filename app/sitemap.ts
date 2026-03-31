import { MetadataRoute } from "next"
import { createServerClient } from "@supabase/ssr"
import { JOURNAL_POSTS } from "@/lib/journal"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.haxeus.in"

const STATIC_PAGES: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/journal`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/size-guide`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/shipping-policy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/privacy-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/returns-refunds`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms-conditions`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    let productPages: MetadataRoute.Sitemap = []

    try {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { cookies: { getAll: () => [] } }
        )

        const { data: products } = await supabase
            .from("products")
            .select("id, updated_at")
            .eq("is_active", true)
            .order("updated_at", { ascending: false })

        if (products?.length) {
            productPages = products.map((product) => ({
                url: `${SITE_URL}/products/${product.id}`,
                lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
                changeFrequency: "weekly" as const,
                priority: 0.8,
            }))
        }
    } catch (err) {
        console.error("[sitemap] Failed to fetch products:", err)
    }

    const journalPages: MetadataRoute.Sitemap = JOURNAL_POSTS.map((post) => ({
        url: `${SITE_URL}/journal/${post.slug}`,
        lastModified: new Date(post.publishedAt),
        changeFrequency: "monthly" as const,
        priority: 0.5,
    }))

    return [...STATIC_PAGES, ...productPages, ...journalPages]
}
