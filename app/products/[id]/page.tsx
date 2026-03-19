import { notFound } from "next/navigation"
import dynamic from "next/dynamic"
import { fetchProductById } from "@/lib/fetch-product"
import { ProductPageClient } from "./ProductPageClient"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const product = await fetchProductById(Number(id))
  if (!product) {
    console.warn(`[generateMetadata] Product ${id} not found`)
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
  const product = await fetchProductById(productId)

  if (!product) {
    console.error(`[ProductPage] Product ${id} not found in DB`)
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
