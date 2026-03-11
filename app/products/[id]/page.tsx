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
import { supabase, ProductInventory } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/contexts/CartContext"
import { useTheme } from "@/components/ThemeProvider"
import { WishlistButton } from "@/components/WishlistButton"
import { Heart, ShoppingCart, Truck, Shield, RotateCcw, Star, Zap } from "lucide-react"
import { getProductInventory, checkStockAvailability } from "@/lib/inventory"
import { getProductReviews, getProductRatingsSummary } from "@/lib/reviews"

interface Product {
  id: number
  name: string
  description: string
  price: number
  front_image?: string
  back_image?: string
  available_sizes?: string[]
  sizes?: string[]
}

interface ProductImage {
  id: string
  product_id: number
  image_url: string
  display_order: number
  is_primary: boolean
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { addItem } = useCart()

  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const isDark = mounted ? theme === "dark" : true

  const [product, setProduct] = useState<Product | null>(null)
  const [productImages, setProductImages] = useState<ProductImage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [addingToCart, setAddingToCart] = useState(false)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [inventory, setInventory] = useState<ProductInventory[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [ratingSummary, setRatingSummary] = useState<any>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    fetchProduct()
    fetchProductImages()
    fetchInventory()
    fetchReviews()
  }, [params.id])

  const fetchProduct = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from("products").select("*").eq("id", params.id).single()

      if (error) {
        console.error("Error fetching product:", error)
        return
      }

      if (data) {
        setProduct({
          ...data,
          sizes: data.available_sizes || data.sizes || ["S", "M", "L", "XL"]
        })
      }
    } catch (error) {
      console.error("Error fetching product:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProductImages = async () => {
    try {
      const { data, error } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", params.id)
        .order("display_order")

      if (!error && data && data.length > 0) {
        setProductImages(data)
      }
      // If no gallery images, the product page will fall back to front_image from product
    } catch (error) {
      console.warn("Could not fetch product images:", error)
    }
  }

  const fetchInventory = async () => {
    try {
      const inventoryData = await getProductInventory(Number(params.id))
      setInventory(inventoryData)
    } catch (error) {
      console.warn("Could not fetch inventory:", error)
    }
  }

  const fetchReviews = async () => {
    try {
      const { reviews: reviewsData } = await getProductReviews(Number(params.id), {
        limit: 5,
        sortBy: 'helpful'
      })
      setReviews(reviewsData)

      const summary = await getProductRatingsSummary(Number(params.id))
      setRatingSummary(summary)
    } catch (error) {
      console.warn("Could not fetch reviews:", error)
    }
  }

  useEffect(() => {
    if (product && inventory.length > 0) {
      const productSizes = product.sizes || product.available_sizes || []
      // Find first available size
      const firstAvailable = productSizes.find(size => {
        const stock = inventory.find(inv => inv.size === size)
        return stock && stock.stock_quantity > 0
      })
      if (firstAvailable) {
        setSelectedSize(firstAvailable)
      } else if (productSizes.length > 0) {
        setSelectedSize(productSizes[0])
      }
    }
  }, [product, inventory])

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
  const buyNow = async () => {
    if (!selectedSize) {
      toast({
        title: "Please select a size",
        description: "Select a size before purchasing.",
        variant: "destructive",
      })
      return
    }

    setAddingToCart(true)
    try {
      await addItem(product!.id, selectedSize, quantity)
      router.push("/checkout")
    } catch (error: any) {
      console.error("Buy now error:", error)
      toast({
        title: "Error",
        description: error.message || "Could not proceed to checkout.",
        variant: "destructive",
      })
      setAddingToCart(false)
    }
  }

  const selectedStock = inventory.find((inv) => inv.size === selectedSize)
  const isOutOfStock = !selectedStock || selectedStock.stock_quantity <= 0

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)] mx-auto mb-4"></div>
          <p className="text-theme-2">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080808]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-theme mb-4">Product not found</h1>
          <Button onClick={() => router.push("/products")} className="bg-[var(--accent)] hover:opacity-90 text-white">
            Back to Products
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-theme pt-[100px] pb-8 opacity-0 animate-fadeIn transition-colors duration-300">
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images - Scrollable Gallery */}
          <div className="space-y-3">
            {/* Main Image */}
            <div
              className="aspect-square relative bg-black rounded-2xl overflow-hidden"
              onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
              onTouchEnd={(e) => {
                if (touchStartX === null) return
                const diff = touchStartX - e.changedTouches[0].clientX
                const total = productImages.length > 0 ? productImages.length : 1
                if (Math.abs(diff) > 40) {
                  if (diff > 0) {
                    setSelectedImageIndex(i => (i + 1) % total)
                  } else {
                    setSelectedImageIndex(i => (i - 1 + total) % total)
                  }
                }
                setTouchStartX(null)
              }}
            >
              {productImages.length > 0 ? (
                <Image
                  src={productImages[selectedImageIndex]?.image_url || "/placeholder.svg"}
                  alt={`${product.name} - Image ${selectedImageIndex + 1}`}
                  fill
                  className="object-cover transition-opacity duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg"
                  }}
                />
              ) : (
                <Image
                  src={product.front_image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg"
                  }}
                />
              )}
            </div>

            {/* Swipe dots — below the image */}
            {productImages.length > 1 && (
              <div className="flex justify-center gap-1.5">
                {productImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImageIndex(i)}
                    className="block rounded-full transition-all duration-200"
                    style={{
                      width: i === selectedImageIndex ? "18px" : "6px",
                      height: "6px",
                      background: i === selectedImageIndex ? "var(--text)" : "var(--text-3)",
                      opacity: i === selectedImageIndex ? 1 : 0.4,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Thumbnail Strip - Scrollable */}
            {productImages.length > 1 && (
              <div className="relative">
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {productImages.map((img, index) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all ${selectedImageIndex === index
                        ? 'opacity-100 scale-105'
                        : 'opacity-50 hover:opacity-80'
                        }`}
                    >
                      <Image
                        src={img.image_url}
                        alt={`${product.name} thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg"
                        }}
                      />
                      {img.is_primary && (
                        <span className="absolute bottom-0.5 right-0.5 bg-black/60 text-white text-[9px] px-1 rounded">
                          Main
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                {/* Scroll hint indicator */}
                {productImages.length > 4 && (
                  <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-[var(--bg)] to-transparent pointer-events-none" />
                )}
              </div>
            )}

            {/* Image counter */}
            {productImages.length > 1 && (
              <p className="text-center text-sm text-white/40">
                {selectedImageIndex + 1} of {productImages.length} images
              </p>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-5">
            {/* Name + Price */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-theme mb-3">{product.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl font-bold text-[var(--accent)]">₹{product.price.toLocaleString("en-IN")}</span>
                {ratingSummary && ratingSummary.totalReviews > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < Math.round(ratingSummary.averageRating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-theme-3'
                            }`}
                        />
                      ))}
                    </div>
                    <span className="text-theme-2 text-sm">
                      {ratingSummary.averageRating.toFixed(1)} ({ratingSummary.totalReviews})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <Label className="text-base font-semibold mb-3 block text-theme">Size</Label>
              <div className="flex flex-wrap gap-2">
                {(product.sizes || product.available_sizes || []).map((size) => {
                  const inventoryItem = inventory.find(i => i.size === size)
                  const inStock = (inventoryItem?.stock_quantity ?? 0) > 0
                  const isSelected = selectedSize === size
                  const lowStock = inventoryItem && inventoryItem.stock_quantity > 0 && inventoryItem.stock_quantity <= inventoryItem.low_stock_threshold

                  return (
                    <div key={size} className="relative">
                      <button
                        onClick={() => inStock && setSelectedSize(size)}
                        disabled={!inStock}
                        className={`
                          px-5 py-2.5 rounded-full text-sm font-semibold border transition-all duration-200
                          ${isSelected
                            ? 'bg-[#e93a3a] border-[#e93a3a] text-white'
                            : inStock
                              ? isDark
                                ? 'bg-transparent border-white/20 text-white hover:border-white/60'
                                : 'bg-transparent border-black/20 text-black hover:border-black/60'
                              : 'opacity-30 cursor-not-allowed border-white/10 text-white/30'
                          }
                        `}
                      >
                        {size}
                        {!inStock && <span className="ml-1 text-xs">✕</span>}
                      </button>
                      {lowStock && inStock && (
                        <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs">
                          {inventoryItem.stock_quantity} left
                        </Badge>
                      )}
                    </div>
                  )
                })}
              </div>
              {selectedSize && inventory.find(inv => inv.size === selectedSize && inv.stock_quantity <= inv.low_stock_threshold) && (
                <p className="mt-2 text-[#e7bf04] text-sm font-medium">
                  ⚡ Hurry! Only {inventory.find(inv => inv.size === selectedSize)?.stock_quantity} left in stock
                </p>
              )}
            </div>

            {/* Quantity + Action Buttons — all in one compact block */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Label className="text-base font-semibold text-theme shrink-0">Qty:</Label>
                <Select value={quantity.toString()} onValueChange={(value) => setQuantity(Number.parseInt(value))}>
                  <SelectTrigger className="w-24 h-10 bg-card border-theme text-theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-theme text-theme">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={addToCart}
                  disabled={addingToCart || isOutOfStock}
                  className="flex-1 bg-transparent hover:bg-[var(--accent)]/10 text-[var(--accent)] border-2 border-[var(--accent)] h-12 text-base disabled:opacity-50 transition-all"
                  size="lg"
                  variant="outline"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {isOutOfStock ? "Out of Stock" : addingToCart ? "Adding..." : "Add to Cart"}
                </Button>
                <WishlistButton
                  productId={product.id}
                  size="lg"
                  className="h-12 px-5 border-red-600 text-red-600 hover:bg-red-600 hover:text-white bg-transparent"
                />
              </div>
              <Button
                onClick={buyNow}
                disabled={addingToCart || isOutOfStock}
                className="w-full bg-[var(--accent)] hover:opacity-90 text-white h-12 text-base font-bold shadow-lg shadow-[var(--accent)]/20 transition-all disabled:opacity-50"
                size="lg"
              >
                <Zap className="w-5 h-5 mr-2" />
                {isOutOfStock ? "Out of Stock" : "Buy Now"}
              </Button>
            </div>

            {/* Description — below the buy buttons */}
            <p className="text-theme-2 leading-relaxed">{product.description}</p>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 text-center bg-card border-theme">
                <Truck className="w-8 h-8 mx-auto mb-2 text-[var(--accent-cyan)]" />
                <div className="font-semibold text-theme">Shipping</div>
                <div className="text-sm text-theme-3">1-2 weeks delivery</div>
              </Card>
              <Card className="p-4 text-center bg-card border-theme">
                <Shield className="w-8 h-8 mx-auto mb-2 text-[var(--accent-yellow)]" />
                <div className="font-semibold text-theme">Premium Quality</div>
                <div className="text-sm text-theme-3">100% Bio-Washed Cotton</div>
              </Card>
              <Card className="p-4 text-center bg-card border-theme">
                <RotateCcw className="w-8 h-8 mx-auto mb-2 text-[var(--accent-pink)]" />
                <div className="font-semibold text-theme">10-Day Replacement</div>
                <div className="text-sm text-theme-3">10-day replacement policy</div>
              </Card>
            </div>

            {/* Product Features */}
            <Card className="p-6 bg-card border-theme">
              <h3 className="font-bold text-lg mb-4 text-theme">Product Details</h3>
              <ul className="space-y-2 text-theme-2">
                <li>• Machine washable (cold water recommended)</li>
                <li>• Unique HAXEUS design</li>
                <li>• Comfortable relaxed fit</li>
                <li>• Durable construction for long-lasting wear</li>
              </ul>

              <div className="mt-6 pt-4 border-t border-theme">
                <h4 className="font-semibold mb-3 text-theme">Shipping &amp; Returns</h4>
                <ul className="space-y-2 text-theme-3 text-sm">
                  <li>• <strong>Domestic Shipping:</strong> 7-10 days</li>
                  <li>• <strong>International:</strong> Product price + shipping charges</li>
                  <li>• <strong>Replacement:</strong> 10-day replacement from date of delivery</li>
                </ul>
              </div>
            </Card>

            {/* Size Chart */}
            <Card className="p-6 bg-card border-theme">
              <h3 className="font-bold text-lg mb-4 text-theme">Men's Relaxed Fit T-Shirt Size Chart</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-theme">
                      <th className="py-3 px-4 text-left font-semibold text-theme">Size</th>
                      <th className="py-3 px-4 text-center font-semibold text-theme">Chest (in)</th>
                      <th className="py-3 px-4 text-center font-semibold text-theme">Length (in)</th>
                    </tr>
                  </thead>
                  <tbody className="text-theme-2">
                    <tr className="border-b border-white/[0.04]">
                      <td className="py-3 px-4 font-medium">S</td>
                      <td className="py-3 px-4 text-center">40</td>
                      <td className="py-3 px-4 text-center">27.5</td>
                    </tr>
                    <tr className="border-b border-white/[0.04]">
                      <td className="py-3 px-4 font-medium">M</td>
                      <td className="py-3 px-4 text-center">42</td>
                      <td className="py-3 px-4 text-center">28.5</td>
                    </tr>
                    <tr className="border-b border-theme/50">
                      <td className="py-3 px-4 font-medium">L</td>
                      <td className="py-3 px-4 text-center">44</td>
                      <td className="py-3 px-4 text-center">29.5</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">XL</td>
                      <td className="py-3 px-4 text-center">46</td>
                      <td className="py-3 px-4 text-center">30.5</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-xs text-theme-3">
                * Measurements are in inches. For best fit, measure a similar garment you already own.
              </p>
            </Card>
          </div>
        </div>

        {/* Reviews Section */}
        {ratingSummary && ratingSummary.totalReviews > 0 && (
          <div className="mt-16">
            <Card className="p-8 bg-card border-theme">
              <h2 className="text-3xl font-bold text-theme mb-6">Customer Reviews</h2>

              {/* Rating Summary */}
              <div className="flex flex-col md:flex-row gap-8 mb-8 pb-8 border-b border-theme">
                <div className="text-center md:text-left">
                  <div className="text-5xl font-bold text-theme mb-2">
                    {ratingSummary.averageRating.toFixed(1)}
                  </div>
                  <div className="flex justify-center md:justify-start mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-6 h-6 ${i < Math.round(ratingSummary.averageRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-theme-3'
                          }`}
                      />
                    ))}
                  </div>
                  <div className="text-theme-2">
                    Based on {ratingSummary.totalReviews} reviews
                  </div>
                </div>

                {/* Rating Distribution */}
                <div className="flex-1">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = ratingSummary.ratingDistribution[rating] || 0
                    const percentage = ratingSummary.totalReviews > 0
                      ? (count / ratingSummary.totalReviews) * 100
                      : 0

                    return (
                      <div key={rating} className="flex items-center gap-3 mb-2">
                        <span className="text-sm w-8 text-theme-2">{rating} ⭐</span>
                        <div className="flex-1 h-3 bg-card-2 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm w-12 text-right text-theme-2">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Individual Reviews */}
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-theme pb-6 last:border-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-theme-3'
                                  }`}
                              />
                            ))}
                          </div>
                          {review.verified_purchase && (
                            <Badge className="bg-green-500 text-white text-xs">Verified Purchase</Badge>
                          )}
                        </div>
                        {review.title && (
                          <h4 className="font-semibold text-theme mb-1">{review.title}</h4>
                        )}
                      </div>
                      <span className="text-sm text-theme-3">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-theme-2 mb-3">{review.comment}</p>
                    )}
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 mb-3">
                        {review.images.map((img: any) => (
                          <div key={img.id} className="w-20 h-20 relative rounded-lg overflow-hidden">
                            <Image src={img.image_url} alt="Review" fill className="object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-sm">
                      <button className="text-theme-2 hover:text-theme transition-colors">
                        Helpful ({review.helpful_count})
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {ratingSummary.totalReviews > 5 && (
                <Button variant="outline" className="w-full mt-6">
                  View All {ratingSummary.totalReviews} Reviews
                </Button>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
