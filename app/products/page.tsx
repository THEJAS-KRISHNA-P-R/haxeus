"use client"

import { useState, useEffect, useMemo, lazy, Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import dynamic from "next/dynamic"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { Heart, ShoppingCart, SlidersHorizontal } from "lucide-react"
import { WishlistButton } from "@/components/WishlistButton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ProductGridSkeleton } from "@/components/ProductSkeleton"
import { motion, AnimatePresence } from "framer-motion"
import {
  fadeIn,
  fadeInUp,
  scaleIn,
  scrollReveal,
  staggerFast,
  hoverScale,
  tapScale,
} from "@/lib/animations"

interface Product {
  id: number
  name: string
  description: string
  price: number
  front_image?: string
  back_image?: string
  available_sizes?: string[]
  sizes?: string[]
}

function ProductsContent() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState("default")
  const [priceRange, setPriceRange] = useState("all")
  const searchParams = useSearchParams()
  const searchQuery = searchParams?.get("search") || ""

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      // First try to get products with their primary image from product_images
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          product_images (
            image_url,
            is_primary,
            display_order
          )
        `)
        .order("id")

      if (error) throw error

      if (data && data.length > 0) {
        // Map products and set front_image from product_images if available
        const mappedProducts = data.map(product => {
          // Find primary image or first image from gallery
          const primaryImg = product.product_images?.find((img: any) => img.is_primary)
          const firstImg = product.product_images?.[0]
          const galleryImage = primaryImg?.image_url || firstImg?.image_url

          return {
            ...product,
            front_image: galleryImage || product.front_image || "/placeholder.svg",
            sizes: product.available_sizes || product.sizes || ["S", "M", "L", "XL", "XXL"]
          }
        })
        setProducts(mappedProducts)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Price range filter
    if (priceRange !== "all") {
      filtered = filtered.filter((product) => {
        if (priceRange === "under-2000") return product.price < 2000
        if (priceRange === "2000-3000") return product.price >= 2000 && product.price <= 3000
        if (priceRange === "above-3000") return product.price > 3000
        return true
      })
    }

    // Sorting
    if (sortBy === "price-low") {
      filtered.sort((a, b) => a.price - b.price)
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => b.price - a.price)
    } else if (sortBy === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name))
    }

    return filtered
  }, [products, searchQuery, sortBy, priceRange])

  return (
    <div className="min-h-screen bg-theme pt-20 pb-12 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="text-center mb-12"
        >
          <motion.h1
            className="text-5xl lg:text-6xl font-bold text-theme mb-6"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            Featured <motion.span
              style={{ color: "var(--accent)" }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Collection
            </motion.span>
          </motion.h1>
          <motion.p
            className="text-xl text-theme-2 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Discover our most popular premium T-shirts, carefully crafted for ultimate comfort and style.
          </motion.p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-10"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
            >
              <SlidersHorizontal className="w-5 h-5 text-[var(--accent)]" />
              <span className="text-sm font-semibold text-theme-2">Filters:</span>
            </motion.div>

            <motion.div whileHover={hoverScale} whileTap={tapScale}>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="w-[200px] bg-card border border-theme hover:border-[var(--accent)] shadow-sm text-theme">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent className="bg-card border-theme text-theme">
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="under-2000">Under ₹2,000</SelectItem>
                  <SelectItem value="2000-3000">₹2,000 - ₹3,000</SelectItem>
                  <SelectItem value="above-3000">Above ₹3,000</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>

            <motion.div whileHover={hoverScale} whileTap={tapScale}>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px] bg-card border border-theme hover:border-[var(--accent)] shadow-sm text-theme">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent className="bg-card border-theme text-theme">
                  <SelectItem value="default" className="text-white/60 hover:bg-[#111]/5">Default</SelectItem>
                  <SelectItem value="price-low" className="text-white/60 hover:bg-[#111]/5">Price: Low to High</SelectItem>
                  <SelectItem value="price-high" className="text-white/60 hover:bg-[#111]/5">Price: High to Low</SelectItem>
                  <SelectItem value="name" className="text-white/60 hover:bg-[#111]/5">Name: A to Z</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>

            <AnimatePresence>
              {(searchQuery || priceRange !== "all" || sortBy !== "default") && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div whileHover={hoverScale} whileTap={tapScale}>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setPriceRange("all")
                        setSortBy("default")
                        window.history.pushState({}, "", "/products")
                      }}
                      className="text-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 font-semibold"
                    >
                      Clear Filters
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Results count */}
          <motion.div
            className="text-center text-sm text-theme-2 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Showing <span className="font-bold text-[var(--accent)]">{loading ? '...' : filteredProducts.length}</span> {filteredProducts.length === 1 ? "product" : "products"}
            {searchQuery && ` for "${searchQuery}"`}
          </motion.div>
        </motion.div>

        {/* Products Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            // Loading skeleton
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-card rounded-lg overflow-hidden shadow-md shadow-black/10 animate-pulse">
                  <div className="aspect-square bg-[#111]/5" />
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-[#111]/5 rounded w-3/4" />
                    <div className="h-4 bg-[#111]/5 rounded w-full" />
                    <div className="h-4 bg-[#111]/5 rounded w-2/3" />
                    <div className="flex justify-between items-center pt-2">
                      <div className="h-8 bg-[#111]/5 rounded w-24" />
                      <div className="h-10 bg-[#111]/5 rounded w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : filteredProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="text-center py-20"
            >
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
                className="text-6xl mb-6"
              >
                😞
              </motion.div>
              <p className="text-2xl text-theme-2 mb-6">
                {products.length === 0
                  ? "No products available yet. Check back soon!"
                  : "No products found matching your criteria."}
              </p>
              {products.length > 0 && (
                <motion.div whileHover={hoverScale} whileTap={tapScale}>
                  <Button
                    onClick={() => {
                      setPriceRange("all")
                      setSortBy("default")
                      window.history.pushState({}, "", "/products")
                    }}
                    className="bg-[var(--accent)] hover:opacity-90 px-8 py-6 text-lg font-semibold rounded-xl shadow-md"
                  >
                    Clear Filters
                  </Button>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerFast}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.05 }}
                  whileHover={{ y: -10 }}
                  className="snap-start"
                >
                  <Card className="group overflow-hidden bg-card shadow-none hover:shadow-md border border-theme h-full transition-all">
                    {/* Product Image */}
                    <Link href={`/products/${product.id}`}>
                      <div className="aspect-square relative bg-black overflow-hidden cursor-pointer">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 2 }}
                          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <Image
                            src={product.front_image || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-cover"
                            loading={index < 4 ? "eager" : "lazy"}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/placeholder.svg?height=400&width=400&text=Product+Image"
                            }}
                          />
                        </motion.div>

                        {/* Overlay with quick actions */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"
                          initial={{ opacity: 0.4 }}
                          whileHover={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                            <motion.div
                              initial={{ y: 20, opacity: 0 }}
                              whileHover={{ y: 0, opacity: 1, scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <WishlistButton
                                productId={product.id}
                                variant="ghost"
                                size="sm"
                                className="bg-card text-theme hover:bg-theme shadow-md"
                              />
                            </motion.div>
                            <motion.div
                              initial={{ y: 20, opacity: 0 }}
                              whileHover={{ y: 0, opacity: 1, scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button size="sm" className="bg-[var(--accent)] hover:opacity-90 shadow-md">
                                <ShoppingCart className="w-4 h-4" />
                              </Button>
                            </motion.div>
                          </div>
                        </motion.div>
                      </div>
                    </Link>

                    {/* Product Details */}
                    <CardContent className="p-6">
                      <Link href={`/products/${product.id}`}>
                        <motion.h3
                          className="text-lg font-bold text-theme mb-2 hover:text-[var(--accent)] cursor-pointer line-clamp-1"
                          whileHover={{ x: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          {product.name}
                        </motion.h3>
                      </Link>

                      <p className="text-sm text-theme-2 mb-4 line-clamp-2 leading-relaxed">{product.description}</p>

                      {/* Size Options */}
                      <div className="flex gap-1 mb-4 flex-wrap">
                        {(product.sizes || product.available_sizes || []).slice(0, 5).map((size, sizeIndex) => (
                          <motion.div
                            key={size}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.05 + sizeIndex * 0.05 }}
                            whileHover={{ scale: 1.1, backgroundColor: "var(--accent)", color: "#ffffff" }}
                          >
                            <Badge variant="outline" className="text-xs px-2 py-1 cursor-pointer border-theme text-theme-2 hover:bg-[var(--accent)]">
                              {size}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>

                      {/* Price and Action */}
                      <div className="flex items-center justify-between">
                        <div>
                          <motion.span
                            className="text-2xl font-bold text-theme"
                            whileHover={{ scale: 1.1, color: "var(--accent)" }}
                          >
                            ₹{product.price.toLocaleString("en-IN")}
                          </motion.span>
                          <div className="text-xs text-green-500 font-medium">✓ Free shipping</div>
                        </div>
                        <Link href={`/products/${product.id}`}>
                          <motion.div whileHover={hoverScale} whileTap={tapScale}>
                            <Button className="bg-[var(--accent)] hover:opacity-90 text-white px-6 py-6 rounded-full font-semibold shadow-md">
                              View
                            </Button>
                          </motion.div>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mt-20"
        >
          <motion.p
            className="text-theme-2 mb-6 text-lg"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Can't find what you're looking for?
          </motion.p>
          <motion.div whileHover={hoverScale} whileTap={tapScale}>
            <a href="https://www.instagram.com/haxeus.in/" target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white bg-transparent px-10 py-6 rounded-full text-lg font-semibold shadow-md"
              >
                Contact Us for Custom Designs
              </Button>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080808]" />}>
      <ProductsContent />
    </Suspense>
  )
}
