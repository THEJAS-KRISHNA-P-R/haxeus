"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { supabase } from "@/lib/supabase"
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  MapPin,
  CreditCard,
} from "lucide-react"
import { format } from "date-fns"

interface OrderItem {
  id: string
  product_id: number
  size: string
  quantity: number
  price: number
  product?: {
    name: string
    front_image: string
  }
}

interface Order {
  id: string
  status: string
  payment_status: string
  shipping_address: any
  total_amount: number
  discount_amount: number
  payment_method: string
  tracking_number: string
  coupon_code: string
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export default function OrderDetailsPage() {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const orderId = params?.id as string

  useEffect(() => {
    checkAuth()
  }, [orderId])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/auth")
      return
    }
    fetchOrderDetails(orderId, user.id)
  }

  const fetchOrderDetails = async (orderId: string, userId: string) => {
    try {
      // Fetch order — filter by user_id to prevent IDOR
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .eq("user_id", userId)
        .single()

      if (orderError) throw orderError

      // Fetch order items with product info
      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select(`
          *,
          product:products(name, front_image)
        `)
        .eq("order_id", orderId)

      if (itemsError) {
        console.warn("Error fetching order items:", itemsError?.message ?? itemsError?.code)
      }

      setOrder({
        ...orderData,
        items: itemsData || []
      })
    } catch (error: any) {
      console.error("Error fetching order details:", error?.message ?? error?.code ?? JSON.stringify(error))
      router.push("/orders")
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="w-8 h-8 text-green-600" />
      case "shipped":
        return <Truck className="w-8 h-8 text-blue-600" />
      case "processing":
        return <Package className="w-8 h-8 text-orange-600" />
      case "cancelled":
        return <XCircle className="w-8 h-8 text-red-600" />
      default:
        return <Clock className="w-8 h-8 text-white/40" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered": return "bg-green-900/30 text-green-400 border border-green-500/20"
      case "shipped": return "bg-[#07e4e1]/10 text-[#07e4e1] border border-[#07e4e1]/20"
      case "processing": return "bg-[#e7bf04]/10 text-[#e7bf04] border border-[#e7bf04]/20"
      case "cancelled": return "bg-[#e93a3a]/10 text-[#e93a3a] border border-[#e93a3a]/20"
      case "confirmed": return "bg-green-900/30 text-green-400 border border-green-500/20"
      default: return "bg-[#1a1a1a] text-white/50 border border-white/10"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/10 border-t-[#e93a3a] mx-auto"></div>
          <p className="mt-4 text-white/40">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <XCircle className="w-16 h-16 mx-auto text-[#e93a3a] mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Order Not Found</h2>
            <p className="text-white/40 mb-6">The order you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.</p>
            <Link href="/orders">
              <Button>Back to Orders</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Parse shipping address from JSONB
  const addr = order.shipping_address || {}

  // Calculate subtotal from items
  const itemsSubtotal = order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) ?? 0
  const discountAmt = order.discount_amount ?? 0
  const shippingCost = (order.total_amount ?? 0) - itemsSubtotal + discountAmt

  return (
    <div className="min-h-screen bg-[#080808] py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/orders">
            <Button variant="ghost" className="mb-4 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Orders
            </Button>
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Order #{order.id.slice(0, 8).toUpperCase()}
              </h1>
              <p className="text-white/40"> {format(new Date(order.created_at), "MMMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
            <Badge className={`${getStatusColor(order.status ?? "pending")} text-lg px-4 py-2`}>
              {(order.status ?? "pending").charAt(0).toUpperCase() + (order.status ?? "pending").slice(1)}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                    <div className="w-20 h-20 bg-black rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.product?.front_image || "/placeholder.svg"}
                        alt={item.product?.name || "Product"}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.product?.name}</h3>
                      <p className="text-sm text-white/40">Size: {item.size}</p>
                      <p className="text-sm text-white/40">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                      <p className="text-sm text-white/40">₹{item.price.toLocaleString("en-IN")} each</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Shipping Address — read from JSONB */}
            {addr && (addr.full_name || addr.address_line1) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-white/60">
                    {addr.full_name && <p className="font-semibold">{addr.full_name}</p>}
                    {addr.address_line1 && <p>{addr.address_line1}</p>}
                    {addr.address_line2 && <p>{addr.address_line2}</p>}
                    <p>
                      {[addr.city, addr.state, addr.pincode].filter(Boolean).join(", ")}
                    </p>
                    {addr.phone && <p className="mt-2">Phone: {addr.phone}</p>}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(order.status)}
                  <div>
                    <p className="font-semibold">
                      {(order.status ?? "pending").charAt(0).toUpperCase() + (order.status ?? "pending").slice(1)}
                    </p>
                    {order.updated_at && (
                      <p className="text-sm text-white/40">
                        Last updated {format(new Date(order.updated_at), "MMM d, yyyy")}
                      </p>
                    )}
                  </div>
                </div>
                {order.tracking_number && (
                  <div className="pt-4 border-t">
                    <p className="text-sm font-semibold text-white/60 mb-1">Tracking Number</p>
                    <p className="font-mono text-sm bg-[#1a1a1a] text-white/80 p-2 rounded-lg">
                      {order.tracking_number}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/40">Method</span>
                    <span className="font-semibold">{order.payment_method || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Status</span>
                    <Badge className={(order.payment_status ?? "pending") === "paid" ? "bg-green-900/30 text-green-400 border border-green-500/20" : "bg-[#e7bf04]/10 text-[#e7bf04] border border-[#e7bf04]/20"}>
                      {(order.payment_status ?? "pending").charAt(0).toUpperCase() + (order.payment_status ?? "pending").slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Total */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{itemsSubtotal.toLocaleString("en-IN")}</span>
                </div>
                {shippingCost > 0 && (
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>₹{shippingCost.toLocaleString("en-IN")}</span>
                  </div>
                )}
                {shippingCost === 0 && (
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                )}
                {discountAmt > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{discountAmt.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{(order.total_amount ?? 0).toLocaleString("en-IN")}</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-2">
              <Button variant="outline" className="w-full">
                Contact Support
              </Button>
              {order.status === "pending" && (
                <Button variant="destructive" className="w-full">
                  Cancel Order
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
