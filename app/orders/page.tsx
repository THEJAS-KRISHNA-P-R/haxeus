"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { Package, Truck, CheckCircle, XCircle, Clock, ArrowRight } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { formatPrice } from "@/lib/currency"

interface Order {
  id: string
  status: string
  payment_status: string
  total_amount: number
  created_at: string
  order_number?: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/auth")
      return
    }
    fetchOrders(user.id)
  }

  const fetchOrders = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          status,
          payment_status,
          total_amount,
          created_at,
          order_number
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching orders:", error?.message ?? error?.code ?? JSON.stringify(error))
        setOrders([])
      } else {
        setOrders(data || [])
      }
    } catch (error: any) {
      console.error("Error fetching orders:", error?.message ?? error?.code ?? JSON.stringify(error))
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (rawStatus: string) => {
    const status = (rawStatus || "pending").toLowerCase()
    switch (status) {
      case "delivered":
      case "confirmed":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "shipped":
        return <Truck className="w-5 h-5 text-blue-600" />
      case "processing":
      case "preorder":
        return <Package className="w-5 h-5 text-orange-600" />
      case "cancelled":
      case "refunded":
        return <XCircle className="w-5 h-5 text-[var(--accent)]" />
      default:
        return <Clock className="w-5 h-5 text-[var(--text-3)]" />
    }
  }

  const getStatusColor = (rawStatus: string) => {
    const status = (rawStatus || "pending").toLowerCase()
    switch (status) {
      case "delivered":
      case "confirmed":
        return "bg-green-500/10 text-green-600 border border-green-500/20"
      case "shipped":
        return "bg-blue-500/10 text-blue-600 border border-blue-500/20"
      case "processing":
      case "preorder":
        return "bg-orange-500/10 text-orange-600 border border-orange-500/20"
      case "cancelled":
      case "refunded":
        return "bg-red-500/10 text-red-600 border border-red-500/20"
      default:
        return "bg-[var(--bg-elevated)] text-[var(--text-2)] border border-[var(--border)]"
    }
  }

  const getPaymentStatusColor = (rawStatus: string) => {
    const status = (rawStatus || "pending").toLowerCase()
    switch (status) {
      case "paid":
        return "bg-green-500/10 text-green-600 border border-green-500/20"
      case "pending":
        return "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20"
      case "failed":
        return "bg-red-500/10 text-red-600 border border-red-500/20"
      default:
        return "bg-[var(--bg-elevated)] text-[var(--text-2)] border border-[var(--border)]"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[var(--accent)] mx-auto"></div>
          <p className="mt-4 text-[var(--text-3)]">Loading your orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[var(--text)] mb-2">Order History</h1>
          <p className="text-[var(--text-3)]">Track and manage your orders</p>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="w-20 h-20 mx-auto text-[var(--text-3)] opacity-50 mb-6" />
              <h2 className="text-2xl font-bold text-[var(--text)] mb-2">No orders yet</h2>
              <p className="text-[var(--text-3)] mb-6">You haven't placed any orders yet.</p>
              <Link href="/products">
                <Button className="bg-[var(--accent)] hover:bg-[var(--accent)]/80 text-[var(--bg)]">
                  Start Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="hover:shadow-md shadow-black/10 transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(order.status)}
                        <div>
                          <h3 className="font-bold text-lg text-[var(--text)]">
                            Order {order.order_number ? `#${order.order_number}` : `#${order.id.slice(-8).toUpperCase()}`}
                          </h3>
                          <p className="text-sm text-[var(--text-3)]">
                            Placed {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge className={getStatusColor(order.status ?? "pending")}>
                          {(order.status ?? "pending").charAt(0).toUpperCase() + (order.status ?? "pending").slice(1)}
                        </Badge>
                        <Badge className={getPaymentStatusColor(order.payment_status ?? "pending")}>
                          Payment: {(order.payment_status ?? "pending").charAt(0).toUpperCase() + (order.payment_status ?? "pending").slice(1)}
                        </Badge>
                      </div>
                    </div>

                    {/* Order Total & Action */}
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-[var(--text-3)]">Total</p>
                        <p className="text-2xl font-bold text-[var(--text)]">
                          {formatPrice(order.total_amount ?? 0)}
                        </p>
                      </div>
                      <Link href={`/orders/${order.id}`}>
                        <Button variant="outline" className="flex items-center gap-2">
                          View Details
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

