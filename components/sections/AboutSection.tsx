import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { hoverScale, tapScale } from "@/lib/animations"
import type { AboutConfig } from "@/types/homepage"
import { DEFAULT_HOMEPAGE_CONFIG } from "@/lib/homepage-defaults"

interface AboutSectionProps {
  config: AboutConfig
  isDark?: boolean
}

function TextHeading({
  heading,
  headingAccent,
  headingSuffix,
  isDark,
  align = "text-center"
}: {
  heading: string
  headingAccent: string
  headingSuffix: string
  isDark: boolean
  align?: string
}) {
  return (
    <div className={`mb-6 lg:mb-8 ${align}`}>
      <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold break-words ${isDark ? "text-white" : "text-black"}`}>
        {heading} <span style={{ color: "var(--accent)" }}>{headingAccent}</span> {headingSuffix}
      </h2>
    </div>
  )
}

function TextBody({
  body1,
  body2,
  features,
  ctaText,
  ctaHref,
  isDark,
  align = "text-center lg:text-left"
}: {
  body1: string
  body2: string
  features: { label: string; color: string }[]
  ctaText: string
  ctaHref: string
  isDark: boolean
  align?: string
}) {
  return (
    <div className={align}>
      <p className={`mb-4 leading-relaxed text-base sm:text-lg ${isDark ? "text-white/90" : "text-black/99"}`}>
        {body1}
      </p>
      <p className={`mb-6 leading-relaxed text-base sm:text-lg ${isDark ? "text-white/90" : "text-black/99"}`}>
        {body2}
      </p>

      <div className={`grid grid-cols-2 gap-4 sm:gap-6 mb-8 max-w-sm ${align.includes("center") ? "mx-auto" : ""} lg:mx-0`}>
        {features.map((feature, index) => (
          <div key={index} className="flex items-center">
            <div className="w-2.5 h-2.5 rounded-full mr-2.5 flex-shrink-0" style={{ backgroundColor: feature.color }} />
            <span className={`text-sm font-semibold ${isDark ? "text-white/80" : "text-black/80"}`}>{feature.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Link href={ctaHref}>
          <motion.div whileHover={hoverScale} whileTap={tapScale}>
            <Button className="bg-[var(--accent)] hover:opacity-90 text-white px-8 py-5 rounded-full text-base font-semibold shadow-lg shadow-[var(--accent)]/20 transition-all duration-300">
              {ctaText}
            </Button>
          </motion.div>
        </Link>
      </div>
    </div>
  )
}

/**
 * Clean, Standard About Section
 * Mobile: Heading -> Image -> Body
 * PC: Text (Left) -> Image (Right)
 */
export function AboutSection({ config, isDark = true }: AboutSectionProps) {
  const imageUrl = config.image_url ?? DEFAULT_HOMEPAGE_CONFIG.about.image_url

  return (
    <section className="relative z-10 border-t border-theme py-16 md:py-24 lg:py-32 bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Using a grid with custom orders to satisfy different layouts on PC vs Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          
          {/* 1. Mobile-only Heading (Appears at top on mobile, hidden on PC) */}
          <div className="lg:hidden order-1">
            <TextHeading
              heading={config.heading ?? DEFAULT_HOMEPAGE_CONFIG.about.heading}
              headingAccent={config.heading_accent ?? DEFAULT_HOMEPAGE_CONFIG.about.heading_accent}
              headingSuffix={config.heading_suffix ?? DEFAULT_HOMEPAGE_CONFIG.about.heading_suffix}
              isDark={isDark}
              align="text-center"
            />
          </div>

          {/* 2. Main Text Content for PC (Hidden on mobile) */}
          {/* This preserves the exact PC layout: Heading + Body grouped on the left */}
          <div className="hidden lg:block lg:col-span-5 lg:order-1">
            <TextHeading
              heading={config.heading ?? DEFAULT_HOMEPAGE_CONFIG.about.heading}
              headingAccent={config.heading_accent ?? DEFAULT_HOMEPAGE_CONFIG.about.heading_accent}
              headingSuffix={config.heading_suffix ?? DEFAULT_HOMEPAGE_CONFIG.about.heading_suffix}
              isDark={isDark}
              align="text-left"
            />
            <TextBody
              body1={config.body1 ?? DEFAULT_HOMEPAGE_CONFIG.about.body1}
              body2={config.body2 ?? DEFAULT_HOMEPAGE_CONFIG.about.body2}
              features={config.features ?? DEFAULT_HOMEPAGE_CONFIG.about.features}
              ctaText={config.cta_text ?? DEFAULT_HOMEPAGE_CONFIG.about.cta_text}
              ctaHref={config.cta_href ?? DEFAULT_HOMEPAGE_CONFIG.about.cta_href}
              isDark={isDark}
              align="text-left"
            />
          </div>

          {/* 3. Featured Image (Middle on mobile, Right on PC) */}
          <div
            className="lg:col-span-7 lg:order-2 order-2 relative aspect-[4/3] lg:aspect-square w-full rounded-[40px] overflow-hidden shadow-2xl"
          >
            <Image
              src={imageUrl}
              alt="About HAXEUS"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[var(--accent)]" />
          </div>

          {/* 4. Mobile-only Body (Appears at bottom on mobile, hidden on PC) */}
          <div className="lg:hidden order-3">
            <TextBody
              body1={config.body1 ?? DEFAULT_HOMEPAGE_CONFIG.about.body1}
              body2={config.body2 ?? DEFAULT_HOMEPAGE_CONFIG.about.body2}
              features={config.features ?? DEFAULT_HOMEPAGE_CONFIG.about.features}
              ctaText={config.cta_text ?? DEFAULT_HOMEPAGE_CONFIG.about.cta_text}
              ctaHref={config.cta_href ?? DEFAULT_HOMEPAGE_CONFIG.about.cta_href}
              isDark={isDark}
              align="text-center"
            />
          </div>

        </div>
      </div>
    </section>
  )
}
