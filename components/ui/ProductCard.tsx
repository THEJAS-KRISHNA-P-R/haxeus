"use client"

import { useRouter } from "next/navigation"
import { useTheme } from "@/components/ThemeProvider"
import { Heart, ShoppingCart } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { hoverScale, tapScale } from "@/lib/animations"
import { WishlistButton } from "@/components/WishlistButton"
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
  const { theme } = useTheme()
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
    } catch {}
  }

  const isPreorderData = product.is_preorder && product.preorder_status !== "stopped"
  const isSoldOut = product.preorder_status === "sold_out"

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.05 }}
      whileHover={{ y: -10 }}
      className="snap-start h-full"
    >
      <Link href={`/products/${product.id}`} className="block h-full">
        <Card className="group overflow-hidden bg-card shadow-none hover:shadow-md border-0 h-full transition-all cursor-pointer flex flex-col">
          
          {/* Image zone */}
          <div className="aspect-square relative bg-black overflow-hidden hide-transform">
            <motion.div
              className="relative h-full w-full"
              whileHover={{ scale: 1.1, rotate: 2 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src={product.front_image || "/placeholder.svg"}
                alt={product.name}
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
                    <WishlistButton
                      productId={product.id}
                      variant="ghost"
                      size="sm"
                      className="bg-card text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 shadow-md"
                    />
                  </motion.div>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileHover={{ y: 0, opacity: 1, scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button size="sm" className="bg-[var(--accent)] hover:opacity-90 shadow-md" onClick={(e) => e.stopPropagation()}>
                      <ShoppingCart className="w-4 h-4" />
                    </Button>
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
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-sm ${
                  isSoldOut
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

          {/* Content zone */}
          <CardContent className="p-4">
            {/* Name */}
            <Shuffle
              text={product.name}
              tag="h3"
              className="text-base font-semibold mb-1 text-theme"
              duration={0.4}
              shuffleTimes={1}
            />

            {/* Description snippet */}
            {product.description && (
              <p className={`text-xs mb-3 line-clamp-2 ${isDark ? "text-white/40" : "text-black/40"}`}>
                {product.description}
              </p>
            )}

            {/* Price and CTA row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col">
                <p className="text-xl font-bold text-theme leading-none">
                  ₹{product.price.toLocaleString("en-IN")}
                </p>
                {!product.is_preorder && product.total_stock === 0 && (
                  <span className={`mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase border w-fit ${
                    isDark
                      ? "bg-white/[0.06] text-white/40 border-white/[0.08]"
                      : "bg-black/[0.05] text-black/40 border-black/[0.08]"
                  }`}>
                    Sold Out
                  </span>
                )}
              </div>

              <div className="flex-1 max-w-[140px]">
                {product.is_preorder ? (
                  <Link href={`/products/${product.id}`}>
                    <Button className="w-full py-2.5 h-auto text-xs font-bold rounded-full bg-[#e7bf04] hover:bg-[#f0cc1a] text-black transition-all">
                      Pre-Order Now
                    </Button>
                  </Link>
                ) : product.total_stock === 0 ? (
                  <Link href={`/products/${product.id}`}>
                    <Button className={`w-full py-2.5 h-auto text-xs font-semibold rounded-full transition-all ${
                      isDark
                        ? "bg-white/[0.04] text-white/30 border border-white/[0.06]"
                        : "bg-black/[0.03] text-black/30 border border-black/[0.06]"
                    }`}>
                      View Details
                    </Button>
                  </Link>
                ) : (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      router.push(`/products/${product.id}`)
                    }}
                    className="w-full py-2.5 text-xs font-bold rounded-full bg-[var(--accent)] text-white hover:opacity-90 transition-all shadow-sm shadow-[var(--accent)]/10"
                  >
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}
