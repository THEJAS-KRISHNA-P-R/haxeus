/** @type {import('next').NextConfig} */

// ── Security headers (audit fix #7.1, #2.3, #13.1, #14.1) ──────────────────
const securityHeaders = [
  // Prevent clickjacking
  { key: "X-Frame-Options", value: "DENY" },
  // Prevent MIME sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Referrer leakage control
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable unused browser features
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Force HTTPS for 2 years, include subdomains
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // DNS prefetch
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // Content Security Policy
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Razorpay checkout + Next.js inline runtime scripts
      "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com",
      // Supabase realtime (wss) + Razorpay API
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.razorpay.com https://lumberjack.razorpay.com",
      // Supabase Storage images + data URIs + blob for canvas
      "img-src 'self' data: blob: https://*.supabase.co https://hebbkx1anhila5yf.public.blob.vercel-storage.com https://images.unsplash.com",
      // Razorpay modal iframes
      "frame-src https://api.razorpay.com",
      // Inline styles used by Tailwind + Framer Motion
      "style-src 'self' 'unsafe-inline'",
      // Fonts if any are self-hosted
      "font-src 'self' data:",
      // Workers for Three.js/WebGL
      "worker-src 'self' blob:",
    ].join("; "),
  },
]

const nextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable source maps in production (#7.4)
  productionBrowserSourceMaps: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hebbkx1anhila5yf.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "hexzhuaifunjowwqkxcy.supabase.co",
        pathname: "/storage/v1/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
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
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-dialog",
      "@radix-ui/react-popover",
      "@radix-ui/react-icons",
      "@supabase/supabase-js",
    ],
  },
  outputFileTracingIncludes: {
    "/**": ["./node_modules/@img/**/*", "./node_modules/sharp/**/*"],
  },
  // Security headers applied to all routes
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ]
  },
  // Empty turbopack config — signals intentional use of Turbopack (Next.js 16 default)
  turbopack: {},
}

export default nextConfig
