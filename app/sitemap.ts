import { MetadataRoute } from "next"
import { createServerClient } from "@supabase/ssr"

const SITE_URL = "https://haxeus.com"

const STATIC_PAGES: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/size-guide`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
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
            .select("id, slug, updated_at")
            .eq("is_published", true)
            .order("updated_at", { ascending: false })

        if (products?.length) {
            productPages = products.map((product) => ({
                url: `${SITE_URL}/products/${product.slug ?? product.id}`,
                lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
                changeFrequency: "weekly" as const,
                priority: 0.8,
            }))
        }
    } catch (err) {
        console.error("[sitemap] Failed to fetch products:", err)
    }

    return [...STATIC_PAGES, ...productPages]
}
