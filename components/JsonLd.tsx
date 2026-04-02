const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://haxeus.in"

function safeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026")
}

function absoluteUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url
  }

  return `${SITE_URL}${url.startsWith("/") ? url : `/${url}`}`
}

export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "HAXEUS",
    alternateName: ["haxeus", "haxeus.in", "Haxeus", "HAXEUS India"],
    url: SITE_URL,
    logo: `${SITE_URL}/android-chrome-192x192.png`,
    description:
      "HAXEUS - Premium artistic streetwear for those who move differently. Oversized fits, dark aesthetics, limited drops. Shop hoodies, tees, and premium apparel.",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "support@haxeus.in",
      availableLanguage: ["English", "Malayalam"],
    },
    sameAs: ["https://instagram.com/haxeus", "https://twitter.com/haxeus"],
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }} />
}

export function WebsiteJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "HAXEUS",
    alternateName: ["haxeus", "haxeus.in", "HAXEUS - Premium Streetwear"],
    url: SITE_URL,
    description: "HAXEUS - Premium artistic streetwear for those who move differently. Shop hoodies, tees, and premium apparel.",
    publisher: { "@type": "Organization", name: "HAXEUS", url: SITE_URL },
    inLanguage: "en-IN",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/products?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }} />
}

interface ProductJsonLdProps {
  name: string
  description: string
  image: string | string[]
  price: number
  currency?: string
  slug: string
  inStock: boolean
  brand?: string
  aggregateRating?: number
  reviewCount?: number
}

export function ProductJsonLd({
  name,
  description,
  image,
  price,
  currency = "INR",
  slug,
  inStock,
  brand = "HAXEUS",
  aggregateRating,
  reviewCount,
}: ProductJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: (Array.isArray(image) ? image : [image]).map(absoluteUrl),
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
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: price >= 999 ? 0 : 60,
          currency: "INR",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "IN",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 2,
            unitCode: "d",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 3,
            maxValue: 7,
            unitCode: "d",
          },
        },
      },
    },
    ...(aggregateRating && reviewCount
      ? {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: aggregateRating.toFixed(1),
          reviewCount,
        },
      }
      : {}),
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }} />
}

interface BreadcrumbItem {
  name: string
  url: string
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }} />
}

interface FAQItem {
  question: string
  answer: string
}

const PRODUCT_FAQ_ITEMS: FAQItem[] = [
  {
    question: "What sizes does this product come in?",
    answer: "Most HAXEUS products follow an XS to XXL size range. We recommend checking the size guide on each product page for exact chest, length, and shoulder measurements.",
  },
  {
    question: "How long does shipping take?",
    answer: "We ship within 48 hours. Domestic delivery typically takes 7-10 days across India. International shipping is available with additional charges.",
  },
  {
    question: "What is your replacement policy?",
    answer: "HAXEUS does not offer returns or refunds. Eligible damaged, defective, or incorrect items can be replaced within 10 days of delivery after a quick eligibility review.",
  },
  {
    question: "What material is this made from?",
    answer: "Our products are made from premium 240gsm bio-washed cotton for durability, breathability, and a premium feel against your skin.",
  },
]

export function ProductFAQJsonLd() {
  return <FAQJsonLd items={PRODUCT_FAQ_ITEMS} />
}

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

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }} />
}
