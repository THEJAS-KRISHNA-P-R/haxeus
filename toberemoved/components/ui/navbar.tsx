"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ShoppingCart, Search, Heart, Menu, X, Sun, Moon, ChevronDown, User
} from "lucide-react"
import { cn } from "@/lib/utils"
import { GlassFilter } from "@/components/ui/liquid-glass-button"

// ── Types ──────────────────────────────────────────────────────────────────

interface NavLink {
  label: string
  href: string
  children?: { label: string; href: string }[]
}

// ── Data ───────────────────────────────────────────────────────────────────

const NAV_LINKS: NavLink[] = [
  { label: "Shop",    href: "/products" },
  { label: "About",   href: "/about"    },
  { label: "Contact", href: "/contact"  },
]

// ── Hooks ──────────────────────────────────────────────────────────────────

function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > threshold)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [threshold])
  return scrolled
}

function useCartCount() {
  // Replace with your real cart hook / context
  return 2
}

// ── Sub-components ─────────────────────────────────────────────────────────

function NavLogo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5 shrink-0 select-none">
      {/* Logo mark: layered circles matching brand palette */}
      <div className="relative w-7 h-7 shrink-0">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#01f3f3] to-[#c23b9a] opacity-20 group-hover:opacity-40 transition-opacity duration-300 blur-[3px]" />
        <div className="relative w-full h-full rounded-full bg-black border border-white/10 flex items-center justify-center overflow-hidden">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#01f3f3] to-[#c23b9a] opacity-90" />
          <div className="absolute w-2 h-2 rounded-full bg-black" />
        </div>
      </div>
      {/* Wordmark */}
      <span
        className="font-black text-[17px] tracking-[0.18em] uppercase"
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.75) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        HAXEUS
      </span>
    </Link>
  )
}

function NavLink({
  link,
  isActive,
}: {
  link: NavLink
  isActive: boolean
}) {
  return (
    <Link
      href={link.href}
      className={cn(
        "relative px-3.5 py-1.5 text-sm font-medium rounded-full transition-all duration-200",
        "group select-none",
        isActive
          ? "text-white"
          : "text-white/50 hover:text-white/90 dark:text-white/45 dark:hover:text-white/85",
      )}
    >
      {/* Active pill background */}
      {isActive && (
        <motion.span
          layoutId="nav-active-pill"
          className="absolute inset-0 rounded-full bg-white/10 border border-white/[0.08]"
          style={{ borderRadius: 9999 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}

      {/* Active dot */}
      {isActive && (
        <span
          className="absolute bottom-[3px] left-1/2 -translate-x-1/2 w-[3px] h-[3px] rounded-full bg-[#01f3f3]"
          style={{ boxShadow: "0 0 6px #01f3f3, 0 0 12px rgba(1,243,243,0.4)" }}
        />
      )}

      {/* Hover underline (non-active) */}
      {!isActive && (
        <span className="absolute bottom-0.5 left-3.5 right-3.5 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
      )}

      <span className="relative z-10">{link.label}</span>
    </Link>
  )
}

function IconButton({
  children,
  label,
  badge,
  onClick,
  className,
}: {
  children: React.ReactNode
  label: string
  badge?: number
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className={cn(
        "relative w-8 h-8 flex items-center justify-center rounded-full",
        "text-white/40 hover:text-white/90",
        "transition-all duration-200",
        "hover:bg-white/[0.07]",
        className,
      )}
    >
      {children}
      {badge !== undefined && badge > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] rounded-full bg-[#c23b9a] flex items-center justify-center px-0.5"
          style={{ boxShadow: "0 0 8px rgba(194,59,154,0.6)" }}
        >
          <span className="text-[9px] font-black text-white leading-none">{badge}</span>
        </motion.span>
      )}
    </button>
  )
}

function ThemeToggle({
  isDark,
  onToggle,
}: {
  isDark: boolean
  onToggle: () => void
}) {
  return (
    <button
      aria-label="Toggle theme"
      onClick={onToggle}
      className={cn(
        "relative w-8 h-8 flex items-center justify-center rounded-full",
        "text-white/40 hover:text-white/90",
        "transition-all duration-200 hover:bg-white/[0.07]",
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.15 }}
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}

// ── Glass pill background ───────────────────────────────────────────────────

function NavPill({
  scrolled,
  children,
  className,
}: {
  scrolled: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("relative", className)}>
      {/* Refraction layer (SVG filter backdrop) */}
      <div
        className="absolute inset-0 rounded-full -z-10 overflow-hidden"
        style={{ backdropFilter: 'url("#nav-glass-filter") blur(0px)' }}
      />

      {/* Glass surface */}
      <div
        className={cn(
          "absolute inset-0 rounded-full transition-all duration-500",
          scrolled
            ? [
                "bg-black/60",
                "shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-1px_0_rgba(0,0,0,0.2)]",
                "border border-white/[0.07]",
              ]
            : [
                "bg-white/[0.055]",
                "shadow-[0_4px_24px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-1px_0_rgba(0,0,0,0.08)]",
                "border border-white/[0.10]",
              ],
          "backdrop-blur-xl",
        )}
      >
        {/* Cyan top highlight line */}
        <div
          className="absolute top-0 left-6 right-6 h-px rounded-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(1,243,243,0.25), rgba(194,59,154,0.15), transparent)",
          }}
        />
      </div>

      {children}
    </div>
  )
}

// ── Mobile Drawer ──────────────────────────────────────────────────────────

function MobileDrawer({
  open,
  onClose,
  links,
  activePath,
  cartCount,
  isDark,
  onToggleDark,
}: {
  open: boolean
  onClose: () => void
  links: NavLink[]
  activePath: string
  cartCount: number
  isDark: boolean
  onToggleDark: () => void
}) {
  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            className={cn(
              "fixed z-50 left-4 right-4",
              "top-[72px]",
              "rounded-2xl overflow-hidden",
              "border border-white/[0.09]",
              "bg-black/85 backdrop-blur-2xl",
              "shadow-[0_16px_48px_rgba(0,0,0,0.5)]",
            )}
          >
            {/* Top accent */}
            <div
              className="h-px w-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent 5%, #01f3f3 30%, #c23b9a 70%, transparent 95%)",
                opacity: 0.5,
              }}
            />

            <nav className="p-3 flex flex-col gap-1">
              {links.map((link, i) => {
                const isActive = activePath === link.href
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, type: "spring", stiffness: 400, damping: 30 }}
                  >
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl",
                        "text-sm font-medium transition-all duration-150",
                        isActive
                          ? "bg-white/[0.08] text-white border border-white/[0.07]"
                          : "text-white/55 hover:text-white hover:bg-white/[0.05]",
                      )}
                    >
                      {isActive && (
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-[#01f3f3]"
                          style={{ boxShadow: "0 0 6px #01f3f3" }}
                        />
                      )}
                      {link.label}
                    </Link>
                  </motion.div>
                )
              })}

              {/* Divider */}
              <div className="my-1 h-px bg-white/[0.06] mx-1" />

              {/* Secondary links */}
              {[
                { label: "Wishlist", href: "/profile?tab=wishlist", icon: Heart },
                { label: "Profile",  href: "/profile",              icon: User  },
              ].map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (links.length + i) * 0.04 + 0.05 }}
                >
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/40 hover:text-white hover:bg-white/[0.05] transition-all duration-150"
                  >
                    <item.icon size={14} />
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              {/* Bottom actions */}
              <div className="mt-1 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-between">
                <Link
                  href="/auth"
                  onClick={onClose}
                  className="text-sm font-semibold text-[#01f3f3] hover:text-[#01f3f3]/80 transition-colors"
                  style={{ textShadow: "0 0 12px rgba(1,243,243,0.4)" }}
                >
                  Sign In →
                </Link>
                <button
                  onClick={onToggleDark}
                  className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors"
                >
                  {isDark ? <Sun size={13} /> : <Moon size={13} />}
                  {isDark ? "Light" : "Dark"}
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ── Main Navbar ────────────────────────────────────────────────────────────

interface NavbarProps {
  /** Pass isDark state from a parent ThemeProvider, or manage internally */
  isDark?: boolean
  onToggleDark?: () => void
}

export default function Navbar({ isDark: isDarkProp, onToggleDark: onToggleDarkProp }: NavbarProps) {
  const pathname   = usePathname()
  const scrolled   = useScrolled()
  const cartCount  = useCartCount()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Internal dark state (fallback when no prop provided)
  const [isDarkInternal, setIsDarkInternal] = useState(true)
  const isDark        = isDarkProp        ?? isDarkInternal
  const onToggleDark  = onToggleDarkProp  ?? (() => setIsDarkInternal((v) => !v))

  // Close drawer on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  return (
    <>
      {/* SVG filter for glass refraction — hidden, affects backdrop-filter */}
      <GlassFilter />

      {/* Additional nav-specific filter */}
      <svg className="pointer-events-none absolute" style={{ width: 0, height: 0, position: "fixed" }}>
        <defs>
          <filter
            id="nav-glass-filter"
            x="-5%" y="-5%" width="110%" height="110%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence type="fractalNoise" baseFrequency="0.04 0.04" numOctaves="1" seed="3" result="turb" />
            <feGaussianBlur in="turb" stdDeviation="1.5" result="blur" />
            <feDisplacementMap in="SourceGraphic" in2="blur" scale="30" xChannelSelector="R" yChannelSelector="B" result="disp" />
            <feGaussianBlur in="disp" stdDeviation="2" />
          </filter>
        </defs>
      </svg>

      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-3 pointer-events-none"
      >
        <NavPill
          scrolled={scrolled}
          className="pointer-events-auto w-full max-w-[700px]"
        >
          <div className="relative z-10 flex items-center h-12 px-3 gap-1">

            {/* Logo */}
            <NavLogo />

            {/* Desktop links — centered */}
            <nav
              className="hidden md:flex items-center gap-0.5 flex-1 justify-center"
              aria-label="Main navigation"
            >
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.href}
                  link={link}
                  isActive={pathname === link.href}
                />
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-0.5 ml-auto">
              {/* Search */}
              <IconButton label="Search">
                <Search size={15} />
              </IconButton>

              {/* Wishlist — hidden on mobile */}
              <Link href="/profile?tab=wishlist" className="hidden sm:flex">
                <IconButton label="Wishlist">
                  <Heart size={15} />
                </IconButton>
              </Link>

              {/* Cart */}
              <Link href="/cart">
                <IconButton label="Cart" badge={cartCount}>
                  <ShoppingCart size={15} />
                </IconButton>
              </Link>

              {/* Theme toggle — hidden on mobile */}
              <span className="hidden sm:flex">
                <ThemeToggle isDark={isDark} onToggle={onToggleDark} />
              </span>

              {/* Sign In — desktop */}
              <Link
                href="/auth"
                className={cn(
                  "hidden md:flex items-center ml-1 px-4 py-1.5 rounded-full",
                  "text-[13px] font-semibold",
                  "bg-white text-black",
                  "hover:bg-white/90 transition-all duration-200",
                  "hover:shadow-[0_0_16px_rgba(1,243,243,0.25)]",
                  "active:scale-[0.97]",
                )}
              >
                Sign In
              </Link>

              {/* Hamburger — mobile only */}
              <button
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden relative w-8 h-8 flex items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/[0.07] transition-all ml-0.5"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={mobileOpen ? "x" : "menu"}
                    initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                    animate={{ rotate: 0,  opacity: 1, scale: 1 }}
                    exit={  { rotate:  90, opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.15 }}
                  >
                    {mobileOpen ? <X size={16} /> : <Menu size={16} />}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>

          </div>
        </NavPill>
      </motion.header>

      {/* Mobile drawer */}
      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        links={NAV_LINKS}
        activePath={pathname}
        cartCount={cartCount}
        isDark={isDark}
        onToggleDark={onToggleDark}
      />
    </>
  )
}
