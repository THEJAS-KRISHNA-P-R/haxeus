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
  Calendar,
  FileText
} from "lucide-react"
import { format } from "date-fns"

interface OrderItem {
  id: string
  product_id: string
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
  order_number: string
  status: string
  payment_status: string
  email: string
  phone: string
  shipping_first_name: string
  shipping_last_name: string
  shipping_address_line_1: string
  shipping_address_line_2: string
  shipping_city: string
  shipping_state: string
  shipping_zip_code: string
  shipping_country: string
  subtotal: number
  shipping_cost: number
  tax_amount: number
  discount_amount: number
  total: number
  payment_method: string
  tracking_number: string
  customer_notes: string
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
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      router.push("/auth")
      return
    }
    fetchOrderDetails(orderId, session.user.id)
  }

  const fetchOrderDetails = async (orderId: string, userId: string) => {
    try {
      // Fetch order
      const { data: orderData, error: orderError } = await supabase
        .from("backend_order")
        .select("*")
        .eq("id", orderId)
        .eq("user_id", userId)
        .single()

      if (orderError) throw orderError

      // Fetch order items
      const { data: itemsData, error: itemsError } = await supabase
        .from("backend_orderitem")
        .select(`
          *,
          product:backend_product(name, front_image)
        `)
        .eq("order_id", orderId)

      if (itemsError) {
        console.warn("Error fetching order items:", itemsError)
      }

      setOrder({
        ...orderData,
        items: itemsData || []
      })
    } catch (error) {
      console.error("Error fetching order details:", error)
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
        return <Clock className="w-8 h-8 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200"
      case "shipped":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "processing":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <XCircle className="w-16 h-16 mx-auto text-red-600 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
            <Link href="/orders">
              <Button>Back to Orders</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
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
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Order #{order.order_number}
              </h1>
              <p className="text-gray-600">
                Placed on {format(new Date(order.created_at), "MMMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
            <Badge className={`${getStatusColor(order.status)} text-lg px-4 py-2`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
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
                      <p className="text-sm text-gray-600">Size: {item.size}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                      <p className="text-sm text-gray-600">₹{item.price.toLocaleString("en-IN")} each</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-gray-700">
                  <p className="font-semibold">
                    {order.shipping_first_name} {order.shipping_last_name}
                  </p>
                  <p>{order.shipping_address_line_1}</p>
                  {order.shipping_address_line_2 && <p>{order.shipping_address_line_2}</p>}
                  <p>
                    {order.shipping_city}, {order.shipping_state} {order.shipping_zip_code}
                  </p>
                  <p>{order.shipping_country}</p>
                  {order.phone && <p className="mt-2">Phone: {order.phone}</p>}
                  <p>Email: {order.email}</p>
                </div>
              </CardContent>
            </Card>

            {/* Customer Notes */}
            {order.customer_notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Order Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{order.customer_notes}</p>
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
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Last updated {format(new Date(order.updated_at), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                {order.tracking_number && (
                  <div className="pt-4 border-t">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Tracking Number</p>
                    <p className="font-mono text-sm bg-gray-100 p-2 rounded">
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
                    <span className="text-gray-600">Method</span>
                    <span className="font-semibold">{order.payment_method || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <Badge className={order.payment_status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
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
                  <span>₹{order.subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{order.shipping_cost === 0 ? "Free" : `₹${order.shipping_cost.toLocaleString("en-IN")}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>₹{order.tax_amount.toLocaleString("en-IN")}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{order.discount_amount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{order.total.toLocaleString("en-IN")}</span>
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
