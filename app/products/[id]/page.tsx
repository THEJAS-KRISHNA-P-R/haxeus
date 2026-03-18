import { notFound } from "next/navigation"
import dynamic from "next/dynamic"
import { fetchProductById } from "@/lib/fetch-product"
import { ProductPageClient } from "./ProductPageClient"
import { TrackProductView } from "@/components/TrackProductView"

// Dynamic imports for heavy components below the fold
const RelatedProducts = dynamic(
  () => import("@/components/RelatedProducts").then(m => ({ default: m.RelatedProducts })),
  { ssr: false }
)

const RecentlyViewed = dynamic(
  () => import("@/components/RecentlyViewed").then(m => ({ default: m.RecentlyViewed })),
  { ssr: false }
)

interface PageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: PageProps) {
  const product = await fetchProductById(Number(params.id))
  if (!product) return { title: "Product Not Found — HAXEUS" }

  return {
    title: `${product.name} — HAXEUS`,
    description: product.description || `Premium streetwear by HAXEUS. ${product.name}`,
    openGraph: {
      images: product.front_image ? [product.front_image] : [],
    }
  }
}

export default async function ProductPage({ params }: PageProps) {
  const productId = Number(params.id)
  const product = await fetchProductById(productId)

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-theme transition-colors duration-300">
      <ProductPageClient 
        product={product} 
        inventory={product.product_inventory || []} 
        images={product.product_images || []} 
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <TrackProductView product={product as any} />
        
        {/* Horizontal scroll sections */}
        <RelatedProducts
          productId={product.id}
          category={product.category}
        />
        
        <RecentlyViewed currentProductId={product.id} />
      </div>
    </div>
  )
}
