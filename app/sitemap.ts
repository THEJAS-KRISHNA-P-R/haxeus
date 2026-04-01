import { MetadataRoute } from 'next'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://haxeus.in'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = getSupabaseAdmin()

  // 1. Fetch all products
  const { data: products } = await supabase
    .from('products')
    .select('id, updated_at')

  // 2. Define static routes
  const staticRoutes = [
    '',
    '/products',
    '/about',
    '/blog',
    '/contact',
    '/shipping-returns',
    '/privacy-policy',
    '/terms-of-service',
  ].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // 3. Map products to sitemap entries
  const productRoutes = (products || []).map((product) => ({
    url: `${SITE_URL}/products/${product.id}`,
    lastModified: new Date(product.updated_at || Date.now()),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // 4. Map blog posts (Currently static map from blog/page.tsx logic)
  const blogSlugs = ['indian-streetwear-brands-2026'] // Sync with POST_MAP
  const blogRoutes = blogSlugs.map((slug) => ({
    url: `${SITE_URL}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  return [...staticRoutes, ...productRoutes, ...blogRoutes]
}
