"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Heart, ShoppingCart } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { hoverScale, tapScale, cardHover } from "@/lib/animations"
import { WishlistButton } from "@/components/WishlistButton"
// We'll import type Product from "@/lib/supabase" since the prompt used sizes_available vs available_sizes
import type { Product } from "@/lib/supabase"

interface ProductCardProps {
  product: Product
  index: number
  accentColor?: string
  variant?: "default" | "preorder"
  onPreorderClick?: (product: Product) => void
}

export function isSupabaseStorageUrl(url?: string) {
  return typeof url === "string" && url.includes(".supabase.co/storage/v1/")
}

export function ProductCard({
  product,
  index,
  accentColor = "#e7bf04",
  variant = "default",
  onPreorderClick
}: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(() => {
    // Only use local wishlist state for the preorder variant alternative heart,
    // otherwise the canonical card uses the WishlistButton component directly
    try {
      const stored = localStorage.getItem("haxeus_preorder_wishlist")
      const ids: number[] = stored ? JSON.parse(stored) : []
      return ids.includes(product.id)
    } catch { return false }
  })

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
  const sizes = (product as any).sizes || (product as any).available_sizes || ["S", "M", "L", "XL"]

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
                unoptimized={isSupabaseStorageUrl(product.front_image)}
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
          <CardContent className="p-3 sm:p-5 flex flex-col flex-1">
            <motion.h3
              className="text-base sm:text-xl font-bold text-slate-900 dark:text-white mb-1 sm:mb-2 hover:text-[var(--accent)] line-clamp-1"
              whileHover={{ x: 5 }}
              transition={{ duration: 0.2 }}
            >
              {product.name}
            </motion.h3>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-2 sm:mb-3 line-clamp-2 leading-relaxed">
              {product.description || "Premium streetwear"}
            </p>


            <div className="mt-auto">
              <div className="flex items-center gap-2 mb-2">
                <motion.span
                  className="text-base sm:text-xl font-bold text-slate-900 dark:text-white"
                  whileHover={{ scale: 1.1, color: "var(--accent)" }}
                >
                  ₹{product.price.toLocaleString("en-IN")}
                </motion.span>
                
                {variant === "preorder" && product.preorder_count > 0 && (
                  <span className="text-xs text-slate-500 dark:text-white/40 ml-auto">
                    {product.preorder_count}
                    {product.max_preorders ? ` / ${product.max_preorders}` : ""} reserved
                  </span>
                )}
              </div>

              {/* Progress bar — only for preorders with a max */}
              {variant === "preorder" && product.max_preorders && (
                <div className="mb-4">
                  <div className="h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#e7bf04] transition-all duration-500"
                      style={{ width: `${Math.min(100, (product.preorder_count / product.max_preorders) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Preorder Variant CTA area */}
              {variant === "preorder" && (
                <div className="flex gap-2">
                  <motion.div whileHover={hoverScale} whileTap={tapScale} className="flex-1">
                    <Button
                      disabled={isSoldOut}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!isSoldOut) onPreorderClick?.(product);
                      }}
                      className="w-full bg-[var(--accent)] text-white hover:opacity-90 py-5 text-sm sm:text-base font-semibold rounded-full shadow-md shadow-[var(--accent)]/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSoldOut ? "Sold Out" : "Pre-Order Now"}
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <button
                      onClick={toggleWishlist}
                      className={`h-full px-4 rounded-full border transition-all ${
                        wishlisted
                          ? "border-[#c03c9d] text-[#c03c9d] bg-[#c03c9d]/10"
                          : "border-black/[0.12] dark:border-white/[0.12] text-slate-500 dark:text-white/50 hover:border-[#c03c9d] hover:text-[#c03c9d]"
                      }`}
                    >
                      <Heart size={18} fill={wishlisted ? "#c03c9d" : "none"} />
                    </button>
                  </motion.div>
                </div>
              )}
            </div>
            
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}
