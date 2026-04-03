"use client"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect, useState, useRef, useCallback } from "react"
import {
  LayoutDashboard, ShoppingBag, Package, Users,
  Tag, Star, BarChart3, Settings, Bell, LogOut, Search, X, Mail, ShoppingCart, HardDrive, Globe, Menu
} from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Overview" },
  { href: "/admin/homepage", icon: Globe, label: "Homepage" },
  { href: "/admin/orders", icon: ShoppingBag, label: "Orders" },
  { href: "/admin/products", icon: Package, label: "Products" },
  { href: "/admin/storage", icon: HardDrive, label: "Storage" },
  { href: "/admin/preorders", icon: ShoppingCart, label: "Pre-Orders" },
  { href: "/admin/users", icon: Users, label: "Customers" },
  { href: "/admin/coupons", icon: Tag, label: "Coupons" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
  { href: "/admin/reviews", icon: Star, label: "Reviews" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/admin/communications", icon: Mail, label: "Communications" },
]

// ----------------------------------
// Admin Global Search Component
// ----------------------------------

interface SearchResult {
  type: "order" | "product" | "customer" | "coupon" | "nav"
  id: string
  title: string
  subtitle: string
  href: string
  icon?: any
}

function AdminSearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const search = useCallback(async (q: string) => {
    const term = q.trim().toLowerCase()
    if (term.length < 2) { setResults([]); return }
    setLoading(true)

    // Sanitize: strip characters that could break PostgREST .or() filter syntax
    const safeTerm = term.replace(/[(),]/g, "")

    // 1. Navigation Search
    const navResults: SearchResult[] = navItems
      .filter(item => item.label.toLowerCase().includes(safeTerm))
      .map(item => ({
        type: "nav",
        id: item.href,
        title: `Jump to ${item.label}`,
        subtitle: `Navigate to ${item.label} section`,
        href: item.href,
        icon: item.icon
      }))

    // 2. Status-based Order Search

    const res = await fetch(`/api/admin/search?q=${encodeURIComponent(term)}`)
    if (!res.ok) { setLoading(false); return }
    const { results: dbResults } = await res.json()

    setResults([...navResults, ...dbResults])
    setLoading(false)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => search(query), 300)
    return () => clearTimeout(t)
  }, [query, search])

  // Keyboard shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
      if (e.key === "Escape") { setOpen(false); setQuery("") }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const typeColors: Record<string, string> = {
    order: "var(--accent-cyan, #07e4e1)",
    product: "var(--accent-yellow, #e7bf04)",
    coupon: "var(--accent-pink, #c03c9d)",
    customer: "var(--accent, #e93a3a)",
    nav: "var(--text-3, #71717a)",
  }

  return (
    <div className="relative flex-1 max-w-sm">
      <div
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          borderRadius: "0.75rem",
          display: "flex", alignItems: "center", gap: "0.5rem",
          padding: "0.375rem 0.75rem",
        }}
      >
        <Search size={14} style={{ color: "var(--text-3)", flexShrink: 0 }} />
        <input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Search nav, users, orders (paid, pending)…"
          style={{
            background: "transparent", border: "none", outline: "none",
            color: "var(--text)", fontSize: "0.8125rem", width: "100%",
          }}
        />
        {query && (
          <button onClick={() => { setQuery(""); setResults([]) }}>
            <X size={12} style={{ color: "var(--text-3)" }} />
          </button>
        )}
      </div>

      {open && (results.length > 0 || loading) && (
        <>
          <div className="fixed inset-0 z-[149]" onClick={() => setOpen(false)} />
          <div
            style={{
              position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0,
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: "0.75rem", zIndex: 150,
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)", overflow: "hidden",
            }}
          >
            {loading ? (
              <div className="px-4 py-3 text-xs" style={{ color: "var(--text-3)" }}>Searching…</div>
            ) : (
              results.map(r => (
                <button
                  key={r.type + r.id}
                  onClick={() => { router.push(r.href); setOpen(false); setQuery("") }}
                  style={{ borderBottom: "1px solid var(--border)", width: "100%" }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-elevated)] transition-colors text-left"
                >
                  <div style={{
                    background: typeColors[r.type] + "15",
                    color: typeColors[r.type],
                    width: "32px", height: "32px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    borderRadius: "8px", flexShrink: 0
                  }}>
                    {r.type === "nav" && r.icon ? <r.icon size={16} /> : (
                      <span style={{ fontSize: "0.6rem", fontWeight: 800 }}>
                        {r.type.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p style={{ color: "var(--text)" }} className="text-sm font-bold truncate">{r.title}</p>
                      <span style={{
                        color: typeColors[r.type],
                        fontSize: "0.55rem", fontWeight: 900,
                        textTransform: "uppercase", letterSpacing: "0.05em",
                        opacity: 0.8
                      }}>
                        {r.type}
                      </span>
                    </div>
                    <p style={{ color: "var(--text-3)" }} className="text-[11px] font-medium truncate opacity-70">{r.subtitle}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ----------------------------------
// Admin Layout
// ----------------------------------

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [adminEmail, setAdminEmail] = useState<string>("Admin")
  const [unreadMsgCount, setUnreadMsgCount] = useState(0)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Server-side auth guard using API route with service role
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch('/api/admin/verify')
        const data = await res.json()

        if (!res.ok || !data.authorized) {
          router.push('/')
          return
        }

        setAdminEmail(data.email ?? 'Admin')
        setIsAuthorized(true)

        // Also fetch unread message count
        const fetchMessages = async () => {
          try {
            const res = await fetch('/api/admin/messages/count')
            if (res.ok) {
              const { count } = await res.json()
              setUnreadMsgCount(count)
            }
          } catch (err) {
            console.warn("Could not fetch unread messages")
          }
        }
        fetchMessages()
      } catch (err) {
        router.push('/')
      }
    }

    checkAdmin()
  }, [router])

  // Close sidebar on navigation (mobile)
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [pathname])

  if (isAuthorized === null) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!isAuthorized) return null

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth")
  }

  const sidebarContent = (
    <>
      {/* Brand */}
      <div
        style={{ borderBottom: "1px solid var(--border)" }}
        className="px-6 py-8 shrink-0 flex items-center justify-between"
      >
        <div>
          <span style={{ color: "var(--accent)" }} className="text-xl font-black tracking-widest uppercase">
            HAXEUS
          </span>
          <p style={{ color: "var(--text-3)" }} className="text-xs mt-1 font-medium">Admin Dashboard</p>
        </div>
        <button className="lg:hidden p-2 text-[var(--text-3)]" onClick={() => setIsSidebarOpen(false)}>
          <X size={20} />
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              color: isActive(item.href) ? "var(--text)" : "var(--text-3)",
              background: isActive(item.href) ? "rgba(var(--text-rgb), 0.05)" : "transparent",
              display: "flex",
              alignItems: "center",
              gap: "0.875rem",
              padding: "0.875rem 1rem",
              borderRadius: "1rem",
              fontSize: "0.8125rem",
              fontWeight: 800,
              textDecoration: "none",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              border: isActive(item.href) ? "1px solid var(--border)" : "1px solid transparent",
            }}
            className="hover:translate-x-1"
          >
            <item.icon size={18} className={cn("shrink-0", isActive(item.href) ? "text-[var(--accent)]" : "opacity-40")} />
            <span className="font-large">{item.label}</span>
            {item.href === "/admin/communications" && unreadMsgCount > 0 && (
              <span className="ml-auto bg-[var(--accent)] text-white text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 shadow-lg shadow-[var(--accent)]/30">
                {unreadMsgCount}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Admin user */}
      <div
        style={{ borderTop: "1px solid var(--border)" }}
        className="px-6 py-6 shrink-0 bg-[var(--bg-elevated)]/30"
      >
        <div className="flex items-center gap-4 mb-5">
          <div
            style={{ background: "var(--accent)" }}
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-xs font-black shrink-0 shadow-xl shadow-[var(--accent)]/20 border border-white/10"
          >
            {adminEmail.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p style={{ color: "var(--text)" }} className="text-xs font-black uppercase tracking-tight truncate">{adminEmail.split('@')[0]}</p>
            <p style={{ color: "var(--text-3)" }} className="text-[9px] font-black uppercase tracking-widest truncate">System Operator</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{ color: "var(--text-3)" }}
          className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.2em] hover:text-[var(--accent)] transition-all w-full"
        >
          <LogOut size={14} />
          Terminate session
        </button>
      </div>
    </>
  )

  return (
    <div id="admin-root" style={{ background: "var(--bg)", minHeight: "100vh" }} className="flex">
      <style jsx global>{`
        #admin-root {
          --text: #ffffff !important;
          --text-2: #f4f4f5 !important;
          --text-3: rgba(255, 255, 255, 0.9) !important;
          --text-rgb: 255, 255, 255 !important;
        }

        [data-theme="light"] #admin-root {
          --text: #000000 !important;
          --text-2: #18181b !important;
          --text-3: rgba(0, 0, 0, 0.8) !important;
          --text-rgb: 0, 0, 0 !important;
        }

        #admin-root p, 
        #admin-root span, 
        #admin-root div,
        #admin-root footer,
        #admin-root aside nav a {
          transition: color 0.1s ease !important;
        }
      `}</style>

      {/* -- DESKTOP SIDEBAR -- */}
      <aside
        style={{
          background: "var(--bg)",
          borderRight: "1px solid var(--border)",
          width: "280px",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
        }}
        className="hidden lg:flex flex-col z-[131]"
      >
        {sidebarContent}
      </aside>

      {/* -- MOBILE DRAWER -- */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[140] lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              style={{ background: "var(--bg)", width: "280px" }}
              className="fixed top-0 left-0 bottom-0 z-[150] lg:hidden flex flex-col shadow-2xl border-right border-[var(--border)]"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 lg:ml-[280px]">
        {/* -- ADMIN TOPBAR -- */}
        <header
          style={{
            background: "rgba(var(--bg-rgb), 0.8)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid var(--border)",
            height: "80px",
          }}
          className="sticky top-0 z-[130] flex items-center px-6 md:px-10 gap-6"
        >
          <button
            className="lg:hidden p-2.5 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border)] text-[var(--text)] active:scale-90 transition-transform"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>

          {/* Global Search */}
          <div className="hidden md:block flex-1 max-w-md">
            <AdminSearch />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => router.push("/admin/notifications")}
              style={{ color: "var(--text-3)" }}
              className="relative p-3 rounded-2xl bg-[var(--bg-elevated)]/50 border border-[var(--border)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text)] transition-all group"
            >
              <Bell size={20} className="group-hover:rotate-12 transition-transform" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[var(--accent)] rounded-full border-2 border-[var(--bg)] shadow-[0_0_8px_var(--accent)]" />
            </button>
          </div>
        </header>

        {/* -- MAIN CONTENT -- */}
        <main
          className="flex-1 p-6 md:p-10 max-w-[1600px] w-full mx-auto"
        >
          {children}

          {/* Admin footer */}
          <footer
            style={{ borderTop: "1px solid var(--border)", color: "var(--text-3)" }}
            className="mt-20 py-8 text-[9px] font-black uppercase tracking-[0.3em] text-center"
          >
            HAXEUS OPERATING SYSTEM v2.01 // © {new Date().getFullYear()} DEEPCORE INDUSTRIES
          </footer>
        </main>
      </div>
    </div>
  )
}
