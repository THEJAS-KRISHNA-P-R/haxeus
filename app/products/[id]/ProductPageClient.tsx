"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useTheme } from "next-themes"
import { ShoppingCart, Zap, Shield, Truck, RotateCcw } from "lucide-react"
import { useCart } from "@/contexts/CartContext"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import type { Product } from "@/lib/supabase"

interface ProductPageClientProps {
  product: any // We'll use any or a combined type from Supabase
  inventory: any[]
  images: any[]
}

export function ProductPageClient({ product, inventory, images }: ProductPageClientProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { addItem } = useCart()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => setMounted(true), [])

  const isDark = !mounted ? true : (
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
  )

  const allImages = images.length > 0 
    ? images.map(img => img.image_url) 
    : [product.front_image || "/placeholder.svg"]
  
  const [activeImage, setActiveImage] = useState(allImages[0])
  const [selectedSize, setSelectedSize] = useState("")
  const [addingToCart, setAddingToCart] = useState(false)

  const sizes = ["S", "M", "L", "XL"]
  const availableSizes = inventory
    .filter(inv => inv.stock_quantity > 0)
    .map(inv => inv.size)

  useEffect(() => {
    if (availableSizes.length > 0) {
      setSelectedSize(availableSizes[0])
    } else {
      setSelectedSize(sizes[0])
    }
  }, [inventory])

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast({ title: "Please select a size", variant: "destructive" })
      return
    }
    setAddingToCart(true)
    try {
      await addItem(product.id, selectedSize, 1)
      toast({ title: "Added to cart!", description: `${product.name} added.` })
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setAddingToCart(false)
    }
  }

  const handleBuyNow = async () => {
    if (!selectedSize) {
      toast({ title: "Please select a size", variant: "destructive" })
      return
    }
    setAddingToCart(true)
    try {
      await addItem(product.id, selectedSize, 1)
      router.push("/checkout")
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
      setAddingToCart(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-[88px] pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-8 lg:gap-12 items-start">

        {/* Left — image gallery */}
        <div className="lg:sticky lg:top-[88px]">
          {/* Main image */}
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black">
            <Image
              src={activeImage}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
              priority
              onError={(e) => {
                const t = e.target as HTMLImageElement
                t.src = "/placeholder.svg"
              }}
            />
          </div>

          {/* Thumbnail strip — only if multiple images */}
          {allImages.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1 hide-scrollbar" style={{ scrollbarWidth: "none" }}>
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                    activeImage === img
                      ? "border-[#e93a3a]"
                      : (isDark ? "border-white/[0.10]" : "border-black/[0.10]")
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right — product details */}
        <div className="flex flex-col gap-6">
          {/* Name */}
          <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${
            isDark ? "text-white" : "text-black"
          }`}>
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-[var(--accent)]">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            {product.is_preorder && product.preorder_status === "active" && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#e7bf04]/20 text-[#e7bf04]">
                PRE-ORDER
              </span>
            )}
          </div>

          {/* Expected date — if preorder */}
          {product.is_preorder && product.expected_date && (
            <p className={`text-sm ${isDark ? "text-white/50" : "text-black/50"}`}>
              Expected: {product.expected_date}
            </p>
          )}

          {/* Size selector */}
          <div>
            <p className={`text-sm font-semibold mb-2.5 ${isDark ? "text-white/70" : "text-black/70"}`}>
              Size
            </p>
            <div className="flex flex-wrap gap-2">
              {sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  disabled={!availableSizes.includes(size)}
                  className={`w-12 h-12 rounded-xl border text-sm font-semibold transition-all ${
                    selectedSize === size
                      ? "border-[#e93a3a] bg-[#e93a3a]/10 text-[#e93a3a]"
                      : availableSizes.includes(size)
                        ? (isDark
                            ? "border-white/[0.12] text-white hover:border-white/[0.30]"
                            : "border-black/[0.12] text-black hover:border-black/[0.30]")
                        : (isDark
                            ? "border-white/[0.04] text-white/20 cursor-not-allowed"
                            : "border-black/[0.04] text-black/20 cursor-not-allowed")
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="flex-1 py-4 rounded-full bg-[#e93a3a] hover:bg-[#ff4a4a] text-white font-bold tracking-wide shadow-lg shadow-[#e93a3a]/20 transition-colors disabled:opacity-50"
            >
              {addingToCart ? "..." : "Add to Cart"}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={addingToCart}
              className={`flex-1 py-4 rounded-full border font-bold tracking-wide transition-colors disabled:opacity-50 ${
                isDark
                  ? "border-white/[0.15] text-white hover:bg-white/[0.06]"
                  : "border-black/[0.15] text-black hover:bg-black/[0.06]"
              }`}
            >
              Buy Now
            </button>
          </div>

          {/* Description */}
          {product.description && (
            <div className="space-y-4">
              <p className={`text-sm leading-relaxed ${isDark ? "text-white/65" : "text-black/65"}`}>
                {product.description}
              </p>
              
              {/* Trust markers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-theme pt-6">
                <div className="flex flex-col items-center text-center p-3">
                  <Truck className="w-6 h-6 mb-2 text-[var(--accent)]" />
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-white/40" : "text-black/40"}`}>Shipping</span>
                  <span className={`text-xs mt-1 ${isDark ? "text-white/70" : "text-black/70"}`}>Fast Delivery</span>
                </div>
                <div className="flex flex-col items-center text-center p-3">
                  <Shield className="w-6 h-6 mb-2 text-[var(--accent)]" />
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-white/40" : "text-black/40"}`}>Quality</span>
                  <span className={`text-xs mt-1 ${isDark ? "text-white/70" : "text-black/70"}`}>100% Cotton</span>
                </div>
                <div className="flex flex-col items-center text-center p-3">
                  <RotateCcw className="w-6 h-6 mb-2 text-[var(--accent)]" />
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-white/40" : "text-black/40"}`}>Returns</span>
                  <span className={`text-xs mt-1 ${isDark ? "text-white/70" : "text-black/70"}`}>10-Day Policy</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
