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
import type { Metadata, Viewport } from "next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://haxeuz.netlify.app"), // Replace with your actual domain
  title: "HAXEUS - Premium Artistic Expression Meets Fashion",
  description: "Discover unique, artistic T-shirts that blend creative expression with premium comfort. Shop exclusive designs, track orders, and enjoy fast shipping.",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'HAXEUS'
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favi/favicon.ico' },
      { url: '/favi/favicon.svg', type: 'image/svg+xml' },
      { url: '/favi/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/favi/apple-touch-icon.png', sizes: '180x180' }
    ],
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#080808'
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

            <ConditionalFooter /> {/* Changed from Footer */}
            <Toaster />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
