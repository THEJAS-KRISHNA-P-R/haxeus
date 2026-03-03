import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import { CartProvider } from "@/contexts/CartContext"
import { ThemeProvider } from "@/contexts/ThemeContext"
import { PWAProvider } from "@/components/PWAProvider"
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
    <html lang="en" suppressHydrationWarning className="dark">
      <head>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                document.documentElement.classList.add('dark');
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.className} bg-[#080808] text-[#e8e8e8]`}>
        <ThemeProvider defaultTheme="dark" storageKey="haxeus-theme">
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
