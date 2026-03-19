"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useTheme } from "@/components/ThemeProvider"
import { ProductCardCompact } from "@/components/ui/ProductCardCompact"
import { useRelatedProducts } from "@/hooks/useProductQueries"
import type { Product } from "@/lib/supabase"

interface RelatedProductsProps {
  productId: number
  category: string | null
}

export function RelatedProducts({ productId, category }: RelatedProductsProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isDark = !mounted ? true : theme === "dark"

  const { data: rawRelated = [], isLoading: loading } = useRelatedProducts(productId.toString(), category || "Streetwear")
  const products = rawRelated as Product[]
  const scrollRef = useRef<HTMLDivElement>(null)


  function scroll(dir: "left" | "right") {
    if (!scrollRef.current) return
    const amount = scrollRef.current.clientWidth * 0.75
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" })
  }

  if (!loading && products.length === 0) return null

  return (
    <section className="relative py-16 border-t border-white/[0.05] dark:border-white/[0.05] border-black/[0.05]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs tracking-[0.25em] font-medium uppercase text-[#e7bf04] mb-1">
              You Might Also Like
            </p>
            <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>
              {category
                ? `More ${category.charAt(0).toUpperCase() + category.slice(1)}s`
                : "Related Products"}
            </h2>
          </div>

          {/* Scroll arrows */}
          {products.length > 3 && (
            <div className="flex gap-2">
              <button
                onClick={() => scroll("left")}
                className={`p-2.5 rounded-full border transition-colors ${
                  isDark
                    ? "border-white/[0.10] text-white/50 hover:text-white hover:border-white/[0.25]"
                    : "border-black/[0.10] text-black/50 hover:text-black hover:border-black/[0.25]"
                }`}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => scroll("right")}
                className={`p-2.5 rounded-full border transition-colors ${
                  isDark
                    ? "border-white/[0.10] text-white/50 hover:text-white hover:border-white/[0.25]"
                    : "border-black/[0.10] text-black/50 hover:text-black hover:border-black/[0.25]"
                }`}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Scroll container */}
        {loading ? (
          // Skeleton
          <div className="flex gap-3 sm:gap-4 overflow-hidden">
            {[1,2,3,4,5].map(i => (
              <div
                key={i}
                className={`flex-shrink-0 w-36 sm:w-44 rounded-xl animate-pulse ${
                  isDark ? "bg-white/[0.04]" : "bg-black/[0.04]"
                }`}
                style={{ height: 220 }}
              />
            ))}
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 scroll-smooth hide-scrollbar"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {products.map((product, index) => (
              <ProductCardCompact key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
