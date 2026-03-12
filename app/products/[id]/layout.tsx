import { createServerClient } from "@supabase/ssr"
import type { Metadata } from "next"
import { BreadcrumbJsonLd, ProductJsonLd } from "@/components/JsonLd"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://haxeus.in"

type ParamsInput = Promise<{ id: string }>

interface ProductSeoRecord {
  id: number
  name: string
  description: string
  price: number
  front_image?: string | null
  available_sizes?: string[] | null
  product_images?: Array<{
    image_url: string
    is_primary: boolean
    display_order: number
  }>
}

function createSupabaseServerClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [] } }
  )
}

function truncateDescription(description: string) {
  if (description.length <= 155) {
    return description
  }

  return `${description.slice(0, 152).trimEnd()}...`
}

async function getProductSeoRecord(id: string): Promise<ProductSeoRecord | null> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      description,
      price,
      front_image,
      available_sizes,
      product_images (
        image_url,
        is_primary,
        display_order
      )
    `)
    .eq("id", id)
    .single()

  if (error || !data) {
    return null
  }

  return data as ProductSeoRecord
}

async function getRatingSummary(productId: number) {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from("product_reviews")
    .select("rating")
    .eq("product_id", productId)
    .eq("is_approved", true)

  if (error || !data || data.length === 0) {
    return null
  }

  const totalReviews = data.length
  const averageRating = data.reduce((sum, review) => sum + review.rating, 0) / totalReviews

  return {
    totalReviews,
    averageRating: Math.round(averageRating * 10) / 10,
  }
}

export async function generateMetadata({ params }: { params: ParamsInput }): Promise<Metadata> {
  const { id } = await params
  const product = await getProductSeoRecord(id)

  if (!product) {
    return {
      title: "Product not found",
      alternates: {
        canonical: `${SITE_URL}/products`,
      },
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const canonicalUrl = `${SITE_URL}/products/${product.id}`
  const primaryImage = product.product_images?.find((img) => img.is_primary)?.image_url
    || product.product_images?.[0]?.image_url
    || product.front_image
    || "/placeholder.svg"
  const description = truncateDescription(product.description)

  return {
    title: product.name,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      title: `${product.name} | HAXEUS`,
      description,
      images: [
        {
          url: primaryImage,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | HAXEUS`,
      description,
      images: [primaryImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  }
}

export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: ParamsInput
}) {
  const { id } = await params
  const product = await getProductSeoRecord(id)

  if (!product) {
    return children
  }

  const primaryImage = product.product_images?.find((img) => img.is_primary)?.image_url
    || product.product_images?.[0]?.image_url
    || product.front_image
    || "/placeholder.svg"
  const ratingSummary = await getRatingSummary(product.id)

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Products", url: `${SITE_URL}/products` },
          { name: product.name, url: `${SITE_URL}/products/${product.id}` },
        ]}
      />
      <ProductJsonLd
        name={product.name}
        description={product.description}
        image={primaryImage}
        price={product.price}
        slug={String(product.id)}
        inStock={(product.available_sizes?.length ?? 0) > 0}
        aggregateRating={ratingSummary?.averageRating}
        reviewCount={ratingSummary?.totalReviews}
      />
      {children}
    </>
  )
}