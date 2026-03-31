import { notFound } from "next/navigation"
import { fetchProductById } from "@/lib/fetch-product"
import { fetchRelatedProducts } from "@/lib/fetch-related"
import { ProductPageClient } from "./ProductPageClient"
import type { Metadata } from "next"

const SITE_URL = "https://www.haxeus.in"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const product = await fetchProductById(Number(id))
  if (!product) {
    return { title: "Product Not Found", robots: { index: false, follow: false } }
  }

  const description = product.description
    ? product.description.slice(0, 160)
    : `Premium streetwear by HAXEUS. ${product.name}`

  const imageUrl = product.front_image || undefined

  return {
    title: product.name,
    description,
    alternates: { canonical: `${SITE_URL}/products/${id}` },
    openGraph: {
      type: "website",
      url: `${SITE_URL}/products/${id}`,
      title: `${product.name} | HAXEUS`,
      description,
      images: imageUrl
        ? [{ url: imageUrl, width: 1200, height: 1200, alt: `${product.name} — HAXEUS streetwear` }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | HAXEUS`,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params
  const productId = Number(id)

  // Fetch product and related products in parallel to eliminate waterfall
  const productPromise = fetchProductById(productId)
  const [product] = await Promise.all([productPromise])

  if (!product) {
    notFound()
  }

  // Fetch related products after we have the category
  const relatedProducts = await fetchRelatedProducts(productId, product.category || 'Streetwear')

  // Build JSON-LD structured data
  const inventory = product.product_inventory || []
  const totalStock = inventory.reduce((sum: number, inv: { stock_quantity?: number }) => sum + (inv.stock_quantity ?? 0), 0)
  const availability = totalStock > 0
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock"

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || "",
    image: product.front_image || undefined,
    brand: { "@type": "Brand", name: "HAXEUS" },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price,
      availability,
      url: `${SITE_URL}/products/${id}`,
      seller: { "@type": "Organization", name: "HAXEUS" },
    },
  }

  return (
    <div className="min-h-screen bg-theme transition-colors duration-300">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductPageClient
        product={product}
        inventory={product.product_inventory || []}
        images={product.product_images || []}
        relatedProducts={relatedProducts}
      />
    </div>
  )
}
