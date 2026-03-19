"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { useTheme } from "@/components/ThemeProvider"
import { Shield, Truck, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCart } from "@/contexts/CartContext"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { TrackProductView } from "@/components/TrackProductView"
import { SocialProof } from "@/components/SocialProof"
import { useProduct, useProductInventory } from "@/hooks/useProductQueries"
import { Product, ProductInventory } from "@/lib/supabase"

const RelatedProducts = dynamic(
  () => import("@/components/RelatedProducts").then(m => ({ default: m.RelatedProducts })),
  { ssr: false }
)

const RecentlyViewed = dynamic(
  () => import("@/components/RecentlyViewed").then(m => ({ default: m.RecentlyViewed })),
  { ssr: false }
)

interface ProductPageClientProps {
  product: any
  inventory: any[]
  images: any[]
}

export function ProductPageClient({ 
  product: initialProduct, 
  inventory: initialInventory, 
  images 
}: ProductPageClientProps) {
  // Use React Query for session-level caching
  // Passes initial server-fetched data for instant first-render
  const { data: product } = useProduct(initialProduct.id.toString(), { 
    initialData: initialProduct 
  })
  const { data: inventory = [] } = useProductInventory(initialProduct.id.toString(), { 
    initialData: initialInventory 
  })

  // Explicit type safety for usage in component
  const p = (product || initialProduct) as Product
  const inv = (inventory || initialInventory) as ProductInventory[]

  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { addItem } = useCart()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => setMounted(true), [])

  const isDark = !mounted ? true : theme === "dark"

  const allImages = images.length > 0
    ? images.map(img => img.image_url)
    : [p.front_image || "/placeholder.svg"]

  const [activeIndex, setActiveIndex] = useState(0)
  const activeImage = allImages[activeIndex]
  const [selectedSize, setSelectedSize] = useState("")
  const [addingToCart, setAddingToCart] = useState(false)
  const [sizesExpanded, setSizesExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const MOBILE_VISIBLE = 4
  const DESKTOP_VISIBLE = 6

  // Define standard size order for sorting
  const sizeOrder = ["3XS", "2XS", "XS", "S", "M", "L", "XL", "2XL", "XXL", "3XL", "XXXL", "4XL", "XXXXL"]

  // Extract all unique sizes from inventory and sort them logically
  const allAvailableSizes = Array.from(new Set(inv.map(inv => inv.size)))
    .sort((a, b) => {
      const indexA = sizeOrder.indexOf(a.toUpperCase())
      const indexB = sizeOrder.indexOf(b.toUpperCase())
      if (indexA === -1 && indexB === -1) return a.localeCompare(b)
      if (indexA === -1) return 1
      if (indexB === -1) return -1
      return indexA - indexB
    })

  // Helper to format size for display (e.g. XXL -> 2XL)
  const formatSize = (size: string) => {
    const s = size.toUpperCase()
    if (s === "XXXL") return "3XL"
    if (s === "XXXXL") return "4XL"
    if (s === "XXL") return "2XL"
    return size
  }

  // Final sizes to display based on product type
  const sizesToDisplay = allAvailableSizes.length > 0 ? allAvailableSizes : []

  // For preorders, all sizes in inventory are available. For normal, only those with stock > 0.
  const availableSizes = p.is_preorder
    ? sizesToDisplay
    : inv.filter(inv => inv.stock_quantity > 0).map(inv => inv.size)

  // Size selection is now manual to prevent accidental 'S' size orders
  useEffect(() => {
    // Detect mobile for size selector
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener("resize", checkMobile)

    // Keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setActiveIndex(prev => (prev === 0 ? allImages.length - 1 : prev - 1))
      } else if (e.key === "ArrowRight") {
        setActiveIndex(prev => (prev === allImages.length - 1 ? 0 : prev + 1))
      }
    }
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("resize", checkMobile)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [allImages.length])

  // Out-of-stock check — preorders are never OOS
  const isSelectedSizeOutOfStock = !p.is_preorder && selectedSize
    ? (inv.find(i => i.size === selectedSize)?.stock_quantity ?? 0) === 0
    : false

  async function handleAddToCart(type: "preorder" | "normal") {
    if (!selectedSize) {
      toast({
        title: "Size required",
        description: "Please select a size before adding to cart",
        variant: "destructive",
      })
      return
    }
    setAddingToCart(true)
    try {
      await addItem({
        productId: p.id,
        size: selectedSize,
        color: "",
        quantity: 1,
        is_preorder: type === "preorder",
        preorder_expected_date: type === "preorder" ? (p.expected_date ?? null) : null,
      })
      toast({ title: "Added to cart!", description: p.name })
      if (type === "preorder") {
        router.push("/cart")
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setTimeout(() => setAddingToCart(false), 600)
    }
  }

  async function handleBuyNow() {
    if (!selectedSize) {
      toast({
        title: "Size required",
        description: "Please select a size to proceed to buy",
        variant: "destructive",
      })
      return
    }
    setAddingToCart(true)
    try {
      await handleAddToCart("normal")
      router.push("/cart")
    } catch (err: any) {
      // handleAddToCart already shows a toast for errors, but we can add one here too if needed
    } finally {
      setTimeout(() => setAddingToCart(false), 600)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-[88px] pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-8 lg:gap-12 items-start">

        {/* Left — image gallery */}
        <div className="lg:sticky lg:top-[88px] lg:scale-[0.85] lg:origin-top group">
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black touch-pan-y">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="relative w-full h-full"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_e, { offset, velocity }) => {
                  const swipe = Math.abs(offset.x) > 50 || Math.abs(velocity.x) > 500
                  if (swipe) {
                    if (offset.x > 0) {
                      setActiveIndex(prev => (prev === 0 ? allImages.length - 1 : prev - 1))
                    } else {
                      setActiveIndex(prev => (prev === allImages.length - 1 ? 0 : prev + 1))
                    }
                  }
                }}
              >
                <Image
                  src={activeImage}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover pointer-events-none"
                  priority
                  onError={(e) => {
                    const t = e.target as HTMLImageElement
                    t.src = "/placeholder.svg"
                  }}
                />
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={() => setActiveIndex(prev => (prev === 0 ? allImages.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md text-white transition-all opacity-0 group-hover:opacity-100 hidden sm:block z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={() => setActiveIndex(prev => (prev === allImages.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md text-white transition-all opacity-0 group-hover:opacity-100 hidden sm:block z-10"
                  aria-label="Next image"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Pagination Dots */}
            {allImages.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {allImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all duration-300",
                      activeIndex === i ? "bg-white w-4" : "bg-white/40 hover:bg-white/60"
                    )}
                    aria-label={`Go to image ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {allImages.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                    activeIndex === i
                      ? "border-[#e93a3a]"
                      : isDark ? "border-white/[0.10]" : "border-black/[0.10]"
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
          <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? "text-white" : "text-black"}`}>
            {p.name}
          </h1>

          {/* Social proof — reviews or preorder count */}
          <SocialProof product={p} />

          {/* Price + badge */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-theme-2">
              ₹{p.price.toLocaleString("en-IN")}
            </span>
            {p.is_preorder && p.preorder_status === "active" && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#eab308]/20 text-[#eab308] border border-[#eab308]/30">
                PRE-ORDER
              </span>
            )}
          </div>

          {/* Expected date — preorder */}
          {p.is_preorder && p.expected_date && (
            <p className={`text-sm -mt-3 ${isDark ? "text-white/50" : "text-black/50"}`}>
              Expected: {p.expected_date}
            </p>
          )}

          {/* Size selector */}
          <div>
            <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 ${isDark ? "text-white/40" : "text-black/40"}`}>
              Select Size
            </h3>
            <div className="relative">
              <div 
                className="flex flex-nowrap gap-3 overflow-x-auto pb-4 pt-1 -mx-1 px-1 hide-scrollbar scroll-smooth" 
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {(sizesExpanded ? sizesToDisplay : sizesToDisplay.slice(0, isMobile ? MOBILE_VISIBLE : DESKTOP_VISIBLE))
                  .map((size) => {
                    const isAvailable = availableSizes.includes(size)
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        disabled={!isAvailable}
                        className={cn(
                          "flex-shrink-0 w-12 h-12 rounded-xl border flex items-center justify-center text-sm font-bold transition-all",
                          selectedSize === size
                            ? "bg-[#e93a3a] border-[#e93a3a] text-white shadow-lg shadow-[#e93a3a]/20"
                            : isAvailable
                              ? isDark
                                ? "bg-white/[0.04] border-white/10 text-white hover:border-white/30"
                                : "bg-black/[0.04] border-black/10 text-black hover:border-black/30"
                              : isDark
                                ? "bg-transparent border-white/5 text-white/20 cursor-not-allowed"
                                : "bg-transparent border-black/5 text-black/20 cursor-not-allowed"
                        )}
                      >
                        {formatSize(size)}
                      </button>
                    )
                  })
                }

                {/* +N more button — only show when not expanded and there are hidden sizes */}
                {!sizesExpanded && sizesToDisplay.length > (isMobile ? MOBILE_VISIBLE : DESKTOP_VISIBLE) && (
                  <button
                    onClick={() => setSizesExpanded(true)}
                    className={`flex-shrink-0 h-12 px-3 rounded-xl border text-xs font-bold transition-all whitespace-nowrap ${
                      isDark
                        ? "border-white/10 text-white/50 hover:border-white/30 hover:text-white bg-white/[0.03]"
                        : "border-black/10 text-black/50 hover:border-black/30 hover:text-black bg-black/[0.02]"
                    }`}
                  >
                    +{sizesToDisplay.length - (isMobile ? MOBILE_VISIBLE : DESKTOP_VISIBLE)} more
                  </button>
                )}
              </div>
            </div>
            {!selectedSize && (
              <p className={`text-[10px] uppercase tracking-widest font-bold mt-2 animate-pulse ${isDark ? "text-white/30" : "text-black/30"}`}>
                Select a size to continue
              </p>
            )}
          </div>

          {/* CTA buttons */}
          {p.is_preorder ? (
            <button
              onClick={() => handleAddToCart("preorder")}
              disabled={addingToCart}
              className="w-full py-4 rounded-full bg-gradient-to-r from-[#eab308] to-[#facc15] hover:from-[#facc15] hover:to-[#fde047] text-black font-bold tracking-wide text-lg shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {addingToCart ? "Adding..." : "Pre-Order — Add to Cart"}
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleAddToCart("normal")}
                disabled={!selectedSize || isSelectedSizeOutOfStock || addingToCart}
                className={`flex-1 py-4 rounded-full border font-bold tracking-wide text-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  isDark
                    ? "border-white/[0.15] text-white hover:bg-white/[0.06]"
                    : "border-black/[0.15] text-black hover:bg-black/[0.06]"
                }`}
              >
                  {isSelectedSizeOutOfStock ? "Out of Stock" : addingToCart ? "Adding..." : "Add to Cart"}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!selectedSize || isSelectedSizeOutOfStock || addingToCart}
                className={`flex-1 py-4 rounded-full font-bold tracking-wide text-lg shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  isDark
                    ? "bg-white text-black hover:bg-white/90 shadow-white/10"
                    : "bg-black text-white hover:bg-black/90 shadow-black/10"
                }`}
              >
                {isSelectedSizeOutOfStock ? "Out of Stock" : addingToCart ? "Adding..." : "Buy Now"}
              </button>
            </div>
          )}

          {/* Description + trust markers */}
          {p.description && (
            <div className="space-y-4">
              <p className={`text-sm leading-relaxed ${isDark ? "text-white/65" : "text-black/65"}`}>
                {p.description}
              </p>

              <div className="grid grid-cols-3 gap-2 sm:gap-4 border-t border-theme pt-6">
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

      <TrackProductView product={p} />
      <RelatedProducts productId={p.id} category={p.category || 'Streetwear'} />
      <RecentlyViewed currentProductId={p.id} />
    </div>
  )
}
