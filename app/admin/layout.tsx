"use client"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect, useState, useRef, useCallback } from "react"
import {
  LayoutDashboard, ShoppingBag, Package, Users,
  Tag, Star, BarChart3, Settings, Bell, LogOut, Search, X
} from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { supabase } from "@/lib/supabase"

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Overview" },
  { href: "/admin/orders", icon: ShoppingBag, label: "Orders" },
  { href: "/admin/products", icon: Package, label: "Products" },
  { href: "/admin/users", icon: Users, label: "Customers" },
  { href: "/admin/coupons", icon: Tag, label: "Coupons" },
  { href: "/admin/reviews", icon: Star, label: "Reviews" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
]

// ──────────────────────────────────
// Admin Global Search Component
// ──────────────────────────────────

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

    // 1. Navigation Search
    const navResults: SearchResult[] = navItems
      .filter(item => item.label.toLowerCase().includes(term))
      .map(item => ({
        type: "nav",
        id: item.href,
        title: `Jump to ${item.label}`,
        subtitle: `Navigate to ${item.label} section`,
        href: item.href,
        icon: item.icon
      }))

    // 2. Status-based Order Search
    const statuses = ["paid", "pending", "shipped", "delivered", "cancelled"]
    const matchedStatus = statuses.find(s => s.startsWith(term))

    // 3. Parallel Database Search
    const [ordersRes, productsRes, couponsRes, customersRes] = await Promise.all([
      supabase.from("orders")
        .select("id, email, total_amount, status")
        .or(matchedStatus ? `status.eq.${matchedStatus}` : `email.ilike.%${term}%,id.ilike.%${term}%`)
        .limit(matchedStatus ? 8 : 4),
      supabase.from("products")
        .select("id, name, price, is_active")
        .ilike("name", `%${term}%`)
        .limit(4),
      supabase.from("coupons")
        .select("id, code, discount_type, discount_value, is_active")
        .ilike("code", `%${term}%`)
        .limit(3),
      supabase.from("profiles")
        .select("id, full_name, email")
        .or(`full_name.ilike.%${term}%,email.ilike.%${term}%`)
        .limit(4)
    ])

    const r: SearchResult[] = [...navResults]

    ordersRes.data?.forEach(o => r.push({
      type: "order",
      id: o.id,
      title: `Order #${o.id.slice(-8).toUpperCase()}`,
      subtitle: `${o.email} — ₹${o.total_amount} — ${o.status.toUpperCase()}`,
      href: `/admin/orders?id=${o.id}`,
    }))

    productsRes.data?.forEach(p => r.push({
      type: "product",
      id: String(p.id),
      title: p.name,
      subtitle: `₹${p.price} — ${p.is_active ? "Active" : "Inactive"}`,
      href: `/admin/products/${p.id}`,
    }))

    customersRes.data?.forEach(c => r.push({
      type: "customer",
      id: c.id,
      title: c.full_name || "Unknown Customer",
      subtitle: c.email,
      href: `/admin/users?email=${encodeURIComponent(c.email)}`,
    }))

    couponsRes.data?.forEach(c => r.push({
      type: "coupon",
      id: String(c.id),
      title: c.code,
      subtitle: `${c.discount_type === "percentage" ? c.discount_value + "% off" : "₹" + c.discount_value + " off"} — ${c.is_active ? "Active" : "Paused"}`,
      href: `/admin/coupons`,
    }))

    setResults(r)
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

// ──────────────────────────────────
// Admin Layout
// ──────────────────────────────────

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

  // Client-side auth guard (backup to middleware)
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        router.push('/auth?redirect=/admin')
        return
      }

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      if (!roleData || roleData.role !== 'admin') {
        router.push('/?error=unauthorized')
        return
      }

      setIsAuthorized(true)
    }

    checkAdmin()
  }, [router])

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

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>

      {/* ── SIDEBAR ── */}
      <aside
        style={{
          background: "var(--bg-card)",
          borderRight: "1px solid var(--border)",
          position: "fixed",
          top: 0,
          left: 0,
          width: "256px",
          height: "100vh",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {/* Brand */}
        <div
          style={{ borderBottom: "1px solid var(--border)" }}
          className="px-6 py-8 shrink-0"
        >
          <span style={{ color: "var(--accent)" }} className="text-xl font-bold tracking-widest">
            HAXEUS
          </span>
          <p style={{ color: "var(--text-3)" }} className="text-[10px] font-bold uppercase tracking-wider mt-1">Admin Dashboard</p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                color: isActive(item.href) ? "var(--accent)" : "var(--text-2)",
                background: isActive(item.href) ? "color-mix(in srgb, var(--accent) 10%, transparent)" : "transparent",
                display: "flex",
                alignItems: "center",
                gap: "0.875rem",
                padding: "0.75rem 1rem",
                borderRadius: "0.75rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                textDecoration: "none",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              onMouseEnter={e => {
                if (!isActive(item.href)) {
                  (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)";
                  (e.currentTarget as HTMLElement).style.color = "var(--text)";
                }
              }}
              onMouseLeave={e => {
                if (!isActive(item.href)) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-2)";
                }
              }}
            >
              <item.icon size={18} className="shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Admin user */}
        <div
          style={{ borderTop: "1px solid var(--border)" }}
          className="px-6 py-6 shrink-0"
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              style={{ background: "var(--accent)" }}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-lg shadow-red-500/20"
            >
              A
            </div>
            <div className="min-w-0">
              <p style={{ color: "var(--text)" }} className="text-sm font-bold truncate">Admin</p>
              <p style={{ color: "var(--text-3)" }} className="text-[10px] font-bold uppercase truncate opacity-60">admin@haxeus.com</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{ color: "var(--text-3)" }}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:text-[var(--accent)] transition-colors w-full"
          >
            <LogOut size={14} />
            Logout Session
          </button>
        </div>
      </aside>

      {/* ── ADMIN TOPBAR ── */}
      <header
        style={{
          background: "var(--bg-card)",
          borderBottom: "1px solid var(--border)",
          position: "fixed",
          top: 0,
          left: "256px",
          right: 0,
          height: "64px",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          padding: "0 2rem",
          gap: "1.5rem",
        }}
      >
        {/* Global Search */}
        <AdminSearch />

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => router.push("/admin/notifications")}
            style={{ color: "var(--text-2)" }}
            className="relative p-2.5 rounded-xl hover:bg-[var(--bg-elevated)] hover:text-[var(--text)] transition-all"
          >
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[var(--bg-card)]" />
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main
        style={{ background: "var(--bg)" }}
        className="ml-64 pt-24 min-h-screen px-8"
      >
        {children}

        {/* Admin footer */}
        <footer
          style={{ borderTop: "1px solid var(--border)", color: "var(--text-3)" }}
          className="mt-12 px-8 py-4 text-xs text-center"
        >
          HAXEUS Admin © {new Date().getFullYear()}
        </footer>
      </main>

    </div>
  )
}