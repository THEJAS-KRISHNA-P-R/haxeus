/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: [
      'hebbkx1anhila5yf.public.blob.vercel-storage.com',
      'localhost',
    ],
    unoptimized: false,
  },
  compress: true,
}

export default nextConfig
