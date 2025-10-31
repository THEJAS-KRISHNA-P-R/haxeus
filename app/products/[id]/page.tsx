"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/contexts/CartContext"
import { WishlistButton } from "@/components/WishlistButton"
import { Heart, ShoppingCart, Truck, Shield, RotateCcw } from "lucide-react"

interface Product {
  id: number
  name: string
  description: string
  price: number
  front_image: string
  back_image: string
  available_sizes?: string[]
  sizes?: string[]
}

const staticProducts: Product[] = [
  {
    id: 1,
    name: "BUSTED Vintage Tee",
    description:
      "Make a bold statement with our BUSTED vintage wash tee. Featuring distressed tie-dye effects and striking red typography, this piece embodies rebellious spirit. Crafted from premium cotton blend for ultimate comfort and durability. Perfect for those who dare to stand out from the crowd.",
    price: 2499.0,
    front_image: "/images/busted-front.jpg",
    back_image: "/images/busted-back.jpg",
    sizes: ["S", "M", "L", "XL", "XXL"],
    
  },
  {
    id: 2,
    name: "Save The Flower Tee",
    description:
      "Eco-conscious design featuring delicate hand and flower artwork with a meaningful environmental message. This cream-colored tee represents hope and sustainability. Made from 100% organic cotton with water-based inks. A perfect blend of style and social consciousness.",
    price: 2799.0,
    front_image: "/images/save-flower-front.jpg",
    back_image: "/images/save-flower-back.jpg",
    sizes: ["S", "M", "L", "XL", "XXL"],
    
  },
  {
    id: 3,
    name: "Statue Tee",
    description:
      "Clean, understated design perfect for everyday wear. This minimalist tee features subtle detailing and premium construction. Crafted with the finest cotton for exceptional softness and breathability. A wardrobe essential that pairs with everything.",
    price: 2299.0,
    front_image: "/images/statue-front.jpg",
    back_image: "/images/statue-back.jpg",
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    id: 4,
    name: "UFO Tee",
    description:
      "Modern geometric pattern with unique diagonal stripes and HEX branding. This design represents the intersection of street style and contemporary art. Premium tie-dye wash creates a unique texture. Each piece is individually crafted for a one-of-a-kind look.",
    price: 2999.0,
    front_image: "/images/ufo-front.jpg",
    back_image: "/images/ufo-back.jpg",
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    id: 5,
    name: "Renaissance Fusion Tee",
    description:
      "Artistic blend of classical sculpture and contemporary sunflower elements. This unique design merges art history with modern aesthetics. Features a detailed statue bust with vibrant sunflower crown. Premium quality print on soft cotton canvas.",
    price: 3199.0,
    front_image: "/images/soul-front.jpg",
    back_image: "/images/soul-back.jpg",
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
]

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { addItem } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [showBack, setShowBack] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    fetchProduct()
  }, [params.id])

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase.from("products").select("*").eq("id", params.id).single()

      if (error) {
        console.warn("Using static product data:", error.message)
        const staticProduct = staticProducts.find((p) => p.id === Number.parseInt(params.id as string))
        if (!staticProduct) {
          throw new Error("Product not found")
        }
        setProduct(staticProduct)
      } else {
        // Map Supabase data to match our interface
        setProduct({
          ...data,
          sizes: data.available_sizes || data.sizes || ["S", "M", "L", "XL", "XXL"]
        })
      }
    } catch (error) {
      console.warn("Error fetching product:", error)
      const staticProduct = staticProducts.find((p) => p.id === Number.parseInt(params.id as string))
      if (staticProduct) {
        setProduct(staticProduct)
      } else {
        router.push("/products")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (product) {
      const productSizes = product.sizes || product.available_sizes || []
      if (productSizes.length > 0) setSelectedSize(productSizes[0])
    }
  }, [product])

  const addToCart = async () => {
    if (!selectedSize) {
      toast({
        title: "Please select a size",
        description: "Select a size before adding to cart.",
        variant: "destructive",
      })
      return
    }

    setAddingToCart(true)
    try {
      await addItem(product!.id, selectedSize, quantity)
      
      toast({
        title: "Added to cart!",
        description: `${product!.name} has been added to your cart.`,
      })
    } catch (error: any) {
      console.error('Add to cart error:', error)
      toast({
        title: "Error",
        description: error.message || "Could not add to cart.",
        variant: "destructive",
      })
    } finally {
      setAddingToCart(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 dark:border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading product details...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Product not found</h1>
          <Button onClick={() => router.push("/products")} className="bg-red-600 hover:bg-red-700">
            Back to Products
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-6">
            <div className="aspect-square relative bg-gradient-to-br from-gray-100 via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl overflow-hidden shadow-2xl dark:shadow-red-900/20">
              <Image
                src={showBack ? product.back_image : product.front_image}
                alt={product.name}
                fill
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg?height=600&width=600&text=Product+Image"
                }}
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant={!showBack ? "default" : "outline"}
                onClick={() => setShowBack(false)}
                className={`flex-1 ${!showBack ? "bg-red-600 text-white hover:bg-red-700" : "dark:border-gray-600 dark:hover:bg-gray-800"}`}
              >
                Front View
              </Button>
              <Button
                variant={showBack ? "default" : "outline"}
                onClick={() => setShowBack(true)}
                className={`flex-1 ${showBack ? "bg-red-600 text-white hover:bg-red-700 hover:text-black" : "dark:border-gray-600 dark:hover:bg-gray-800"}`}
              >
                Back View
              </Button>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{product.name}</h1>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold text-red-600 dark:text-red-500">₹{product.price.toLocaleString("en-IN")}</span>
                
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">{product.description}</p>
            </div>

            {/* Size Selection */}
            <div>
              <Label className="text-lg font-semibold mb-4 block dark:text-white">Size</Label>
              <RadioGroup value={selectedSize} onValueChange={setSelectedSize} className="flex gap-3 flex-wrap">
                  {(product.sizes || product.available_sizes || []).map((size) => (
                  <div
                      key={size}
                    className={`border-2 cursor-pointer rounded-lg p-4 flex items-center justify-center min-w-[60px] font-semibold transition-all ${selectedSize === size ? "bg-red-600 text-white border-red-600" : "hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-600 dark:text-gray-300"}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {/* Remove the radio disc, just show the label */}
                    {size}
                  </div>
                  ))}
              </RadioGroup>
            </div>


            {/* Quantity */}
            <div>
              <Label htmlFor="quantity" className="text-lg font-semibold mb-4 block dark:text-white">
                Quantity
              </Label>
              <Select value={quantity.toString()} onValueChange={(value) => setQuantity(Number.parseInt(value))}>
                <SelectTrigger className="w-32 h-12 dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <SelectItem key={num} value={num.toString()} className="dark:text-gray-300 dark:hover:bg-gray-700">
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={addToCart}
                disabled={addingToCart}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white h-14 text-lg disabled:opacity-50"
                size="lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </Button>
              <WishlistButton 
                productId={product.id}
                size="lg"
                className="h-14 px-6 border-red-600 text-red-600 hover:bg-red-600 hover:text-white bg-transparent"
              />
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 text-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <Truck className="w-8 h-8 mx-auto mb-2 text-red-600 dark:text-red-500" />
                <div className="font-semibold dark:text-white">Free Shipping</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">On orders above ₹2000</div>
              </Card>
              <Card className="p-4 text-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <Shield className="w-8 h-8 mx-auto mb-2 text-red-600 dark:text-red-500" />
                <div className="font-semibold dark:text-white">Quality Guarantee</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Premium materials</div>
              </Card>
              <Card className="p-4 text-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <RotateCcw className="w-8 h-8 mx-auto mb-2 text-red-600 dark:text-red-500" />
                <div className="font-semibold dark:text-white">Easy Returns</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">30-day return policy</div>
              </Card>
            </div>

            {/* Product Features */}
            <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-lg mb-4 dark:text-white">Product Features</h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>• 100% premium cotton blend</li>
                <li>• Pre-shrunk for perfect fit</li>
                <li>• Machine washable (cold water recommended)</li>
                <li>• Unique HAXEUZ design</li>
                <li>• Comfortable regular fit</li>
                <li>• Durable construction for long-lasting wear</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
