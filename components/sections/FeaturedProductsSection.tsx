"use client"

import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import type { FeaturedProductsConfig } from "@/types/homepage"
import type { Product } from "@/lib/supabase"

interface FeaturedProductsSectionProps {
  config: FeaturedProductsConfig
  products: Product[]
}

export function FeaturedProductsSection({ config, products }: FeaturedProductsSectionProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isDark = mounted && (theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches))

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  }

  const desktopGridClass = config.count >= 6 ? "lg:grid-cols-3" : "lg:grid-cols-3"

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className={`text-4xl lg:text-5xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
            {config.heading} <span className="text-[#e93a3a]">{config.heading_accent}</span>
          </h2>
          <p className={`mt-4 text-lg ${isDark ? 'text-white/65' : 'text-black/65'} max-w-2xl mx-auto`}>
            {config.subtext}
          </p>
        </div>
        
        <motion.div
          className={`grid grid-cols-1 md:grid-cols-2 ${desktopGridClass} gap-8`}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {products.map(product => (
            <motion.div key={product.id} variants={itemVariants}>
              <Link href={`/products/${product.id}`} className="block group">
                <div className={`rounded-2xl overflow-hidden border ${isDark ? 'bg-white/[0.03] border-white/[0.07]' : 'bg-black/[0.02] border-black/[0.07]'}`}>
                  <div className="aspect-square overflow-hidden">
                    <Image
                      src={product.front_image || '/images/placeholder.png'}
                      alt={product.name}
                      width={500}
                      height={500}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-black'}`}>{product.name}</h3>
                    <p className="text-[#e93a3a] font-bold mt-1">₹{product.price}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
