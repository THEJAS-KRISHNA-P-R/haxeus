"use client"

import { motion } from "framer-motion"
import { scrollReveal } from "@/lib/animations"
import { ProductCard } from "@/components/ui/ProductCard"
import type { PreorderSectionConfig } from "@/types/homepage"
import { Product } from "@/types/supabase"

interface PreorderSectionProps {
  config: PreorderSectionConfig
  products: Product[]
  isDark?: boolean
  onPreorderClick: (product: Product) => void
}

const accentColors = ["#e7bf04", "#c03c9d", "#07e4e1"]

export function PreorderSection({ 
  config, 
  products, 
  isDark = true,
  onPreorderClick
}: PreorderSectionProps) {
  if (products.length === 0) return null

  return (
    <section className="relative min-h-screen flex items-center z-10 border-t border-theme">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={scrollReveal}
          className="mb-16"
        >
          <div className="text-xs tracking-[0.25em] font-medium uppercase text-[var(--accent)] mb-2">COMING SOON</div>
          <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 ${isDark ? "text-white" : "text-black"}`}>
            {config.heading}
          </h2>
          <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto text-white/80">
            {config.subtext}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              accentColor={accentColors[index % 3]}
              variant="preorder"
              onPreorderClick={onPreorderClick}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
