"use client"

import Link from "next/link"
import Image from "next/image"
import dynamic from "next/dynamic"
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

// Lazy load heavy components
const DynamicTestimonials = dynamic(() => import("../components/Testimonials"), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded-lg" />,
})

export default function HomePage() {
  const featuredProducts = [
    {
      id: 1,
      name: "BUSTED Vintage Tee",
      price: 2499.0,
      image: "/images/busted-front.jpg",
    },
    {
      id: 2,
      name: "Save the Flower Tee",
      price: 2799.0,
      image: "/images/save-flower-front.jpg",
    },
    {
      id: 5,
      name: "Renaissance Fusion Tee",
      price: 3199.0,
      image: "/images/statue-front.jpg",
    },
  ]

  return (
    <div className="min-h-screen scroll-smooth overflow-x-hidden bg-white dark:bg-gray-950 transition-colors duration-300">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-16 lg:py-24 snap-start transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-8"
            >
              <motion.div variants={fadeInUp}>
                <motion.h1 
                  className="text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight transition-colors duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                  Artistic <motion.span 
                    className="text-red-600 dark:text-red-500"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    Expression
                  </motion.span>
                  <br />
                  Meets Comfort
                </motion.h1>
                <motion.p 
                  className="text-lg text-gray-600 dark:text-gray-400 mt-6 leading-relaxed transition-colors duration-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  Discover unique, artistic T-shirts that blend creative expression with premium comfort. Each design
                  tells a story, crafted for those who dare to stand out.
                </motion.p>
              </motion.div>

              <motion.div variants={fadeIn} className="flex gap-4 flex-wrap">
                <Link href="/products">
                  <motion.div whileHover={hoverScale} whileTap={tapScale}>
                    <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 rounded-full text-lg shadow-lg hover:shadow-xl transition-all">
                      Shop Collection
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/about">
                  <motion.div whileHover={hoverScale} whileTap={tapScale}>
                    <Button variant="outline" size="lg" className="px-8 py-6 rounded-full border-2 border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-lg transition-colors duration-300">
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
                  { value: "10K+", label: "Happy Customers" },
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
            Join thousands of satisfied customers who've made the switch to HAXEUZ. Your perfect T-shirt is just a click
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
            className="flex max-w-md mx-auto shadow-2xl rounded-full overflow-hidden"
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 text-gray-900 dark:text-gray-900 focus:outline-none text-lg"
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="bg-gray-800 hover:bg-gray-900 dark:bg-gray-900 dark:hover:bg-black text-white px-8 py-8 font-semibold">
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
                  <Card className="overflow-hidden shadow-lg hover:shadow-2xl dark:hover:shadow-red-900/20 transition-all duration-500 border-0 dark:border dark:border-gray-700 bg-white dark:bg-gray-800">
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
                      <h3 className="text-xl font-semibold mb-2 hover:text-red-600 dark:hover:text-red-500 transition-colors dark:text-white">{product.name}</h3>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-4">₹{product.price.toLocaleString("en-IN")}</p>
                      <Link href={`/products/${product.id}`}>
                        <motion.div whileHover={hoverScale} whileTap={tapScale}>
                          <Button className="w-full bg-red-600 text-white hover:bg-red-700 py-6 text-lg font-semibold rounded-xl shadow-md hover:shadow-lg transition-all">
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
                  alt="HAXEUZ Quality"
                  fill
                  className="object-cover rounded-2xl shadow-2xl"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg?height=400&width=600&text=About+HAXEUZ"
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
                At HAXEUZ, we believe that comfort shouldn't compromise style. Our journey began with a simple mission:
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
                <motion.div whileHover={hoverScale} whileTap={tapScale}>
                  <Button className="bg-red-600 hover:bg-red-700 text-white px-10 py-6 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all">
                    Learn More About Us
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
