"use client"

import Link from "next/link"
import Image from "next/image"
import dynamic from "next/dynamic"
import { useState, useEffect, useRef } from "react"
import { useTheme } from "next-themes"
import { ShimmerButton } from "@/components/ui/ShimmerButton"
import { ShinyButton } from "@/components/ui/shiny-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion, useScroll, useTransform } from "framer-motion"
import {
  fadeIn,
  fadeInUp,
  fadeInRight,
  staggerContainer,
  staggerFast,
  scaleIn,
  scrollReveal,
  hoverScale,
  tapScale,
  cardHover,
} from "@/lib/animations"
import Shuffle from "@/components/Shuffle"
import SplitText from "@/components/ui/SplitText"
import ShinyText from "@/components/ui/ShinyText"
import { supabase } from "@/lib/supabase"
import { useHomepageConfig } from "@/hooks/useHomepageConfig"
import { DEFAULT_HOMEPAGE_CONFIG } from "@/lib/homepage-defaults"
import { ProductCard } from "@/components/ui/ProductCard"
import { PreorderModal } from "@/components/PreorderModal"
import type { Product } from "@/lib/supabase"


const DynamicTestimonials = dynamic(() => import("../components/Testimonials"), {
  loading: () => <div className="h-96 animate-pulse bg-[var(--bg-elevated)] rounded-2xl" />,
})

interface FeaturedProduct {
  id: number
  name: string
  price: number
  image?: string
  front_image?: string
}

function isSupabaseStorageUrl(url?: string) {
  return typeof url === "string" && url.includes(".supabase.co/storage/v1/")
}

export default function HomePage() {
  const { theme } = useTheme()
  const { config } = useHomepageConfig()
  const [mounted, setMounted] = useState(false)
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [preorderItems, setPreorderItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [heroLine1Done, setHeroLine1Done] = useState(false)
  const [heroLine2Done, setHeroLine2Done] = useState(false)
  const [heroLine3Done, setHeroLine3Done] = useState(false)
  const [newsletterEmail, setNewsletterEmail] = useState("")
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "loading" | "success" | "duplicate" | "error">("idle")
  const [preorderModalItem, setPreorderModalItem] = useState<Product | null>(null)
  const isDark = !mounted ? true : (
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
  )

  const handleNewsletterSubmit = async () => {
    if (!newsletterEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail)) return
    setNewsletterStatus("loading")
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail.trim().toLowerCase() })
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.error === "already_subscribed") {
          setNewsletterStatus("duplicate")
        } else {
          setNewsletterStatus("error")
        }
      } else {
        setNewsletterStatus("success")
        setNewsletterEmail("")
      }
      setTimeout(() => setNewsletterStatus("idle"), 4000)
    } catch {
      setNewsletterStatus("error")
      setTimeout(() => setNewsletterStatus("idle"), 4000)
    }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const check = () => setIsMobile(
      window.innerWidth < 768 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    )
    check()
    window.addEventListener('resize', check, { passive: true })
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    let isActive = true

    async function fetchPreorderItems() {
      try {
        const res = await fetch("/api/preorders", { signal: controller.signal })
        if (!res.ok) return
        const data = await res.json()
        if (isActive) {
          setPreorderItems(Array.isArray(data) ? data : [])
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return
        if (isActive) {
          setPreorderItems([])
        }
      }
    }

    fetchPreorderItems()

    return () => {
      isActive = false
      controller.abort()
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    let isActive = true

    async function fetchFeaturedProducts() {
      try {
        const mode = config.featured_products.selection_mode
        const count = config.featured_products.count ?? 3

        let query = supabase
          .from("products")
          .select(`
            id,
            name,
            price,
            description,
            tagline,
            front_image,
            product_images (
              image_url,
              is_primary,
              display_order
            )
          `)

        // Supabase client v2 might not support .abortSignal(signal) in all environments or types
        // so we rely on isActive for now if the client doesn't support it, 
        // but we keep the AbortController for consistency if we find a way to plug it in.

        if (mode === "manual" && config.featured_products.manual_product_ids?.length > 0) {
          query = query.in("id", config.featured_products.manual_product_ids).limit(count)
        } else if (mode === "newest") {
          query = query.order("id", { ascending: false }).limit(count)
        } else {
          query = query.order("id").limit(count)
        }

        const { data, error } = await query

        if (error) throw error

        if (!isActive) return

        if (data && data.length > 0) {
          const mapped = data.map((product: any) => {
            const primaryImg = product.product_images?.find((img: any) => img.is_primary)
            const firstImg = product.product_images?.[0]
            const galleryImage = primaryImg?.image_url || firstImg?.image_url

            return {
              ...product,
              front_image: galleryImage || product.front_image || "/placeholder.svg"
            }
          })
          setFeaturedProducts(mapped)
        }
      } catch (error) {
        if ((error as { name?: string })?.name === "AbortError") return
        if ((error as { name?: string })?.name !== "AbortError") {
          console.error("Error fetching featured products:", error)
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    fetchFeaturedProducts()

    return () => {
      isActive = false
      controller.abort()
    }
  }, [config.featured_products])

  const accentColors = ["#e7bf04", "#c03c9d", "#07e4e1"]
  const isSectionVisible = (sectionKey: "announcement_bar" | "hero" | "newsletter" | "featured_products" | "preorder" | "testimonials" | "about", visible = true) => {
    return visible !== false && !config.hidden_sections?.includes(sectionKey)
  }

  return (
    <>
      {/* PAGE CONTENT - window scrolls; fixed bg stays in place */}
      <div ref={containerRef} style={{ position: 'relative', zIndex: 1 }}>

        {isSectionVisible("announcement_bar", config.announcement_bar?.visible) && config.announcement_bar?.text && (
          <div
            className="w-full text-center py-2.5 px-4 text-sm font-semibold tracking-wide z-20"
            style={{
              backgroundColor: config.announcement_bar.bg_color ?? "#e93a3a",
              color: config.announcement_bar.text_color ?? "#ffffff"
            }}
          >
            {config.announcement_bar.text}
          </div>
        )}

        {/* SECTION 1: HERO */}
        {isSectionVisible("hero", config.hero.visible) && (
          <section className="relative min-h-screen flex items-center z-10">
            {/* No LightPillar here - it's in layout.tsx now, fixed behind everything */}
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
                        className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-semibold leading-[1.15] tracking-tight"
                        style={{ fontKerning: 'none', fontVariantLigatures: 'none' }}
                      >
                        {/* Line 1 */}
                        <span className="relative block drop-shadow-[0_1px_8px_rgba(255,255,255,0.08)]">
                          {/* invisible height placeholder - no visible duplicate */}
                          <span className="block text-white pointer-events-none select-none" style={{ opacity: 0 }} aria-hidden="true">{config.hero.line1 ?? DEFAULT_HOMEPAGE_CONFIG.hero.line1}</span>
                          <motion.span
                            className="absolute inset-0 block"
                            animate={{ opacity: heroLine1Done ? 0 : 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <SplitText
                              text={config.hero.line1 ?? DEFAULT_HOMEPAGE_CONFIG.hero.line1}
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
                              text={config.hero.line1 ?? DEFAULT_HOMEPAGE_CONFIG.hero.line1}
                              className="block"
                              display="block"
                              baseVisible={false}
                              disabled={!heroLine1Done}
                              color="#ffffff"
                              shineColor="#ffc0c0"
                              speed={3}
                              spread={60}
                              delay={1}
                            />
                          </motion.span>
                        </span>

                        {/* Line 2 */}
                        <span className="relative block drop-shadow-[0_4px_18px_rgba(233,58,58,0.4)]">
                          {/* invisible height placeholder - no visible duplicate */}
                          <span className="block text-[var(--accent)] pointer-events-none select-none" style={{ opacity: 0 }} aria-hidden="true">{config.hero.line2 ?? DEFAULT_HOMEPAGE_CONFIG.hero.line2}</span>
                          <motion.span
                            className="absolute inset-0 block"
                            animate={{ opacity: heroLine2Done ? 0 : 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <SplitText
                              text={config.hero.line2 ?? DEFAULT_HOMEPAGE_CONFIG.hero.line2}
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
                              text={config.hero.line2 ?? DEFAULT_HOMEPAGE_CONFIG.hero.line2}
                              className="block"
                              display="block"
                              baseVisible={false}
                              disabled={!heroLine2Done}
                              color="#e93e3a"
                              shineColor="#f86666"
                              speed={3}
                              spread={60}
                              delay={1}
                            />
                          </motion.span>
                        </span>

                        {/* Line 3 */}
                        <span className="relative block drop-shadow-[0_2px_10px_rgba(233,58,58,0.2)]">
                          {/* invisible height placeholder - no visible duplicate */}
                          <span className="block text-white/80 pointer-events-none select-none" style={{ opacity: 0 }} aria-hidden="true">{config.hero.line3 ?? DEFAULT_HOMEPAGE_CONFIG.hero.line3}</span>
                          <motion.span
                            className="absolute inset-0 block"
                            animate={{ opacity: heroLine3Done ? 0 : 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <SplitText
                              text={config.hero.line3 ?? DEFAULT_HOMEPAGE_CONFIG.hero.line3}
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
                              text={config.hero.line3 ?? DEFAULT_HOMEPAGE_CONFIG.hero.line3}
                              className="block"
                              display="block"
                              baseVisible={false}
                              disabled={!heroLine3Done}
                              color="rgba(255,255,255,0.8)"
                              shineColor="#ffbcbc"
                              speed={3}
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
                        {config.hero.subtext ?? DEFAULT_HOMEPAGE_CONFIG.hero.subtext}
                      </p>
                    </motion.div>
                  </div>

                  <div className="flex gap-4 flex-wrap mt-2">
                    <Link href={config.hero.cta_primary?.href ?? DEFAULT_HOMEPAGE_CONFIG.hero.cta_primary.href}>
                      <ShinyButton
                        highlight="#000000ff"
                        highlightSubtle="#ff0000ff"
                        className="h-[52px] px-7"
                      >
                        {config.hero.cta_primary?.text ?? DEFAULT_HOMEPAGE_CONFIG.hero.cta_primary.text}
                      </ShinyButton>
                    </Link>
                    <Link href={config.hero.cta_secondary?.href ?? DEFAULT_HOMEPAGE_CONFIG.hero.cta_secondary.href}>
                      <ShimmerButton
                        background="rgba(0, 0, 0, 1)"
                        borderRadius="100px"
                        shimmerColor="#ffffffff"
                        shimmerDuration="2.5s"
                        className="h-[52px] px-7 border-white/[0.08] text-red-600/90 font-bold text-sm tracking-widest uppercase hover:text-white"
                      >
                        {config.hero.cta_secondary?.text ?? DEFAULT_HOMEPAGE_CONFIG.hero.cta_secondary.text}
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
                    {[...(config.hero.stats ?? DEFAULT_HOMEPAGE_CONFIG.hero.stats)].map((stat, index) => (
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
                      src={config.hero.hero_product_image_url ?? DEFAULT_HOMEPAGE_CONFIG.hero.hero_product_image_url}
                      alt="Featured T-shirt"
                      width={400}
                      height={500}
                      priority
                      className="mx-auto rounded-xl"
                      style={{ height: "auto" }}
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
                      <div className="text-xs font-medium" style={{ color: config.hero.badge_top.color ?? "#e7bf04" }}>
                        {config.hero.badge_top.label ?? DEFAULT_HOMEPAGE_CONFIG.hero.badge_top.label}
                      </div>
                      <div className="text-sm font-bold text-white">{config.hero.badge_top?.value ?? DEFAULT_HOMEPAGE_CONFIG.hero.badge_top.value}</div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.5, rotate: 10 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      transition={{ delay: 1, type: "spring", stiffness: 200 }}
                      whileHover={{ scale: 1.1, rotate: -5 }}
                      className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md rounded-2xl px-4 py-3"
                    >
                      <div className="text-xs font-medium" style={{ color: config.hero.badge_bottom.color ?? "#07e4e1" }}>
                        {config.hero.badge_bottom.label ?? DEFAULT_HOMEPAGE_CONFIG.hero.badge_bottom.label}
                      </div>
                      <div className="text-sm font-bold text-white">{config.hero.badge_bottom?.value ?? DEFAULT_HOMEPAGE_CONFIG.hero.badge_bottom.value}</div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 1.5: PREORDER */}
        {preorderItems.length > 0 && isSectionVisible("preorder", config.preorder.visible) && (
          <section className="relative min-h-screen flex items-center z-10 border-t border-theme">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20 text-center">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={scrollReveal}
                className="mb-16"
              >
                <div className="text-xs tracking-[0.25em] font-medium uppercase text-[var(--accent)] mb-2">COMING SOON</div>
                <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 ${isDark ? "text-white" : "text-black"}`}>
                  {config.preorder.heading}
                </h2>
                <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto text-white/80">
                  {config.preorder.subtext}
                </p>
              </motion.div>

              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                {preorderItems.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                    accentColor={accentColors[index % 3]}
                    variant="preorder"
                    onPreorderClick={(p) => setPreorderModalItem(p)}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* SECTION 2: NEWSLETTER */}
        {isSectionVisible("newsletter", config.newsletter.visible) && (
          <section className="relative py-20 md:py-32 flex items-center z-10 border-t border-theme overflow-x-hidden">

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 w-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className={`text-2xl sm:text-3xl lg:text-5xl font-bold mb-6 leading-snug sm:leading-relaxed ${isDark ? "text-white" : "text-black"}`}>
                  {config.newsletter.heading ?? DEFAULT_HOMEPAGE_CONFIG.newsletter.heading}
                </h2>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 justify-center mt-8 mb-8"
              >
                <Link href="/products">
                  <motion.div whileHover={hoverScale} whileTap={tapScale}>
                    <Button size="lg" className="bg-theme text-theme border border-theme hover:bg-card-2 px-10 py-6 rounded-full text-lg font-semibold shadow-lg">
                      {config.newsletter.cta_text ?? DEFAULT_HOMEPAGE_CONFIG.newsletter.cta_text}
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex max-w-[calc(100%-2rem)] sm:max-w-md mx-auto shadow-2xl rounded-full overflow-hidden bg-[var(--bg-elevated)]/80 backdrop-blur-sm"
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleNewsletterSubmit()}
                  className={`flex-1 px-6 py-4 bg-transparent focus:outline-none text-lg min-w-0 ${isDark ? "text-white placeholder:text-white/30" : "text-black placeholder:text-black/30"}`}
                />
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleNewsletterSubmit}
                    disabled={newsletterStatus === "loading"}
                    className="bg-[var(--accent)] hover:opacity-90 text-white px-8 h-full rounded-full font-semibold whitespace-nowrap disabled:opacity-50"
                  >
                    {newsletterStatus === "loading" ? "..." : "Subscribe"}
                  </Button>
                </motion.div>
              </motion.div>
              {newsletterStatus === "success" && (
                <p className="text-sm mt-3 text-emerald-400 font-medium">You&apos;re in! Welcome to the movement.</p>
              )}
              {newsletterStatus === "duplicate" && (
                <p className="text-sm mt-3 text-[#e7bf04] font-medium">Already subscribed! You&apos;re part of the crew.</p>
              )}
              {newsletterStatus === "error" && (
                <p className="text-sm mt-3 text-[var(--accent)] font-medium">Something went wrong. Try again.</p>
              )}
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-sm mt-4 text-white/70"
              >
                {config.newsletter.subtext ?? DEFAULT_HOMEPAGE_CONFIG.newsletter.subtext}
              </motion.p>
            </div>
          </section>
        )}

        {/* SECTION 3: FEATURED PRODUCTS */}
        {isSectionVisible("featured_products", config.featured_products.visible) && (
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
                  {config.featured_products.heading ?? DEFAULT_HOMEPAGE_CONFIG.featured_products.heading} <span style={{ color: "var(--accent)" }}>{config.featured_products.heading_accent ?? DEFAULT_HOMEPAGE_CONFIG.featured_products.heading_accent}</span>
                </h2>
                <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto text-white/80">
                  {config.featured_products.subtext ?? DEFAULT_HOMEPAGE_CONFIG.featured_products.subtext}
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
              ) : featuredProducts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-6xl mb-6"
                  >
                  </motion.div>
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
                  {featuredProducts.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={index}
                      accentColor={accentColors[index % 3]}
                      variant="default"
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}



        {/* SECTION 4: TESTIMONIALS */}
        {isSectionVisible("testimonials") && (
          <section className="relative z-10 border-t border-theme">
            <DynamicTestimonials />
          </section>
        )}

        {/* SECTION 5: ABOUT */}
        {isSectionVisible("about", config.about.visible) && (
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
                      src={config.about.image_url ?? DEFAULT_HOMEPAGE_CONFIG.about.image_url}
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
                    {/* Accent overlay line */}
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
                      {config.about.heading ?? DEFAULT_HOMEPAGE_CONFIG.about.heading} <span style={{ color: "var(--accent)" }}>{config.about.heading_accent ?? DEFAULT_HOMEPAGE_CONFIG.about.heading_accent}</span> {config.about.heading_suffix ?? DEFAULT_HOMEPAGE_CONFIG.about.heading_suffix}
                    </h2>
                  </motion.div>
                  <motion.div variants={fadeInRight}>
                    <p className="mb-6 leading-relaxed text-lg text-white/80">
                      {config.about.body1 ?? DEFAULT_HOMEPAGE_CONFIG.about.body1}
                    </p>
                  </motion.div>
                  <motion.div variants={fadeInRight}>
                    <p className="mb-8 leading-relaxed text-lg text-white/80">
                      {config.about.body2 ?? DEFAULT_HOMEPAGE_CONFIG.about.body2}
                    </p>
                  </motion.div>

                  <motion.div variants={fadeInRight} className="grid grid-cols-2 gap-6 mb-8">
                    {[...(config.about.features ?? DEFAULT_HOMEPAGE_CONFIG.about.features)].map((feature, index) => (
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
                    <Link href={config.about.cta_href ?? DEFAULT_HOMEPAGE_CONFIG.about.cta_href}>
                      <motion.div whileHover={hoverScale} whileTap={tapScale}>
                        <Button className="bg-[var(--accent)] hover:opacity-90 text-white px-10 py-6 rounded-full text-lg font-semibold shadow-lg shadow-[var(--accent)]/20 transition-all duration-300">
                          {config.about.cta_text ?? DEFAULT_HOMEPAGE_CONFIG.about.cta_text}
                        </Button>
                      </motion.div>
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </section>
        )}
      </div>

      {preorderModalItem && (
        <PreorderModal
          item={preorderModalItem}
          isOpen={!!preorderModalItem}
          onClose={() => setPreorderModalItem(null)}
        />
      )}
    </>
  )
}
