import type { Metadata } from "next"
import ProductsPageClient from "./ProductsPageClient"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://haxeus.in"

type SearchParamsInput = Promise<Record<string, string | string[] | undefined>>

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParamsInput
}): Promise<Metadata> {
  const resolvedSearchParams = await searchParams
  const search = typeof resolvedSearchParams.search === "string"
    ? resolvedSearchParams.search.trim()
    : ""
  const sort = typeof resolvedSearchParams.sort === "string" ? resolvedSearchParams.sort : ""
  const price = typeof resolvedSearchParams.price === "string" ? resolvedSearchParams.price : ""
  const hasSearchIntent = search.length > 0
  const hasFilterParams = sort.length > 0 || price.length > 0
  const shouldNoIndex = hasSearchIntent || hasFilterParams

  return {
    title: hasSearchIntent ? `Search results for ${search}` : "Shop Streetwear T-Shirts & Hoodies",
    description: hasSearchIntent
      ? `Browse HAXEUS results for ${search}. Explore oversized streetwear, graphic tees, and premium drops.`
      : "Shop HAXEUS products: oversized streetwear, graphic tees, and premium limited drops.",
    alternates: {
      canonical: `${SITE_URL}/products`,
    },
    robots: shouldNoIndex
      ? {
          index: false,
          follow: true,
          googleBot: {
            index: false,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
    openGraph: {
      type: "website",
      url: `${SITE_URL}/products`,
      title: hasSearchIntent ? `Search results for ${search} | HAXEUS` : "Products | HAXEUS",
      description: hasSearchIntent
        ? `Browse HAXEUS results for ${search}.`
        : "Explore premium HAXEUS streetwear products and limited drops.",
    },
    twitter: {
      card: "summary_large_image",
      title: hasSearchIntent ? `Search results for ${search} | HAXEUS` : "Products | HAXEUS",
      description: shouldNoIndex
        ? `Browse HAXEUS results for ${search}.`
        : "Explore premium HAXEUS streetwear products and limited drops.",
    },
  }
}

export default function ProductsPage() {
  return <ProductsPageClient />
}

