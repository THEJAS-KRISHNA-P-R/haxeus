"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Heart, ShoppingCart } from "lucide-react"
import { useTheme } from "@/components/ThemeProvider"
import { useCart } from "@/contexts/CartContext"
import { Card, CardContent } from "@/components/ui/card"
import { formatPrice } from "@/lib/currency"
import { getShimmerDataUrl } from "@/lib/image-placeholder"
import { Product } from "@/types/supabase"

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
  onPreorderClick,
}: ProductCardProps) {
  const router = useRouter()
  const { theme } = useTheme()
  const { user, toggleWishlist, isWishlisted } = useCart()
  const [mounted, setMounted] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)

  useEffect(() => {
    setMounted(true)

    if (user) {
      setWishlisted(isWishlisted(product.id))
      return
    }

    try {
      const stored = localStorage.getItem("haxeus_preorder_wishlist")
      const ids: number[] = stored ? JSON.parse(stored) : []
      setWishlisted(ids.includes(product.id))
    } catch {
      setWishlisted(false)
    }
  }, [isWishlisted, product.id, user])

  const isDark = !mounted ? true : theme === "dark"
  const isPreorderData = product.is_preorder && product.preorder_status !== "stopped"
  const isSoldOut = product.preorder_status === "sold_out"
  const productImages = [...(product.product_images ?? [])].sort((a, b) => a.display_order - b.display_order)
  const secondaryImage =
    productImages.find((image) => image.image_url && image.image_url !== product.front_image)?.image_url ||
    product.back_image

  const { id, name, price, description, front_image, is_preorder, total_stock } = product

  async function handleWishlistToggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (user) {
      await toggleWishlist(product.id)
      setWishlisted(isWishlisted(product.id))
      return
    }

    try {
      const stored = localStorage.getItem("haxeus_preorder_wishlist")
      const ids: number[] = stored ? JSON.parse(stored) : []
      const updated = ids.includes(product.id)
        ? ids.filter((storedId) => storedId !== product.id)
        : [...ids, product.id]

      localStorage.setItem("haxeus_preorder_wishlist", JSON.stringify(updated))
      setWishlisted(updated.includes(product.id))
    } catch {
      setWishlisted((current) => !current)
    }
  }

  function openProductDetails(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/products/${product.id}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -10 }}
      className="h-full"
    >
      <Link href={`/products/${id}`} className="block h-full">
        <Card className="group flex h-full cursor-pointer flex-col overflow-hidden border-0 bg-card shadow-none transition-all hover:shadow-md">
          <div className="relative aspect-square overflow-hidden bg-black hide-transform">
            <motion.div
              className="relative h-full w-full"
              whileHover={{ scale: 1.06, rotate: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src={front_image || "/placeholder.svg"}
                alt={name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                className={`object-cover transition-opacity duration-500 ${secondaryImage ? "group-hover:opacity-0" : ""}`}
                priority={index < 2}
                fetchPriority={index < 2 ? "high" : "auto"}
                placeholder="blur"
                blurDataURL={getShimmerDataUrl(800, 800)}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg"
                }}
              />

              {secondaryImage && (
                <Image
                  src={secondaryImage}
                  alt={`${name} alternate view`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL={getShimmerDataUrl(800, 800)}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = front_image || "/placeholder.svg"
                  }}
                />
              )}
            </motion.div>

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
                    <div
                      className="flex cursor-pointer items-center justify-center rounded-full bg-card p-2 text-slate-900 shadow-md hover:bg-slate-100 dark:text-white dark:hover:bg-white/10"
                      onClick={(event) => void handleWishlistToggle(event)}
                    >
                      <Heart size={16} className={wishlisted ? "fill-red-500 text-red-500" : ""} />
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileHover={{ y: 0, opacity: 1, scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div
                      className="flex cursor-pointer items-center justify-center rounded-full bg-[var(--accent)] p-2 shadow-md hover:opacity-90"
                      onClick={openProductDetails}
                    >
                      <ShoppingCart className="h-4 w-4 text-white" />
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>

            <div
              className="absolute bottom-0 left-0 right-0 z-10 h-1 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{ background: accentColor }}
            />

            {isPreorderData && (
              <div className="absolute left-3 top-3 z-10">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-sm ${
                    isSoldOut ? "bg-red-500/20 text-red-500" : "bg-[#e7bf04]/20 text-[#e7bf04]"
                  }`}
                >
                  {isSoldOut ? "Sold Out" : "Pre-Order"}
                </span>
              </div>
            )}

            {isPreorderData && product.expected_date && (
              <div className="absolute right-3 top-3 z-10 hidden sm:block">
                <span className="rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#07e4e1] backdrop-blur-sm">
                  Ships {product.expected_date}
                </span>
              </div>
            )}
          </div>

          <CardContent className="p-2 sm:p-4">
            <div className="flex min-h-[88px] flex-1 flex-col sm:min-h-[122px]">
              <div className="mb-0 text-left sm:mb-1">
                <h3 className="truncate text-sm font-bold text-theme sm:text-lg">{name}</h3>
              </div>

              <div className="flex-grow text-left">
                {description && (
                  <p
                    className={`mb-1.5 line-clamp-2 text-[10px] leading-tight sm:mb-3 sm:line-clamp-3 sm:text-[12px] sm:leading-relaxed ${
                      isDark ? "text-white/40" : "text-black/60"
                    }`}
                  >
                    {description}
                  </p>
                )}
              </div>

              <div className="mt-auto flex items-center justify-between gap-1.5 border-t border-theme/5 pt-1.5 sm:gap-4 sm:pt-3">
                <div className="flex shrink-0 flex-col">
                  <p className="text-base font-bold leading-none text-theme sm:text-xl">{formatPrice(price)}</p>
                  {!is_preorder && total_stock === 0 && (
                    <span
                      className={`mt-1 w-fit rounded-full border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest sm:text-[9px] ${
                        isDark
                          ? "border-white/[0.08] bg-white/[0.06] text-white/40"
                          : "border-black/[0.08] bg-black/[0.1] text-black/60"
                      }`}
                    >
                      Out
                    </span>
                  )}
                </div>

                <div className="flex-1">
                  {is_preorder ? (
                    <div
                      onClick={(e) => {
                        if (onPreorderClick) {
                          e.preventDefault()
                          e.stopPropagation()
                          onPreorderClick(product)
                          return
                        }

                        openProductDetails(e)
                      }}
                      className="flex h-auto w-full cursor-pointer items-center justify-center rounded-full border-none bg-[#e7bf04] py-1.5 text-[12px] font-bold text-black transition-all hover:bg-[#f0cc1a] sm:py-2.5 sm:text-xs"
                    >
                      Pre-Order Now
                    </div>
                  ) : total_stock === 0 ? (
                    <div
                      className={`flex w-full items-center justify-center rounded-full border-none py-1.5 text-[10px] font-semibold transition-all sm:py-2.5 sm:text-xs ${
                        isDark
                          ? "border-white/[0.08] bg-white/[0.06] text-white/40"
                          : "border-black/[0.08] bg-black/[0.1] text-black/60"
                      }`}
                    >
                      View
                    </div>
                  ) : (
                    <div
                      onClick={openProductDetails}
                      className="w-full cursor-pointer rounded-full bg-[var(--accent)] py-1.5 text-center text-[10px] font-bold text-white transition-all hover:opacity-90 sm:py-2.5 sm:text-xs"
                    >
                      Select Size
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
