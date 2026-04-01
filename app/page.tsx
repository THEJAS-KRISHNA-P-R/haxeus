import { createClient } from "@/lib/supabase-server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"
import { getActiveDrop } from "@/lib/drops"
import { HomePageClient } from "@/components/home/HomePageClient"
import { TrustSignals } from "@/components/TrustSignals"
import { DEFAULT_HOMEPAGE_CONFIG } from "@/lib/homepage-defaults"
import { deepMerge } from "@/lib/deep-merge"
import type { Product, ProductImage } from "@/types/supabase"
import type { HomepageConfig } from "@/types/homepage"
import { SupabaseClient } from "@supabase/supabase-js"
import type { Metadata } from "next"
import { CURRENCY_SYMBOL } from "@/lib/currency"

// Force dynamic since we're using cookies in createClient for the homepage config
export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata: Metadata = {
  title: "Premium Artistic Streetwear India",
  description:
    `Shop limited-drop graphic tees and oversized streetwear. Artistic designs made in India. Free shipping above ${CURRENCY_SYMBOL}999.`,
  alternates: { canonical: "https://haxeus.in" },
  openGraph: {
    url: "https://haxeus.in",
    title: "HAXEUS — Premium Artistic Streetwear India",
    description:
      `Shop limited-drop graphic tees and oversized streetwear. Artistic designs made in India. Free shipping above ${CURRENCY_SYMBOL}999.`,
  },
}

async function getHomepageConfig(supabase: SupabaseClient): Promise<HomepageConfig> {
  try {
    const { data, error } = await supabase
      .from("store_settings")
      .select("value")
      .eq("key", "homepage_config")
      .maybeSingle()

    if (error) throw error

    if (data?.value) {
      return deepMerge(DEFAULT_HOMEPAGE_CONFIG, data.value as any)
    }
  } catch (err) {
    console.error("Error fetching homepage config:", err)
  }
  return DEFAULT_HOMEPAGE_CONFIG
}

async function getPreorderItems(supabase: SupabaseClient): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(`
        id, name, price, description, front_image,
        is_preorder, preorder_status, expected_date,
        max_preorders, preorder_count,
        product_images (image_url, is_primary, display_order)
      `)
      .eq("is_preorder", true)
      .in("preorder_status", ["active", "sold_out"])
      .order("id")

    if (error) throw error
    
    const products = data as any[] | null
    
    // Map images
    return (products || []).map((product) => {
      const images = product.product_images as ProductImage[] | undefined
      const primaryImg = images?.find((img) => img.is_primary)
      const firstImg = images?.[0]
      const galleryImage = primaryImg?.image_url || firstImg?.image_url

      return {
        ...product,
        front_image: galleryImage || product.front_image || "/placeholder.svg"
      }
    })
  } catch (err) {
    console.error("Error fetching preorder items:", err)
    return []
  }
}

async function getFeaturedProducts(supabase: SupabaseClient, config: HomepageConfig): Promise<Product[]> {
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
        category,
        front_image,
        product_images (
          image_url,
          is_primary,
          display_order
        )
      `)

    if (mode === "manual" && config.featured_products.manual_product_ids?.length > 0) {
      query = query.in("id", config.featured_products.manual_product_ids).limit(count)
    } else if (mode === "newest") {
      query = query.order("id", { ascending: false }).limit(count)
    } else {
      query = query.order("id").limit(count)
    }

    const { data, error } = await query
    if (error) throw error

    const products = data as any[] | null

    if (products && products.length > 0) {
      return products.map((product) => {
        const images = product.product_images as ProductImage[] | undefined
        const primaryImg = images?.find((img) => img.is_primary)
        const firstImg = images?.[0]
        const galleryImage = primaryImg?.image_url || firstImg?.image_url

        return {
          ...product,
          front_image: galleryImage || product.front_image || "/placeholder.svg"
        }
      })
    }
  } catch (err) {
    console.error("Error fetching featured products:", err)
  }
  return []
}

export default async function HomePage() {
  const supabase = await createClient()
  const supabaseAdmin = getSupabaseAdmin()
  
  // Parallel fetching
  const configPromise = getHomepageConfig(supabaseAdmin)
  const preordersPromise = getPreorderItems(supabase)
  const activeDropPromise = getActiveDrop()
  
  const [config, preorderItems, activeDrop] = await Promise.all([
    configPromise,
    preordersPromise,
    activeDropPromise,
  ])

  // Featured products depend on config
  const featuredProducts = await getFeaturedProducts(supabase, config)

  return (
    <div className="flex flex-col gap-0">
      <HomePageClient 
        config={config}
        featuredProducts={featuredProducts}
        preorderItems={preorderItems}
        activeDrop={activeDrop}
      />
      <TrustSignals />
    </div>
  )
}
