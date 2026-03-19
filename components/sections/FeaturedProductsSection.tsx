"use client"

import { motion } from "framer-motion"
import { scrollReveal } from "@/lib/animations"
import { ProductCard } from "@/components/ui/ProductCard"
import type { FeaturedProductsConfig } from "@/types/homepage"
import type { Product } from "@/lib/supabase"
import { DEFAULT_HOMEPAGE_CONFIG } from "@/lib/homepage-defaults"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { hoverScale, tapScale } from "@/lib/animations"

interface FeaturedProductsSectionProps {
  config: FeaturedProductsConfig
  products: Product[]
  loading?: boolean
  isDark?: boolean
}

const accentColors = ["#e7bf04", "#c03c9d", "#07e4e1"]

export function FeaturedProductsSection({ 
  config, 
  products, 
  loading = false,
  isDark = true 
}: FeaturedProductsSectionProps) {
  const heading = config.heading ?? DEFAULT_HOMEPAGE_CONFIG.featured_products.heading
  const headingAccent = config.heading_accent ?? DEFAULT_HOMEPAGE_CONFIG.featured_products.heading_accent
  const subtext = config.subtext ?? DEFAULT_HOMEPAGE_CONFIG.featured_products.subtext

  return (
    <section className="relative min-h-screen flex items-center z-10 border-t border-theme">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={scrollReveal}
          className="text-center mb-16"
        >
          <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 ${isDark ? "text-white" : "text-black"}`}>
            {heading} <span style={{ color: "var(--accent)" }}>{headingAccent}</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto text-white/80">
            {subtext}
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[var(--bg-elevated)] rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-[var(--text)]/5" />
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-[var(--text)]/5 rounded w-3/4" />
                  <div className="h-8 bg-[var(--text)]/5 rounded w-1/2" />
                  <div className="h-12 bg-[var(--text)]/5 rounded-full w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-6"
            />
            <h3 className="text-3xl font-bold text-theme mb-4">Coming Soon!</h3>
            <p className="text-lg text-white/70 max-w-md mx-auto mb-8">
              We&apos;re working on bringing you amazing products. Stay tuned!
            </p>
            <Link href="/contact">
              <motion.div whileHover={hoverScale} whileTap={tapScale}>
                <Button className="bg-[var(--accent)] hover:opacity-90 text-white px-8 py-6 rounded-full text-lg font-semibold shadow-lg shadow-[var(--accent)]/20">
                  Get Notified
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 text-left">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product as any}
                index={index}
                accentColor={accentColors[index % 3]}
                variant="default"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
