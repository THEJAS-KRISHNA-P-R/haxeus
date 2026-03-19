"use client"

import { useRouter } from "next/navigation"
import { useTheme } from "@/components/ThemeProvider"
import { Heart, ShoppingCart } from "lucide-react"
import { useState, useEffect } from "react"
import { useCart } from "@/contexts/CartContext"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { hoverScale, tapScale, cardHover, cardTap, getAnimationProps } from "@/lib/animations"
import { WishlistButton } from "@/components/WishlistButton"
import { useDeviceTier } from "@/hooks/useDeviceTier"
import type { Product } from "@/lib/supabase"
import Shuffle from "@/components/Shuffle"

interface ProductCardProps {
  product: Product
  index: number
  accentColor?: string
  variant?: "default" | "preorder"
  onPreorderClick?: (product: Product) => void
}

export function ProductCard({
  product,
  index,
  accentColor = "#e7bf04",
  variant = "default",
  onPreorderClick
}: ProductCardProps) {
  const router = useRouter()
  const tier = useDeviceTier()
  const { theme } = useTheme()
  const { addItem } = useCart()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [wishlisted, setWishlisted] = useState(() => {
    try {
      const stored = localStorage.getItem("haxeus_preorder_wishlist")
      const ids: number[] = stored ? JSON.parse(stored) : []
      return ids.includes(product.id)
    } catch { return false }
  })

  useEffect(() => setMounted(true), [])
  const isDark = !mounted ? true : theme === "dark"

  function toggleWishlist(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    try {
      const stored = localStorage.getItem("haxeus_preorder_wishlist")
      const ids: number[] = stored ? JSON.parse(stored) : []
      const updated = ids.includes(product.id)
        ? ids.filter(id => id !== product.id)
        : [...ids, product.id]
      localStorage.setItem("haxeus_preorder_wishlist", JSON.stringify(updated))
      setWishlisted(!wishlisted)
    } catch { }
  }

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    try {
      await addItem({
        productId: product.id,
        size: "S", // Default size for quick-add from card
        quantity: 1,
        is_preorder: product.is_preorder
      })
      toast({ title: "Added to cart", description: product.name })
      router.push("/cart")
    } catch (err: any) {
      // If adding fails (e.g. size S out of stock), redirect to product page to pick size
      router.push(`/products/${product.id}`)
    }
  }

  const isPreorderData = product.is_preorder && product.preorder_status !== "stopped"
  const isSoldOut = product.preorder_status === "sold_out"

  // Sanitize data — only use what's needed for the card
  const { id, name, price, description, front_image, is_preorder, total_stock } = product;

  return (
    <motion.div
      {...getAnimationProps({
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.4, ease: "easeOut" }
      })}
      whileHover={tier === "low" ? {} : { y: -10 }}
      className="h-full"
    >
      <Link href={`/products/${id}`} className="block h-full">
        <Card className="group overflow-hidden bg-card shadow-none hover:shadow-md border-0 h-full transition-all cursor-pointer flex flex-col">

          {/* Image zone */}
          <div className="aspect-square relative bg-black overflow-hidden hide-transform">
            <motion.div
              className="relative h-full w-full"
              whileHover={{ scale: 1.1, rotate: 2 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src={front_image || "/placeholder.svg"}
                alt={name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover"
                priority={index < 4}
                onError={(e) => {
                  const t = e.target as HTMLImageElement
                  t.src = "/placeholder.svg"
                }}
              />
            </motion.div>

            {/* Hover overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"
              initial={{ opacity: 0.4 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {variant === "default" && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileHover={{ y: 0, opacity: 1, scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="bg-card text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 shadow-md p-2 rounded-full cursor-pointer flex items-center justify-center" onClick={toggleWishlist}>
                      <Heart size={16} className={wishlisted ? "fill-red-500 text-red-500" : ""} />
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileHover={{ y: 0, opacity: 1, scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="bg-[var(--accent)] hover:opacity-90 shadow-md p-2 rounded-full cursor-pointer flex items-center justify-center" onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/products/${id}`); }}>
                      <ShoppingCart className="w-4 h-4 text-white" />
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>

            {/* Accent bottom line */}
            <div
              className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"
              style={{ background: accentColor }}
            />

            {/* Preorder badge — top left */}
            {isPreorderData && (
              <div className="absolute top-3 left-3 z-10">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-sm ${isSoldOut
                    ? "bg-red-500/20 text-red-500"
                    : "bg-[#e7bf04]/20 text-[#e7bf04]"
                  }`}>
                  {isSoldOut ? "Sold Out" : "Pre-Order"}
                </span>
              </div>
            )}

            {/* Expected date badge — top right */}
            {isPreorderData && product.expected_date && (
              <div className="absolute top-3 right-3 z-10 hidden sm:block">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-black/60 text-[#07e4e1] backdrop-blur-sm">
                  Ships {product.expected_date}
                </span>
              </div>
            )}
          </div>

          <CardContent className="p-2 sm:p-4">
            <div className="flex-1 flex flex-col min-h-[88px] sm:min-h-[122px]">
              {/* Name */}
              <div className="mb-0 sm:mb-1 text-left">
                <h3 className="text-sm sm:text-lg font-bold text-theme truncate">
                  {name}
                </h3>
              </div>

              {/* Description snippet */}
              <div className="flex-grow text-left">
                {description && (
                  <p className={`text-[10px] sm:text-[12px] mb-1.5 sm:mb-3 line-clamp-2 sm:line-clamp-3 leading-tight sm:leading-relaxed ${isDark ? "text-white/40" : "text-black/40"}`}>
                    {description}
                  </p>
                )}
              </div>

              {/* Price and CTA row */}
              <div className="flex items-center justify-between gap-1.5 sm:gap-4 mt-auto pt-1.5 sm:pt-3 border-t border-theme/5">
                <div className="flex flex-col shrink-0">
                  <p className="text-base sm:text-xl font-bold text-theme leading-none">
                    ₹{price.toLocaleString("en-IN")}
                  </p>
                  {!is_preorder && total_stock === 0 && (
                    <span className={`mt-1 px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px] font-bold tracking-widest uppercase border w-fit ${isDark
                        ? "bg-white/[0.06] text-white/40 border-white/[0.08]"
                        : "bg-black/[0.05] text-black/40 border-black/[0.08]"
                      }`}>
                      Out
                    </span>
                  )}
                </div>

                <div className="flex-1">
                  {is_preorder ? (
                    <div
                      onClick={handleAddToCart}
                      className="w-full py-1.5 sm:py-2.5 h-auto text-[10px] sm:text-xs font-bold rounded-full bg-[#e7bf04] hover:bg-[#f0cc1a] text-black transition-all border-none flex items-center justify-center cursor-pointer"
                    >
                      Pre-Order Now
                    </div>
                  ) : total_stock === 0 ? (
                    <div className={`w-full py-1.5 sm:py-2.5 h-auto text-[10px] sm:text-xs font-semibold rounded-full transition-all border-none flex items-center justify-center ${isDark
                        ? "bg-white/[0.06] text-white/40 border-white/[0.08]"
                        : "bg-black/[0.05] text-black/40 border-black/[0.08]"
                      }`}>
                      View
                    </div>
                  ) : (
                    <div
                      onClick={handleAddToCart}
                      className="w-full py-1.5 sm:py-2.5 text-[10px] sm:text-xs font-bold rounded-full bg-[var(--accent)] text-white hover:opacity-90 transition-all text-center cursor-pointer"
                    >
                      Add to Cart
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}
