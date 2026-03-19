"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { staggerContainer, fadeInRight, hoverScale, tapScale } from "@/lib/animations"
import type { AboutConfig } from "@/types/homepage"
import { DEFAULT_HOMEPAGE_CONFIG } from "@/lib/homepage-defaults"

interface AboutSectionProps {
  config: AboutConfig
  isDark?: boolean
}

export function AboutSection({ config, isDark = true }: AboutSectionProps) {
  const imageUrl = config.image_url ?? DEFAULT_HOMEPAGE_CONFIG.about.image_url
  const heading = config.heading ?? DEFAULT_HOMEPAGE_CONFIG.about.heading
  const headingAccent = config.heading_accent ?? DEFAULT_HOMEPAGE_CONFIG.about.heading_accent
  const headingSuffix = config.heading_suffix ?? DEFAULT_HOMEPAGE_CONFIG.about.heading_suffix
  const body1 = config.body1 ?? DEFAULT_HOMEPAGE_CONFIG.about.body1
  const body2 = config.body2 ?? DEFAULT_HOMEPAGE_CONFIG.about.body2
  const features = config.features ?? DEFAULT_HOMEPAGE_CONFIG.about.features
  const ctaText = config.cta_text ?? DEFAULT_HOMEPAGE_CONFIG.about.cta_text
  const ctaHref = config.cta_href ?? DEFAULT_HOMEPAGE_CONFIG.about.cta_href

  return (
    <section className="relative z-10 border-t border-theme">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative h-64 sm:h-80 lg:h-[500px]"
          >
            <motion.div
              whileHover={{ scale: 1.05, rotate: 1 }}
              transition={{ duration: 0.4 }}
              className="relative h-full"
            >
              <Image
                src={imageUrl}
                alt="HAXEUS Quality"
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover rounded-2xl"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg?height=400&width=600&text=About+HAXEUS"
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#e7bf04] via-[#c03c9d] to-[#07e4e1]" />
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInRight}>
              <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 break-words ${isDark ? "text-white" : "text-black"}`}>
                {heading} <span style={{ color: "var(--accent)" }}>{headingAccent}</span> {headingSuffix}
              </h2>
            </motion.div>
            <motion.div variants={fadeInRight}>
              <p className="mb-6 leading-relaxed text-lg text-white/80">
                {body1}
              </p>
            </motion.div>
            <motion.div variants={fadeInRight}>
              <p className="mb-8 leading-relaxed text-lg text-white/80">
                {body2}
              </p>
            </motion.div>

            <motion.div variants={fadeInRight} className="grid grid-cols-2 gap-6 mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-center"
                  whileHover={{ x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className="w-3 h-3 rounded-full mr-3 flex-shrink-0"
                    style={{ backgroundColor: feature.color }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                  />
                  <span className="font-semibold text-white/80">{feature.label}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeInRight}>
              <Link href={ctaHref}>
                <motion.div whileHover={hoverScale} whileTap={tapScale}>
                  <Button className="bg-[var(--accent)] hover:opacity-90 text-white px-10 py-6 rounded-full text-lg font-semibold shadow-lg shadow-[var(--accent)]/20 transition-all duration-300">
                    {ctaText}
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
