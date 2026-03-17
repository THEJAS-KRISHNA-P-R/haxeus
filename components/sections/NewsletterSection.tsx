"use client"

import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import type { NewsletterConfig } from "@/types/homepage"

const shadowMedium = { textShadow: "0 1px 12px rgba(0,0,0,0.65), 0 1px 4px rgba(0,0,0,0.45)" }

interface NewsletterSectionProps {
  config: NewsletterConfig
}

export function NewsletterSection({ config }: NewsletterSectionProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isDark = mounted && (theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches))

  return (
    <section className={`py-16 ${isDark ? 'bg-white/[0.03]' : 'bg-black/[0.02]'}`}>
      <div className="container mx-auto px-4 text-center">
        <motion.h3 
          className={`text-2xl lg:text-3xl font-semibold max-w-3xl mx-auto mb-4 ${isDark ? 'text-white' : 'text-black'}`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {config.heading}
        </motion.h3>
        <motion.p 
          className={`mb-8 ${isDark ? 'text-white/65' : 'text-black/65'}`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {config.subtext}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* This would be where the newsletter signup form component goes */}
          <button className="bg-[#e93a3a] hover:bg-[#ff4a4a] text-white font-bold rounded-full tracking-wide shadow-lg shadow-[#e93a3a]/20 px-8 py-3">
            {config.cta_text}
          </button>
        </motion.div>
      </div>
    </section>
  )
}
