"use client"

import { useRef } from "react"
import {
  motion,
  useTransform,
  useSpring,
  useReducedMotion,
  useMotionValue,
  useAnimationFrame,
  type MotionValue,
} from "framer-motion"
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

// ─── Shared text column ────────────────────────────────────────────────────────

interface TextColumnProps {
  heading: string
  headingAccent: string
  headingSuffix: string
  body1: string
  body2: string
  features: { label: string; color: string }[]
  ctaText: string
  ctaHref: string
  isDark: boolean
  opacity: number | MotionValue<number>
}

function TextColumn({
  heading,
  headingAccent,
  headingSuffix,
  body1,
  body2,
  features,
  ctaText,
  ctaHref,
  isDark,
  opacity,
}: TextColumnProps) {
  return (
    <motion.div
      style={{ opacity }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={staggerContainer}
    >
      <motion.div variants={fadeInRight}>
        <h2 className={`text-2xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 break-words ${isDark ? "text-white" : "text-black"}`}>
          {heading} <span style={{ color: "var(--accent)" }}>{headingAccent}</span> {headingSuffix}
        </h2>
      </motion.div>
      <motion.div variants={fadeInRight}>
        <p className={`mb-4 sm:mb-6 leading-relaxed text-base sm:text-lg ${isDark ? "text-white/90" : "text-black/90"}`}>
          {body1}
        </p>
      </motion.div>
      <motion.div variants={fadeInRight}>
        <p className={`mb-6 sm:mb-8 leading-relaxed text-base sm:text-lg ${isDark ? "text-white/90" : "text-black/90"}`}>
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
            <span className={`font-semibold ${isDark ? "text-white/80" : "text-black/80"}`}>{feature.label}</span>
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
  )
}

// ─── Original static layout (mobile + reduced-motion fallback) ────────────────

function OriginalAboutLayout({ config, isDark = true }: AboutSectionProps) {
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
              className="relative h-full rounded-2xl overflow-hidden"
            >
              <Image
                src={imageUrl}
                alt="HAXEUS Quality"
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg?height=400&width=600&text=About+HAXEUS"
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#e7bf04] via-[#c03c9d] to-[#07e4e1]" />
            </motion.div>
          </motion.div>

          <TextColumn
            heading={heading}
            headingAccent={headingAccent}
            headingSuffix={headingSuffix}
            body1={body1}
            body2={body2}
            features={features}
            ctaText={ctaText}
            ctaHref={ctaHref}
            isDark={isDark}
            opacity={1}
          />
        </div>
      </div>
    </section>
  )
}

// ─── Scroll-zoom variant (desktop, motion OK) ─────────────────────────────────
//
// WHY useScroll WITHOUT target:
// useScroll({ target: containerRef }) tracks when the container enters/leaves
// the viewport — progress goes 0→1 as it scrolls THROUGH the screen.
// For a sticky sequence we need progress 0→1 while the section is PINNED,
// i.e. across the 500vh of virtual scroll distance. The only reliable way
// to get this is to read raw scrollY from the window and map it manually
// against the container's offsetTop (which stays fixed while sticky).

function ScrollZoomAboutSection({ config, isDark = true }: AboutSectionProps) {
  const imageUrl = config.image_url ?? DEFAULT_HOMEPAGE_CONFIG.about.image_url
  const heading = config.heading ?? DEFAULT_HOMEPAGE_CONFIG.about.heading
  const headingAccent = config.heading_accent ?? DEFAULT_HOMEPAGE_CONFIG.about.heading_accent
  const headingSuffix = config.heading_suffix ?? DEFAULT_HOMEPAGE_CONFIG.about.heading_suffix
  const body1 = config.body1 ?? DEFAULT_HOMEPAGE_CONFIG.about.body1
  const body2 = config.body2 ?? DEFAULT_HOMEPAGE_CONFIG.about.body2
  const features = config.features ?? DEFAULT_HOMEPAGE_CONFIG.about.features
  const ctaText = config.cta_text ?? DEFAULT_HOMEPAGE_CONFIG.about.cta_text
  const ctaHref = config.cta_href ?? DEFAULT_HOMEPAGE_CONFIG.about.cta_href

  const containerRef = useRef<HTMLDivElement>(null)

  const progress = useMotionValue(0)

  useAnimationFrame(() => {
    const el = containerRef.current
    if (!el) return
    const { top, height } = el.getBoundingClientRect()

    // We want the 'active' scroll range to be when the container's center 
    // is within the viewport. 
    // progress 0: center of container is at viewport center
    // progress 1: end of virtual scroll
    const vh = window.innerHeight
    const scrollable = height - vh
    if (scrollable <= 0) return

    const raw = -top / scrollable
    progress.set(Math.min(1, Math.max(0, raw)))
  })

  // ── Refined transform: hold → zoom in → hold → zoom out → hold ──────────────
  // Max scale 1.6x. We wait until 10% progress to start the zoom for a "lock" feel.
  const rawScale = useTransform(progress, [0, 0.12, 0.42, 0.58, 0.88, 1], [1, 1, 1.6, 1.6, 1, 1])
  const rawBrightness = useTransform(progress, [0, 0.12, 0.42, 0.58, 0.88, 1], [1, 1, 1.15, 1.15, 1, 1])

  // Text fades out while image expands, fades back in as it contracts
  const textOpacity = useTransform(progress, [0, 0.1, 0.25, 0.75, 0.9, 1], [1, 1, 0, 0, 1, 1])

  // Scroll hint: only at start
  const hintOpacity = useTransform(progress, [0, 0.06], [1, 0])

  // z-index elevates image above grid during zoom
  const zIndex = useTransform(rawScale, (s: number) => Math.round(s > 1.02 ? 50 : 1))

  // Spring wrapping — physical feel
  const scale = useSpring(rawScale, { stiffness: 70, damping: 22, mass: 0.9 })
  const brightnessSpring = useSpring(rawBrightness, { stiffness: 70, damping: 22 })
  const filterStyle = useTransform(brightnessSpring, (b: number) => `brightness(${b})`)

  return (
    // 600vh outer container — gives 500vh of virtual scroll while sticky.
    // Added top-buffer padding for mobile "Center Lock" feel.
    // 600vh outer container — gives 500vh of virtual scroll while sticky.
    <div
      ref={containerRef}
      style={{
        height: "600vh",
        position: "relative"
      }}
    >

      {/* Sticky wrapper — clipped so zoomed image stays within viewport */}
      <div
        style={{
          position: "sticky",
          top: "50%",
          transform: "translateY(-50%)",
          height: "100dvh",
          minHeight: "100vh",
          maxHeight: "100vh",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
        }}
        className="border-y border-theme" // border top and bottom for center lock
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-16 items-center pt-12 pb-12 sm:pt-0 sm:pb-0">

            {/* ── Image column ── */}
            <div className="relative h-48 sm:h-80 lg:h-[500px] mb-6 lg:mb-0">
              <motion.div
                style={{
                  scale,
                  filter: filterStyle,
                  zIndex,
                  transformOrigin: "center center",
                  position: "relative",
                  height: "100%",
                  borderRadius: "1rem",
                  overflow: "hidden",
                }}
              >
                <Image
                  src={imageUrl}
                  alt="HAXEUS Quality"
                  fill
                  priority
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover"
                  onError={(e) => {
                    const t = e.target as HTMLImageElement
                    t.src = "/placeholder.svg?height=400&width=600&text=About+HAXEUS"
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#e7bf04] via-[#c03c9d] to-[#07e4e1]" />
              </motion.div>
            </div>

            {/* ── Text column — fades out during zoom, back in after ── */}
            <div className="lg:mt-0 mt-4 px-4 sm:px-0">
              <TextColumn
                heading={heading}
                headingAccent={headingAccent}
                headingSuffix={headingSuffix}
                body1={body1}
                body2={body2}
                features={features}
                ctaText={ctaText}
                ctaHref={ctaHref}
                isDark={isDark}
                opacity={textOpacity}
              />
            </div>

          </div>
        </div>

        {/* ── Scroll hint ── */}
        <motion.div
          style={{ opacity: hintOpacity }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none select-none"
          aria-hidden
        >
          <span className={`text-[10px] tracking-[0.25em] uppercase font-medium ${isDark ? "text-white/35" : "text-black/35"}`}>
            scroll
          </span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
              <path
                d="M1 1L7 7L13 1"
                stroke={isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </motion.div>

      </div>
      {/* end sticky */}

    </div>
  )
}

// ─── Public export — picks variant based on device/motion prefs ───────────────

export function AboutSection({ config, isDark = true }: AboutSectionProps) {
  const prefersReduced = useReducedMotion()

  if (prefersReduced) {
    return <OriginalAboutLayout config={config} isDark={isDark} />
  }

  return <ScrollZoomAboutSection config={config} isDark={isDark} />
}
