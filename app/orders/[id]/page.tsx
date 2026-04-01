"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { useTheme } from "@/components/ThemeProvider"
import { cn } from "@/lib/utils"
import { ArrowLeft, Check, CheckCircle, Clock, Package, Truck, XCircle } from "lucide-react"
import { format } from "date-fns"
import { formatPrice, CURRENCY_SYMBOL } from "@/lib/currency"

// ─── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; bgCls: string; textCls: string; icon: any }> = {
  pending:    { label: "Pending",    bgCls: "bg-yellow-500/10", textCls: "text-yellow-400",  icon: Clock },
  confirmed:  { label: "Confirmed",  bgCls: "bg-emerald-500/10",textCls: "text-emerald-400", icon: CheckCircle },
  preorder:   { label: "Pre-Order",  bgCls: "bg-[#e7bf04]/10",  textCls: "text-[#e7bf04]",  icon: Clock },
  processing: { label: "Processing", bgCls: "bg-blue-500/10",   textCls: "text-blue-400",   icon: Package },
  shipped:    { label: "Shipped",    bgCls: "bg-purple-500/10", textCls: "text-purple-400",  icon: Truck },
  delivered:  { label: "Delivered",  bgCls: "bg-emerald-500/10",textCls: "text-emerald-400", icon: CheckCircle },
  cancelled:  { label: "Cancelled",  bgCls: "bg-red-500/10",    textCls: "text-red-400",    icon: XCircle },
  refunded:   { label: "Refunded",   bgCls: "bg-orange-500/10", textCls: "text-orange-400", icon: XCircle },
}

const TIMELINE: string[] = ["pending", "confirmed", "processing", "shipped", "delivered"]
const PREORDER_TIMELINE: string[] = ["pending", "preorder", "processing", "shipped", "delivered"]

export default function OrderDetailsPage() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [order, setOrder] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmedBanner, setConfirmedBanner] = useState(false)
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const orderId = params?.id as string

  useEffect(() => {
    setMounted(true)
    if (searchParams?.get("confirmed") === "true") {
      setConfirmedBanner(true)
      const timer = setTimeout(() => setConfirmedBanner(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [])

  useEffect(() => { checkAuth() }, [orderId])

  const isDark = mounted && theme === "dark"

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push("/auth"); return }
    fetchOrder(orderId, user.id)
  }

  async function fetchOrder(id: string, userId: string) {
    try {
      const { data: orderData } = await supabase
        .from("orders")
        .select(`
          id, order_number, status, payment_status,
          shipping_name, shipping_phone,
          shipping_address_1, shipping_address_2,
          shipping_city, shipping_state, shipping_pincode, shipping_country,
          shipping_address,
          total_amount, subtotal_amount, shipping_amount, discount_amount,
          payment_method, tracking_number, coupon_code,
          is_preorder, created_at, updated_at
        `)
        .eq("id", id)
        .eq("user_id", userId)
        .maybeSingle()

      if (!orderData) { router.push("/orders"); return }
      setOrder(orderData)

      const { data: itemsData } = await supabase
        .from("order_items")
        .select("*, product:products(name, front_image)")
        .eq("order_id", id)

      setItems(itemsData || [])
    } catch {
      router.push("/orders")
    } finally {
      setLoading(false)
    }
  }

  const card = cn(
    "rounded-2xl border p-5 transition-colors",
    isDark ? "bg-white/[0.02] border-white/[0.07]" : "bg-white border-black/[0.07] shadow-sm"
  )
  const muted = isDark ? "text-white/50" : "text-black/50"
  const primary = isDark ? "text-white" : "text-black"

  if (!mounted || loading) {
    return (
      <div className={cn("min-h-screen flex items-center justify-center pt-20", isDark ? "bg-[#0a0a0a]" : "bg-[#f5f4f0]")}>
        <div className={cn("w-10 h-10 rounded-full border-2 border-t-[#e93a3a] animate-spin", isDark ? "border-white/10" : "border-black/10")} />
      </div>
    )
  }

  if (!order) return null

  const status = order.status ?? "pending"
  const sc = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending
  const StatusIcon = sc.icon
  const isPreorder = order.is_preorder

  // Shipping address — prefer flat columns, fall back to JSON blob
  const addr = {
    name: order.shipping_name || order.shipping_address?.full_name || "",
    phone: order.shipping_phone || order.shipping_address?.phone || "",
    address_1: order.shipping_address_1 || order.shipping_address?.address_line1 || "",
    address_2: order.shipping_address_2 || order.shipping_address?.address_line2 || "",
    city: order.shipping_city || order.shipping_address?.city || "",
    state: order.shipping_state || order.shipping_address?.state || "",
    pincode: order.shipping_pincode || order.shipping_address?.pincode || "",
    country: order.shipping_country || order.shipping_address?.country || "India",
  }

  const subtotal = order.subtotal_amount ?? items.reduce((s: number, i: any) => s + ((i.unit_price ?? i.price) * i.quantity), 0)
  const shippingAmt = order.shipping_amount ?? 0
  const discount = order.discount_amount ?? 0

  // Timeline
  const timeline = isPreorder ? PREORDER_TIMELINE : TIMELINE
  const currentIdx = timeline.indexOf(status)

  return (
    <main className={cn("min-h-screen pt-[88px] pb-16 px-4 md:px-8 transition-colors", isDark ? "bg-[#0a0a0a]" : "bg-[#f5f4f0]")}>
      <div className="max-w-5xl mx-auto">

        {/* Payment confirmed banner */}
        {confirmedBanner && (
          <div className="mt-6 mb-4 flex items-center gap-3 px-5 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">Payment successful!</p>
              <p className="text-xs opacity-80">Your {isPreorder ? "pre-order" : "order"} is confirmed. A confirmation email has been sent.</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-3 mt-6 mb-6">
          <Link href="/orders">
            <button className={cn("p-2 rounded-full transition-all", isDark ? "text-white/45 hover:text-white hover:bg-white/[0.07]" : "text-black/45 hover:text-black hover:bg-black/[0.05]")}>
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div className="flex-1">
            <p className={cn("text-xs tracking-widest uppercase font-medium mb-0.5", isDark ? "text-white/30" : "text-black/35")}>Order</p>
            <h1 className={cn("text-xl font-bold tracking-tight", primary)}>
              {order.order_number || `#${order.id.slice(0, 8).toUpperCase()}`}
            </h1>
          </div>
          <span className={cn("px-3 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase flex items-center gap-1.5", sc.bgCls, sc.textCls)}>
            <StatusIcon className="w-3.5 h-3.5" />
            {sc.label}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">

          {/* Left column */}
          <div className="space-y-4">

            {/* Status timeline */}
            <div className={card}>
              <p className={cn("text-xs font-bold tracking-[0.2em] uppercase mb-4", isDark ? "text-white/35" : "text-black/40")}>Order Progress</p>
              <div className="flex items-center gap-1">
                {timeline.map((s, i) => {
                  const done = currentIdx > i
                  const active = currentIdx === i
                  const sc2 = STATUS_CONFIG[s]
                  return (
                    <div key={s} className="flex items-center gap-1 flex-1">
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                          done ? "bg-emerald-500 text-white" : active ? "bg-[#e93a3a] text-white" : isDark ? "bg-white/[0.08] text-white/25" : "bg-black/[0.07] text-black/25"
                        )}>
                          {done ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : i + 1}
                        </div>
                        <p className={cn("text-[9px] mt-1 font-bold uppercase tracking-wider text-center w-12", active ? (isDark ? "text-white/80" : "text-black/80") : muted)}>
                          {sc2?.label ?? s}
                        </p>
                      </div>
                      {i < timeline.length - 1 && (
                        <div className={cn("h-px flex-1 -mt-4", done ? "bg-emerald-500/40" : isDark ? "bg-white/[0.07]" : "bg-black/[0.07]")} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Order items */}
            <div className={card}>
              <p className={cn("text-xs font-bold tracking-[0.2em] uppercase mb-4", isDark ? "text-white/35" : "text-black/40")}>Items</p>
              <div className="space-y-4">
                {items.map((item: any) => {
                  const price = item.unit_price ?? item.price
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className={cn("relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0", isDark ? "bg-white/[0.05]" : "bg-black/[0.05]")}>
                        <Image
                          src={item.product?.front_image || "/placeholder.svg"}
                          alt={item.product?.name || "Product"}
                          fill sizes="56px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-semibold truncate", primary)}>{item.product?.name || item.product_name}</p>
                        <p className={cn("text-xs mt-0.5", muted)}>
                          {item.size}{item.color ? ` · ${item.color}` : ""} · Qty {item.quantity}
                        </p>
                        {(item.is_preorder ?? false) && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-[#e7bf04]/20 text-[#e7bf04]">PRE-ORDER</span>
                            {(item.preorder_expected_date || item.product?.expected_date) && (
                              <span className={cn("text-[10px]", muted)}>Ships {item.preorder_expected_date ?? item.product?.expected_date}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <p className={cn("text-sm font-bold flex-shrink-0", primary)}>
                        {formatPrice(price * item.quantity)}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Shipping address */}
            {addr.address_1 && (
              <div className={card}>
                <p className={cn("text-xs font-bold tracking-[0.2em] uppercase mb-3", isDark ? "text-white/35" : "text-black/40")}>Shipping Address</p>
                {addr.name && <p className={cn("font-bold text-sm", primary)}>{addr.name}</p>}
                <p className={cn("text-sm mt-1 leading-relaxed", muted)}>
                  {addr.address_1}
                  {addr.address_2 ? `, ${addr.address_2}` : ""}
                  <br />
                  {addr.city}, {addr.state} — {addr.pincode}
                  {addr.country !== "India" ? `, ${addr.country}` : ""}
                </p>
                {addr.phone && <p className={cn("text-sm mt-1", muted)}>+91 {addr.phone}</p>}
              </div>
            )}
          </div>

          {/* Right — summary */}
          <div className="space-y-4">
            {/* Order summary */}
            <div className={card}>
              <p className={cn("text-xs font-bold tracking-[0.2em] uppercase mb-4", isDark ? "text-white/35" : "text-black/40")}>Summary</p>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className={muted}>Subtotal</span>
                  <span className={primary}>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={muted}>Shipping</span>
                  <span className={shippingAmt === 0 ? "text-emerald-400" : primary}>
                    {shippingAmt === 0 ? "FREE" : `${CURRENCY_SYMBOL}${shippingAmt}`}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className={muted}>Discount</span>
                    <span className="text-emerald-400">\u2212{formatPrice(discount)}</span>
                  </div>
                )}
                <div className={cn("border-t pt-2.5 flex justify-between font-bold", isDark ? "border-white/[0.07]" : "border-black/[0.07]")}>
                  <span className={primary}>Total</span>
                  <span className="text-[#e93a3a]">{formatPrice(order.total_amount ?? 0)}</span>
                </div>
              </div>
            </div>

            {/* Meta */}
            <div className={card}>
              <p className={cn("text-xs font-bold tracking-[0.2em] uppercase mb-3", isDark ? "text-white/35" : "text-black/40")}>Details</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={muted}>Placed</span>
                  <span className={primary}>{order.created_at ? format(new Date(order.created_at), "d MMM yyyy") : "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className={muted}>Payment</span>
                  <span className={cn("font-medium", order.payment_status === "paid" ? "text-emerald-400" : "text-yellow-400")}>
                    {(order.payment_status ?? "pending").charAt(0).toUpperCase() + (order.payment_status ?? "pending").slice(1)}
                  </span>
                </div>
                {order.tracking_number && (
                  <div className="flex justify-between gap-2">
                    <span className={muted}>Tracking</span>
                    <span className={cn("font-mono text-xs", primary)}>{order.tracking_number}</span>
                  </div>
                )}
                {order.coupon_code && (
                  <div className="flex justify-between">
                    <span className={muted}>Coupon</span>
                    <span className={cn("font-mono text-xs font-bold", primary)}>{order.coupon_code}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <Link href="/products">
              <button className={cn("w-full py-3.5 rounded-full text-sm font-bold tracking-wide transition-colors", "bg-[#e93a3a] hover:bg-[#ff4a4a] text-white shadow-lg shadow-[#e93a3a]/20")}>
                Continue Shopping
              </button>
            </Link>
          </div>

        </div>
      </div>
    </main>
  )
}
