"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { ShimmerButton } from "@/components/ui/ShimmerButton"
import { ShinyButton } from "@/components/ui/shiny-button"
import { cn } from "@/lib/utils"
import { staggerContainer, staggerFast, scaleIn } from "@/lib/animations"
import SplitText from "@/components/ui/SplitText"
import ShinyText from "@/components/ui/ShinyText"
import type { HeroConfig } from "@/types/homepage"
import { DEFAULT_HOMEPAGE_CONFIG } from "@/lib/homepage-defaults"
import type { ActiveDrop } from "@/types/drops"
import { useTheme } from "@/components/ThemeProvider"
import { DropCountdown } from "../DropCountdown"
import { TrustSignals } from "@/components/TrustSignals"

interface HeroSectionProps {
  config: HeroConfig
  activeDrop: ActiveDrop | null
}

export function HeroSection({ config, activeDrop }: HeroSectionProps) {
  const prefersReducedMotion = useReducedMotion()
  const { theme } = useTheme()
  const [heroLine1Done, setHeroLine1Done] = useState(false)
  const [heroLine2Done, setHeroLine2Done] = useState(false)
  const [heroLine3Done, setHeroLine3Done] = useState(false)

  const isDark = theme === "dark" || !theme
  const shinyColor = isDark ? "#ffffff" : "#211013"
  const shinySubtleColor = isDark ? "rgba(255,255,255,0.8)" : "rgba(33, 16, 19, 0.8)"

  // On mobile, the bg image has a dark scrim — always use white for text/shiny
  const [isMobileHero, setIsMobileHero] = useState(false)
  useEffect(() => {
    const check = () => setIsMobileHero(window.innerWidth < 1024)
    check()
    window.addEventListener("resize", check, { passive: true })
    return () => window.removeEventListener("resize", check)
  }, [])

  const mobileShinyColor = "#ffffffff"
  const mobileShinySubtle = "rgba(255,255,255,0.85)"
  const activeShinyColor = isMobileHero ? mobileShinyColor : shinyColor
  const activeShinySubtle = isMobileHero ? mobileShinySubtle : shinySubtleColor

  const line1 = config.line1 ?? DEFAULT_HOMEPAGE_CONFIG.hero.line1
  const line2 = config.line2 ?? DEFAULT_HOMEPAGE_CONFIG.hero.line2
  const line3 = config.line3 ?? DEFAULT_HOMEPAGE_CONFIG.hero.line3

  const heroImageUrl = (config.hero_product_image_url ?? DEFAULT_HOMEPAGE_CONFIG.hero.hero_product_image_url) || "/placeholder.svg"

  return (
    <section className="relative h-[100svh] lg:min-h-screen lg:h-auto overflow-hidden lg:overflow-visible flex items-start lg:items-center z-10 w-full">

      {/* ── Mobile-only full-bleed background image ─────────── */}
      <div
        className="absolute inset-0 lg:hidden"
        style={{
          backgroundImage: `url(${heroImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
        }}
      >
        {/* Dark scrim so text is always readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-24 pt-28 lg:py-20 lg:pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

          {/* ── Text Column ─────────────────────────────────── */}
          <motion.div
            initial={prefersReducedMotion ? false : "hidden"}
            animate="visible"
            variants={staggerContainer}
            layout="position"
            className="space-y-6 sm:space-y-8"
          >
            <div>
              <div className="relative py-4 overflow-visible">
                <h1
                  className="font-hero font-bold uppercase"
                  style={{
                    fontKerning: "none",
                    fontVariantLigatures: "none",
                    lineHeight: 0.92,
                    /* viewport-relative: big on phone, capped on desktop */
                    fontSize: "clamp(3.25rem, 13vw, 5.5rem)",
                  }}
                >
                  {/* Line 1 */}
                  <span className="relative grid items-start overflow-visible whitespace-nowrap tracking-tight">
                    <span className="block text-white lg:text-theme pointer-events-none select-none invisible col-start-1 row-start-1" aria-hidden="true">{line1}</span>
                    <motion.span
                      className="col-start-1 row-start-1 block"
                      animate={{ opacity: heroLine1Done || prefersReducedMotion ? 0 : 1 }}
                      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
                    >
                      {prefersReducedMotion
                        ? <span className="block text-white lg:text-theme" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.9)" }}>{line1}</span>
                        : <SplitText text={line1} tag="span" className="block text-white lg:text-theme" splitType="chars" delay={65} duration={2.4} from={{ opacity: 0, y: 20 }} to={{ opacity: 1, y: 0 }} threshold={0} rootMargin="0px" textAlign="left" onLetterAnimationComplete={() => setHeroLine1Done(true)} />
                      }
                    </motion.span>
                    <motion.span
                      className="col-start-1 row-start-1 block"
                      animate={{ opacity: heroLine1Done && !prefersReducedMotion ? 1 : 0 }}
                      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
                    >
                      <ShinyText text={line1} className="block" display="block" baseVisible={false} disabled={!heroLine1Done} color={activeShinyColor} shineColor="#ffc4c4ff" speed={6} spread={60} delay={1} />
                    </motion.span>
                  </span>

                  {/* Line 2 — italic red gut-punch */}
                  <span
                    className="relative grid items-start overflow-visible whitespace-nowrap drop-shadow-[0_4px_18px_rgba(233,58,58,0.4)]"
                    style={{ fontWeight: 800, fontStyle: "italic", letterSpacing: "-0.01em" }}
                  >
                    <span className="block text-[#ef3939] pointer-events-none select-none invisible col-start-1 row-start-1" aria-hidden="true">{line2}</span>
                    <motion.span
                      className="col-start-1 row-start-1 block"
                      animate={{ opacity: heroLine2Done || prefersReducedMotion ? 0 : 1 }}
                      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
                    >
                      {prefersReducedMotion
                        ? <span className="block text-[#ef3939]">{line2}</span>
                        : <SplitText text={line2} tag="span" className="block text-[#ef3939]" splitType="chars" delay={65} duration={2.4} from={{ opacity: 0, y: 20 }} to={{ opacity: 1, y: 0 }} threshold={0} rootMargin="0px" textAlign="left" onLetterAnimationComplete={() => setHeroLine2Done(true)} />
                      }
                    </motion.span>
                    <motion.span
                      className="col-start-1 row-start-1 block"
                      animate={{ opacity: heroLine2Done && !prefersReducedMotion ? 1 : 0 }}
                      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
                    >
                      <ShinyText text={line2} className="block" display="block" baseVisible={false} disabled={!heroLine2Done} color="#ef3939" shineColor="#f86666" speed={6} spread={60} delay={1} />
                    </motion.span>
                  </span>

                  {/* Line 3 */}
                  <span className="relative grid items-start overflow-visible whitespace-nowrap tracking-tight drop-shadow-[0_2px_10px_rgba(233,58,58,0.2)]">
                    <span className="block text-white lg:text-theme-2 pointer-events-none select-none invisible col-start-1 row-start-1" aria-hidden="true">{line3}</span>
                    <motion.span
                      className="col-start-1 row-start-1 block"
                      animate={{ opacity: heroLine3Done || prefersReducedMotion ? 0 : 1 }}
                      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
                    >
                      {prefersReducedMotion
                        ? <span className="block text-white lg:text-theme-2">{line3}</span>
                        : <SplitText text={line3} tag="span" className="block text-white lg:text-theme-2" splitType="chars" delay={65} duration={2.4} from={{ opacity: 0, y: 20 }} to={{ opacity: 1, y: 0 }} threshold={0} rootMargin="0px" textAlign="left" onLetterAnimationComplete={() => setHeroLine3Done(true)} />
                      }
                    </motion.span>
                    <motion.span
                      className="col-start-1 row-start-1 block"
                      animate={{ opacity: heroLine3Done && !prefersReducedMotion ? 1 : 0 }}
                      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
                    >
                      <ShinyText text={line3} className="block" display="block" baseVisible={false} disabled={!heroLine3Done} color={activeShinySubtle} shineColor="#ffbcbc" speed={6} spread={60} delay={1} />
                    </motion.span>
                  </span>
                </h1>
              </div>

              {/* Subtext — visible on mobile too */}
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.8, duration: 0.5 }}
                layout="position"
              >
                <p className="text-sm mt-4 leading-relaxed max-w-lg text-white/80 lg:text-theme-2 lg:text-base lg:sm:text-lg">
                  {config.subtext ?? DEFAULT_HOMEPAGE_CONFIG.hero.subtext}
                </p>
              </motion.div>
            </div>

            {/* CTAs */}
            <motion.div
              className="flex gap-3 flex-col items-start lg:flex-row lg:items-center lg:flex-wrap"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.9, duration: 0.5 }}
            >
              <Link href={config.cta_primary?.href ?? DEFAULT_HOMEPAGE_CONFIG.hero.cta_primary.href}>
                {/* Mobile Primary CTA */}
                <ShinyButton
                  highlight="#ffc6c6ff"
                  highlightSubtle="#ef3939"
                  className="inline-flex lg:hidden h-[52px] px-8 [--bg-inverse:#ffffff] [--text-inverse:#100a0b] shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                >
                  {config.cta_primary?.text ?? DEFAULT_HOMEPAGE_CONFIG.hero.cta_primary.text}
                </ShinyButton>
                {/* Desktop Primary CTA */}
                <ShinyButton
                  highlight={isDark ? "#ffc6c6ff" : "#000000"}
                  highlightSubtle="#ef3939"
                  className={cn(
                    "hidden lg:inline-flex h-[52px] px-7",
                    isDark ? "[--bg-inverse:#ffffff] [--text-inverse:#100a0b]" : "[--bg-inverse:#0f0a0a] [--text-inverse:#ffffff]"
                  )}
                >
                  {config.cta_primary?.text ?? DEFAULT_HOMEPAGE_CONFIG.hero.cta_primary.text}
                </ShinyButton>
              </Link>
              <Link href={config.cta_secondary?.href ?? DEFAULT_HOMEPAGE_CONFIG.hero.cta_secondary.href}>
                <ShimmerButton
                  background="rgba(0, 0, 0, 1)"
                  borderRadius="100px"
                  shimmerColor="#ffffff"
                  shimmerDuration="2s"
                  className="h-[52px] px-8 font-bold text-sm tracking-widest uppercase hover:opacity-80 transition-colors duration-300 text-white lg:hidden"
                >
                  {config.cta_secondary?.text ?? DEFAULT_HOMEPAGE_CONFIG.hero.cta_secondary.text}
                </ShimmerButton>
                <ShimmerButton
                  background={isDark ? "var(--brand-bg-dark)" : "rgba(255,255,255,1)"}
                  borderRadius="100px"
                  shimmerColor={isDark ? "#ffffffff" : "#000000"}
                  shimmerDuration="2.5s"
                  className={cn(
                    "hidden lg:flex h-[52px] px-7 border-theme-hover font-bold text-sm tracking-widest uppercase hover:opacity-80 transition-colors duration-300",
                    isDark ? "text-white" : "text-black"
                  )}
                >
                  {config.cta_secondary?.text ?? DEFAULT_HOMEPAGE_CONFIG.hero.cta_secondary.text}
                </ShimmerButton>
              </Link>
            </motion.div>

            {activeDrop && (
              <DropCountdown targetDate={new Date(activeDrop.target_date)} dropName={activeDrop.name} />
            )}

            {/* Stats — hidden on mobile (image is bg, no room) */}
            <motion.div
              variants={staggerFast}
              initial={prefersReducedMotion ? false : "hidden"}
              animate="visible"
              layout="position"
              className="hidden lg:grid grid-cols-3 gap-3 sm:gap-6 md:gap-8 pt-2"
            >
              {[...(config.stats ?? DEFAULT_HOMEPAGE_CONFIG.hero.stats)].map((stat, index) => (
                <motion.div
                  key={index}
                  variants={scaleIn}
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.1, y: -5 }}
                  className="cursor-default"
                >
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="text-[10px] sm:text-sm mt-1 text-theme-3">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── Product Showcase — desktop only ──────────────── */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            layout="position"
            className="relative hidden lg:block"
          >
            <motion.div
              className="bg-card/60 backdrop-blur-sm rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-theme"
              whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4 }}
            >
              <Image
                src={heroImageUrl}
                alt="Featured T-shirt"
                width={500}
                height={500}
                priority
                className="mx-auto rounded-xl w-full h-full object-cover"
                style={{ width: "auto", height: "auto" }}
                onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg" }}
              />

              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.5, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.8, type: "spring", stiffness: 200 }}
                whileHover={prefersReducedMotion ? undefined : { scale: 1.1, rotate: 5 }}
                className="absolute top-4 right-4 bg-black/80 backdrop-blur-md rounded-2xl px-4 py-3"
              >
                <div className="text-xs font-medium" style={{ color: config.badge_top.color ?? "#e7bf04" }}>
                  {config.badge_top.label ?? DEFAULT_HOMEPAGE_CONFIG.hero.badge_top.label}
                </div>
                <div className="text-sm font-bold text-white">
                  {config.badge_top?.value ?? DEFAULT_HOMEPAGE_CONFIG.hero.badge_top.value}
                </div>
              </motion.div>

              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.5, rotate: 10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { delay: 1, type: "spring", stiffness: 200 }}
                whileHover={prefersReducedMotion ? undefined : { scale: 1.1, rotate: -5 }}
                className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md rounded-2xl px-4 py-3"
              >
                <div className="text-xs font-medium" style={{ color: config.badge_bottom.color ?? "#07e4e1" }}>
                  {config.badge_bottom.label ?? DEFAULT_HOMEPAGE_CONFIG.hero.badge_bottom.label}
                </div>
                <div className="text-sm font-bold text-white">
                  {config.badge_bottom?.value ?? DEFAULT_HOMEPAGE_CONFIG.hero.badge_bottom.value}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

        </div>
      </div>

      {/* Mobile-only Trust Signals tightly attached to the absolute bottom of the viewport */}
      <div className="absolute bottom-20 left-0 right-0 w-full overflow-hidden lg:hidden z-20 pointer-events-none pb-4 translate-y-1/2">
        <TrustSignals />
      </div>
    </section>
  )
}
