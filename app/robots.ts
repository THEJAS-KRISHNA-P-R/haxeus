import { MetadataRoute } from "next"

const SITE_URL = "https://haxeus.com"

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: ["/", "/products", "/products/", "/about", "/contact", "/size-guide",
                    "/privacy-policy", "/returns-refunds", "/terms-conditions"],
                disallow: ["/admin", "/admin/", "/api/", "/profile", "/profile/",
                    "/cart", "/checkout", "/order-success", "/auth"],
            },
            {
                // Block AI training scrapers
                userAgent: ["GPTBot", "ChatGPT-User", "CCBot", "anthropic-ai", "Claude-Web", "Omgilibot"],
                disallow: ["/"],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    }
}
