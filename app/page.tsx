"use client"

import Link from "next/link"
import Image from "next/image"
import dynamic from "next/dynamic"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import {
  fadeIn,
  fadeInUp,
  fadeInRight,
  staggerContainer,
  staggerFast,
  scaleIn,
  scrollReveal,
  hoverScale,
  hoverLift,
  tapScale,
  cardHover,
} from "@/lib/animations"
import Shuffle from "@/components/Shuffle"
import DarkVeil from "@/components/DarkVeil"
import { supabase } from "@/lib/supabase"

// Lazy load heavy components
const DynamicTestimonials = dynamic(() => import("../components/Testimonials"), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded-lg" />,
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

  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        // Fetch top 3 products from Supabase (ordered by id or sales if available)
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
            // Find primary image or first image from gallery
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

  return (
    <div className="min-h-screen scroll-smooth overflow-x-hidden bg-white dark:bg-gray-950">
      {/* Hero Section - Always Dark */}
      <section className="relative bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 py-16 lg:py-24 snap-start overflow-hidden">
        {/* WebGL Animated Background */}
        <div className="absolute inset-0 z-0 opacity-70 dark:opacity-100 pointer-events-none">
          <DarkVeil
            hueShift={344}
            noiseIntensity={0}
            scanlineIntensity={0}
            speed={0.4}
            scanlineFrequency={0.1}
            warpAmount={5}
            resolutionScale={1}
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="visible"
              animate="visible"
              variants={staggerContainer}
              className="space-y-8"
            >
              <motion.div variants={fadeInUp}>
                <motion.h1
                  className="text-5xl lg:text-7xl font-bold leading-tight"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <motion.div className="relative px-4 sm:px-6 lg:px-8 py-10 overflow-visible">
                    <motion.h1
                      className="
      text-5xl lg:text-7xl
      font-semibold
      leading-[1.15]
      tracking-tight
      text-white
    "
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {/* Line 1 */}
                      <motion.span
                        className="
        block
        bg-gradient-to-r
        from-neutral-100 via-neutral-200 to-neutral-100
        bg-clip-text text-transparent
        drop-shadow-[0_1px_8px_rgba(255,255,255,0.08)]
      "
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.4 }}
                      >
                        For Those Who
                      </motion.span>

                      {/* Line 2 — HERO */}
                      <motion.span
                        className="
        block
        bg-gradient-to-r
        from-red-500 via-rose-400 to-orange-300
        bg-clip-text text-transparent
        drop-shadow-[0_4px_18px_rgba(239,68,68,0.35)]
      "
                        initial={{ opacity: 0, scale: 0.99 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                      >
                        Won&apos;t Change
                      </motion.span>

                      {/* Line 3 */}
                      <motion.span
                        className="
        block
        bg-gradient-to-r
        from-neutral-300 via-rose-300 to-orange-300
        bg-clip-text text-transparent
        drop-shadow-[0_2px_10px_rgba(239,68,68,0.25)]
      "
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45, duration: 0.4 }}
                      >
                        To Fit In
                      </motion.span>
                    </motion.h1>
                  </motion.div>

                </motion.h1>
                <motion.p
                  className="text-lg text-gray-300 mt-8 leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  Bold designs for bold individuals. Express yourself unapologetically with premium streetwear
                  that celebrates your unique identity and refuses to blend in.
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
                    <Button size="lg" className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white px-10 py-6 rounded-full text-lg shadow-lg hover:shadow-xl transition-shadow">
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
                    <Button variant="outline" size="lg" className="px-10 py-6 rounded-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white text-lg transition-colors">
                      Our Story
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                variants={staggerFast}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-3 gap-8 pt-8"
              >
                {[
                  { value: "10+", label: "Happy Customers" },
                  { value: "99%", label: "Satisfaction Rate" },
                  { value: "24/7", label: "Support" }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    variants={scaleIn}
                    whileHover={{ scale: 1.1, y: -5 }}
                    className="cursor-default"
                  >
                    <div className="text-4xl font-bold text-red-600 dark:text-red-500">{stat.value}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{stat.label}</div>
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
                className="bg-black from-gray-900 to-black rounded-3xl p-8 relative overflow-hidden shadow-2xl"
                whileHover={{ scale: 1.02, rotateY: 5 }}
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

                {/* Floating Badges */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-2xl backdrop-blur-sm"
                >
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Artistic Designs</div>
                  <div className="text-sm font-bold text-red-600 dark:text-red-500">Premium Quality</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.5, rotate: 10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 1, type: "spring", stiffness: 200 }}
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-2xl backdrop-blur-sm"
                >
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Eco-Conscious</div>
                  <div className="text-sm font-bold text-red-600 dark:text-red-500">Sustainable</div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white py-20 relative overflow-hidden">
        {/* Animated background shapes */}
        <motion.div
          className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl lg:text-4xl font-bold mb-6 leading-relaxed text-white"
          >
            Join thousands of satisfied customers who've made the switch to HAXEUS. Your perfect T-shirt is just a click
            away.
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
                <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100 px-10 py-6 rounded-full text-lg font-semibold shadow-lg">
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
            className="flex max-w-md mx-auto shadow-2xl rounded-full overflow-hidden bg-white"
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 bg-white text-gray-900 focus:outline-none text-lg min-w-0"
            />
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button className="bg-gray-800 hover:bg-gray-900 text-white px-8 h-full rounded-none rounded-r-full font-semibold whitespace-nowrap">
                Subscribe
              </Button>
            </motion.div>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-sm mt-4 opacity-90"
          >
            Get exclusive offers and updates. Unsubscribe anytime.
          </motion.p>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 snap-start">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={scrollReveal}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Featured <span className="text-red-600 dark:text-red-500">Collection</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Discover our most popular premium T-shirts, carefully crafted for ultimate comfort and style.
            </p>
          </motion.div>

          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg animate-pulse">
                  <div className="aspect-square bg-gray-200 dark:bg-gray-700" />
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            /* Coming Soon State */
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
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Coming Soon!</h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
                We're working on bringing you amazing products. Stay tuned for our upcoming collection!
              </p>
              <Link href="/contact">
                <motion.div whileHover={hoverScale} whileTap={tapScale}>
                  <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 rounded-full text-lg font-semibold shadow-lg">
                    Get Notified
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          ) : (
            /* Products Grid */
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
                    <Card className="overflow-hidden shadow-lg hover:shadow-2xl dark:hover:shadow-red-900/20 border-0 dark:border dark:border-gray-700 bg-white dark:bg-gray-800">
                      <Link href={`/products/${product.id}`}>
                        <div className="aspect-square relative bg-gradient-to-br from-gray-900 to-black group cursor-pointer overflow-hidden">
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
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      </Link>
                      <CardContent className="p-6">
                        <Shuffle
                          text={product.name}
                          tag="h3"
                          className="text-xl font-semibold mb-2 dark:text-white"
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
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mb-4">₹{product.price.toLocaleString("en-IN")}</p>
                        <Link href={`/products/${product.id}`}>
                          <motion.div whileHover={hoverScale} whileTap={tapScale}>
                            <Button className="w-full bg-red-600 text-white hover:bg-red-700 py-6 text-lg font-semibold rounded-xl shadow-md hover:shadow-lg">
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

      {/* Customer Testimonials - Lazy Loaded */}
      <DynamicTestimonials />

      {/* About Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative h-96 lg:h-[500px]"
            >
              <motion.div
                whileHover={{ scale: 1.05, rotate: 2 }}
                transition={{ duration: 0.4 }}
                className="relative h-full"
              >
                <Image
                  src="/images/statue-front.jpg"
                  alt="HAXEUS Quality"
                  fill
                  className="object-cover rounded-2xl shadow-2xl"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg?height=400&width=600&text=About+HAXEUS"
                  }}
                />
              </motion.div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.h2 variants={fadeInRight} className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Crafting <span className="text-red-600 dark:text-red-500">Premium</span> Since 2019
              </motion.h2>
              <motion.p variants={fadeInRight} className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed text-lg">
                At HAXEUS, we believe that comfort shouldn't compromise style. Our journey began with a simple mission:
                to create the perfect T-shirt that combines premium materials, exceptional craftsmanship, and timeless
                design.
              </motion.p>
              <motion.p variants={fadeInRight} className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed text-lg">
                Every piece in our collection is meticulously crafted using the finest cotton blends, ensuring
                durability, breathability, and that luxurious feel against your skin.
              </motion.p>

              <motion.div variants={fadeInRight} className="grid grid-cols-2 gap-6 mb-8">
                {[
                  "Premium Materials",
                  "Ethical Production",
                  "Sustainable Practices",
                  "Perfect Fit"
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center"
                    whileHover={{ x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      className="w-3 h-3 bg-red-600 rounded-full mr-3"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                    />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{feature}</span>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div variants={fadeInRight}>
                <Link href="/about">
                  <motion.div whileHover={hoverScale} whileTap={tapScale}>
                    <Button className="bg-red-600 hover:bg-red-700 text-white px-10 py-6 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl">
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
  )
}
