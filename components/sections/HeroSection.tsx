"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { motion } from "framer-motion"
import { ShimmerButton } from "@/components/ui/ShimmerButton"
import { ShinyButton } from "@/components/ui/shiny-button"
import { 
  staggerContainer, 
  staggerFast, 
  scaleIn 
} from "@/lib/animations"
import SplitText from "@/components/ui/SplitText"
import ShinyText from "@/components/ui/ShinyText"
import type { HeroConfig } from "@/types/homepage"
import { DEFAULT_HOMEPAGE_CONFIG } from "@/lib/homepage-defaults"

interface HeroSectionProps {
  config: HeroConfig
}

export function HeroSection({ config }: HeroSectionProps) {
  const [heroLine1Done, setHeroLine1Done] = useState(false)
  const [heroLine2Done, setHeroLine2Done] = useState(false)
  const [heroLine3Done, setHeroLine3Done] = useState(false)

  const line1 = config.line1 ?? DEFAULT_HOMEPAGE_CONFIG.hero.line1
  const line2 = config.line2 ?? DEFAULT_HOMEPAGE_CONFIG.hero.line2
  const line3 = config.line3 ?? DEFAULT_HOMEPAGE_CONFIG.hero.line3

  return (
    <section className="relative min-h-screen flex items-center z-10">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">
          {/* Hero Text */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-8"
          >
            <div>
              <div className="relative py-10 overflow-visible">
                <h1
                  className="text-5xl sm:text-6xl md:text-7xl lg:text-7xl font-semibold leading-[1.15] tracking-tight"
                  style={{ fontKerning: 'none', fontVariantLigatures: 'none' }}
                >
                  {/* Line 1 */}
                  <span className="relative block drop-shadow-[0_1px_8px_rgba(255,255,255,0.08)]">
                    <span className="block text-white pointer-events-none select-none" style={{ opacity: 0 }} aria-hidden="true">{line1}</span>
                    <motion.span
                      className="absolute inset-0 block"
                      animate={{ opacity: heroLine1Done ? 0 : 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <SplitText
                        text={line1}
                        tag="span"
                        className="block text-white"
                        splitType="chars"
                        delay={65}
                        duration={2.4}
                        from={{ opacity: 0, y: 20 }}
                        to={{ opacity: 1, y: 0 }}
                        threshold={0}
                        rootMargin="0px"
                        textAlign="left"
                        onLetterAnimationComplete={() => setHeroLine1Done(true)}
                      />
                    </motion.span>
                    <motion.span
                      className="absolute inset-0 block"
                      animate={{ opacity: heroLine1Done ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ShinyText
                        text={line1}
                        className="block"
                        display="block"
                        baseVisible={false}
                        disabled={!heroLine1Done}
                        color="#ffffff"
                        shineColor="#ffc0c0"
                        speed={6}
                        spread={60}
                        delay={1}
                      />
                    </motion.span>
                  </span>

                  {/* Line 2 */}
                  <span className="relative block drop-shadow-[0_4px_18px_rgba(233,58,58,0.4)]">
                    <span className="block text-[var(--accent)] pointer-events-none select-none" style={{ opacity: 0 }} aria-hidden="true">{line2}</span>
                    <motion.span
                      className="absolute inset-0 block"
                      animate={{ opacity: heroLine2Done ? 0 : 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <SplitText
                        text={line2}
                        tag="span"
                        className="block text-[var(--accent)]"
                        splitType="chars"
                        delay={65}
                        duration={2.4}
                        from={{ opacity: 0, y: 20 }}
                        to={{ opacity: 1, y: 0 }}
                        threshold={0}
                        rootMargin="0px"
                        textAlign="left"
                        onLetterAnimationComplete={() => setHeroLine2Done(true)}
                      />
                    </motion.span>
                    <motion.span
                      className="absolute inset-0 block"
                      animate={{ opacity: heroLine2Done ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ShinyText
                        text={line2}
                        className="block"
                        display="block"
                        baseVisible={false}
                        disabled={!heroLine2Done}
                        color="#e93e3a"
                        shineColor="#f86666"
                        speed={6}
                        spread={60}
                        delay={1}
                      />
                    </motion.span>
                  </span>

                  {/* Line 3 */}
                  <span className="relative block drop-shadow-[0_2px_10px_rgba(233,58,58,0.2)]">
                    <span className="block text-white/80 pointer-events-none select-none" style={{ opacity: 0 }} aria-hidden="true">{line3}</span>
                    <motion.span
                      className="absolute inset-0 block"
                      animate={{ opacity: heroLine3Done ? 0 : 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <SplitText
                        text={line3}
                        tag="span"
                        className="block text-white/80"
                        splitType="chars"
                        delay={65}
                        duration={2.4}
                        from={{ opacity: 0, y: 20 }}
                        to={{ opacity: 1, y: 0 }}
                        threshold={0}
                        rootMargin="0px"
                        textAlign="left"
                        onLetterAnimationComplete={() => setHeroLine3Done(true)}
                      />
                    </motion.span>
                    <motion.span
                      className="absolute inset-0 block"
                      animate={{ opacity: heroLine3Done ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ShinyText
                        text={line3}
                        className="block"
                        display="block"
                        baseVisible={false}
                        disabled={!heroLine3Done}
                        color="rgba(255,255,255,0.8)"
                        shineColor="#ffbcbc"
                        speed={6}
                        spread={60}
                        delay={1}
                      />
                    </motion.span>
                  </span>
                </h1>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <p className="text-lg mt-4 leading-relaxed max-w-lg text-white/80">
                  {config.subtext ?? DEFAULT_HOMEPAGE_CONFIG.hero.subtext}
                </p>
              </motion.div>
            </div>

            <div className="flex gap-4 flex-wrap mt-2">
              <Link href={config.cta_primary?.href ?? DEFAULT_HOMEPAGE_CONFIG.hero.cta_primary.href}>
                <ShinyButton
                  highlight="#000000ff"
                  highlightSubtle="#ff0000ff"
                  className="h-[52px] px-7"
                >
                  {config.cta_primary?.text ?? DEFAULT_HOMEPAGE_CONFIG.hero.cta_primary.text}
                </ShinyButton>
              </Link>
              <Link href={config.cta_secondary?.href ?? DEFAULT_HOMEPAGE_CONFIG.hero.cta_secondary.href}>
                <ShimmerButton
                  background="rgba(0, 0, 0, 1)"
                  borderRadius="100px"
                  shimmerColor="#ffffffff"
                  shimmerDuration="2.5s"
                  className="h-[52px] px-7 border-white/[0.08] text-red-600/90 font-bold text-sm tracking-widest uppercase hover:text-white"
                >
                  {config.cta_secondary?.text ?? DEFAULT_HOMEPAGE_CONFIG.hero.cta_secondary.text}
                </ShimmerButton>
              </Link>
            </div>

            {/* Stats with accent colors */}
            <motion.div
              variants={staggerFast}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-3 gap-3 sm:gap-6 md:gap-8 pt-6 sm:pt-8"
            >
              {[...(config.stats ?? DEFAULT_HOMEPAGE_CONFIG.hero.stats)].map((stat, index) => (
                <motion.div
                  key={index}
                  variants={scaleIn}
                  whileHover={{ scale: 1.1, y: -5 }}
                  className="cursor-default"
                >
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="text-xs sm:text-sm mt-1 text-white/70">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Product Showcase */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <motion.div
              className="bg-card/60 backdrop-blur-sm rounded-3xl p-8 relative overflow-hidden border border-theme"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.4 }}
            >
              <Image
                src={(config.hero_product_image_url ?? DEFAULT_HOMEPAGE_CONFIG.hero.hero_product_image_url) || "/placeholder.svg"}
                alt="Featured T-shirt"
                width={500}
                height={500}
                priority
                className="mx-auto rounded-xl w-full h-full object-cover"
                style={{ width: 'auto', height: 'auto' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg"
                }}
              />

              {/* Floating Badges with accent colors */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="absolute top-4 right-4 bg-black/80 backdrop-blur-md rounded-2xl px-4 py-3"
              >
                <div className="text-xs font-medium" style={{ color: config.badge_top.color ?? "#e7bf04" }}>
                  {config.badge_top.label ?? DEFAULT_HOMEPAGE_CONFIG.hero.badge_top.label}
                </div>
                <div className="text-sm font-bold text-white">{config.badge_top?.value ?? DEFAULT_HOMEPAGE_CONFIG.hero.badge_top.value}</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.5, rotate: 10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 1, type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.1, rotate: -5 }}
                className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md rounded-2xl px-4 py-3"
              >
                <div className="text-xs font-medium" style={{ color: config.badge_bottom.color ?? "#07e4e1" }}>
                  {config.badge_bottom.label ?? DEFAULT_HOMEPAGE_CONFIG.hero.badge_bottom.label}
                </div>
                <div className="text-sm font-bold text-white">{config.badge_bottom?.value ?? DEFAULT_HOMEPAGE_CONFIG.hero.badge_bottom.value}</div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
