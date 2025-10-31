"use client"

import { useEffect, useState } from "react"
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

export default function ProfilePage() {
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
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-20 bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Account</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{user.email}</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid dark:bg-gray-800 dark:border-gray-700">
            <TabsTrigger value="orders" className="gap-2 dark:text-gray-300 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">
              <Package size={16} />
              Orders
            </TabsTrigger>
            <TabsTrigger value="addresses" className="gap-2 dark:text-gray-300 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">
              <MapPin size={16} />
              Addresses
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="gap-2 dark:text-gray-300 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">
              <Heart size={16} />
              Wishlist
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 dark:text-gray-300 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">
              <Settings size={16} />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            {orders.length === 0 ? (
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="py-12 text-center">
                  <ShoppingBag
                    size={48}
                    className="mx-auto text-gray-400 dark:text-gray-600 mb-4"
                  />
                  <h3 className="text-lg font-semibold mb-2 dark:text-white">
                    No orders yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Start shopping to see your orders here
                  </p>
                  <Link href="/products">
                    <Button>Browse Products</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              orders.map((order) => (
                <Card key={order.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg dark:text-white">
                          Order #{order.id.slice(0, 8)}
                        </CardTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
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
                          <div className="relative h-16 w-16 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
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
                            <p className="font-medium text-sm dark:text-white">
                              {item.product.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Size: {item.size} • Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="font-semibold dark:text-white">
                            ₹{Number(item.price).toLocaleString("en-IN")}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
                      <p className="font-semibold dark:text-white">Total</p>
                      <p className="font-bold text-lg dark:text-white">
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
              <h2 className="text-xl font-semibold dark:text-white">Saved Addresses</h2>
              <Link href="/profile/addresses/new">
                <Button className="gap-2">
                  <Plus size={16} />
                  Add Address
                </Button>
              </Link>
            </div>

            {addresses.length === 0 ? (
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="py-12 text-center">
                  <MapPin size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                  <h3 className="text-lg font-semibold mb-2 dark:text-white">
                    No saved addresses
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Add an address for faster checkout
                  </p>
                  <Link href="/profile/addresses/new">
                    <Button>Add Address</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((address) => (
                  <Card key={address.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold dark:text-white">{address.full_name}</p>
                          {address.is_default && (
                            <Badge variant="secondary" className="mt-1 dark:bg-gray-700 dark:text-gray-300">
                              Default
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" className="dark:hover:bg-gray-700">
                            <Edit size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" className="dark:hover:bg-gray-700">
                            <Trash2 size={16} className="text-red-500 dark:text-red-400" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
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
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="py-12 text-center">
                  <Heart size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                  <h3 className="text-lg font-semibold mb-2 dark:text-white">
                    No items in wishlist
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Save your favorite products here
                  </p>
                  <Link href="/products">
                    <Button>Browse Products</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map((item) => (
                  <Card key={item.id} className="overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <Link href={`/products/${item.product.id}`}>
                      <div className="relative h-64 bg-gray-100 dark:bg-gray-700">
                        <Image
                          src={item.product.front_image || "/placeholder.jpg"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </Link>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 dark:text-white">
                        {item.product.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-lg dark:text-white">
                          ₹{Number(item.product.price).toLocaleString("en-IN")}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="dark:hover:bg-gray-700"
                          onClick={async () => {
                            // Remove from wishlist
                            const success = await removeFromWishlist(item.product.id)
                            if (success) {
                              // Refresh wishlist
                              loadUserData()
                            }
                          }}
                        >
                          <Trash2 size={16} className="text-red-500 dark:text-red-400" />
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
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Member Since
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {new Date(user.created_at).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-300"
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