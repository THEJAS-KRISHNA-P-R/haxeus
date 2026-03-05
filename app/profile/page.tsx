"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase, type Order, type OrderItem, type UserAddress } from "@/lib/supabase"
import { removeFromWishlist } from "@/lib/wishlist"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Package,
  MapPin,
  Settings,
  Heart,
  LogOut,
  ShoppingBag,
  Plus,
  Edit,
  Trash2,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface OrderWithItems extends Order {
  order_items: (OrderItem & {
    product: {
      name: string
      front_image: string
    }
  })[]
}

function ProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [wishlist, setWishlist] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("orders")

  useEffect(() => {
    loadUserData()
    // Check if there's a tab parameter in the URL
    const tab = searchParams?.get("tab")
    if (tab) {
      setActiveTab(tab)
    }
  }, [searchParams])

  async function loadUserData() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth")
        return
      }

      setUser(user)

      // Load orders
      const { data: ordersData } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items (
            *,
            product:products (
              name,
              front_image
            )
          )
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      setOrders((ordersData as any) || [])

      // Load addresses
      const { data: addressesData } = await supabase
        .from("user_addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })

      setAddresses(addressesData || [])

      // Load wishlist
      const { data: wishlistData } = await supabase
        .from("wishlist")
        .select(
          `
          *,
          product:products (
            id,
            name,
            price,
            front_image
          )
        `
        )
        .eq("user_id", user.id)

      setWishlist((wishlistData as any) || [])
    } catch (error) {
      console.error("Error loading user data:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/")
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "pending": return "bg-[#e7bf04]/10 text-[#e7bf04] border border-[#e7bf04]/20"
      case "processing": return "bg-[#07e4e1]/10 text-[#07e4e1] border border-[#07e4e1]/20"
      case "shipped": return "bg-[#c03c9d]/10 text-[#c03c9d] border border-[#c03c9d]/20"
      case "delivered": return "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
      case "cancelled": return "bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20"
      default: return "bg-card text-theme-2"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-20 bg-theme">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-theme/10 border-t-[var(--accent)]"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-theme pt-20 pb-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-theme">My Account</h1>
          <p className="text-theme-2 mt-1">{user.email}</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid bg-card border border-theme">
            <TabsTrigger value="orders" className="gap-2 text-theme-2 data-[state=active]:bg-theme data-[state=active]:text-theme">
              <Package size={16} />
              Orders
            </TabsTrigger>
            <TabsTrigger value="addresses" className="gap-2 text-theme-2 data-[state=active]:bg-theme data-[state=active]:text-theme">
              <MapPin size={16} />
              Addresses
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="gap-2 text-theme-2 data-[state=active]:bg-theme data-[state=active]:text-theme">
              <Heart size={16} />
              Wishlist
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 text-theme-2 data-[state=active]:bg-theme data-[state=active]:text-theme">
              <Settings size={16} />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            {orders.length === 0 ? (
              <Card className="bg-card border-theme">
                <CardContent className="py-12 text-center">
                  <ShoppingBag
                    size={48}
                    className="mx-auto text-theme-3 mb-4"
                  />
                  <h3 className="text-lg font-semibold mb-2 text-theme">
                    No orders yet
                  </h3>
                  <p className="text-theme-2 mb-4">
                    Start shopping to see your orders here
                  </p>
                  <Link href="/products">
                    <Button className="bg-[var(--accent)] hover:opacity-90">Browse Products</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              orders.map((order) => (
                <Card key={order.id} className="bg-card border-theme">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg text-theme">
                          Order #{order.id.slice(0, 8)}
                        </CardTitle>
                        <p className="text-sm text-theme-2 mt-1">
                          {new Date(order.created_at!).toLocaleDateString(
                            "en-IN",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-4">
                      {order.order_items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4"
                        >
                          <div className="relative h-16 w-16 rounded-md overflow-hidden bg-background/5 flex-shrink-0">
                            <Image
                              src={
                                item.product.front_image || "/placeholder.jpg"
                              }
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm text-theme">
                              {item.product.name}
                            </p>
                            <p className="text-sm text-theme-2">
                              Size: {item.size} • Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="font-semibold text-theme">
                            ₹{Number(item.price).toLocaleString("en-IN")}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-theme">
                      <p className="font-semibold text-theme">Total</p>
                      <p className="font-bold text-lg text-theme">
                        ₹{Number(order.total_amount).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-theme">Saved Addresses</h2>
              <Link href="/profile/addresses/new">
                <Button className="gap-2 bg-[var(--accent)] hover:opacity-90">
                  <Plus size={16} />
                  Add Address
                </Button>
              </Link>
            </div>

            {addresses.length === 0 ? (
              <Card className="bg-card border-theme">
                <CardContent className="py-12 text-center">
                  <MapPin size={48} className="mx-auto text-theme-3 mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-theme">
                    No saved addresses
                  </h3>
                  <p className="text-theme-2 mb-4">
                    Add an address for faster checkout
                  </p>
                  <Link href="/profile/addresses/new">
                    <Button className="bg-[var(--accent)] hover:opacity-90">Add Address</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((address) => (
                  <Card key={address.id} className="bg-card border-theme text-theme">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-theme">{address.full_name}</p>
                          {address.is_default && (
                            <Badge variant="secondary" className="mt-1 bg-card border border-theme text-theme-2">
                              Default
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" className="hover:bg-theme opacity-10">
                            <Edit size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" className="hover:bg-theme opacity-10">
                            <Trash2 size={16} className="text-[var(--accent)]" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-theme-2 space-y-1">
                        <p>{address.address_line1}</p>
                        {address.address_line2 && <p>{address.address_line2}</p>}
                        <p>
                          {address.city}, {address.state} {address.pincode}
                        </p>
                        <p className="mt-2">Phone: {address.phone}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist" className="space-y-4">
            {wishlist.length === 0 ? (
              <Card className="bg-card border-theme">
                <CardContent className="py-12 text-center">
                  <Heart size={48} className="mx-auto text-theme-3 mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-theme">
                    No items in wishlist
                  </h3>
                  <p className="text-theme-2 mb-4">
                    Save your favorite products here
                  </p>
                  <Link href="/products">
                    <Button className="bg-[var(--accent)] hover:opacity-90">Browse Products</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map((item) => (
                  <Card key={item.id} className="overflow-hidden bg-card border-theme">
                    <Link href={`/products/${item.product.id}`}>
                      <div className="relative h-64 bg-background/5">
                        <Image
                          src={item.product.front_image || "/placeholder.jpg"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </Link>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 text-theme">
                        {item.product.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-lg text-theme">
                          ₹{Number(item.product.price).toLocaleString("en-IN")}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-theme opacity-10"
                          onClick={async () => {
                            // Remove from wishlist
                            const success = await removeFromWishlist(item.product.id)
                            if (success) {
                              // Refresh wishlist
                              loadUserData()
                            }
                          }}
                        >
                          <Trash2 size={16} className="text-[var(--accent)]" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card className="bg-card border-theme">
              <CardHeader>
                <CardTitle className="text-theme">Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-theme-2">
                    Email
                  </label>
                  <p className="mt-1 text-sm text-theme">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-theme-2">
                    Member Since
                  </label>
                  <p className="mt-1 text-sm text-theme">
                    {new Date(user.created_at).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-theme">
              <CardHeader>
                <CardTitle className="text-theme">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 border-theme hover:bg-theme opacity-10 text-theme-2"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-theme" />}>
      <ProfileContent />
    </Suspense>
  )
}