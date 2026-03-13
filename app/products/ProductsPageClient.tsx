"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { ShoppingCart, SlidersHorizontal } from "lucide-react"
import { WishlistButton } from "@/components/WishlistButton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { motion, AnimatePresence } from "framer-motion"
import {
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

function isSupabaseStorageUrl(url?: string) {
  return typeof url === "string" && url.includes(".supabase.co/storage/v1/")
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
        const mappedProducts = data.map(product => {
          const primaryImg = product.product_images?.find((img: any) => img.is_primary)
          const firstImg = product.product_images?.[0]
          const galleryImage = primaryImg?.image_url || firstImg?.image_url

          return {
            ...product,
            front_image: galleryImage || product.front_image || "/placeholder.svg",
            sizes: product.available_sizes || product.sizes || ["S", "M", "L", "XL"],
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

  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (priceRange !== "all") {
      filtered = filtered.filter((product) => {
        if (priceRange === "under-600") return product.price < 600
        if (priceRange === "1000-2000") return product.price >= 1000 && product.price <= 2000
        if (priceRange === "2000-3000") return product.price > 2000 && product.price <= 3000
        if (priceRange === "above-3000") return product.price > 3000
        return true
      })
    }

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
        <motion.div
          initial={{ opacity: 1, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between gap-3 mb-5 flex-wrap"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-theme leading-tight">
              Featured <span style={{ color: "var(--accent)" }}>Collection</span>
            </h1>
            <p className="text-xs text-theme-2 mt-0.5">
              {loading ? "…" : filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
              {searchQuery && ` for "${searchQuery}"`}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal className="w-4 h-4 text-[var(--accent)] shrink-0" />
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="w-[120px] sm:w-[150px] bg-card border border-theme h-8 text-xs text-theme">
                <SelectValue placeholder="Price" />
              </SelectTrigger>
              <SelectContent className="bg-card border-theme text-theme">
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="under-600">Under ₹600</SelectItem>
                <SelectItem value="1000-2000">₹1,000–₹2,000</SelectItem>
                <SelectItem value="2000-3000">₹2,000–₹3,000</SelectItem>
                <SelectItem value="above-3000">Above ₹3,000</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[110px] sm:w-[140px] bg-card border border-theme h-8 text-xs text-theme">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent className="bg-card border-theme text-theme">
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="price-low">Low → High</SelectItem>
                <SelectItem value="price-high">High → Low</SelectItem>
                <SelectItem value="name">A → Z</SelectItem>
              </SelectContent>
            </Select>
            {(searchQuery || priceRange !== "all" || sortBy !== "default") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setPriceRange("all"); setSortBy("default"); window.history.pushState({}, "", "/products") }}
                className="text-[var(--accent)] hover:bg-[var(--accent)]/10 text-xs h-8 px-2"
              >
                Clear
              </Button>
            )}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-card rounded-lg overflow-hidden shadow-md shadow-black/10 animate-pulse">
                  <div className="aspect-square bg-[#111]/5" />
                  <div className="p-3 sm:p-5 space-y-2">
                    <div className="h-4 bg-[#111]/5 rounded w-3/4" />
                    <div className="h-3 bg-[#111]/5 rounded w-full hidden sm:block" />
                    <div className="flex justify-between items-center pt-1">
                      <div className="h-6 bg-[#111]/5 rounded w-16" />
                      <div className="h-8 bg-[#111]/5 rounded w-16" />
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
                ??
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
              className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6"
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
                  <Link href={`/products/${product.id}`} className="block h-full">
                    <Card className="group overflow-hidden bg-card shadow-none hover:shadow-md border border-theme h-full transition-all cursor-pointer">
                      <div className="aspect-square relative bg-black overflow-hidden">
                        <motion.div
                          className="relative h-full w-full"
                          whileHover={{ scale: 1.1, rotate: 2 }}
                          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <Image
                            src={product.front_image || "/placeholder.svg"}
                            alt={`HAXEUS ${product.name} premium streetwear`}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-cover"
                            loading={index < 4 ? "eager" : "lazy"}
                            unoptimized={isSupabaseStorageUrl(product.front_image)}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/placeholder.svg"
                            }}
                          />
                        </motion.div>

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
                              <Button size="sm" className="bg-[var(--accent)] hover:opacity-90 shadow-md" onClick={(e) => e.stopPropagation()}>
                                <ShoppingCart className="w-4 h-4" />
                              </Button>
                            </motion.div>
                          </div>
                        </motion.div>
                      </div>

                      <CardContent className="p-3 sm:p-5 flex flex-col flex-1">
                        <motion.h3
                          className="text-base sm:text-xl font-bold text-theme mb-1 sm:mb-2 hover:text-[var(--accent)] line-clamp-1"
                          whileHover={{ x: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          {product.name}
                        </motion.h3>

                        <p className="text-xs sm:text-sm text-theme-2 mb-2 sm:mb-3 line-clamp-2 leading-relaxed">{product.description}</p>

                        <div className="hidden sm:flex gap-1 mb-3 flex-wrap">
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

                        <div className="mt-auto">
                          <motion.span
                            className="text-base sm:text-xl font-bold text-theme"
                            whileHover={{ scale: 1.1, color: "var(--accent)" }}
                          >
                            ₹{product.price.toLocaleString("en-IN")}
                          </motion.span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

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

export default function ProductsPageClient() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080808]" />}>
      <ProductsContent />
    </Suspense>
  )
}