"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase, type Order, type OrderItem } from "@/lib/supabase"
import { sendShippingUpdateEmail } from "@/lib/email"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Package } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface OrderWithDetails extends Order {
  order_items: (OrderItem & {
    product: {
      name: string
      front_image: string
    }
  })[]
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  const [order, setOrder] = useState<OrderWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    loadOrder()
  }, [orderId])

  async function loadOrder() {
    try {
      const { data, error } = await supabase
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
        .eq("id", orderId)
        .single()

      if (error) throw error
      setOrder(data as any)
    } catch (error) {
      console.error("Error loading order:", error)
      alert("Failed to load order")
    } finally {
      setLoading(false)
    }
  }

  async function updateOrderStatus(newStatus: string) {
    setUpdating(true)
    try {
      const { error } = await supabase
        .from("orders")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)

      if (error) throw error

      setOrder((prev) => (prev ? { ...prev, status: newStatus } : null))

      // Send shipping update email if status is shipped or delivered
      if (order && (newStatus === "shipped" || newStatus === "delivered")) {
        const { data: userData } = await supabase.auth.admin.getUserById(order.user_id)
        
        if (userData?.user?.email) {
          await sendShippingUpdateEmail({
            orderId: order.id,
            customerEmail: userData.user.email,
            customerName: order.shipping_address?.fullName || "Customer",
            status: newStatus,
          })
        }
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      alert("Failed to update order status")
    } finally {
      setUpdating(false)
    }
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
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Order not found</p>
        <Link href="/admin/orders">
          <Button className="mt-4">Back to Orders</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Order #{order.id.slice(0, 8)}
            </h1>
            <p className="text-gray-500 mt-1">
              Placed on{" "}
              {new Date(order.created_at!).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
        <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.order_items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 border-b pb-4 last:border-0"
                >
                  <div className="relative h-20 w-20 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={item.product.front_image || "/placeholder.jpg"}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-500">
                      Size: {item.size} • Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ₹{Number(item.price).toLocaleString("en-IN")}
                    </p>
                    <p className="text-sm text-gray-500">
                      ₹{(Number(item.price) * item.quantity).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              ))}

              {/* Total */}
              <div className="flex justify-between items-center pt-4 border-t">
                <p className="font-semibold text-lg">Total</p>
                <p className="font-bold text-xl">
                  ₹{Number(order.total_amount).toLocaleString("en-IN")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Details */}
        <div className="space-y-6">
          {/* Status Update */}
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={order.status}
                onValueChange={updateOrderStatus}
                disabled={updating}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                Update the order status to keep the customer informed
              </p>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          {order.shipping_address && (
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <p className="font-medium">
                    {order.shipping_address.fullName}
                  </p>
                  <p>{order.shipping_address.address}</p>
                  <p>
                    {order.shipping_address.city},{" "}
                    {order.shipping_address.state}{" "}
                    {order.shipping_address.pincode}
                  </p>
                  <p className="text-gray-500">
                    Phone: {order.shipping_address.phone}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Items</span>
                <span>{order.order_items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID</span>
                <span className="font-mono text-xs">
                  {order.id.slice(0, 13)}...
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created</span>
                <span>
                  {new Date(order.created_at!).toLocaleDateString("en-IN")}
                </span>
              </div>
              {order.updated_at && order.updated_at !== order.created_at && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated</span>
                  <span>
                    {new Date(order.updated_at).toLocaleDateString("en-IN")}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
