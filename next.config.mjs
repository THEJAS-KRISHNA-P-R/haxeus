/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'hexzhuaifunjowwqkxcy.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    unoptimized: false,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60,
  },
  compress: true,
  reactStrictMode: true,
  poweredByHeader: false,
  // Faster compilation
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-dialog',
      '@radix-ui/react-popover',
      '@radix-ui/react-icons',
      '@supabase/supabase-js',
    ],
  },
  outputFileTracingIncludes: {
    '/**': ['./node_modules/@img/**/*', './node_modules/sharp/**/*'],
  },
  // Empty turbopack config — signals intentional use of Turbopack (Next.js 16 default)
  turbopack: {},
}

export default nextConfig
