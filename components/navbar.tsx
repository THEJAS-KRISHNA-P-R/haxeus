"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ShoppingCart, User, Menu, X, Search, Heart } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import type { Session } from "@supabase/supabase-js"
import { useCart } from "@/contexts/CartContext"
import { DarkModeToggle, useTheme } from "@/contexts/ThemeContext"
import { motion, AnimatePresence } from "framer-motion"
import { StaggeredMenu } from "@/components/StaggeredMenu"
import type { StaggeredMenuItem } from "@/components/StaggeredMenu"
import DesktopNav from "@/components/DesktopNav"

export function Navbar() {
  const [user, setUser] = useState<any>(null)
  const { totalItems } = useCart()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { theme } = useTheme()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      setUser(data.session?.user ?? null)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Sync search with URL params
  useEffect(() => {
    const query = searchParams?.get("search") || ""
    setSearchQuery(query)
  }, [searchParams])

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    if (pathname !== "/products") {
      router.push(`/products?search=${encodeURIComponent(value)}`)
    } else {
      const params = new URLSearchParams(searchParams?.toString())
      if (value) {
        params.set("search", value)
      } else {
        params.delete("search")
      }
      router.push(`/products?${params.toString()}`)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  // Menu items for staggered menu
  const menuItems: StaggeredMenuItem[] = [
    { label: 'Products', ariaLabel: 'View all products', link: '/products' },
    { label: 'About', ariaLabel: 'Learn about us', link: '/about' },
    { label: 'Contact', ariaLabel: 'Get in touch', link: '/contact' },
    { label: 'Cart', ariaLabel: `View cart with ${totalItems} items`, link: '/cart' },
    { label: 'Wishlist', ariaLabel: 'View your wishlist', link: '/profile?tab=wishlist' },
  ]

  if (user) {
    menuItems.push({ label: 'Profile', ariaLabel: 'View your profile', link: '/profile' })
  } else {
    menuItems.push({ label: 'Sign In', ariaLabel: 'Sign in to your account', link: '/auth' })
  }

  const isDarkMode = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  // Desktop nav items
  const desktopNavItems = [
    { label: 'Products', href: '/products' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ]

  return (
    <>
      {/* Mobile Staggered Menu - Only visible on mobile */}
      <div className={`md:hidden fixed top-0 left-0 w-full h-screen z-50 ${isMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <StaggeredMenu
          position="right"
          items={menuItems}
          displaySocials={false}
          displayItemNumbering={true}
          menuButtonColor={isDarkMode ? "#f3f4f6" : "#111827"}
          openMenuButtonColor={isDarkMode ? "#111827" : "#f3f4f6"}
          changeMenuColorOnOpen={true}
          colors={isDarkMode ? ['#1f2937', '#111827'] : ['#f3f4f6', '#e5e7eb']}
          accentColor="#ef4444"
          onMenuOpen={() => setIsMenuOpen(true)}
          onMenuClose={() => setIsMenuOpen(false)}
          customFooter={
            <div className="flex items-center justify-between px-2 py-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</span>
              <DarkModeToggle />
            </div>
          }
        />
      </div>

      {/* Main Navbar */}
      <nav className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 sticky top-0 z-40 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo (desktop) */}
            <Link
              href="/"
              className="hidden md:flex items-center space-x-2 text-2xl font-bold text-red-600 hover:scale-105 transition-transform"
            >
              <Image
                src="/android-chrome-192x192.png"
                alt="Logo"
                width={32}
                height={32}
                priority
                className="w-8 h-8 dark:invert dark:brightness-0 dark:contrast-200"
              />
              <span>HAXEUS</span>
            </Link>

            {/* Logo (mobile, centered) */}
            <div className="flex flex-1 justify-center md:hidden">
              <Link
                href="/"
                className="flex items-center space-x-2 text-2xl font-bold text-red-600"
              >
                <Image
                  src="/android-chrome-192x192.png"
                  alt="Logo"
                  width={32}
                  height={32}
                  priority
                  className="w-8 h-8 dark:invert dark:brightness-0 dark:contrast-200"
                />
                <span>HAXEUS</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center">
              <DesktopNav items={desktopNavItems} />
            </div>

            {/* Desktop Search & Actions */}
            <div className="hidden md:flex items-center space-x-3">
              {/* Search */}
              <div className="relative">
                <AnimatePresence mode="wait">
                  {isSearchOpen ? (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 250, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                          type="text"
                          placeholder="Search products..."
                          value={searchQuery}
                          onChange={(e) => handleSearch(e.target.value)}
                          onBlur={() => !searchQuery && setIsSearchOpen(false)}
                          autoFocus
                          className="pl-9 pr-4 h-9 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-red-500 focus:ring-red-500"
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsSearchOpen(true)}
                        className="hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <Search className="h-5 w-5" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Cart */}
              <Link href="/cart" className="relative">
                <Button variant="ghost" size="sm" className="hover:bg-gray-100 dark:hover:bg-gray-800">
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Button>
              </Link>

              {/* Wishlist */}
              <Link href="/profile?tab=wishlist">
                <Button variant="ghost" size="sm" className="hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>

              {/* Dark Mode Toggle */}
              <DarkModeToggle />

              {/* User */}
              {user ? (
                <Button variant="ghost" size="sm" onClick={() => router.push("/profile")} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                  <User className="h-5 w-5" />
                </Button>
              ) : (
                <Button variant="outline" onClick={() => router.push("/auth")} className="hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400 hover:border-red-600 dark:hover:border-red-500">
                  Sign In
                </Button>
              )}
            </div>

            {/* Mobile - Login/User icon on left */}
            <div className="md:hidden w-16 flex items-center">
              {user ? (
                <Link href="/profile">
                  <Button variant="ghost" size="sm" className="hover:bg-gray-100 dark:hover:bg-gray-800">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Link href="/auth">
                  <Button variant="ghost" size="sm" className="hover:bg-gray-100 dark:hover:bg-gray-800">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
