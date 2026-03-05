"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Package, ShoppingCart, Users, Star,
  Ticket, BarChart3, Settings, ChevronLeft, Bell, Search, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";

const nav = [
  { href: "/admin", icon: LayoutDashboard, label: "Overview" },
  { href: "/admin/products", icon: Package, label: "Products" },
  { href: "/admin/orders", icon: ShoppingCart, label: "Orders" },
  { href: "/admin/users", icon: Users, label: "Customers" },
  { href: "/admin/coupons", icon: Ticket, label: "Coupons" },
  { href: "/admin/reviews", icon: Star, label: "Reviews" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => { checkAdminAccess(); }, []);

  async function checkAdminAccess() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }
      const adminStatus = await isAdmin();
      if (!adminStatus) {
        setError("Access Denied: You don't have admin privileges.");
        setLoading(false);
        return;
      }
      setUserEmail(user.email || "");
      setLoading(false);
    } catch {
      setError("Error checking admin access. Please ensure the database schema is configured.");
      setLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#080808]">
        <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-white/60 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#080808] px-4">
        <div className="max-w-md w-full bg-hx-zinc border border-white/[0.08] rounded-2xl p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
            <span className="text-red-400 text-2xl font-bold">!</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-white/40 text-sm mb-6">{error}</p>
          <button onClick={() => router.push("/")}
            className="w-full py-2.5 text-sm font-semibold bg-white text-black rounded-xl hover:bg-white/90 transition-colors">
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#080808] text-white">
      <motion.aside
        data-testid="admin-sidebar"
        animate={{ width: collapsed ? 64 : 220 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed top-0 left-0 h-screen flex-shrink-0 flex flex-col border-r border-white/[0.06] overflow-hidden z-[40] bg-[#080808] pt-20"
      >
        <div className={cn(
          "h-16 flex items-center px-4 border-b border-white/[0.06] flex-shrink-0",
          collapsed ? "justify-center" : "justify-between"
        )}>
          {!collapsed && (
            <Link href="/admin" className="flex items-center gap-2">
              <Image
                src="/android-chrome-192x192.png"
                alt="Logo"
                width={22}
                height={22}
                className="w-[22px] h-[22px] brightness-0 contrast-200"
              />
              <span className="font-display text-lg font-bold tracking-widest text-[#e93a3a]">HAXEUS</span>
            </Link>
          )}
          <button onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/[0.06] transition-all">
            <motion.div animate={{ rotate: collapsed ? 180 : 0 }}>
              <ChevronLeft size={16} />
            </motion.div>
          </button>
        </div>

        <nav className="flex-1 py-3 px-2 flex flex-col gap-1 overflow-y-auto">
          {nav.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                  isActive
                    ? "bg-[#e93a3a]/10 text-[#e93a3a]"
                    : "text-white/40 hover:text-white hover:bg-white/[0.04]"
                )}>
                {isActive && (
                  <motion.div layoutId="admin-nav-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#e93a3a] rounded-full" />
                )}
                <item.icon size={17} className="flex-shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -4 }}
                      className="text-sm font-medium whitespace-nowrap">
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="p-4 border-t border-white/[0.06] space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#e93a3a]/20 flex items-center justify-center text-xs font-bold text-[#e93a3a] border border-[#e93a3a]/20">
                A
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white">Admin</div>
                <div className="text-[10px] text-white/30 truncate">{userEmail || "haxeus.in"}</div>
              </div>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/[0.06] transition-all text-xs font-medium">
              <LogOut size={13} /> Logout
            </button>
          </div>
        )}
      </motion.aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden pt-20"
        style={{ marginLeft: collapsed ? 64 : 220, transition: 'margin-left 0.3s' }}>
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/[0.06] flex-shrink-0">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
            <input type="text" placeholder="Search orders, products..."
              className="w-60 pl-9 pr-4 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/70 placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all" />
          </div>
          <button onClick={() => router.push('/admin/notifications')} className="relative p-2 text-white/30 hover:text-white transition-colors">
            <Bell size={18} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-hx-accent rounded-full" />
          </button>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}