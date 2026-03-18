import { createClient } from "@/lib/supabase-server"
import { HomePageClient } from "@/components/home/HomePageClient"
import { DEFAULT_HOMEPAGE_CONFIG } from "@/lib/homepage-defaults"
import { deepMerge } from "@/lib/deep-merge"
import type { Product, ProductImage } from "@/lib/supabase"
import type { HomepageConfig } from "@/types/homepage"

// Force dynamic since we're using cookies in createClient for the homepage config
export const dynamic = "force-dynamic"
export const revalidate = 0

async function getHomepageConfig(supabase: any): Promise<HomepageConfig> {
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

async function getPreorderItems(supabase: any): Promise<Product[]> {
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
    
    // Map images
    return (data || []).map((product: any) => {
      const primaryImg = product.product_images?.find((img: any) => img.is_primary)
      const firstImg = product.product_images?.[0]
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

async function getFeaturedProducts(supabase: any, config: HomepageConfig): Promise<Product[]> {
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

    if (data && data.length > 0) {
      return (data as any[]).map((product) => {
        const primaryImg = product.product_images?.find((img: any) => img.is_primary)
        const firstImg = product.product_images?.[0]
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
  
  // Parallel fetching
  const configPromise = getHomepageConfig(supabase)
  const preordersPromise = getPreorderItems(supabase)
  
  const [config, preorderItems] = await Promise.all([
    configPromise,
    preordersPromise
  ])

  // Featured products depend on config
  const featuredProducts = await getFeaturedProducts(supabase, config)

  return (
    <HomePageClient 
      config={config}
      featuredProducts={featuredProducts}
      preorderItems={preorderItems}
    />
  )
}
