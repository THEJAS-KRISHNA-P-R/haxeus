"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { useTheme } from "@/components/ThemeProvider"
import { useState, useEffect } from "react"
import type { Product } from "@/lib/supabase"
import { isSupabaseStorageUrl } from "@/lib/storage-utils"

interface ProductCardCompactProps {
  product: Product
  index?: number
}

export function ProductCardCompact({ product, index = 0 }: ProductCardCompactProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isDark = !mounted ? true : theme === "dark"

  const image = product.front_image ?? "/placeholder.svg"

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="flex-shrink-0 w-36 sm:w-44"
    >
      <Link href={`/products/${product.id}`} className="block group">

        {/* Image */}
        <div className={`relative w-full aspect-square rounded-xl overflow-hidden mb-2.5 ${
          isDark ? "bg-white/[0.04]" : "bg-black/[0.04]"
        }`}>
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 144px, 176px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized={isSupabaseStorageUrl(image)}
            onError={(e) => {
              const t = e.target as HTMLImageElement
              t.src = "/placeholder.svg"
            }}
          />

          {/* Preorder badge — only if preorder */}
          {product.is_preorder && product.preorder_status === "active" && (
            <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#eab308]/20 text-[#eab308] border border-[#eab308]/30">
              Pre
            </span>
          )}
        </div>

        {/* Name */}
        <p className={`text-xs sm:text-sm font-semibold leading-tight truncate transition-colors ${
          isDark
            ? "text-white group-hover:text-white/70"
            : "text-black group-hover:text-black/60"
        }`}>
          {product.name}
        </p>

        {/* Price */}
        <p className="text-xs sm:text-sm font-bold text-theme-2 mt-0.5">
          ₹{product.price.toLocaleString("en-IN")}
        </p>

      </Link>
    </motion.div>
  )
}
