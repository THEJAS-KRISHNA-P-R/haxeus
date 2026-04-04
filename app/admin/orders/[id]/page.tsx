"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase, type Order, type OrderItem } from "@/lib/supabase"
import { sendShippingUpdateEmail } from "@/lib/email"
import {
  AdminCard,
  AdminButton,
  AdminBadge,
} from "@/components/admin/AdminUI"
import { ArrowLeft, Package, MapPin, ClipboardList, Clock, Truck, CheckCircle2, XCircle, BarChart3 } from "lucide-react"
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
    } | null
    product_name: string | null
    product_image: string | null
  })[]
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  paid: { label: "Paid", color: "var(--color-success, #16a34a)", icon: CheckCircle2 },
  confirmed: { label: "Confirmed", color: "var(--color-success, #16a34a)", icon: CheckCircle2 },
  pending: { label: "Pending", color: "var(--accent-yellow, #f59e0b)", icon: Clock },
  preorder: { label: "Pre-Order", color: "var(--accent-yellow, #facc15)", icon: Package },
  processing: { label: "Processing", color: "var(--accent-cyan, #3b82f6)", icon: ClipboardList },
  shipped: { label: "Shipped", color: "var(--accent-cyan, #3b82f6)", icon: Truck },
  delivered: { label: "Delivered", color: "var(--color-success, #16a34a)", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "var(--color-accent, #f43f5e)", icon: XCircle },
  refunded: { label: "Refunded", color: "var(--accent-yellow, #fb923c)", icon: XCircle },
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
        .select(`
          *,
          order_items (
            *,
            product_name,
            product_image,
            product:products (
              name,
              front_image
            )
          )
        `)
        .eq("id", orderId)
        .single()

      if (error) throw error
      setOrder(data as any)
    } catch (error) {
      console.error("Error loading order:", error)
    } finally {
      setLoading(false)
    }
  }

  async function updateOrderStatus(newStatus: string) {
    setUpdating(true)
    try {
      const isDelivered = newStatus === "delivered"
      const confirmDelivered = isDelivered
        ? window.confirm("Mark this order as delivered only after India Post / post-office confirmation. Continue?")
        : true

      if (!confirmDelivered) {
        return
      }

      const timestamp = new Date().toISOString()
      const { error } = await supabase
        .from("orders")
        .update({
          status: newStatus,
          delivered_at: isDelivered ? timestamp : null,
          updated_at: timestamp,
        })
        .eq("id", orderId)

      if (error) throw error

      setOrder((prev) =>
        prev
          ? {
            ...prev,
            status: newStatus as any,
            delivered_at: isDelivered ? timestamp : undefined,
            updated_at: timestamp,
          }
          : null
      )

      if (order && (newStatus === "shipped" || newStatus === "delivered")) {
        const { data: userData } = await supabase.auth.admin.getUserById(order.user_id)
        if (userData?.user?.email) {
          await sendShippingUpdateEmail({
            orderId: order.id,
            customerEmail: userData.user.email,
            customerName: order.shipping_name || "Customer",
            status: newStatus as any,
          })
        }
      }
    } catch (error) {
      console.error("Error updating order status:", error)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} className="animate-spin rounded-full h-12 w-12 border-2"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-24 px-6 border border-dashed rounded-3xl" style={{ borderColor: 'var(--border)' }}>
        <p style={{ color: 'var(--text-3)' }} className="text-sm font-bold uppercase tracking-widest leading-loose">Order not found</p>
        <AdminButton onClick={() => router.push("/admin/orders")} className="mt-6" variant="outline">
          Back to Orders
        </AdminButton>
      </div>
    )
  }

  const address = order.shipping_address as any
  const status = (order.status ?? "pending").toLowerCase()
  const s = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <AdminButton
            variant="ghost"
            onClick={() => router.push("/admin/orders")}
            className="-ml-4"
          >
            <ArrowLeft size={14} className="mr-2" /> Back to Orders
          </AdminButton>

          <div className="space-y-1">
            <h1
              style={{ color: "var(--text)", fontFamily: "var(--font-clash)" }}
              className="text-4xl font-black italic tracking-tighter uppercase"
            >
              Order <span className="text-[var(--accent)]">#{order.id.slice(0, 8)}</span>
            </h1>
            <p style={{ color: "var(--text-3)" }} className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
              <Clock size={12} /> Placed on {new Date(order.created_at!).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </p>
          </div>
        </div>

        {/* Global Status Badge */}
        <AdminBadge
          variant={
            status === "Paid" || status === "Confirmed" || status === "Delivered" ? "success" :
              status === "Pending" || status === "Preorder" || status === "Refunded" ? "warning" :
                status === "Processing" || status === "Shipped" ? "info" :
                  "danger"
          }
          className="px-6 py-4 rounded-2xl border-2 shadow-lg"
          icon={s.icon}
        >
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Payment/Shipping Status</span>
            <span className="text-xl font-black uppercase tracking-tight leading-none mt-1.5">{s.label}</span>
          </div>
        </AdminBadge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Items) */}
        <div className="lg:col-span-2 space-y-8">
          <AdminCard className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <Package size={18} style={{ color: "var(--accent)" }} />
              <h2 style={{ color: "var(--text)" }} className="text-sm font-bold uppercase tracking-widest">Order Contens / Items</h2>
            </div>

            <div className="space-y-6">
              {order.order_items.map((item) => (
                <div
                  key={item.id}
                  style={{ borderColor: "var(--border)" }}
                  className="flex items-center gap-6 border-b pb-6 last:border-0 last:pb-0 group"
                >
                  <div
                    style={{ background: "var(--bg-elevated)", borderColor: "var(--border)" }}
                    className="relative h-24 w-24 rounded-2xl overflow-hidden flex-shrink-0 border transition-transform group-hover:scale-105"
                  >
                    <Image
                      src={item.product_image || item.product?.front_image || "/placeholder.svg"}
                      alt={item.product_name || item.product?.name || "Product"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ color: "var(--text)" }} className="font-bold text-lg leading-tight truncate">{item.product_name || item.product?.name || "Product Deleted"}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <AdminBadge variant="neutral" className="bg-[var(--bg-card)]/50 backdrop-blur-sm border-[var(--border)]">
                        <span className="opacity-60 mr-1">SIZE:</span> {item.size}
                      </AdminBadge>
                      <AdminBadge variant="neutral" className="bg-[var(--bg-card)]/50 backdrop-blur-sm border-[var(--border)]">
                        <span className="opacity-60 mr-1">QTY:</span> {item.quantity}
                      </AdminBadge>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p style={{ color: "var(--text)" }} className="font-bold text-lg tabular-nums italic">
                      ₹{Number(item.price).toLocaleString("en-IN")}
                    </p>
                    <p style={{ color: "var(--text-3)" }} className="text-[10px] uppercase font-bold tracking-widest">
                      Total: ₹{(Number(item.price) * item.quantity).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: "2rem",
                paddingTop: "2rem",
                borderTop: "2px solid var(--border)",
              }}
              className="flex justify-between items-center"
            >
              <div className="flex flex-col">
                <span style={{ color: "var(--text-3)" }} className="text-[10px] font-black uppercase tracking-[0.2em]">Grand Total / Paid</span>
                <span style={{ color: "var(--text)" }} className="text-sm font-medium opacity-60">Including GST & Shipping</span>
              </div>
              <p style={{ color: "var(--text)", fontFamily: "var(--font-clash)" }} className="text-4xl font-black italic tracking-tighter">
                ₹{Number(order.total_amount).toLocaleString("en-IN")}
              </p>
            </div>
          </AdminCard>
        </div>

        {/* Right Column (Manage & Address) */}
        <div className="space-y-8">
          {/* Status Update Card */}
          <AdminCard className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <ClipboardList size={18} style={{ color: "var(--accent)" }} />
              <h2 style={{ color: "var(--text)" }} className="text-sm font-bold uppercase tracking-widest">Manage Workflow</h2>
            </div>

            <div className="space-y-4">
              <div
                style={{ background: "var(--bg-elevated)", borderColor: "var(--border)" }}
                className="p-1 rounded-2xl border"
              >
                <Select
                  value={order.status}
                  onValueChange={updateOrderStatus}
                  disabled={updating}
                >
                  <SelectTrigger className="border-none bg-transparent focus:ring-0 text-[var(--text)] font-bold uppercase tracking-widest text-[10px] h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                      <SelectItem
                        key={key}
                        value={key}
                        className="text-[10px] font-bold uppercase tracking-widest py-3 focus:bg-[var(--bg-elevated)] focus:text-[var(--text)]"
                      >
                        {cfg.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div
                style={{ background: "var(--bg-elevated)" }}
                className="p-4 rounded-2xl"
              >
                <p style={{ color: "var(--text-3)" }} className="text-[10px] font-bold uppercase leading-relaxed tracking-wider">
                  Mark as delivered only after India Post or post-office confirmation. This unlocks the ability for customers to write verified reviews.
                </p>
              </div>
            </div>
          </AdminCard>

          {/* Shipping Address Card */}
          {address && (
            <AdminCard className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <MapPin size={18} style={{ color: "var(--accent)" }} />
                <h2 style={{ color: "var(--text)" }} className="text-sm font-bold uppercase tracking-widest">Logistics / Destination</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <p style={{ color: "var(--text)" }} className="font-bold text-lg leading-tight uppercase italic">{order.shipping_name}</p>
                  <p style={{ color: "var(--text-2)" }} className="text-sm font-medium leading-relaxed">
                    {address.line1}<br />
                    {address.line2 && <>{address.line2}<br /></>}
                    {address.city}, {address.state} {address.pincode}
                  </p>
                </div>

                <div
                  style={{ borderTop: "1px solid var(--border)" }}
                  className="pt-4 flex items-center justify-between"
                >
                  <span style={{ color: "var(--text-3)" }} className="text-[10px] font-bold uppercase tracking-widest">Phone</span>
                  <a
                    href={`tel:${order.shipping_address.phone}`}
                    className="text-[var(--accent)] font-bold text-sm tracking-tight hover:underline"
                  >
                    {order.shipping_address.phone}
                  </a>
                </div>
              </div>
            </AdminCard>
          )}

          {/* Metadata Card */}
          <AdminCard className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 size={18} style={{ color: "var(--accent)" }} className="rotate-90" />
              <h2 style={{ color: "var(--text)" }} className="text-sm font-bold uppercase tracking-widest">System Metadata</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                <span style={{ color: "var(--text-3)" }}>Order ID</span>
                <span style={{ color: "var(--text-2)" }} className="font-mono opacity-80 decoration-[var(--border)]">{order.id.slice(0, 13)}...</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                <span style={{ color: "var(--text-3)" }}>Payment Type</span>
                <AdminBadge variant="neutral">Razorpay / Secure</AdminBadge>
              </div>
              {order.updated_at && (
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                  <span style={{ color: "var(--text-3)" }}>Last Trace</span>
                  <span style={{ color: "var(--text-2)" }}>{new Date(order.updated_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  )
}
