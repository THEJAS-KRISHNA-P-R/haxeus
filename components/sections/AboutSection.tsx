"use client"

import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import type { AboutConfig } from "@/types/homepage"

interface AboutSectionProps {
  config: AboutConfig
}

export function AboutSection({ config }: AboutSectionProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isDark = mounted && (theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches))

  return (
    <section className={`py-24 ${isDark ? 'bg-white/[0.03]' : 'bg-black/[0.02]'}`}>
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className={`text-4xl lg:text-5xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
              {config.heading} <span style={{color: config.heading_accent}}>{config.heading_accent}</span> {config.heading_suffix}
            </h2>
            <p className={`mt-6 text-lg ${isDark ? 'text-white/65' : 'text-black/65'}`}>
              {config.body1}
            </p>
            <p className={`mt-4 text-lg ${isDark ? 'text-white/65' : 'text-black/65'}`}>
              {config.body2}
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {config.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{backgroundColor: feature.color}}></div>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>{feature.label}</span>
                </div>
              ))}
            </div>
            <Link href={config.cta_href} className="mt-10 inline-block bg-[#e93a3a] hover:bg-[#ff4a4a] text-white font-bold rounded-full tracking-wide shadow-lg shadow-[#e93a3a]/20 px-8 py-3">
              {config.cta_text}
            </Link>
          </motion.div>
          <motion.div
            className="relative aspect-[4/5] rounded-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Image
              src={config.image_url}
              alt="About HAXEUS"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
