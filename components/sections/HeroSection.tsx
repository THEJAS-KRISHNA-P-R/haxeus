"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import type { HeroConfig } from "@/types/homepage"

const shadowStrong = { textShadow: "0 2px 16px rgba(0,0,0,0.75), 0 1px 6px rgba(0,0,0,0.55)" }
const shadowMedium = { textShadow: "0 1px 12px rgba(0,0,0,0.65), 0 1px 4px rgba(0,0,0,0.45)" }

interface HeroSectionProps {
  config: HeroConfig
}

export function HeroSection({ config }: HeroSectionProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isDark = mounted && (theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches))

  const HeroImage = () => (
    <motion.div 
      className="relative w-full max-w-lg mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <Image
        src={config.hero_product_image_url}
        alt="Hero Product"
        width={800}
        height={800}
        className="rounded-2xl object-cover"
        priority
      />
    </motion.div>
  )

  return (
    <section className="relative w-full text-center py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <motion.h1 
          className="text-5xl md:text-7xl font-bold tracking-tighter mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span className="block text-white" style={shadowStrong}>{config.line1}</span>
          <span className="block text-[#e93a3a]" style={shadowStrong}>{config.line2}</span>
          <span className="block text-white/70" style={shadowStrong}>{config.line3}</span>
        </motion.h1>
        <motion.p 
          className="max-w-2xl mx-auto text-lg text-white/80 mb-10"
          style={shadowMedium}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          {config.subtext}
        </motion.p>
        
        <motion.div 
          className="flex justify-center items-center gap-4 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
        >
          <Link href={config.cta_primary.href} className="bg-[#e93a3a] hover:bg-[#ff4a4a] text-white font-bold rounded-full tracking-wide shadow-lg shadow-[#e93a3a]/20 px-8 py-3 text-lg">
            {config.cta_primary.text}
          </Link>
          <Link href={config.cta_secondary.href} className="border border-white/[0.12] text-white/70 hover:text-white rounded-full px-8 py-3 text-lg">
            {config.cta_secondary.text}
          </Link>
        </motion.div>

        {config.hero_product_id ? (
          <Link href={`/products/${config.hero_product_id}`}>
            <HeroImage />
          </Link>
        ) : (
          <HeroImage />
        )}

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {config.stats.map((stat, i) => (
            <motion.div 
              key={i} 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.15, duration: 0.5 }}
            >
              <p className="text-4xl font-bold" style={{ color: stat.color, ...shadowStrong }}>{stat.value}</p>
              <p className="text-white/70" style={shadowMedium}>{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
