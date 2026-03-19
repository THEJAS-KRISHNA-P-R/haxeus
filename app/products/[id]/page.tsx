import { notFound } from "next/navigation"
import { fetchProductById } from "@/lib/fetch-product"
import { fetchRelatedProducts } from "@/lib/fetch-related"
import { ProductPageClient } from "./ProductPageClient"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const product = await fetchProductById(Number(id))
  if (!product) {
    return { title: "Product Not Found — HAXEUS" }
  }

  return {
    title: `${product.name} — HAXEUS`,
    description: product.description || `Premium streetwear by HAXEUS. ${product.name}`,
    openGraph: {
      images: product.front_image ? [product.front_image] : [],
    }
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

  return (
    <div className="min-h-screen bg-theme transition-colors duration-300">
      <ProductPageClient 
        product={product} 
        inventory={product.product_inventory || []} 
        images={product.product_images || []} 
        relatedProducts={relatedProducts}
      />
    </div>
  )
}
