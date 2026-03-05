"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useCallback, Suspense } from "react"
import { Input } from "@/components/ui/input"
import { ShoppingCart, User, Search, Heart, X, Menu } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import type { Session } from "@supabase/supabase-js"
import { useCart } from "@/contexts/CartContext"
import { motion, AnimatePresence } from "framer-motion"
import GlassSurface from "@/components/GlassSurface"
import { DarkModeToggle } from "@/contexts/ThemeContext"
import { StaggeredMenu } from "@/components/StaggeredMenu"
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

import { useTheme } from "@/contexts/ThemeContext"

export function Navbar() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && (theme === "dark" || (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches))
  const [user, setUser] = useState<any>(null)
  const { totalItems } = useCart()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      setUser(data.session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
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

  return (
    <>
      <Suspense fallback={null}>
        <NavbarSearchSync onSync={setSearchQuery} />
      </Suspense>

      {/* ── DESKTOP FLOATING PILL ─────────────────────────────────── */}
      <div
        className="hidden md:flex fixed top-4 z-[200] w-[780px] max-w-[calc(100vw-2rem)]"
        style={{ left: '50%', transform: 'translate(-50%, 0) translateZ(0)', willChange: 'transform' }}
      >
        <GlassSurface
          width="100%"
          height={56}
          borderRadius={100}
          borderWidth={0.06}
          brightness={isDark ? 50 : 100}
          opacity={isDark ? 0.8 : 0.85}
          blur={14}
          backgroundOpacity={isDark ? 0.28 : 0.15}
          saturation={isDark ? 1.2 : 1.1}
          distortionScale={-18}
          redOffset={0}
          greenOffset={0}
          blueOffset={0}
          className="w-full glass-surface-fixed transition-all duration-300"
        >
          <div className="flex items-center justify-between w-full px-5 gap-3">
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
                className={cn(
                  "w-6 h-6 contrast-200 transition-all",
                  isDark ? "invert brightness-0" : "brightness-0"
                )}
              />
              <span className="text-sm font-bold tracking-widest text-[#e93a3a]">HAXEUS</span>
            </Link>

            <nav className="flex items-center gap-0.5">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                    isActive(item.href)
                      ? "text-[#e93a3a] bg-[#e93a3a]/10"
                      : isDark
                        ? "text-white/50 hover:text-white hover:bg-white/[0.07]"
                        : "text-black/50 hover:text-black hover:bg-black/[0.05]"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-0.5 shrink-0">
              <DarkModeToggle />

              <AnimatePresence mode="wait">
                {isSearchOpen ? (
                  <motion.div
                    key="search-open"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 190, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden flex items-center"
                  >
                    <div className="relative w-full">
                      <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5", isDark ? "text-white/40" : "text-black/40")} />
                      <Input
                        type="text"
                        placeholder="Search…"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        onBlur={() => !searchQuery && setIsSearchOpen(false)}
                        autoFocus
                        className={cn(
                          "pl-8 pr-7 h-8 text-xs rounded-full border-none focus:ring-1 focus:ring-[#e93a3a]/50 placeholder:opacity-50",
                          isDark
                            ? "bg-white/[0.06] text-white placeholder:text-white/30"
                            : "bg-black/[0.06] text-black placeholder:text-black/30"
                        )}
                      />
                      <button
                        onClick={() => { setSearchQuery(""); setIsSearchOpen(false) }}
                        className={cn("absolute right-2 top-1/2 -translate-y-1/2 transition-colors", isDark ? "text-white/30 hover:text-white/70" : "text-black/30 hover:text-black/70")}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.button
                    key="search-icon"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setIsSearchOpen(true)}
                    className={cn(
                      "p-2 rounded-full transition-all",
                      isDark
                        ? "text-white/45 hover:text-white hover:bg-white/[0.07]"
                        : "text-black/45 hover:text-black hover:bg-black/[0.05]"
                    )}
                    aria-label="Search"
                  >
                    <Search className="h-4 w-4" />
                  </motion.button>
                )}
              </AnimatePresence>

              <Link
                href="/cart"
                className={cn(
                  "relative p-2 rounded-full transition-all",
                  isDark
                    ? "text-white/45 hover:text-white hover:bg-white/[0.07]"
                    : "text-black/45 hover:text-black hover:bg-black/[0.05]"
                )}
                aria-label="Cart"
              >
                <ShoppingCart className="h-4 w-4" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#e93a3a] text-white text-[9px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </Link>

              <Link
                href="/profile?tab=wishlist"
                className={cn(
                  "p-2 rounded-full transition-all",
                  isDark
                    ? "text-white/45 hover:text-[#c03c9d] hover:bg-[#c03c9d]/[0.08]"
                    : "text-black/45 hover:text-[#c03c9d] hover:bg-[#c03c9d]/[0.08]"
                )}
                aria-label="Wishlist"
              >
                <Heart className="h-4 w-4" />
              </Link>

              {user ? (
                <button
                  onClick={() => router.push("/profile")}
                  className={cn(
                    "p-2 rounded-full transition-all",
                    isDark
                      ? "text-white/45 hover:text-[#07e4e1] hover:bg-[#07e4e1]/[0.08]"
                      : "text-black/45 hover:text-[#059e9b] hover:bg-[#059e9b]/[0.08]"
                  )}
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
      </div>

      {/* ── MOBILE STAGGERED MENU OVERLAY ────────────────────────── */}
      <div className={`md:hidden fixed inset-0 z-[210] ${isMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <StaggeredMenu
          position="right"
          items={menuItems}
          displaySocials={false}
          displayItemNumbering={false}
          menuButtonColor={isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)"}
          openMenuButtonColor={isDark ? "#e8e8e8" : "#222222"}
          changeMenuColorOnOpen={true}
          colors={isDark ? ['#111111', '#0a0a0a'] : ['#ffffff', '#f5f4f0']}
          accentColor="#e93a3a"
          hideToggle={true}
          onMenuOpen={() => setIsMenuOpen(true)}
          onMenuClose={() => setIsMenuOpen(false)}
          customFooter={
            <div className="flex items-center justify-between px-2 py-3">
              <span className="text-sm font-bold tracking-widest text-[#e93a3a]">HAXEUS</span>
            </div>
          }
        />
      </div>

      {/* ── MOBILE TOP BAR ───────────────────────────────────────── */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-[200] px-3 pt-3"
        style={{ willChange: 'transform', transform: 'translateZ(0)' }}
      >
        <AnimatePresence mode="wait">
          {isSearchOpen ? (
            <motion.div
              key="mobile-search-bar"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <GlassSurface
                width="100%"
                height={56}
                borderRadius={100}
                borderWidth={0.05}
                brightness={isDark ? 50 : 100}
                opacity={isDark ? 0.82 : 0.88}
                blur={12}
                backgroundOpacity={isDark ? 0.28 : 0.15}
                distortionScale={-15}
                redOffset={0}
                greenOffset={0}
                blueOffset={0}
                className="w-full glass-surface-fixed"
              >
                <div className="flex items-center gap-2 w-full px-4">
                  <Search className={isDark ? "text-white/40 shrink-0" : "text-black/40 shrink-0"} />
                  <Input
                    type="text"
                    placeholder="Search products…"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    onBlur={() => !searchQuery && setIsSearchOpen(false)}
                    autoFocus
                    className={cn(
                      "flex-1 h-7 text-sm bg-transparent border-none focus:ring-0 p-0",
                      isDark ? "text-white placeholder:text-white/30" : "text-black placeholder:text-black/30"
                    )}
                  />
                  <button
                    onClick={() => { setSearchQuery(""); setIsSearchOpen(false) }}
                    className={isDark ? "text-white/30 hover:text-white/70" : "text-black/30 hover:text-black/70"}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </GlassSurface>
            </motion.div>
          ) : (
            <motion.div
              key="mobile-logo-bar"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <GlassSurface
                width="100%"
                height={56}
                borderRadius={100}
                borderWidth={0.05}
                brightness={isDark ? 50 : 100}
                opacity={isDark ? 0.82 : 0.88}
                blur={12}
                backgroundOpacity={isDark ? 0.28 : 0.15}
                distortionScale={-15}
                redOffset={0}
                greenOffset={0}
                blueOffset={0}
                className="w-full glass-surface-fixed"
              >
                <div className="flex items-center w-full px-4 gap-2">
                  <Link href="/" className="flex items-center gap-2 text-[#e93a3a] shrink-0">
                    <Image
                      src="/android-chrome-192x192.png"
                      alt="Logo"
                      width={20}
                      height={20}
                      priority
                      className={cn("w-6 h-6 contrast-200", isDark ? "invert brightness-0" : "brightness-0")}
                    />
                    <span className="text-sm font-bold tracking-widest">HAXEUS</span>
                  </Link>

                  <div className="flex-1" />

                  <DarkModeToggle />

                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className={cn("p-2 rounded-full transition-colors", isDark ? "text-white/40 hover:text-white/80" : "text-black/40 hover:text-black/80")}
                    aria-label="Search"
                  >
                    <Search className="h-5 w-5" />
                  </button>

                  <Link
                    href={user ? "/profile" : "/auth"}
                    className={cn("p-2 rounded-full transition-colors", isDark ? "text-white/40 hover:text-white/80" : "text-black/40 hover:text-black/80")}
                    aria-label={user ? "Profile" : "Sign in"}
                  >
                    <User className="h-5 w-5" />
                  </Link>

                  <button
                    onClick={() => {
                      const btn = document.querySelector<HTMLButtonElement>(
                        '.staggered-menu-wrapper .sm-toggle'
                      )
                      btn?.click()
                    }}
                    className={cn("p-2 rounded-full transition-colors", isDark ? "text-white/40 hover:text-white/80" : "text-black/40 hover:text-black/80")}
                    aria-label="Menu"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                </div>
              </GlassSurface>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
