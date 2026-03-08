// components/JsonLd.tsx
// Server components — render JSON-LD structured data for rich Google results.
// Usage:
//   Root layout: <OrganizationJsonLd /> <WebsiteJsonLd />
//   Product page: <ProductJsonLd name={...} price={...} ... />
//   Category/product pages: <BreadcrumbJsonLd items={[...]} />
//   Size guide / FAQ pages: <FAQJsonLd items={[...]} />

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://haxeus.in"

// ── Organization — add to root layout once ────────────────────────────────────
export function OrganizationJsonLd() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "HAXEUS",
        url: SITE_URL,
        logo: `${SITE_URL}/android-chrome-192x192.png`,
        description:
            "HAXEUS — Luxury streetwear for those who move differently. Oversized fits, dark aesthetics, limited drops.",
        contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer support",
            email: "haxeus.in@gmail.com",
            availableLanguage: ["English", "Malayalam"],
        },
        sameAs: [
            "https://instagram.com/haxeus",
            "https://twitter.com/haxeus",
        ],
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    )
}

// ── Website with SearchAction — add to root layout once ───────────────────────
export function WebsiteJsonLd() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "HAXEUS",
        url: SITE_URL,
        potentialAction: {
            "@type": "SearchAction",
            target: {
                "@type": "EntryPoint",
                urlTemplate: `${SITE_URL}/products?search={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
        },
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    )
}

// ── Product — use on individual product pages ─────────────────────────────────
interface ProductJsonLdProps {
    name: string
    description: string
    image: string | string[]
    price: number
    currency?: string
    slug: string
    inStock: boolean
    brand?: string
}

export function ProductJsonLd({
    name, description, image, price, currency = "INR", slug, inStock, brand = "HAXEUS",
}: ProductJsonLdProps) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Product",
        name,
        description,
        image: Array.isArray(image) ? image : [image],
        url: `${SITE_URL}/products/${slug}`,
        brand: { "@type": "Brand", name: brand },
        offers: {
            "@type": "Offer",
            url: `${SITE_URL}/products/${slug}`,
            priceCurrency: currency,
            price: price.toFixed(2),
            priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            seller: { "@type": "Organization", name: "HAXEUS", url: SITE_URL },
        },
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    )
}

// ── Breadcrumb — use on product and category pages ────────────────────────────
interface BreadcrumbItem { name: string; url: string }

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.name,
            item: item.url,
        })),
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    )
}

// ── FAQ — use on size guide, returns, and other FAQ-like pages ────────────────
interface FAQItem { question: string; answer: string }

export function FAQJsonLd({ items }: { items: FAQItem[] }) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    )
}
