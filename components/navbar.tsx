"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useCallback, Suspense } from "react"
import dynamic from "next/dynamic"
import { Input } from "@/components/ui/input"
import { ShoppingCart, User, Search, Heart, X, Menu } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useCart } from "@/contexts/CartContext"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import GlassSurface from "@/components/GlassSurface"
import { User as SupabaseUser } from "@supabase/supabase-js"
import type { StaggeredMenuItem } from "@/components/StaggeredMenu"
import { cn } from "@/lib/utils"

// Isolated component that uses useSearchParams — wrapped in Suspense inside Navbar
function NavbarSearchSync({ onSync }: { onSync: (q: string) => void }) {
  const searchParams = useSearchParams()
  useEffect(() => {
    const query = searchParams?.get("search") || ""
    onSync(query)
  }, [searchParams, onSync])
  return null
}

import { useTheme } from "@/components/ThemeProvider"
import { ThemeToggle } from "@/components/ThemeToggle"

const StaggeredMenu = dynamic(
  () => import("@/components/StaggeredMenu").then((mod) => mod.StaggeredMenu),
  { ssr: false }
)

export function Navbar() {
  const { theme } = useTheme()
  const prefersReducedMotion = useReducedMotion()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && theme === "dark"
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const { totalItems, isLoading: isCartLoading } = useCart()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const pathname = usePathname()

  const desktopNavbarGlassProps = {
    brightness: isDark ? 100 : 0,
    opacity: 0.2, // Subtle glass look that doesn't muddy the blend
    blur: 24, 
    backgroundOpacity: 0, // CRITICAL: background color blocks mix-blend-mode
    saturation: 1.2,
    distortionScale: -12,
    redOffset: 0,
    greenOffset: 0,
    blueOffset: 0,
  }
  
  const mobileNavbarGlassProps = {
    brightness: isDark ? 100 : 0,
    opacity: 0.25,
    blur: 12,
    backgroundOpacity: 0,
    distortionScale: -8,
    redOffset: 0,
    greenOffset: 0,
    blueOffset: 0,
  }
  
  const glassFallbackStyle = { '--glass-bg': isDark ? 'rgba(230, 230, 230, 0.12)' : 'rgba(0, 0, 0, 0.05)' } as React.CSSProperties;

  useEffect(() => {
    let active = true
    const initSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          if (error.name !== "AuthSessionMissingError") {
            console.error("Auth init error:", error.message)
          }
          if (active) setUser(null)
          return
        }
        if (active) setUser(data.session?.user ?? null)
      } catch (err) {
        if (active) setUser(null)
      }
    }
    initSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session?.user ?? null)
    })
    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value)
    if (pathname !== "/products") {
      router.push(`/products?search=${encodeURIComponent(value)}`)
    } else {
      const params = new URLSearchParams(window.location.search)
      if (value) params.set("search", value)
      else params.delete("search")
      router.push(`/products?${params.toString()}`)
    }
  }, [pathname, router])

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href) ?? false

  const navLinks = [
    { label: "Products", href: "/products" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ]

  const menuItems: StaggeredMenuItem[] = [
    { label: 'Products', ariaLabel: 'View all products', link: '/products' },
    { label: 'About', ariaLabel: 'Learn about us', link: '/about' },
    { label: 'Contact', ariaLabel: 'Get in touch', link: '/contact' },
    { label: 'Cart', ariaLabel: `Cart – ${totalItems} items`, link: '/cart' },
    { label: 'Wishlist', ariaLabel: 'Your wishlist', link: '/profile?tab=wishlist' },
  ]
  if (user) {
    menuItems.push({ label: 'Profile', ariaLabel: 'View your profile', link: '/profile' })
  } else {
    menuItems.push({ label: 'Sign In', ariaLabel: 'Sign in', link: '/auth' })
  }

  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY < 10) {
        setIsVisible(true)
      } else if (currentScrollY > lastScrollY) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      lastScrollY = currentScrollY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navbarMotion = prefersReducedMotion
    ? { y: 0, opacity: 1 }
    : { y: isVisible ? 0 : -100, opacity: isVisible ? 1 : 0 }

  return (
    <>
      <Suspense fallback={null}>
        <NavbarSearchSync onSync={setSearchQuery} />
      </Suspense>

      {/* ── DESKTOP FLOATING PILL ─────────────────────────────────── */}
      <div className="fixed left-1/2 top-4 z-[60] hidden w-[780px] max-w-[calc(100vw-2rem)] -translate-x-1/2 md:block">
        <motion.div
          className="w-full"
          animate={navbarMotion}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: "easeInOut" }}
          layout="position"
        >
          <GlassSurface
            width="100%"
            height={56}
            borderRadius={100}
            borderWidth={0.06}
            {...desktopNavbarGlassProps}
            style={glassFallbackStyle}
            className="w-full glass-surface-fixed transition-all duration-300"
          >
            <div className="flex items-center justify-between w-full px-5 gap-3 mix-blend-difference">
              <Link
                href="/"
                className="flex items-center gap-2 hover:scale-105 transition-transform shrink-0"
              >
                <Image
                  src="/android-chrome-192x192.png"
                  alt="Logo"
                  width={24}
                  height={24}
                  priority
                  className="w-6 h-6 contrast-200 transition-all invert brightness-0"
                />
                <span className="text-sm font-bold tracking-widest text-white">HAXEUS</span>
              </Link>

              <nav className="flex items-center gap-0.5">
                {navLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 translate-z-0",
                      isActive(item.href)
                        ? "text-[#e93a3a]"
                        : "text-white hover:bg-white/[0.1] mix-blend-difference"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center gap-0.5 shrink-0">
                <ThemeToggle />

                <AnimatePresence mode="wait">
                  {isSearchOpen ? (
                    <motion.div
                      key="search-open"
                      initial={prefersReducedMotion ? false : { width: 0, opacity: 0 }}
                      animate={{ width: 190, opacity: 1 }}
                      exit={prefersReducedMotion ? undefined : { width: 0, opacity: 0 }}
                      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.18 }}
                      layout="position"
                      className="overflow-hidden flex items-center"
                    >
                      <div className="relative w-full mix-blend-difference">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
                        <Input
                          type="text"
                          placeholder="Search…"
                          value={searchQuery}
                          onChange={(e) => handleSearch(e.target.value)}
                          onBlur={() => !searchQuery && setIsSearchOpen(false)}
                          autoFocus
                          className="pl-8 pr-7 h-8 text-xs rounded-full border-none focus:ring-1 focus:ring-[#e93a3a]/50 placeholder:opacity-50 transition-all bg-white/[0.1] text-white placeholder:text-white/30"
                        />
                        <button
                          onClick={() => { setSearchQuery(""); setIsSearchOpen(false) }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 transition-colors text-white/30 hover:text-white/70"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.button
                      key="search-icon"
                      initial={prefersReducedMotion ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={prefersReducedMotion ? { duration: 0 } : undefined}
                      layout="position"
                      onClick={() => setIsSearchOpen(true)}
                      className="p-2 rounded-full transition-all touch-target text-white hover:bg-white/[0.1] mix-blend-difference"
                      aria-label="Search"
                    >
                      <Search className="h-4 w-4" />
                    </motion.button>
                  )}
                </AnimatePresence>

                <Link
                  href="/cart"
                  className="relative p-2 rounded-full transition-all touch-target flex items-center justify-center text-white hover:bg-white/[0.1]"
                  aria-label="Cart"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {mounted && (isCartLoading ? (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-white/10 animate-pulse" aria-hidden="true" />
                  ) : totalItems > 0 ? (
                    <span className="absolute -top-0.5 -right-0.5 bg-[#e93a3a] text-white text-[9px] rounded-full h-4 w-4 flex items-center justify-center font-bold font-sans mix-blend-normal">
                      {totalItems > 9 ? "9+" : totalItems}
                    </span>
                  ) : null)}
                </Link>

                <Link
                  href="/profile?tab=wishlist"
                  className="p-2 rounded-full transition-all touch-target flex items-center justify-center text-white hover:bg-white/[0.1]"
                  aria-label="Wishlist"
                >
                  <Heart className="h-4 w-4" />
                </Link>

                {user ? (
                  <button
                    onClick={() => router.push("/profile")}
                    className="p-2 rounded-full transition-all text-white hover:bg-white/[0.1]"
                    aria-label="Profile"
                  >
                    <User className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => router.push("/auth")}
                    className="ml-1 px-4 py-1.5 bg-[#e93a3a] hover:bg-[#ff4a4a] text-white text-xs font-bold rounded-full transition-all tracking-wide shadow-lg shadow-[#e93a3a]/20"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </GlassSurface>
        </motion.div>
      </div>

      {/* ── MOBILE STAGGERED MENU OVERLAY ────────────────────────── */}
      <div className={`md:hidden fixed inset-0 z-[70] ${isMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <StaggeredMenu
          position="right"
          items={menuItems}
          displaySocials={false}
          displayItemNumbering={false}
          menuButtonColor={"rgba(255,255,255,0.6) mix-blend-difference"}
          openMenuButtonColor={"#e8e8e8 mix-blend-difference"}
          changeMenuColorOnOpen={true}
          colors={isDark ? ['#111111', '#0a0a0a'] : ['#ffffff', '#f5f4f0']}
          accentColor="#e93a3a"
          hideToggle={true}
          onMenuOpen={() => setIsMenuOpen(true)}
          onMenuClose={() => setIsMenuOpen(false)}
          customFooter={
            <div className="px-2 py-4 border-t border-white/5 mt-4">
              <div className="flex flex-col gap-4">
                <span className="text-sm font-bold tracking-widest text-[#e93a3a]">HAXEUS</span>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  <Link href="/terms-conditions" className="text-[10px] uppercase tracking-wider text-white/40 hover:text-[#e93a3a] transition-colors" onClick={() => setIsMenuOpen(false)}>
                    Terms
                  </Link>
                  <Link href="/privacy-policy" className="text-[10px] uppercase tracking-wider text-white/40 hover:text-[#e93a3a] transition-colors" onClick={() => setIsMenuOpen(false)}>
                    Privacy Policy
                  </Link>
                </div>
              </div>
            </div>
          }
        />
      </div>

      {/* ── MOBILE TOP BAR ───────────────────────────────────────── */}
      <motion.div
        className="md:hidden fixed top-0 left-0 right-0 z-[60] px-3 pt-safe px-safe"
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
        animate={navbarMotion}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: "easeInOut" }}
        layout="position"
      >
        <AnimatePresence mode="wait">
          {isSearchOpen ? (
            <motion.div
              key="mobile-search-bar"
              initial={prefersReducedMotion ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.15 }}
              layout="position"
            >
              <GlassSurface
                width="100%"
                height={56}
                borderRadius={100}
                borderWidth={0.05}
                {...mobileNavbarGlassProps}
                style={glassFallbackStyle}
                className="w-full glass-surface-fixed"
              >
                <div className="flex items-center gap-2 w-full px-4 mix-blend-difference">
                  <Search className="shrink-0 text-white" />
                  <Input
                    type="text"
                    placeholder="Search products…"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    onBlur={() => !searchQuery && setIsSearchOpen(false)}
                    autoFocus
                    className="flex-1 h-7 text-sm bg-transparent border-none focus:ring-0 p-0 text-white placeholder:text-white/30"
                  />
                  <button
                    onClick={() => { setSearchQuery(""); setIsSearchOpen(false) }}
                    className="transition-colors text-white hover:text-white/70"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </GlassSurface>
            </motion.div>
          ) : (
            <motion.div
              key="mobile-logo-bar"
              initial={prefersReducedMotion ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.15 }}
              layout="position"
            >
              <GlassSurface
                width="100%"
                height={56}
                borderRadius={100}
                borderWidth={0.05}
                {...mobileNavbarGlassProps}
                style={glassFallbackStyle}
                className="w-full glass-surface-fixed"
              >
                <div className="flex items-center w-full px-4 gap-2 mix-blend-difference text-white">
                  <Link href="/" className="flex items-center gap-2 text-white shrink-0">
                    <Image
                      src="/android-chrome-192x192.png"
                      alt="Logo"
                      width={20}
                      height={20}
                      priority
                      className="w-6 h-6 contrast-200 invert brightness-0"
                    />
                    <span className="text-sm font-bold tracking-widest">HAXEUS</span>
                  </Link>

                  <div className="flex-1" />

                  <ThemeToggle />

                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2 rounded-full transition-colors touch-target flex items-center justify-center"
                    aria-label="Search"
                  >
                    <Search className="h-5 w-5" />
                  </button>

                  <Link
                    href="/cart"
                    className="p-2 rounded-full transition-colors touch-target flex items-center justify-center relative"
                    aria-label="Cart"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {mounted && (isCartLoading ? (
                      <span className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-white/10 animate-pulse" aria-hidden="true" />
                    ) : totalItems > 0 ? (
                      <span className="absolute top-1 right-1 bg-[#e93a3a] text-white text-[8px] rounded-full h-3.5 w-3.5 flex items-center justify-center font-bold font-sans mix-blend-normal">
                        {totalItems > 9 ? "9+" : totalItems}
                      </span>
                    ) : null)}
                  </Link>

                  <button
                    onClick={() => {
                      const btn = document.querySelector<HTMLButtonElement>(
                        '.staggered-menu-wrapper .sm-toggle'
                      )
                      btn?.click()
                    }}
                    className="p-2 rounded-full transition-colors touch-target flex items-center justify-center"
                    aria-label="Menu"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                </div>
              </GlassSurface>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  )
}
