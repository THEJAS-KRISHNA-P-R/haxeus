"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { useReducedMotion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useTheme } from "@/components/ThemeProvider"
import { cn } from "@/lib/utils"
import { useCart } from "@/contexts/CartContext"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { TrackProductView } from "@/components/TrackProductView"
import { SocialProof } from "@/components/SocialProof"
import { useProduct, useProductInventory } from "@/hooks/useProductQueries"
import { Product, ProductInventory, ProductImage } from "@/types/supabase"
import { formatPrice } from "@/lib/currency"
import { getShimmerDataUrl } from "@/lib/image-placeholder"
import { SizeGuide } from "@/components/SizeGuide"
import { TrustBadges } from "@/components/TrustBadges"
import { ReviewList } from "@/components/ReviewList"
import { supabase } from "@/lib/supabase"
import type { ProductReviewSummary, ProductReviewViewModel } from "@/types/reviews"
import { gaCommerceEvents } from "@/lib/ga-events"

const RelatedProducts = dynamic(
  () => import("@/components/RelatedProducts").then((m) => ({ default: m.RelatedProducts })),
  { ssr: false }
)

const RecentlyViewed = dynamic(
  () => import("@/components/RecentlyViewed").then((m) => ({ default: m.RecentlyViewed })),
  { ssr: false }
)

interface ProductPageClientProps {
  product: Product
  inventory: ProductInventory[]
  images: ProductImage[]
  relatedProducts?: Product[]
  initialReviews: ProductReviewViewModel[]
  reviewSummary: ProductReviewSummary | null
  isAuthenticated: boolean
}

export function ProductPageClient({
  product: initialProduct,
  inventory: initialInventory,
  images,
  relatedProducts = [],
  initialReviews,
  reviewSummary,
}: ProductPageClientProps) {
  const { data: product } = useProduct(initialProduct.id.toString(), {
    initialData: initialProduct,
  })
  const { data: inventory = [] } = useProductInventory(initialProduct.id.toString(), {
    initialData: initialInventory,
  })

  const p = (product || initialProduct) as Product
  const inv = (inventory || initialInventory) as ProductInventory[]

  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { addItem } = useCart()
  const { toast } = useToast()
  const router = useRouter()
  const [reviews, setReviews] = useState<ProductReviewViewModel[]>(initialReviews)
  const [userId, setUserId] = useState<string | null>(null)
  const [canReview, setCanReview] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    setMounted(true)
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null)
    })
  }, [])

  useEffect(() => {
    async function checkReviewEligibility() {
      if (!userId || !p.id) return

      const { data } = await supabase
        .from('orders')
        .select(`
          status,
          order_items!inner(product_id)
        `)
        .eq('user_id', userId)
        .or(`status.eq.delivered,status.eq.Delivered`)
        .eq('order_items.product_id', p.id)
        .limit(1)

      if (data && data.length > 0) {
        setCanReview(true)
      } else {
        setCanReview(false)
      }
    }

    checkReviewEligibility()
  }, [userId, p.id])

  const isDark = !mounted ? true : theme === "dark"

  const allImages = images.length > 0 ? images.map((image) => image.image_url) : [p.front_image || "/placeholder.svg"]

  const [activeIndex, setActiveIndex] = useState(0)
  const activeImage = allImages[activeIndex]
  const [selectedSize, setSelectedSize] = useState("")
  const [addingToCart, setAddingToCart] = useState(false)
  const [sizesExpanded, setSizesExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const liveReviewSummary = reviews.length > 0
    ? {
        averageRating: Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length) * 10) / 10,
        totalReviews: reviews.length,
      }
    : reviewSummary

  const MOBILE_VISIBLE = 4
  const DESKTOP_VISIBLE = 6
  const sizeOrder = ["3XS", "2XS", "XS", "S", "M", "L", "XL", "2XL", "XXL", "3XL", "XXXL", "4XL", "XXXXL"]

  const allAvailableSizes = Array.from(new Set(inv.map((inventoryItem) => inventoryItem.size))).sort((a, b) => {
    const indexA = sizeOrder.indexOf(a.toUpperCase())
    const indexB = sizeOrder.indexOf(b.toUpperCase())

    if (indexA === -1 && indexB === -1) return a.localeCompare(b)
    if (indexA === -1) return 1
    if (indexB === -1) return -1

    return indexA - indexB
  })

  const formatSize = (size: string) => {
    const normalized = size.toUpperCase()

    if (normalized === "XXXL") return "3XL"
    if (normalized === "XXXXL") return "4XL"
    if (normalized === "XXL") return "2XL"

    return size
  }

  const sizesToDisplay = allAvailableSizes.length > 0 ? allAvailableSizes : []
  const availableSizes = p.is_preorder
    ? sizesToDisplay
    : inv.filter((inventoryItem) => inventoryItem.stock_quantity > 0).map((inventoryItem) => inventoryItem.size)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener("resize", checkMobile)

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        setActiveIndex((current) => (current === 0 ? allImages.length - 1 : current - 1))
      } else if (event.key === "ArrowRight") {
        setActiveIndex((current) => (current === allImages.length - 1 ? 0 : current + 1))
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("resize", checkMobile)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [allImages.length])

  const isSelectedSizeOutOfStock = !p.is_preorder && selectedSize
    ? (inv.find((item) => item.size === selectedSize)?.stock_quantity ?? 0) === 0
    : false

  async function handleAddToCart(type: "preorder" | "normal") {
    if (!selectedSize) {
      toast({
        title: "Size required",
        description: "Please select a size before adding to cart",
        variant: "destructive",
      })
      return false
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
      
      gaCommerceEvents.addToCart(
        p.id.toString(),
        p.name,
        1,
        p.price,
        p.category || "Streetwear"
      )

      if (type === "preorder") {
        router.push("/cart")
      }

      return true
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Something went wrong."
      toast({ title: "Error", description: message, variant: "destructive" })
      return false
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
      const added = await handleAddToCart("normal")
      if (added) {
        router.push("/cart")
      }
    } finally {
      setTimeout(() => setAddingToCart(false), 600)
    }
  }

  const handleReviewCreated = (review: ProductReviewViewModel) => {
    setReviews((current) => {
      const exists = current.find((r) => r.id === review.id)
      if (exists) {
        return current.map((r) => (r.id === review.id ? review : r))
      }
      return [review, ...current]
    })
  }

  const handleReviewDeleted = (id: string) => {
    setReviews((current) => current.filter((r) => r.id !== id))
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-[88px] sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[55%_45%] lg:gap-12">
        <div className="group lg:sticky lg:top-[88px] lg:origin-top lg:scale-[0.85]">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-black touch-pan-y">
            <AnimatePresence mode={prefersReducedMotion ? "wait" : "popLayout"}>
              <motion.div
                key={activeIndex}
                initial={prefersReducedMotion ? false : { opacity: 1, x: 0 }}
                animate={{ opacity: 1, x: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
                transition={{ duration: 0 }}
                layout="position"
                className="relative h-full w-full"
                drag={prefersReducedMotion ? false : "x"}
                dragConstraints={prefersReducedMotion ? undefined : { left: 0, right: 0 }}
                dragElastic={prefersReducedMotion ? undefined : 0.2}
                onDragEnd={(_event, { offset, velocity }) => {
                  const swipe = Math.abs(offset.x) > 50 || Math.abs(velocity.x) > 500

                  if (!swipe) return

                  if (offset.x > 0) {
                    setActiveIndex((current) => (current === 0 ? allImages.length - 1 : current - 1))
                  } else {
                    setActiveIndex((current) => (current === allImages.length - 1 ? 0 : current + 1))
                  }
                }}
              >
                <Image
                  src={activeImage}
                  alt={p.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="pointer-events-none object-cover"
                  priority
                  placeholder="blur"
                  blurDataURL={getShimmerDataUrl(1200, 1200)}
                  onError={(event) => {
                    const target = event.target as HTMLImageElement
                    target.src = "/placeholder.svg"
                  }}
                />
              </motion.div>
            </AnimatePresence>

            {allImages.length > 1 && (
              <>
                <button
                  onClick={() => setActiveIndex((current) => (current === 0 ? allImages.length - 1 : current - 1))}
                  className="absolute left-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-black/20 p-2 text-white opacity-0 transition-all hover:bg-black/40 group-hover:opacity-100 sm:block"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={() => setActiveIndex((current) => (current === allImages.length - 1 ? 0 : current + 1))}
                  className="absolute right-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-black/20 p-2 text-white opacity-0 transition-all hover:bg-black/40 group-hover:opacity-100 sm:block"
                  aria-label="Next image"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {allImages.length > 1 && (
              <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                {allImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={cn(
                      "h-1.5 w-1.5 rounded-full transition-all duration-300",
                      activeIndex === index ? "w-4 bg-white" : "bg-white/40 hover:bg-white/60"
                    )}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {allImages.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {allImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-colors",
                    activeIndex === index
                      ? "border-[#e93a3a]"
                      : isDark ? "border-white/[0.10]" : "border-black/[0.10]"
                  )}
                >
                  <Image
                    src={image}
                    alt=""
                    width={64}
                    height={64}
                    sizes="64px"
                    className="h-full w-full object-cover"
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL={getShimmerDataUrl(128, 128)}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <h1 className={cn("text-2xl font-bold tracking-tight sm:text-3xl", isDark ? "text-white" : "text-black")}>
            {p.name}
          </h1>

          <SocialProof product={p} reviewSummary={liveReviewSummary} />

          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-theme-2">{formatPrice(p.price)}</span>
            {p.is_preorder && p.preorder_status === "active" && (
              <span className="rounded-full border border-[#eab308]/30 bg-[#eab308]/20 px-2.5 py-1 text-xs font-bold text-[#eab308]">
                PRE-ORDER
              </span>
            )}
          </div>

          {p.is_preorder && p.expected_date && (
            <p className={cn("-mt-3 text-sm", isDark ? "text-white/50" : "text-black/50")}>
              Expected: {p.expected_date}
            </p>
          )}

          <div>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className={cn("text-sm font-bold uppercase tracking-widest", isDark ? "text-white/40" : "text-black/40")}>
                Select Size
              </h3>
              <SizeGuide />
            </div>

            <div className="relative">
              <div
                className="hide-scrollbar -mx-1 flex flex-nowrap gap-3 overflow-x-auto px-1 pb-4 pt-1 scroll-smooth"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {(sizesExpanded ? sizesToDisplay : sizesToDisplay.slice(0, isMobile ? MOBILE_VISIBLE : DESKTOP_VISIBLE)).map((size) => {
                  const isAvailable = availableSizes.includes(size)

                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      disabled={!isAvailable}
                      className={cn(
                        "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border text-sm font-bold transition-all",
                        selectedSize === size
                          ? "border-[#e93a3a] bg-[#e93a3a] text-white shadow-lg shadow-[#e93a3a]/20"
                          : isAvailable
                            ? isDark
                              ? "border-white/10 bg-white/[0.04] text-white hover:border-white/30"
                              : "border-black/10 bg-black/[0.04] text-black hover:border-black/30"
                            : isDark
                              ? "cursor-not-allowed border-white/5 bg-transparent text-white/20"
                              : "cursor-not-allowed border-black/5 bg-transparent text-black/20"
                      )}
                    >
                      {formatSize(size)}
                    </button>
                  )
                })}

                {!sizesExpanded && sizesToDisplay.length > (isMobile ? MOBILE_VISIBLE : DESKTOP_VISIBLE) && (
                  <button
                    onClick={() => setSizesExpanded(true)}
                    className={cn(
                      "h-12 flex-shrink-0 whitespace-nowrap rounded-xl border px-3 text-xs font-bold transition-all",
                      isDark
                        ? "border-white/10 bg-white/[0.03] text-white/50 hover:border-white/30 hover:text-white"
                        : "border-black/10 bg-black/[0.02] text-black/50 hover:border-black/30 hover:text-black"
                    )}
                  >
                    +{sizesToDisplay.length - (isMobile ? MOBILE_VISIBLE : DESKTOP_VISIBLE)} more
                  </button>
                )}
              </div>
            </div>

            {!selectedSize && (
              <p className={cn("mt-2 animate-pulse text-[10px] font-bold uppercase tracking-widest", isDark ? "text-white/30" : "text-black/30")}>
                Select a size to continue
              </p>
            )}
          </div>

          {p.is_preorder ? (
            <button
              onClick={() => handleAddToCart("preorder")}
              disabled={addingToCart}
              className="w-full rounded-full bg-gradient-to-r from-[#eab308] to-[#facc15] py-4 text-lg font-bold tracking-wide text-black shadow-lg transition-all hover:scale-[1.01] hover:from-[#facc15] hover:to-[#fde047] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {addingToCart ? "Adding..." : "Pre-Order - Add to Cart"}
            </button>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => handleAddToCart("normal")}
                disabled={!selectedSize || isSelectedSizeOutOfStock || addingToCart}
                className={cn(
                  "flex-1 rounded-full border py-4 text-lg font-bold tracking-wide transition-all disabled:cursor-not-allowed disabled:opacity-40",
                  isDark ? "border-white/[0.15] text-white hover:bg-white/[0.06]" : "border-black/[0.15] text-black hover:bg-black/[0.06]"
                )}
              >
                {isSelectedSizeOutOfStock ? "Out of Stock" : addingToCart ? "Adding..." : "Add to Cart"}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!selectedSize || isSelectedSizeOutOfStock || addingToCart}
                className={cn(
                  "flex-1 rounded-full py-4 text-lg font-bold tracking-wide shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-40",
                  isDark ? "bg-white text-black hover:bg-white/90 shadow-white/10" : "bg-black text-white hover:bg-black/90 shadow-black/10"
                )}
              >
                {isSelectedSizeOutOfStock ? "Out of Stock" : addingToCart ? "Adding..." : "Buy Now"}
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm" style={{ color: "var(--color-foreground-muted)" }}>
            <Link href="/returns-refunds" className="font-medium underline underline-offset-4">
              10-day replacement policy
            </Link>
            <span style={{ color: "var(--color-foreground-subtle)" }}>Need help choosing? Use the size guide above.</span>
          </div>

          <TrustBadges compact />

          {p.description && (
            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-theme-2">{p.description}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-14 border-t-2 border-theme">
        <ReviewList 
          productId={p.id}
          userId={userId}
          canReview={canReview}
          reviews={reviews} 
          onReviewCreated={handleReviewCreated}
          onReviewDeleted={handleReviewDeleted}
        />
      </div>

      <TrackProductView product={p} />
      <RelatedProducts productId={p.id} category={p.category || "Streetwear"} initialData={relatedProducts} />
      <RecentlyViewed currentProductId={p.id} />
    </div>
  )
}
