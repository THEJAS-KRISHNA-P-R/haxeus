import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import { CartProvider } from "@/contexts/CartContext"
import { ThemeProvider } from "@/contexts/ThemeContext"
import { PWAProvider } from "@/components/PWAProvider"
const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "HAXEUZ - Premium Artistic Expression Meets Fashion",
  description: "Discover unique, artistic T-shirts that blend creative expression with premium comfort. Shop exclusive designs, track orders, and enjoy fast shipping.",
  generator: 'v0.dev',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'HAXEUZ'
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#667eea'
}

// Force dynamic rendering for all pages due to navbar using useSearchParams
export const dynamic = 'force-dynamic'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#667eea" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" href="/favi/apple-touch-icon.png" />
        
        {/* Favicons */}
        <link rel="icon" type="image/x-icon" href="/favi/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/favi/favicon.svg" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favi/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />
        
        {/* PWA Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="HAXEUZ" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const storageKey = 'haxeuz-theme';
                const theme = localStorage.getItem(storageKey) || 'light';
                const root = document.documentElement;
                
                if (theme === 'system') {
                  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  root.classList.add(systemTheme);
                } else {
                  root.classList.add(theme);
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="light" storageKey="haxeuz-theme">
          <CartProvider>
            <PWAProvider />
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <Footer />
            <Toaster />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
