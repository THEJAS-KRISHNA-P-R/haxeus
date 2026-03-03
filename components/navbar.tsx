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
import { StaggeredMenu } from "@/components/StaggeredMenu"
import type { StaggeredMenuItem } from "@/components/StaggeredMenu"

// Isolated component that uses useSearchParams — wrapped in Suspense inside Navbar
function NavbarSearchSync({ onSync }: { onSync: (q: string) => void }) {
  const searchParams = useSearchParams()
  useEffect(() => {
    const query = searchParams?.get("search") || ""
    onSync(query)
  }, [searchParams, onSync])
  return null
}

export function Navbar() {
  const [user, setUser] = useState<any>(null)
  const { totalItems } = useCart()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {      setUser(data.session?.user ?? null)
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
      {/* Sync search query from URL params — Suspense boundary lives here, not in layout */}
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
          brightness={18}
          opacity={0.92}
          blur={14}
          distortionScale={-160}
          redOffset={0}
          greenOffset={8}
          blueOffset={18}
          backgroundOpacity={0.08}
          saturation={1.4}
          className="w-full glass-surface-fixed"
          disableSvgFilter={true}
        >
          <div className="flex items-center justify-between w-full px-5 gap-3">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 text-[#e93a3a] hover:scale-105 transition-transform shrink-0"
            >
              <Image
                src="/android-chrome-192x192.png"
                alt="Logo"
                width={24}
                height={24}
                priority
                className="w-6 h-6 invert brightness-0 contrast-200"
              />
              <span className="text-sm font-bold tracking-widest">HAXEUS</span>
            </Link>

            {/* Nav links */}
            <nav className="flex items-center gap-0.5">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${isActive(item.href)
                      ? "text-[#e93a3a] bg-[#e93a3a]/10"
                      : "text-white/50 hover:text-white hover:bg-white/[0.07]"
                    }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-0.5 shrink-0">
              {/* Search toggle */}
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
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
                      <Input
                        type="text"
                        placeholder="Search…"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        onBlur={() => !searchQuery && setIsSearchOpen(false)}
                        autoFocus
                        className="pl-8 pr-7 h-8 text-xs bg-white/[0.06] border-white/10 text-white placeholder:text-white/30 focus:ring-1 focus:ring-[#e93a3a]/50 rounded-full"
                      />
                      <button
                        onClick={() => { setSearchQuery(""); setIsSearchOpen(false) }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
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
                    exit={{ opacity: 0 }}
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2 rounded-full text-white/45 hover:text-white hover:bg-white/[0.07] transition-all"
                    aria-label="Search"
                  >
                    <Search className="h-4 w-4" />
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative p-2 rounded-full text-white/45 hover:text-white hover:bg-white/[0.07] transition-all"
                aria-label="Cart"
              >
                <ShoppingCart className="h-4 w-4" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#e93a3a] text-white text-[9px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </Link>

              {/* Wishlist */}
              <Link
                href="/profile?tab=wishlist"
                className="p-2 rounded-full text-white/45 hover:text-[#c03c9d] hover:bg-[#c03c9d]/[0.08] transition-all"
                aria-label="Wishlist"
              >
                <Heart className="h-4 w-4" />
              </Link>

              {/* User / Sign In */}
              {user ? (
                <button
                  onClick={() => router.push("/profile")}
                  className="p-2 rounded-full text-white/45 hover:text-[#07e4e1] hover:bg-[#07e4e1]/[0.08] transition-all"
                  aria-label="Profile"
                >
                  <User className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={() => router.push("/auth")}
                  className="ml-1 px-4 py-1.5 bg-[#e93a3a] hover:bg-[#e93a3a]/80 text-white text-xs font-bold rounded-full transition-all tracking-wide"
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
          menuButtonColor="rgba(255,255,255,0.6)"
          openMenuButtonColor="#e8e8e8"
          changeMenuColorOnOpen={true}
          colors={['#111111', '#0a0a0a']}
          accentColor="#e93a3a"
          hideToggle={true}
          onMenuOpen={() => setIsMenuOpen(true)}
          onMenuClose={() => setIsMenuOpen(false)}
          customFooter={
            <div className="flex items-center justify-between px-2 py-3">
              <span className="text-sm font-bold tracking-widest text-white/40">HAXEUS</span>
            </div>
          }
        />
      </div>

      {/* ── MOBILE TOP BAR ───────────────────────────────────────── */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-[200] px-2 pt-4"
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
                height={48}
                borderRadius={100}
                borderWidth={0.05}
                brightness={16}
                opacity={0.9}
                blur={20}
                distortionScale={-150}
                backgroundOpacity={0.08}
                saturation={1.3}
                className="w-full glass-surface-fixed"
                disableSvgFilter={true}
              >
                <div className="flex items-center gap-2 w-full px-4">
                  <Search className="h-4 w-4 text-white/40 shrink-0" />
                  <Input
                    type="text"
                    placeholder="Search products…"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    onBlur={() => !searchQuery && setIsSearchOpen(false)}
                    autoFocus
                    className="flex-1 h-7 text-sm bg-transparent border-none text-white placeholder:text-white/30 focus:ring-0 p-0"
                  />
                  <button
                    onClick={() => { setSearchQuery(""); setIsSearchOpen(false) }}
                    className="text-white/30 hover:text-white/70 shrink-0"
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
                height={48}
                borderRadius={100}
                borderWidth={0.05}
                brightness={16}
                opacity={0.9}
                blur={20}
                distortionScale={-150}
                backgroundOpacity={0.08}
                saturation={1.3}
                className="w-full glass-surface-fixed"
                disableSvgFilter={true}
              >
                <div className="flex items-center w-full px-4 gap-2">
                  {/* Logo */}
                  <Link href="/" className="flex items-center gap-2 text-[#e93a3a] shrink-0">
                    <Image
                      src="/android-chrome-192x192.png"
                      alt="Logo"
                      width={20}
                      height={20}
                      priority
                      className="w-5 h-5 invert brightness-0 contrast-200"
                    />
                    <span className="text-sm font-bold tracking-widest">HAXEUS</span>
                  </Link>

                  <div className="flex-1" />

                  {/* Search */}
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2 rounded-full text-white/40 hover:text-white/80 transition-colors"
                    aria-label="Search"
                  >
                    <Search className="h-[18px] w-[18px]" />
                  </button>

                  {/* User / login */}
                  <Link
                    href={user ? "/profile" : "/auth"}
                    className="p-2 rounded-full text-white/40 hover:text-white/80 transition-colors"
                    aria-label={user ? "Profile" : "Sign in"}
                  >
                    <User className="h-[18px] w-[18px]" />
                  </Link>

                  {/* Hamburger — opens StaggeredMenu overlay */}
                  <button
                    onClick={() => {
                      // Trigger the StaggeredMenu's own internal toggle by
                      // clicking its hamburger button inside the overlay div
                      const btn = document.querySelector<HTMLButtonElement>(
                        '.staggered-menu-wrapper .sm-toggle'
                      )
                      btn?.click()
                    }}
                    className="p-2 rounded-full text-white/40 hover:text-white/80 transition-colors"
                    aria-label="Menu"
                  >
                    <Menu className="h-[18px] w-[18px]" />
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
