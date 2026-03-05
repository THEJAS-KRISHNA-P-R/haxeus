"use client"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard, ShoppingBag, Package, Users,
  Tag, Star, BarChart3, Settings, Bell, LogOut
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

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

        {/* Nav links — flush immediately below brand, no gap */}
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

        {/* Admin user — inside sidebar, never overlaps anything */}
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
        {/* Search */}
        <div className="relative group">
          <input
            placeholder="Search resources..."
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              borderRadius: "0.875rem",
              padding: "0.5rem 1rem 0.5rem 2.5rem",
              fontSize: "0.8125rem",
              fontWeight: 500,
              outline: "none",
              width: "320px",
              transition: "all 0.2s",
            }}
            onFocus={e => (e.target.style.borderColor = "var(--accent)")}
            onBlur={e => (e.target.style.borderColor = "var(--border)")}
          />
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-[var(--accent)] transition-colors">
            <LayoutDashboard size={14} className="opacity-40" />
          </div>
        </div>

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

        {/* Admin footer — INSIDE main so it scrolls with content, never overlaps sidebar */}
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