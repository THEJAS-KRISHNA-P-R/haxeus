import type React from "react"
import type { Metadata, Viewport } from "next"
import localFont from "next/font/local"
import Script from "next/script"
import "./globals.css"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ConditionalFooter } from "@/components/ConditionalFooter"
import { ConditionalNavbar } from "@/components/ConditionalNavbar"
import { ClientOverlays } from "@/components/ClientOverlays"
import { LightPillarBackground } from "@/components/LightPillarBackground"
import { OrganizationJsonLd, WebsiteJsonLd } from "@/components/JsonLd"
import { PWAProvider } from "@/components/PWAProvider"
import { QueryProvider } from "@/components/QueryProvider"
import { ThemeProvider } from "@/components/ThemeProvider"
import { Toaster } from "@/components/ui/toaster"
import { CartProvider } from "@/contexts/CartContext"

const clashDisplay = localFont({
  src: "../public/fonts/ClashDisplay-Variable.woff2",
  variable: "--font-clash",
  display: "swap",
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://haxeus.in"
const SITE_NAME = "HAXEUS"
const SITE_DESCRIPTION =
  "Premium artistic streetwear from India. Graphic tees, oversized fits, and limited drops for those who wear their world."
const OG_IMAGE = `${SITE_URL}/og-image.jpg`

export const metadata: Metadata = {
  metadataBase: new URL("https://haxeus.in"),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "HAXEUS",
    "haxeus",
    "haxeus.in",
    "premium streetwear India",
    "oversized hoodies India",
    "dark aesthetic clothing",
    "premium streetwear brand India",
    "limited drop streetwear",
    "streetwear Kerala",
    "graphic tees India",
    "urban fashion India",
    "oversized tshirt India",
  ],
  authors: [{ name: "HAXEUS", url: SITE_URL }],
  creator: "HAXEUS",
  publisher: "HAXEUS",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} - Premium Artistic Streetwear`,
    description: SITE_DESCRIPTION,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "HAXEUS - Premium Artistic Streetwear", type: "image/jpeg" }],
    determiner: "auto",
  },
  twitter: {
    card: "summary_large_image",
    site: "@haxeus",
    creator: "@haxeus",
    title: `${SITE_NAME} - Premium Artistic Streetwear`,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  icons: {
    icon: [
      { url: "/favi/favicon.ico" },
      { url: "/favi/favicon.svg", type: "image/svg+xml" },
      { url: "/favi/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [{ url: "/favi/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  applicationName: SITE_NAME,
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: SITE_NAME },
  formatDetection: { telephone: false },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : { google: "REPLACE_AFTER_GSC_SETUP" },
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
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

        {process.env.NEXT_PUBLIC_GA4_ID && (
          <>
            <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA4_ID}`} />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA4_ID}', {
                    page_path: window.location.pathname,
                    send_page_view: true,
                  });
                `,
              }}
            />
          </>
        )}
      </head>
      <body className={`${clashDisplay.variable} font-sans`}>
        <OrganizationJsonLd />
        <WebsiteJsonLd />
        <ThemeProvider>
          <QueryProvider>
            <CartProvider>
              <PWAProvider />
              <LightPillarBackground />
              <ConditionalNavbar />
              <main className="relative min-h-screen" style={{ zIndex: 1 }}>
                {children}
              </main>
              <ConditionalFooter />
              <ClientOverlays />
              <Toaster />
              <Analytics />
              <SpeedInsights />
            </CartProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
