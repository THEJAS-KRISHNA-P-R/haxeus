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
  front_image: string
  back_image: string
  available_sizes?: string[]
  sizes?: string[]
}

const staticProducts: Product[] = [
  {
    id: 1,
    name: "BUSTED Vintage Tee",
    description:
      "Make a bold statement with our BUSTED vintage wash tee. Featuring distressed tie-dye effects and striking red typography, this piece embodies rebellious spirit.",
    price: 2499.0,
    front_image: "/images/busted-front.jpg",
    back_image: "/images/busted-front.jpg",
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    id: 2,
    name: "Save The Flower Tee",
    description:
      "Eco-conscious design featuring delicate hand and flower artwork with a meaningful environmental message. Made from 100% organic cotton.",
    price: 2799.0,
    front_image: "/images/save-flower-front.jpg",
    back_image: "/images/save-flower-back.jpg",
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    id: 3,
    name: "Statue Tee",
    description:
      "Clean, understated design perfect for everyday wear. Crafted with the finest cotton for exceptional softness and breathability.",
    price: 2299.0,
    front_image: "/images/statue-front.jpg",
    back_image: "/images/statue-back.jpg",
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    id: 4,
    name: "HEX Geometric Tee",
    description:
      "Modern geometric pattern with unique diagonal stripes and HEX branding. Premium tie-dye wash creates a unique texture.",
    price: 2999.0,
    front_image: "/images/ufo-front.jpg",
    back_image: "/images/ufo-back.jpg",
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    id: 5,
    name: "Renaissance Fusion Tee",
    description:
      "Artistic blend of classical sculpture and contemporary sunflower elements. Features a detailed statue bust with vibrant sunflower crown.",
    price: 3199.0,
    front_image: "/images/soul-front.jpg",
    back_image: "/images/soul-back.jpg",
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
]

export default function ProductsPage() {
  // Load static products immediately to prevent skeleton flash
  const [products, setProducts] = useState<Product[]>(staticProducts)
  const [loading, setLoading] = useState(false)
  const [sortBy, setSortBy] = useState("default")
  const [priceRange, setPriceRange] = useState("all")
  const searchParams = useSearchParams()
  const searchQuery = searchParams?.get("search") || ""

  useEffect(() => {
    // Quietly fetch from Supabase in background
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from("products").select("*").order("id")

      if (!error && data && data.length > 0) {
        // Update with Supabase data if available
        const mappedProducts = data.map(product => ({
          ...product,
          sizes: product.available_sizes || product.sizes || ["S", "M", "L", "XL", "XXL"]
        }))
        setProducts(mappedProducts)
      }
      // If error or no data, keep using static products (already set)
    } catch (error) {
      // Static products already loaded, no action needed
      console.warn("Using static product data:", error)
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-12 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="text-center mb-12"
        >
          <motion.h1 
            className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            Featured <motion.span 
              className="text-red-600 dark:text-red-500"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Collection
            </motion.span>
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
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
              <SlidersHorizontal className="w-5 h-5 text-red-600 dark:text-red-500" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Filters:</span>
            </motion.div>
            
            <motion.div whileHover={hoverScale} whileTap={tapScale}>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="w-[200px] bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:border-red-500 dark:hover:border-red-500 shadow-sm">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="under-2000">Under ₹2,000</SelectItem>
                  <SelectItem value="2000-3000">₹2,000 - ₹3,000</SelectItem>
                  <SelectItem value="above-3000">Above ₹3,000</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>

            <motion.div whileHover={hoverScale} whileTap={tapScale}>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px] bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:border-red-500 dark:hover:border-red-500 shadow-sm">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <SelectItem value="default" className="dark:text-gray-300 dark:hover:bg-gray-700">Default</SelectItem>
                  <SelectItem value="price-low" className="dark:text-gray-300 dark:hover:bg-gray-700">Price: Low to High</SelectItem>
                  <SelectItem value="price-high" className="dark:text-gray-300 dark:hover:bg-gray-700">Price: High to Low</SelectItem>
                  <SelectItem value="name" className="dark:text-gray-300 dark:hover:bg-gray-700">Name: A to Z</SelectItem>
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
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 font-semibold"
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
            className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Showing <span className="font-bold text-red-600 dark:text-red-500">{filteredProducts.length}</span> {filteredProducts.length === 1 ? "product" : "products"}
            {searchQuery && ` for "${searchQuery}"`}
          </motion.div>
        </motion.div>

        {/* Products Grid */}
        <AnimatePresence mode="wait">
          {filteredProducts.length === 0 ? (
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
              <p className="text-2xl text-gray-600 dark:text-gray-400 mb-6">No products found matching your criteria.</p>
              <motion.div whileHover={hoverScale} whileTap={tapScale}>
                <Button
                  onClick={() => {
                    setPriceRange("all")
                    setSortBy("default")
                    window.history.pushState({}, "", "/products")
                  }}
                  className="bg-red-600 hover:bg-red-700 px-8 py-6 text-lg font-semibold rounded-xl shadow-lg"
                >
                  Clear Filters
                </Button>
              </motion.div>
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
                  variants={scrollReveal}
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="snap-start"
                >
                  <Card className="group overflow-hidden bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl dark:hover:shadow-red-900/20 border-0 dark:border dark:border-gray-700 h-full">
                    {/* Product Image */}
                    <Link href={`/products/${product.id}`}>
                      <div className="aspect-square relative bg-gradient-to-br from-gray-900 to-black overflow-hidden cursor-pointer">
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
                          initial={{ opacity: 0 }}
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
                                className="bg-white text-black hover:bg-gray-100 shadow-lg"
                              />
                            </motion.div>
                            <motion.div 
                              initial={{ y: 20, opacity: 0 }}
                              whileHover={{ y: 0, opacity: 1, scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button size="sm" className="bg-red-600 hover:bg-red-700 shadow-lg">
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
                          className="text-lg font-bold text-gray-900 dark:text-white mb-2 hover:text-red-600 dark:hover:text-red-500 cursor-pointer line-clamp-1"
                          whileHover={{ x: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          {product.name}
                        </motion.h3>
                      </Link>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">{product.description}</p>

                      {/* Size Options */}
                      <div className="flex gap-1 mb-4 flex-wrap">
                        {(product.sizes || product.available_sizes || []).slice(0, 5).map((size, sizeIndex) => (
                          <motion.div
                            key={size}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.05 + sizeIndex * 0.05 }}
                            whileHover={{ scale: 1.1, backgroundColor: "#dc2626", color: "#ffffff" }}
                          >
                            <Badge variant="outline" className="text-xs px-2 py-1 cursor-pointer dark:border-gray-600 dark:text-gray-300 dark:hover:bg-red-600 dark:hover:border-red-600">
                              {size}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>

                      {/* Price and Action */}
                      <div className="flex items-center justify-between">
                        <div>
                          <motion.span 
                            className="text-2xl font-bold text-gray-900 dark:text-white"
                            whileHover={{ scale: 1.1, color: "#dc2626" }}
                          >
                            ₹{product.price.toLocaleString("en-IN")}
                          </motion.span>
                          <div className="text-xs text-green-600 dark:text-green-500 font-medium">✓ Free shipping</div>
                        </div>
                        <Link href={`/products/${product.id}`}>
                          <motion.div whileHover={hoverScale} whileTap={tapScale}>
                            <Button className="bg-red-600 hover:bg-red-700 text-white px-6 py-6 rounded-xl font-semibold shadow-md">
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
            className="text-gray-600 mb-6 text-lg"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Can't find what you're looking for?
          </motion.p>
          <motion.div whileHover={hoverScale} whileTap={tapScale}>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white bg-transparent px-10 py-6 rounded-full text-lg font-semibold shadow-lg"
            >
              Contact Us for Custom Designs
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
