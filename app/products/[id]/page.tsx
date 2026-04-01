import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { fetchProductById } from "@/lib/fetch-product"
import { fetchRelatedProducts } from "@/lib/fetch-related"
import { createClient } from "@/lib/supabase-server"
import { getProductReviews, summarizeReviews } from "@/lib/product-reviews"
import { ProductPageClient } from "./ProductPageClient"
import { ProductJsonLd, ProductFAQJsonLd } from "@/components/JsonLd"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://haxeus.in"

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
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 1200, alt: `${product.name} - HAXEUS streetwear` }] : [],
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
  const product = await fetchProductById(productId)

  if (!product) {
    notFound()
  }

  const [relatedProducts, reviews, supabase] = await Promise.all([
    fetchRelatedProducts(productId, product.category || "Streetwear"),
    getProductReviews(productId),
    createClient(),
  ])

  const reviewSummary = summarizeReviews(reviews)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-theme transition-colors duration-300">
      <ProductJsonLd
        name={product.name}
        description={product.description || ""}
        image={product.front_image || ""}
        price={product.price}
        slug={id}
        inStock={(product.total_stock ?? 0) > 0}
        aggregateRating={reviewSummary?.averageRating || 5}
        reviewCount={reviewSummary?.totalReviews || 0}
      />
      <ProductFAQJsonLd />
      
      <ProductPageClient
        product={product}
        inventory={product.product_inventory || []}
        images={product.product_images || []}
        relatedProducts={relatedProducts}
        initialReviews={reviews}
        reviewSummary={reviewSummary}
        isAuthenticated={Boolean(user)}
      />
    </div>
  )
}
