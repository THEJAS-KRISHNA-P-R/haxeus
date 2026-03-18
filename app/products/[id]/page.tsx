import { notFound } from "next/navigation"
import dynamic from "next/dynamic"
import { fetchProductById } from "@/lib/fetch-product"
import { ProductPageClient } from "./ProductPageClient"

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
    </div>
  )
}
