"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, User, Menu, X } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import type { Session } from "@supabase/supabase-js";

export function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [cartCount, setCartCount] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      setUser(data.session?.user ?? null)
      if (data.session?.user) {
        fetchCartCount(data.session.user.id)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchCartCount(session.user.id)
      } else {
        setCartCount(0)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchCartCount = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("backend_cartitem").select("quantity").eq("user_id", userId)

      if (error) {
        console.warn("Cart table not set up yet:", error.message)
        setCartCount(0)
        return
      }

      if (data) {
        const total = data.reduce((sum: number, item: any) => sum + item.quantity, 0)
        setCartCount(total)
      }
    } catch (error) {
      console.warn("Error fetching cart count:", error)
      setCartCount(0)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <nav className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 text-2xl font-bold text-red-600">
            <Image src="/android-chrome-192x192.png" alt="Logo" width={32} height={32} priority className="w-8 h-8" />
            <span>HAXEUZ</span>
          </Link>
          {/* Mobile Logo */}
          <Link href="/" className="md:hidden flex items-center space-x-2 text-2xl font-bold text-red-600">
            <Image src="/android-chrome-192x192.png" alt="Logo" width={32} height={32} priority className="w-8 h-8" />
            <span>HAXEUZ</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10">
            <Link href="/products" className="text-gray-700 hover:text-gray-900">
              Products
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-gray-900">
              About
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-gray-900">
              Contact
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="sm">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {user ? (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => router.push("/profile")}>
                  <User className="h-5 w-5" />
                </Button>
                
              </div>
            ) : (
              <Button variant="outline" onClick={() => router.push("/auth")}>Sign In</Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden" id="mobile-menu" role="menu" aria-label="Mobile navigation">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link href="/products" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                Products
              </Link>
              <Link href="/about" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                About
              </Link>
              <Link href="/contact" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                Contact
              </Link>
              <Link href="/cart" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                Cart ({cartCount})
              </Link>
              {user ? (
                <>
                  <Link href="/profile" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                    Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block px-3 py-2 text-gray-700 w-full text-left hover:bg-gray-100 rounded-md"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link href="/auth" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
