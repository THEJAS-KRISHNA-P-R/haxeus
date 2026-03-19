"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react"
import { useTheme } from "@/components/ThemeProvider"
import { useProductHistory } from "@/lib/stores/product-history"
import { ProductCardCompact } from "@/components/ui/ProductCardCompact"

interface RecentlyViewedProps {
  currentProductId: number   // exclude current product from the list
}

export function RecentlyViewed({ currentProductId }: RecentlyViewedProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isDark = !mounted ? true : theme === "dark"

  const { recentlyViewed, clearHistory } = useProductHistory()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Exclude current product
  const items = recentlyViewed.filter(p => p.id !== currentProductId)

  // Don't render until mounted (Zustand persist hydrates after mount)
  if (!mounted || items.length === 0) return null

  function scroll(dir: "left" | "right") {
    if (!scrollRef.current) return
    const amount = scrollRef.current.clientWidth * 0.75
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" })
  }

  return (
    <section className="relative py-16 border-t border-white/[0.05] dark:border-white/[0.05] border-black/[0.05]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs tracking-[0.25em] font-medium uppercase text-[#07e4e1] mb-1">
              Your History
            </p>
            <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>
              Recently Viewed
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Clear history */}
            <button
              onClick={clearHistory}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                isDark
                  ? "text-white/30 hover:text-white/60 hover:bg-white/[0.04]"
                  : "text-black/30 hover:text-black/60 hover:bg-black/[0.04]"
              }`}
            >
              <Trash2 size={13} />
              Clear
            </button>

            {/* Scroll arrows */}
            {items.length > 3 && (
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
        </div>

        {/* Scroll container */}
        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 scroll-smooth hide-scrollbar"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {items.map((product, index) => (
            <ProductCardCompact key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
