"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { useTheme } from "@/components/ThemeProvider"
import { cn } from "@/lib/utils"
import { ArrowLeft, CheckCircle, Clock, MapPin, ShieldCheck, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { formatPrice } from "@/lib/currency"
import { PaymentStatusBadge } from "@/components/PaymentStatusBadge"

export default function OrderDetailsPage() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [order, setOrder] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmedBanner, setConfirmedBanner] = useState(false)
  const [verificationBanner, setVerificationBanner] = useState(false)
  
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const orderId = params?.id as string

  useEffect(() => {
    setMounted(true)
    const status = searchParams?.get("payment")
    if (status === "success") {
      setConfirmedBanner(true)
    } else if (status === "verification_failed") {
      setVerificationBanner(true)
    }
  }, [searchParams])

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
        .select("*")
        .eq("id", id)
        .eq("user_id", userId)
        .single()

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

  const cardCls = cn(
    "rounded-2xl border p-6 transition-colors duration-300 backdrop-blur-md",
    isDark ? "bg-white/[0.03] border-white/[0.07]" : "bg-white border-black/[0.08] shadow-sm"
  )
  const mutedText = isDark ? "text-white/40" : "text-black/40"
  const primaryText = isDark ? "text-white" : "text-black"

  if (!mounted || loading) {
    return (
      <div className="min-h-screen pt-[88px] flex items-center justify-center bg-[var(--bg)]">
        <div className="w-10 h-10 rounded-full border-2 border-t-[#e93a3a] animate-spin border-white/10" />
      </div>
    )
  }

  if (!order) return null

  return (
    <main className="min-h-screen pt-[88px] pb-16 px-4 md:px-8 bg-[var(--bg)]">
      <div className="max-w-5xl mx-auto">

        {/* ─── Payment Success Banner ────────────────────────────────────────── */}
        {confirmedBanner && (
          <div className="mt-6 mb-6 p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-start gap-4">
            <div className="p-3 rounded-full bg-emerald-500/20">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black text-lg tracking-tight mb-0.5">Order Confirmed!</p>
              <p className="text-sm font-medium opacity-80 leading-relaxed">
                Your payment was successful and your order is being processed. 
                A confirmation email has been sent to {order.shipping_email || 'your inbox'}.
              </p>
            </div>
          </div>
        )}

        {/* ─── Verification Failed Banner ────────────────────────────────────── */}
        {verificationBanner && (
          <div className="mt-6 mb-6 p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-start gap-4">
            <div className="p-3 rounded-full bg-amber-500/20">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black text-lg tracking-tight mb-0.5">Verification in Progress</p>
              <p className="text-sm font-medium opacity-80 leading-relaxed">
                Your payment was received but validation is taking a moment. 
                Your order status will update to "Confirmed" automatically within 2-5 minutes.
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-4 mb-8 pt-6">
          <Link href="/orders" className={cn("p-2 rounded-full", isDark ? "hover:bg-white/10" : "hover:bg-black/5")}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <p className={cn("text-[10px] tracking-widest uppercase font-bold", mutedText)}>Order Summary</p>
            <h1 className="text-2xl font-black tracking-tight">{order.order_number || `#${order.id.slice(0, 8).toUpperCase()}`}</h1>
          </div>
          <PaymentStatusBadge status={order.status} className="h-9 px-4" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          
          <div className="space-y-6">
            {/* Timeline */}
            <div className={cardCls}>
              <p className={cn("text-xs font-bold tracking-[0.2em] uppercase mb-8", mutedText)}>Order Journey</p>
              <div className="flex items-center justify-between gap-2 px-2">
                {['pending', 'confirmed', 'shipped', 'delivered'].map((s, i) => {
                  const states = ['pending', 'confirmed', 'payment_failed', 'shipped', 'delivered']
                  const currentIdx = states.indexOf(order.status)
                  const thisIdx = states.indexOf(s)
                  const isDone = currentIdx >= thisIdx
                  const isDisabled = order.status === 'payment_failed' && s !== 'pending'
                  
                  return (
                    <React.Fragment key={s}>
                      <div className="flex flex-col items-center gap-2 group">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                          isDisabled ? "opacity-20 translate-y-3" :
                          isDone ? "bg-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/20" : 
                          isDark ? "bg-white/5 text-white/20" : "bg-black/5 text-black/20"
                        )}>
                          {isDone ? <CheckCircle className="w-5 h-5" /> : (i + 1)}
                        </div>
                        <p className={cn("text-[9px] font-black uppercase tracking-widest", isDone ? primaryText : mutedText)}>
                          {s === 'pending' && order.status === 'payment_failed' ? 'Failed' : s}
                        </p>
                      </div>
                      {i < 3 && (
                        <div className={cn("h-[2px] flex-1 mb-6 transition-all", isDisabled ? "bg-white/5" : isDone ? "bg-emerald-500/30" : isDark ? "bg-white/5" : "bg-black/5")} />
                      )}
                    </React.Fragment>
                  )
                })}
              </div>
            </div>

            {/* Items */}
            <div className={cardCls}>
              <p className={cn("text-xs font-bold tracking-[0.2em] uppercase mb-6", mutedText)}>Items in Order</p>
              <div className="space-y-6">
                {items.map((item: any) => (
                  <div key={item.id} className="flex gap-4 p-2 rounded-2xl transition-colors hover:bg-white/[0.02]">
                    <div className="w-20 h-20 rounded-2xl bg-black/5 relative overflow-hidden group">
                      <Image src={item.product?.front_image || "/placeholder.svg"} alt="Item" fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <p className="font-black text-base tracking-tight truncate">{item.product?.name}</p>
                      <p className={cn("text-xs font-bold mt-1", mutedText)}>{item.size} · Qty {item.quantity}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-black text-[#e93a3a]">{formatPrice(item.unit_price || item.price)}</span>
                      </div>
                    </div>
                    <div className="pt-1 text-right">
                      <p className="font-black text-sm">{formatPrice((item.unit_price || item.price) * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className={cardCls}>
               <div className="flex items-center gap-2 mb-4 text-[#e93a3a]">
                <MapPin className="w-4 h-4" />
                <p className="text-xs font-bold tracking-[0.2em] uppercase">Delivery To</p>
              </div>
              <p className="font-black text-base">{order.shipping_address?.full_name || order.shipping_name}</p>
              <p className={cn("text-sm mt-1.5 leading-relaxed font-medium", mutedText)}>
                {order.shipping_address?.address_line1 || order.shipping_address_1}
                {(order.shipping_address?.address_line2 || order.shipping_address_2) ? `, ${order.shipping_address?.address_line2 || order.shipping_address_2}` : ""}
                <br />
                {order.shipping_address?.city || order.shipping_city}, {order.shipping_address?.state || order.shipping_state} — {order.shipping_address?.pincode || order.shipping_pincode}
              </p>
              <p className={cn("text-sm mt-2 font-bold", primaryText)}>+91 {order.shipping_address?.phone || order.shipping_phone}</p>
            </div>
          </div>

          {/* Totals */}
          <aside className="space-y-6">
            <div className={cardCls}>
              <p className={cn("text-xs font-bold tracking-[0.2em] uppercase mb-6", mutedText)}>Financials</p>
              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between">
                  <span className={mutedText}>Subtotal</span>
                  <span className="font-bold">{formatPrice(order.subtotal_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={mutedText}>Shipping</span>
                  <span className={cn("font-bold", order.shipping_amount === 0 ? "text-emerald-400" : "")}>
                    {order.shipping_amount === 0 ? "FREE" : formatPrice(order.shipping_amount)}
                  </span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Discount</span>
                    <span>-{formatPrice(order.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-4 border-t border-white/10">
                  <span className="font-black text-lg">Total Paid</span>
                  <span className="font-black text-xl text-[#e93a3a]">{formatPrice(order.total_amount)}</span>
                </div>
              </div>

              {/* Payment Meta */}
              <div className="mt-8 pt-6 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between text-[10px]">
                  <span className={cn("uppercase tracking-widest font-black", mutedText)}>Payment Method</span>
                  <span className="font-black">{order.payment_method?.toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className={cn("uppercase tracking-widest font-black", mutedText)}>Order Date</span>
                  <span className="font-black">{order.created_at ? format(new Date(order.created_at), 'MMM dd, yyyy') : '—'}</span>
                </div>
              </div>
            </div>

            {/* Assistance */}
            <div className={cn("p-6 rounded-3xl border border-[#e93a3a]/10 bg-[#e93a3a]/5")}>
              <div className="flex items-center gap-2 mb-3 text-[#e93a3a]">
                <ShieldCheck className="w-4 h-4" />
                <p className="text-[10px] font-black tracking-widest uppercase">Secured Order</p>
              </div>
              <p className="text-[10px] font-bold leading-relaxed opacity-60">
                You're covered by HAXEUS buyer protection. Need help with this order? 
                Reach out to us on WhatsApp or Instagram with your Order ID.
              </p>
              <Link href="/support" className="mt-4 flex items-center justify-between text-[10px] font-black uppercase tracking-widest group">
                Customer Support <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <Link href="/products">
              <button className="w-full py-4 rounded-full bg-white/5 border border-white/10 text-xs font-black tracking-widest uppercase hover:bg-white/10 transition-colors">
                Continue Shopping
              </button>
            </Link>
          </aside>
        </div>
      </div>
    </main>
  )
}

