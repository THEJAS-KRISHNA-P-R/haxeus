"use client"

import { Suspense, useMemo } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/ui/ProductCard"
import { useProducts } from "@/hooks/useProductQueries"
import { CURRENCY_SYMBOL } from "@/lib/currency"
import { hoverScale, staggerFast, tapScale } from "@/lib/animations"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function ProductsContent() {
  const prefersReducedMotion = useReducedMotion()
  const { data: rawProducts = [], isLoading: loading } = useProducts()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const searchQuery = searchParams?.get("search") || ""
  const sortBy = searchParams?.get("sort") || "default"
  const priceRange = searchParams?.get("price") || "all"
  const category = searchParams?.get("category") || "all"

  function updateFilters(next: { sort?: string; price?: string; category?: string }) {
    const params = new URLSearchParams(searchParams?.toString())
    const nextSort = next.sort ?? sortBy
    const nextPrice = next.price ?? priceRange
    const nextCategory = next.category ?? category

    if (nextSort === "default") params.delete("sort")
    else params.set("sort", nextSort)

    if (nextPrice === "all") params.delete("price")
    else params.set("price", nextPrice)

    if (nextCategory === "all") params.delete("category")
    else params.set("category", nextCategory)

    const queryString = params.toString()
    router.replace(queryString ? `${pathname}?${queryString}` : (pathname || "/products"))
  }

  function clearFilters() {
    const params = new URLSearchParams(searchParams?.toString())
    params.delete("price")
    params.delete("category")
    params.delete("sort")
    const queryString = params.toString()
    router.replace(queryString ? `${pathname}?${queryString}` : (pathname || "/products"))
  }

  const products = useMemo(
    () =>
      rawProducts.map((product) => ({
        ...product,
        front_image: product.front_image || "/placeholder.svg",
        sizes: product.available_sizes || ["S", "M", "L", "XL"],
      })),
    [rawProducts]
  )

  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (product.description || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (category !== "all") {
      filtered = filtered.filter((product) => product.category === category)
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
  }, [category, priceRange, products, searchQuery, sortBy])

  return (
    <div className="min-h-screen overflow-x-hidden bg-theme pb-12 pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 1, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4 }}
          layout="position"
          className="mb-5 flex flex-wrap items-center justify-between gap-3"
        >
          <div>
            <h1 className="text-2xl font-bold leading-tight text-theme sm:text-3xl">
              Featured <span style={{ color: "var(--accent)" }}>Collection</span>
            </h1>
            <p className="mt-0.5 text-xs text-theme-2">
              {loading ? "..." : filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
              {searchQuery && ` for "${searchQuery}"`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 shrink-0 text-[var(--accent)]" />

            <Select value={priceRange} onValueChange={(value) => updateFilters({ price: value })}>
              <SelectTrigger className="h-8 w-[120px] border border-theme bg-card text-xs text-theme sm:w-[150px]">
                <SelectValue placeholder="Price" />
              </SelectTrigger>
              <SelectContent className="border-theme bg-card text-theme">
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="under-600">Under {CURRENCY_SYMBOL}600</SelectItem>
                <SelectItem value="1000-2000">{CURRENCY_SYMBOL}1,000-{CURRENCY_SYMBOL}2,000</SelectItem>
                <SelectItem value="2000-3000">{CURRENCY_SYMBOL}2,000-{CURRENCY_SYMBOL}3,000</SelectItem>
                <SelectItem value="above-3000">Above {CURRENCY_SYMBOL}3,000</SelectItem>
              </SelectContent>
            </Select>

            <Select value={category} onValueChange={(value) => updateFilters({ category: value })}>
              <SelectTrigger className="h-8 w-[110px] border border-theme bg-card text-xs text-theme focus:ring-0 sm:w-[130px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="border-theme bg-card text-theme">
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="tshirt">T-Shirts</SelectItem>
                <SelectItem value="jersey">Jerseys</SelectItem>
                <SelectItem value="hoodie">Hoodies</SelectItem>
                <SelectItem value="shorts">Shorts</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value) => updateFilters({ sort: value })}>
              <SelectTrigger className="h-8 w-[110px] border border-theme bg-card text-xs text-theme focus:ring-0 sm:w-[140px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent className="border-theme bg-card text-theme">
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="price-low">Low to High</SelectItem>
                <SelectItem value="price-high">High to Low</SelectItem>
                <SelectItem value="name">A to Z</SelectItem>
              </SelectContent>
            </Select>

            {(searchQuery || priceRange !== "all" || category !== "all" || sortBy !== "default") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 px-2 text-xs text-[var(--accent)] hover:bg-[var(--accent)]/10"
              >
                Clear
              </Button>
            )}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : undefined}
              layout="position"
              className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
                <div key={index} className="overflow-hidden rounded-lg bg-card shadow-md shadow-black/10 animate-pulse">
                  <div className="aspect-square bg-[#111]/5" />
                  <div className="space-y-2 p-3 sm:p-5">
                    <div className="h-4 w-3/4 rounded bg-[#111]/5" />
                    <div className="hidden h-3 w-full rounded bg-[#111]/5 sm:block" />
                    <div className="flex items-center justify-between pt-1">
                      <div className="h-6 w-16 rounded bg-[#111]/5" />
                      <div className="h-8 w-16 rounded bg-[#111]/5" />
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : filteredProducts.length === 0 ? (
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.95 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
              layout="position"
              className="py-20 text-center"
            >
              <motion.div
                initial={{ rotate: 0 }}
                animate={prefersReducedMotion ? { rotate: 0 } : { rotate: [0, -10, 10, -10, 0] }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5 }}
                className="mb-6 text-6xl"
              >
                ??
              </motion.div>
              <p className="mb-6 text-2xl text-theme-2">
                {products.length === 0 ? "No products available yet. Check back soon!" : "No products found matching your criteria."}
              </p>
              {products.length > 0 && (
                <motion.div whileHover={prefersReducedMotion ? undefined : hoverScale} whileTap={prefersReducedMotion ? undefined : tapScale}>
                  <Button
                    onClick={clearFilters}
                    className="rounded-xl bg-[var(--accent)] px-8 py-6 text-lg font-semibold shadow-md hover:opacity-90"
                  >
                    Clear Filters
                  </Button>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={prefersReducedMotion ? false : "hidden"}
              animate="visible"
              variants={staggerFast}
              layout="position"
              className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4"
            >
              {filteredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} accentColor="#e7bf04" variant="default" />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6 }}
          layout="position"
          className="mt-20 text-center"
        >
          <motion.p
            className="mb-6 text-lg text-theme-2"
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.2 }}
          >
            Can&apos;t find what you&apos;re looking for?
          </motion.p>
          <motion.div whileHover={prefersReducedMotion ? undefined : hoverScale} whileTap={prefersReducedMotion ? undefined : tapScale}>
            <a href="https://www.instagram.com/haxeus.in/" target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full border-2 border-[var(--accent)] bg-transparent px-10 py-6 text-lg font-semibold text-[var(--accent)] shadow-md hover:bg-[var(--accent)] hover:text-white"
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
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg)]" />}>
      <ProductsContent />
    </Suspense>
  )
}

