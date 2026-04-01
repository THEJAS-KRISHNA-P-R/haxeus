"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { useTheme } from "@/components/ThemeProvider"
import { Product } from "@/types/supabase"
import { formatPrice } from "@/lib/currency"
import { getShimmerDataUrl } from "@/lib/image-placeholder"

interface ProductCardCompactProps {
  product: Product
}

export function ProductCardCompact({ product }: ProductCardCompactProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = !mounted ? true : theme === "dark"
  const primaryImage = product.front_image ?? "/placeholder.svg"
  const sortedImages = [...(product.product_images ?? [])].sort((a, b) => a.display_order - b.display_order)
  const secondaryImage =
    sortedImages.find((image) => image.image_url && image.image_url !== product.front_image)?.image_url ||
    product.back_image

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-[180px] flex-shrink-0 sm:w-44"
    >
      <Link href={`/products/${product.id}`} className="group block">
        <div
          className={`relative mb-2.5 aspect-square w-full overflow-hidden rounded-xl ${
            isDark ? "bg-white/[0.04]" : "bg-black/[0.04]"
          }`}
        >
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 180px, 176px"
            className={`object-cover transition-all duration-500 ${secondaryImage ? "group-hover:opacity-0 group-hover:scale-105" : "group-hover:scale-105"}`}
            loading="lazy"
            placeholder="blur"
            blurDataURL={getShimmerDataUrl(360, 360)}
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = "/placeholder.svg"
            }}
          />

          {secondaryImage && (
            <Image
              src={secondaryImage}
              alt={`${product.name} alternate view`}
              fill
              sizes="(max-width: 640px) 180px, 176px"
              className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              loading="lazy"
              placeholder="blur"
              blurDataURL={getShimmerDataUrl(360, 360)}
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = primaryImage
              }}
            />
          )}

          {!product.is_preorder && product.total_stock === 0 && (
            <div className="absolute inset-0 z-[5] flex items-center justify-center bg-black/60">
              <span className="rounded-full border border-white/20 bg-black/80 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white/70">
                Sold Out
              </span>
            </div>
          )}

          {product.is_preorder && product.preorder_status === "active" && (
            <span className="absolute left-1.5 top-1.5 rounded-full border border-[#eab308]/30 bg-[#eab308]/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#eab308]">
              Pre
            </span>
          )}
        </div>

        <p
          className={`truncate text-xs font-semibold leading-tight transition-colors sm:text-sm ${
            isDark ? "text-white group-hover:text-white/70" : "text-black group-hover:text-black/60"
          }`}
        >
          {product.name}
        </p>

        <p className="mt-0.5 text-xs font-bold text-theme-2 sm:text-sm">{formatPrice(product.price)}</p>
      </Link>
    </motion.div>
  )
}
