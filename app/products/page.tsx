"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { Heart, ShoppingCart } from "lucide-react"

interface Product {
  id: number
  name: string
  description: string
  price: number
  front_image: string
  back_image: string
  sizes: string[]
  
}

const staticProducts: Product[] = [
  {
    id: 1,
    name: "BUSTED Vintage Tee",
    description:
      "Make a bold statement with our BUSTED vintage wash tee. Featuring distressed tie-dye effects and striking red typography, this piece embodies rebellious spirit.",
    price: 2499.0,
    front_image: "/images/busted-front.jpg",
    back_image: "/images/busted-front.jpg",
    sizes: ["S", "M", "L", "XL", "XXL"],
 
  },
  {
    id: 2,
    name: "Save The Flower Tee",
    description:
      "Eco-conscious design featuring delicate hand and flower artwork with a meaningful environmental message. Made from 100% organic cotton.",
    price: 2799.0,
    front_image: "/images/save-flower-front.jpg",
    back_image: "/images/save-flower-back.jpg",
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    id: 3,
    name: "Statue Tee",
    description:
      "Clean, understated design perfect for everyday wear. Crafted with the finest cotton for exceptional softness and breathability.",
    price: 2299.0,
    front_image: "/images/statue-front.jpg",
    back_image: "/images/statue-back.jpg",
    sizes: ["S", "M", "L", "XL", "XXL"],
    
  },
  {
    id: 4,
    name: "HEX Geometric Tee",
    description:
      "Modern geometric pattern with unique diagonal stripes and HEX branding. Premium tie-dye wash creates a unique texture.",
    price: 2999.0,
    front_image: "/images/ufo-front.jpg",
    back_image: "/images/ufo-back.jpg",
    sizes: ["S", "M", "L", "XL", "XXL"],
   
  },
  {
    id: 5,
    name: "Renaissance Fusion Tee",
    description:
      "Artistic blend of classical sculpture and contemporary sunflower elements. Features a detailed statue bust with vibrant sunflower crown.",
    price: 3199.0,
    front_image: "/images/soul-front.jpg",
    back_image: "/images/soul-back.jpg",
    sizes: ["S", "M", "L", "XL", "XXL"],
    
  },
]

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from("products").select("*").order("id")

      if (error) {
        console.warn("Using static products:", error.message)
        setProducts(staticProducts)
      } else {
        setProducts(data && data.length > 0 ? data : staticProducts)
      }
    } catch (error) {
      console.warn("Error fetching products, using static data:", error)
      setProducts(staticProducts)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading our collection...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Featured <span className="text-red-600">Collection</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our most popular premium T-shirts, carefully crafted for ultimate comfort and style.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <Card
              key={product.id}
              className="group overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-300 border-0"
            >
              {/* Product Image */}
              <Link href={`/products/${product.id}`}>
                <div className="aspect-square relative bg-black rounded-t-lg overflow-hidden cursor-pointer">
                  <Image
                    src={product.front_image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg?height=400&width=400&text=Product+Image"
                    }}
                  />

                  {/* Overlay with quick actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-3">
                      <Button size="sm" className="bg-white text-black hover:bg-gray-100">
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button size="sm" className="bg-red-600 hover:bg-red-700">
                        <ShoppingCart className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                 
                </div>
              </Link>

              {/* Product Details */}
              <CardContent className="p-6">
                <Link href={`/products/${product.id}`}>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-red-600 transition-colors cursor-pointer line-clamp-1">
                    {product.name}
                  </h3>
                </Link>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">{product.description}</p>

                {/* Size Options */}
                <div className="flex gap-1 mb-4">
                  {product.sizes.slice(0, 5).map((size) => (
                    <Badge key={size} variant="outline" className="text-xs px-2 py-1">
                      {size}
                    </Badge>
                  ))}
                </div>

                {/* Price and Action */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">₹{product.price.toLocaleString("en-IN")}</span>
                    <div className="text-xs text-gray-500">Free shipping</div>
                  </div>
                  <Link href={`/products/${product.id}`}>
                    <Button className="bg-red-600 hover:bg-red-700 text-white px-6">View Details</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-6">Can't find what you're looking for?</p>
          <Button
            variant="outline"
            size="lg"
            className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white bg-transparent"
          >
            Contact Us for Custom Designs
          </Button>
        </div>
      </div>
    </div>
  )
}
