"use client"

import Link from "next/link"
import Image from "next/image"
import dynamic from "next/dynamic"
import { useState, useEffect, useRef } from "react"
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
import { supabase } from "@/lib/supabase"

// Lazy load heavy components
const LightPillar = dynamic(() => import("@/components/LightPillar"), {
  ssr: false,
})
const DynamicTestimonials = dynamic(() => import("../components/Testimonials"), {
  loading: () => <div className="h-96 animate-pulse bg-[#111] rounded-2xl" />,
})

interface FeaturedProduct {
  id: number
  name: string
  price: number
  image: string
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select(`
            id,
            name,
            price,
            front_image,
            product_images (
              image_url,
              is_primary,
              display_order
            )
          `)
          .order("id")
          .limit(3)

        if (error) throw error

        if (data && data.length > 0) {
          const mapped = data.map((product: any) => {
            const primaryImg = product.product_images?.find((img: any) => img.is_primary)
            const firstImg = product.product_images?.[0]
            const galleryImage = primaryImg?.image_url || firstImg?.image_url

            return {
              id: product.id,
              name: product.name,
              price: product.price,
              image: galleryImage || product.front_image || "/placeholder.svg"
            }
          })
          setFeaturedProducts(mapped)
        }
      } catch (error) {
        console.error("Error fetching featured products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  const accentColors = ["#e7bf04", "#c03c9d", "#07e4e1"]

  return (
    <>
      {/* ═══ FIXED BACKGROUND — full-viewport, behind all content ═══ */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        backgroundColor: '#060010'
      }}>
        <LightPillar
          topColor="#e93a3a"
          bottomColor="#000000"
          intensity={1.4}
          rotationSpeed={0.2}
          interactive={false}
          glowAmount={0.003}
          pillarWidth={9}
          pillarHeight={1.0}
          noiseIntensity={0.0}
          pillarRotation={35}
        />
      </div>

      {/* ═══ PAGE CONTENT — window scrolls; fixed bg stays in place ═══ */}
      <div ref={containerRef} style={{ position: 'relative', zIndex: 1 }}>

        {/* ═══════════════════ SECTION 1: HERO ═══════════════════ */}
        <section className="relative min-h-screen flex items-center z-10">
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Hero Text */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="space-y-8"
              >
                <motion.div variants={fadeInUp}>
                  <div className="relative py-10 overflow-visible">
                    <motion.h1
                      className="text-5xl lg:text-7xl font-semibold leading-[1.15] tracking-tight text-white"
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <motion.span
                        className="block text-white drop-shadow-[0_1px_8px_rgba(255,255,255,0.08)]"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.4 }}
                      >
                        For Those Who
                      </motion.span>

                      <motion.span
                        className="block text-[#e93a3a] drop-shadow-[0_4px_18px_rgba(233,58,58,0.4)]"
                        initial={{ opacity: 0, scale: 0.99 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                      >
                        Won&apos;t Change
                      </motion.span>

                      <motion.span
                        className="block text-white/80 drop-shadow-[0_2px_10px_rgba(233,58,58,0.2)]"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45, duration: 0.4 }}
                      >
                        To Fit In
                      </motion.span>
                    </motion.h1>
                  </div>

                  <motion.p
                    className="text-lg text-white/50 mt-4 leading-relaxed max-w-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                  >
                    Bold designs for bold individuals. Express yourself unapologetically with premium streetwear
                    that refuses to blend in.
                  </motion.p>
                </motion.div>

                <motion.div
                  variants={fadeIn}
                  className="flex gap-4 flex-wrap mt-2"
                >
                  <Link href="/products">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      <Button size="lg" className="bg-[#e93a3a] hover:bg-[#e93a3a]/80 text-white px-10 py-6 rounded-full text-lg shadow-lg shadow-[#e93a3a]/20 hover:shadow-[#e93a3a]/40 transition-all duration-300">
                        Shop Collection
                      </Button>
                    </motion.div>
                  </Link>
                  <Link href="/about">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      <Button variant="outline" size="lg" className="px-10 py-6 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 text-white text-lg transition-all duration-300">
                        Our Story
                      </Button>
                    </motion.div>
                  </Link>
                </motion.div>

                {/* Stats with accent colors */}
                <motion.div
                  variants={staggerFast}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-3 gap-8 pt-8"
                >
                  {[
                    { value: "10+", label: "Happy Customers", color: "#e7bf04" },
                    { value: "99%", label: "Satisfaction Rate", color: "#c03c9d" },
                    { value: "24/7", label: "Support", color: "#07e4e1" }
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      variants={scaleIn}
                      whileHover={{ scale: 1.1, y: -5 }}
                      className="cursor-default"
                    >
                      <div className="text-4xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                      <div className="text-sm text-white/40 mt-1">{stat.label}</div>
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
                  className="bg-black/60 backdrop-blur-sm rounded-3xl p-8 relative overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                >
                  <Image
                    src="/images/save-flower-front.jpg"
                    alt="Featured T-shirt"
                    width={400}
                    height={500}
                    priority
                    className="mx-auto rounded-xl"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg?height=500&width=400&text=Featured+Product"
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
                    <div className="text-xs text-[#e7bf04] font-medium">Artistic Designs</div>
                    <div className="text-sm font-bold text-white">Premium Quality</div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, rotate: 10 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ delay: 1, type: "spring", stiffness: 200 }}
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md rounded-2xl px-4 py-3"
                  >
                    <div className="text-xs text-[#07e4e1] font-medium">Eco-Conscious</div>
                    <div className="text-sm font-bold text-white">Sustainable</div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══════════════════ SECTION 2: NEWSLETTER ═══════════════════ */}
        <section className="relative min-h-screen flex items-center z-10 bg-[#e93a3a]/20 backdrop-blur-2xl border-t border-[#e93a3a]/15">
          {/* Animated background shapes */}
          <motion.div
            className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-96 h-96 bg-black opacity-10 rounded-full"
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -30, 0],
              y: [0, -50, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Accent accent shape */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full opacity-20"
            style={{ background: '#e7bf04' }}
            animate={{ scale: [1, 1.5, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl lg:text-5xl font-bold mb-6 leading-relaxed text-white"
            >
              Join the movement. Your perfect T-shirt is just a click away.
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mt-8 mb-8"
            >
              <Link href="/products">
                <motion.div whileHover={hoverScale} whileTap={tapScale}>
                  <Button size="lg" className="bg-black text-white hover:bg-black/80 px-10 py-6 rounded-full text-lg font-semibold shadow-lg">
                    Shop Now
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex max-w-md mx-auto shadow-2xl rounded-full overflow-hidden bg-black/20 backdrop-blur-sm"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 bg-transparent text-white placeholder:text-white/50 focus:outline-none text-lg min-w-0"
              />
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button className="bg-black hover:bg-black/80 text-white px-8 h-full rounded-full font-semibold whitespace-nowrap">
                  Subscribe
                </Button>
              </motion.div>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-sm mt-4 text-white/70"
            >
              Get exclusive offers and updates. Unsubscribe anytime.
            </motion.p>
          </div>
        </section>

        {/* ═══════════════════ SECTION 3: FEATURED PRODUCTS ═══════════════════ */}
        <section className="relative min-h-screen flex items-center z-10 bg-black/55 backdrop-blur-2xl border-t border-white/[0.04]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={scrollReveal}
              className="text-center mb-16"
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                Featured <span className="text-[#e93a3a]">Collection</span>
              </h2>
              <p className="text-xl text-white/40 max-w-2xl mx-auto">
                Discover our most popular premium T-shirts, carefully crafted for ultimate comfort and style.
              </p>
            </motion.div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-[#111] rounded-2xl overflow-hidden animate-pulse">
                    <div className="aspect-square bg-white/5" />
                    <div className="p-6 space-y-3">
                      <div className="h-6 bg-white/5 rounded w-3/4" />
                      <div className="h-8 bg-white/5 rounded w-1/2" />
                      <div className="h-12 bg-white/5 rounded-full w-full" />
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
                  🚀
                </motion.div>
                <h3 className="text-3xl font-bold text-white mb-4">Coming Soon!</h3>
                <p className="text-lg text-white/40 max-w-md mx-auto mb-8">
                  We&apos;re working on bringing you amazing products. Stay tuned!
                </p>
                <Link href="/contact">
                  <motion.div whileHover={hoverScale} whileTap={tapScale}>
                    <Button className="bg-[#e93a3a] hover:bg-[#e93a3a]/80 text-white px-8 py-6 rounded-full text-lg font-semibold shadow-lg shadow-[#e93a3a]/20">
                      Get Notified
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: index * 0.15 }}
                  >
                    <motion.div whileHover={cardHover} whileTap={{ scale: 0.98 }}>
                      <Card className="overflow-hidden bg-[#111] border-0 rounded-2xl group">
                        <Link href={`/products/${product.id}`}>
                          <div className="aspect-square relative bg-black overflow-hidden">
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              transition={{ duration: 0.6 }}
                            >
                              <Image
                                src={product.image || "/placeholder.svg"}
                                alt={product.name}
                                fill
                                sizes="(max-width: 768px) 100vw, 33vw"
                                className="object-cover"
                                loading={index === 0 ? "eager" : "lazy"}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.src = "/placeholder.svg?height=400&width=400&text=Product+Image"
                                }}
                              />
                            </motion.div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            {/* Accent border on hover */}
                            <div
                              className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                              style={{ background: accentColors[index % 3] }}
                            />
                          </div>
                        </Link>
                        <CardContent className="p-6">
                          <Shuffle
                            text={product.name}
                            tag="h3"
                            className="text-xl font-semibold mb-2 text-white"
                            shuffleDirection="right"
                            duration={0.3}
                            animationMode="evenodd"
                            shuffleTimes={1}
                            ease="power3.out"
                            stagger={0.02}
                            threshold={0}
                            triggerOnce={false}
                            triggerOnHover={true}
                            respectReducedMotion={true}
                            textAlign="left"
                          />
                          <p className="text-2xl font-bold text-white mb-4">₹{product.price.toLocaleString("en-IN")}</p>
                          <Link href={`/products/${product.id}`}>
                            <motion.div whileHover={hoverScale} whileTap={tapScale}>
                              <Button className="w-full bg-[#e93a3a] text-white hover:bg-[#e93a3a]/80 py-6 text-lg font-semibold rounded-full shadow-md shadow-[#e93a3a]/10 hover:shadow-[#e93a3a]/30 transition-all duration-300">
                                View Details
                              </Button>
                            </motion.div>
                          </Link>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ═══════════════════ SECTION 4: TESTIMONIALS ═══════════════════ */}
        <section className="relative z-10 bg-black/55 backdrop-blur-2xl border-t border-white/[0.04]">
          <DynamicTestimonials />
        </section>

        {/* ═══════════════════ SECTION 5: ABOUT ═══════════════════ */}
        <section className="relative min-h-screen flex items-center z-10 bg-black/60 backdrop-blur-2xl border-t border-white/[0.04]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative h-96 lg:h-[500px]"
              >
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 1 }}
                  transition={{ duration: 0.4 }}
                  className="relative h-full"
                >
                  <Image
                    src="/images/statue-front.jpg"
                    alt="HAXEUS Quality"
                    fill
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
                <motion.h2 variants={fadeInRight} className="text-4xl lg:text-5xl font-bold text-white mb-6">
                  Crafting <span className="text-[#e93a3a]">Premium</span> Since 2019
                </motion.h2>
                <motion.p variants={fadeInRight} className="text-white/40 mb-6 leading-relaxed text-lg">
                  At HAXEUS, we believe that comfort shouldn&apos;t compromise style. Our journey began with a simple mission:
                  to create the perfect T-shirt that combines premium materials, exceptional craftsmanship, and timeless
                  design.
                </motion.p>
                <motion.p variants={fadeInRight} className="text-white/40 mb-8 leading-relaxed text-lg">
                  Every piece in our collection is meticulously crafted using the finest cotton blends, ensuring
                  durability, breathability, and that luxurious feel against your skin.
                </motion.p>

                <motion.div variants={fadeInRight} className="grid grid-cols-2 gap-6 mb-8">
                  {[
                    { label: "Premium Materials", color: "#e7bf04" },
                    { label: "Ethical Production", color: "#c03c9d" },
                    { label: "Sustainable Practices", color: "#07e4e1" },
                    { label: "Perfect Fit", color: "#e93a3a" }
                  ].map((feature, index) => (
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
                      <span className="font-semibold text-white/70">{feature.label}</span>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div variants={fadeInRight}>
                  <Link href="/about">
                    <motion.div whileHover={hoverScale} whileTap={tapScale}>
                      <Button className="bg-[#e93a3a] hover:bg-[#e93a3a]/80 text-white px-10 py-6 rounded-full text-lg font-semibold shadow-lg shadow-[#e93a3a]/20 hover:shadow-[#e93a3a]/40 transition-all duration-300">
                        Learn More About Us
                      </Button>
                    </motion.div>
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
