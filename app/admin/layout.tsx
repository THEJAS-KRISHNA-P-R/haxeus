"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { isAdmin } from "@/lib/admin"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [userEmail, setUserEmail] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAdminAccess()
  }, [])

  async function checkAdminAccess() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        console.log("No user logged in, redirecting to /auth")
        router.push("/auth")
        return
      }

      console.log("User found:", user.email, "UUID:", user.id)
      console.log("Checking admin status...")

      const adminStatus = await isAdmin()
      console.log("Admin status:", adminStatus)

      if (!adminStatus) {
        setError(
          "Access Denied: You don't have admin privileges. Please contact an administrator."
        )
        setLoading(false)
        return
      }

      setUserEmail(user.email || "")
      setLoading(false)
    } catch (error) {
      console.error("Error checking admin access:", error)
      setError(
        "Error checking admin access. Please make sure the database schema is set up correctly."
      )
      setLoading(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="max-w-md p-8 bg-white rounded-lg shadow-lg text-center">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <div className="text-left bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-semibold mb-2">Setup Steps:</p>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Run supabase/schema.sql in Supabase</li>
                <li>Get your user UUID from Supabase Dashboard</li>
                <li>Run supabase/make_admin.sql with your UUID</li>
              </ol>
            </div>
            <Button onClick={() => router.push("/")} className="w-full">
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const navItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/products", icon: Package, label: "Products" },
    { href: "/admin/orders", icon: ShoppingCart, label: "Orders" },
    { href: "/admin/users", icon: Users, label: "Users" },
    { href: "/admin/settings", icon: Settings, label: "Settings" },
  ]

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gray-900 dark:bg-gray-800 text-white flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-gray-800 dark:border-gray-700">
          {sidebarOpen && (
            <h1 className="text-xl font-bold">HAXEUZ Admin</h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white hover:bg-gray-800 dark:hover:bg-gray-700"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-700"
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-800 dark:border-gray-700">
          {sidebarOpen && (
            <div className="mb-3">
              <p className="text-sm text-gray-400 dark:text-gray-500">Logged in as</p>
              <p className="text-sm font-medium truncate">{userEmail}</p>
            </div>
          )}
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-white hover:bg-gray-800 dark:hover:bg-gray-700"
          >
            <LogOut size={20} className="mr-3" />
            {sidebarOpen && <span>Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-white dark:bg-gray-950">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
