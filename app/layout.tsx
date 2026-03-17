import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ConditionalNavbar } from "@/components/ConditionalNavbar"
import { ConditionalFooter } from "@/components/ConditionalFooter"
import { Toaster } from "@/components/ui/toaster"
import { CartProvider } from "@/contexts/CartContext"
import { ThemeProvider } from "@/components/ThemeProvider"
import { PWAProvider } from "@/components/PWAProvider"
import { LightPillarBackground } from "@/components/LightPillarBackground"
import { OrganizationJsonLd, WebsiteJsonLd } from "@/components/JsonLd"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import type { Metadata, Viewport } from "next"

const inter = Inter({ subsets: ["latin"] })

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://haxeus.in"
const SITE_NAME = "HAXEUS"
const SITE_DESCRIPTION =
  "HAXEUS — Premium streetwear for those who move differently. Shop hoodies, tees, and premium apparel. Oversized fits, dark aesthetics, limited drops."
const OG_IMAGE = `${SITE_URL}/og-image.jpg`

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Premium Artistic Streetwear`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "HAXEUS", "haxeus", "haxeus.in",
    "premium streetwear India", "oversized hoodies India", "dark aesthetic clothing",
    "premium streetwear brand India", "limited drop streetwear",
    "streetwear Kerala", "graphic tees India", "urban fashion India", "oversized tshirt India",
  ],
  authors: [{ name: "HAXEUS", url: SITE_URL }],
  creator: "HAXEUS",
  publisher: "HAXEUS",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Premium Artistic Streetwear`,
    description: SITE_DESCRIPTION,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "HAXEUS — Premium Artistic Streetwear", type: "image/jpeg" }],
    determiner: "auto",
  },
  twitter: {
    card: "summary_large_image",
    site: "@haxeus",
    creator: "@haxeus",
    title: `${SITE_NAME} — Premium Artistic Streetwear`,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  icons: {
    icon: [
      { url: '/favi/favicon.ico' },
      { url: '/favi/favicon.svg', type: 'image/svg+xml' },
      { url: '/favi/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [{ url: '/favi/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/manifest.json',
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  applicationName: SITE_NAME,
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: SITE_NAME },
  formatDetection: { telephone: false },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    { media: "(prefers-color-scheme: light)", color: "#f5f4f0" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inline script runs before any React hydration — prevents theme flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('haxeus-theme');
                  var dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var theme = t || (dark ? 'dark' : 'light');
                  document.documentElement.setAttribute('data-theme', theme);
                  document.documentElement.classList.add(theme);
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <OrganizationJsonLd />
        <WebsiteJsonLd />
        <ThemeProvider>
          <CartProvider>
            <PWAProvider />

            {/* Fixed viewport background — behind everything */}
            <LightPillarBackground />

            {/* Fixed navbar — above everything */}
            <ConditionalNavbar />

            {/* Scrollable content — sits above the fixed background */}
            <main className="relative min-h-screen" style={{ zIndex: 1 }}>
              {children}
            </main>

            <ConditionalFooter />
            <Toaster />
            <Analytics />
            <SpeedInsights />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
