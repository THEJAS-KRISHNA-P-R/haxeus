"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useCart } from "@/contexts/CartContext"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "@/components/ThemeProvider"
import { useStoreSettings } from "@/hooks/useStoreSettings"
import { cn } from "@/lib/utils"
import { FreeShippingBar } from "@/components/ui/FreeShippingBar"
import { ChevronRight, ArrowLeft, Tag, ChevronDown, Trash2, Truck, ShieldCheck, RotateCcw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { getAnimationProps } from "@/lib/animations"
import { useDeviceTier } from "@/hooks/useDeviceTier"

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCart()
  const { toast } = useToast()
  const router = useRouter()
  const { theme } = useTheme()
  const { settings } = useStoreSettings()
  const tier = useDeviceTier()
  const [mounted, setMounted] = useState(false)
  const [showCoupon, setShowCoupon] = useState(false)
  const [couponCode, setCouponCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const [isApplying, setIsApplying] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<{ id: string, code: string, type: string, value: number } | null>(null)

  useEffect(() => {
    setMounted(true)
    // Prefetch checkout for fast navigation
    router.prefetch("/checkout")
  }, [])

  const isDark = mounted && theme === "dark"

  // Stock map — only needed for non-preorder items
  const [stockMap, setStockMap] = useState<Record<string, number>>({})

  useEffect(() => {
    const normalItems = items.filter(item => !item.is_preorder)
    if (!normalItems.length) return

    const fetchStock = async () => {
      const stockData: Record<string, number> = {}
      await Promise.all(
        normalItems.map(async (item) => {
          const { data } = await supabase
            .from("product_inventory")
            .select("stock_quantity")
            .eq("product_id", item.product_id)
            .eq("size", item.size)
            .maybeSingle()
          stockData[`${item.product_id}_${item.size}`] = data?.stock_quantity ?? 0
        })
      )
      setStockMap(stockData)
    }
    fetchStock()
  }, [items])

  const getAvailableStock = (item: typeof items[0]) => {
    if (item.is_preorder) return 99
    return stockMap[`${item.product_id}_${item.size}`] ?? 99
  }

  const handleIncrease = (item: typeof items[0]) => {
    const available = getAvailableStock(item)
    if (item.quantity >= available) {
      toast({
        title: "Limited Stock",
        description: `Only ${available} units available in this size.`,
        variant: "destructive",
      })
      return
    }
    updateQuantity(item.id, item.quantity + 1)
  }

  const handleApplyCoupon = async () => {
    if (!couponCode) return
    setIsApplying(true)
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode)
        .eq("is_active", true)
        .maybeSingle()

      if (error || !data) {
        toast({ title: "Invalid coupon", description: "This code does not exist or is expired.", variant: "destructive" })
        return
      }

      // Basic validation
      const now = new Date()
      if (data.valid_until && new Date(data.valid_until) < now) {
        toast({ title: "Coupon expired", variant: "destructive" })
        return
      }
      if (data.usage_limit && data.used_count >= data.usage_limit) {
        toast({ title: "Coupon limit reached", variant: "destructive" })
        return
      }

      const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
      if (subtotal < (data.min_purchase_amount || 0)) {
        toast({ title: "Min purchase not met", description: `Spend ₹${data.min_purchase_amount} more to use this code.`, variant: "destructive" })
        return
      }

      let discountVal = 0
      if (data.discount_type === "percentage") {
        discountVal = (subtotal * data.discount_value) / 100
        if (data.max_discount_amount) discountVal = Math.min(discountVal, data.max_discount_amount)
      } else {
        discountVal = data.discount_value
      }

      setDiscount(discountVal)
      setAppliedCoupon({ id: data.id, code: data.code, type: data.discount_type, value: data.discount_value })
      toast({ title: "Coupon applied!", description: `You saved ₹${discountVal.toLocaleString("en-IN")}` })
    } catch (err) {
      toast({ title: "Error applying coupon", variant: "destructive" })
    } finally {
      setIsApplying(false)
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const shipping = subtotal >= settings.free_shipping_above ? 0 : settings.shipping_rate
  const total = Math.max(0, subtotal - discount + shipping)

  const card = cn(
    "rounded-2xl border transition-colors duration-300",
    isDark
      ? "bg-white/[0.02] border-white/[0.07]"
      : "bg-white border-black/[0.08] shadow-sm"
  )

  if (!mounted) return null

  if (items.length === 0) {
    return (
      <div className={cn("min-h-screen pt-[72px] md:pt-[104px] flex items-center justify-center px-3", isDark ? "bg-[#0a0a0a]" : "bg-[#f5f4f0]")}>
        <div className="text-center">
          <p className={cn("text-2xl font-bold mb-2", isDark ? "text-white" : "text-black")}>Your cart is empty</p>
          <p className={cn("text-sm mb-6", isDark ? "text-white/50" : "text-black/50")}>Add some items and come back.</p>
          <Link href="/products">
            <button className="px-8 py-3 bg-[#e93a3a] hover:bg-[#ff4a4a] text-white font-bold rounded-full text-sm transition-all shadow-lg shadow-[#e93a3a]/20">
              Continue Shopping
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className={cn("min-h-screen pt-[72px] md:pt-[104px] pb-16 px-3 md:px-8 transition-colors duration-300", isDark ? "bg-[#0a0a0a]" : "bg-[#f5f4f0]")}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="pt-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <Link href="/products" className={cn("inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase mb-4 transition-colors", isDark ? "text-white/30 hover:text-white/60" : "text-black/35 hover:text-black/60")}>
              <ArrowLeft size={14} strokeWidth={3} />
              Continue Shopping
            </Link>
            <h1 className={cn("text-2xl sm:text-3xl font-bold tracking-tight", isDark ? "text-white" : "text-black")}>
              Shopping Cart
            </h1>
            <p className={cn("text-sm mt-1", isDark ? "text-white/40" : "text-black/40")}>
              {items.length} {items.length === 1 ? "item" : "items"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">

          {/* Cart Items */}
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className={cn("flex gap-4 p-4 rounded-2xl border", isDark ? "bg-white/[0.02] border-white/[0.07]" : "bg-white border-black/[0.07] shadow-sm")}>

                {/* Image */}
                <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-black">
                  <Image
                    src={item.product.front_image || "/placeholder.svg"}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg" }}
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      {/* Product name */}
                      <Link href={`/products/${item.product_id}`}>
                        <p className={cn("font-semibold truncate hover:underline underline-offset-2 transition-colors", isDark ? "text-white" : "text-black")}>
                          {item.product.name}
                        </p>
                      </Link>

                      {/* Size + Color */}
                      <p className={cn("text-sm mt-0.5", isDark ? "text-white/50" : "text-black/50")}>
                        {item.size}{item.color ? ` · ${item.color}` : ""}
                      </p>

                      {/* Preorder badge */}
                      {item.is_preorder && (
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#eab308]/20 text-[#eab308] border border-[#eab308]/30">
                            PRE-ORDER
                          </span>
                          {item.preorder_expected_date && (
                            <span className={cn("text-[11px]", isDark ? "text-white/40" : "text-black/40")}>
                              Ships {item.preorder_expected_date}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className={cn(
                        "p-2 rounded-full transition-all duration-200",
                        isDark 
                          ? "text-white/30 hover:text-[#e93a3a] hover:bg-[#e93a3a]/[0.08]" 
                          : "text-black/30 hover:text-[#e93a3a] hover:bg-[#e93a3a]/[0.08]"
                      )}
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Quantity + Price */}
                  <div className="flex items-center justify-between mt-3">
                    <div className={cn("flex items-center gap-2 rounded-full border px-3 py-1", isDark ? "border-white/[0.10]" : "border-black/[0.10]")}>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className={cn("w-5 h-5 flex items-center justify-center text-lg leading-none", isDark ? "text-white/60 hover:text-white" : "text-black/60 hover:text-black")}
                      >
                        −
                      </button>
                      <span className={cn("text-sm font-medium w-4 text-center", isDark ? "text-white" : "text-black")}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleIncrease(item)}
                        className={cn("w-5 h-5 flex items-center justify-center text-lg leading-none", isDark ? "text-white/60 hover:text-white" : "text-black/60 hover:text-black")}
                      >
                        +
                      </button>
                    </div>
                    <p className={cn("font-bold", isDark ? "text-white" : "text-black")}>
                      ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Free Shipping Progress Bar */}
          <FreeShippingBar subtotal={subtotal} />

          {/* Order Summary */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className={cn(card, "p-5")}>
              <h3 className={cn("font-bold text-lg mb-4", isDark ? "text-white" : "text-black")}>
                Order Summary
              </h3>

              <div className="space-y-2.5">
                <div className="flex justify-between">
                  <span className={isDark ? "text-white/60" : "text-black/60"}>Subtotal</span>
                  <span className={cn("font-medium", isDark ? "text-white" : "text-black")}>
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? "text-white/60" : "text-black/60"}>Shipping</span>
                  <span className={cn("font-medium", shipping === 0 ? "text-emerald-400" : isDark ? "text-white" : "text-black")}>
                    {shipping === 0 ? "FREE" : `₹${shipping}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className={cn("text-xs", isDark ? "text-white/35" : "text-black/35")}>
                    Free shipping on orders above ₹{settings.free_shipping_above.toLocaleString("en-IN")}
                  </p>
                )}

                {/* Coupon Code Section */}
                <div className="pt-2">
                  <button
                    onClick={() => setShowCoupon(!showCoupon)}
                    className={cn("flex items-center gap-2 text-xs font-semibold transition-colors", isDark ? "text-white/40 hover:text-white" : "text-black/45 hover:text-black")}
                  >
                    <Tag size={12} />
                    <span>Have a promo code?</span>
                    <ChevronDown size={12} className={cn("transition-transform duration-300", showCoupon && "rotate-180")} />
                  </button>
                  <AnimatePresence>
                    {showCoupon && (
                      <motion.div
                        {...getAnimationProps({
                          initial: { opacity: 0, height: 0 },
                          animate: { opacity: 1, height: "auto" },
                          exit: { opacity: 0, height: 0 }
                        })}
                        className="overflow-hidden"
                      >
                        <div className="flex gap-2 mt-2.5">
                          <input
                            type="text"
                            placeholder="Code"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            disabled={!!appliedCoupon || isApplying}
                            className={cn("flex-1 px-3 py-2 rounded-xl text-xs outline-none border transition-colors", isDark ? "bg-white/[0.04] border-white/[0.10] text-white focus:border-white/20" : "bg-black/[0.02] border-black/[0.10] text-black focus:border-black/20", appliedCoupon && "opacity-50")}
                          />
                          <button
                            onClick={handleApplyCoupon}
                            disabled={!!appliedCoupon || isApplying}
                            className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all", isDark ? "bg-white/[0.08] text-white hover:bg-white/[0.12]" : "bg-black/[0.08] text-black hover:bg-black/[0.12]", appliedCoupon && "bg-emerald-500/10 text-emerald-400")}
                          >
                            {isApplying ? "..." : appliedCoupon ? "Applied" : "Apply"}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Separator */}
                <div className={cn("border-t pt-2.5", isDark ? "border-white/[0.07]" : "border-black/[0.07]")}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={isDark ? "text-white/60" : "text-black/60"}>Subtotal</span>
                    <span className={isDark ? "text-white" : "text-black"}>₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm mb-1 text-emerald-400">
                      <span>Discount ({appliedCoupon?.code})</span>
                      <span>−₹{discount.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm mb-2.5">
                    <span className={isDark ? "text-white/60" : "text-black/60"}>Shipping</span>
                    <span className={cn(shipping === 0 ? "text-emerald-400" : isDark ? "text-white" : "text-black")}>
                      {shipping === 0 ? "FREE" : `₹${shipping}`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className={cn("font-bold text-lg", isDark ? "text-white" : "text-black")}>Total</span>
                    <span className="font-extrabold text-2xl text-[#e93a3a]">
                      ₹{total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => router.push("/checkout")}
                className="w-full mt-6 py-4 rounded-full bg-[#e93a3a] hover:bg-[#ff4a4a] text-white font-bold tracking-wide text-lg shadow-lg shadow-[#e93a3a]/20 transition-all active:scale-[0.98] group"
              >
                <div className="flex items-center justify-center gap-2">
                  Proceed to Checkout
                  <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>

              <p className={cn("text-[10px] text-center mt-3", isDark ? "text-white/30" : "text-black/30")}>
                By proceeding, you agree to our <Link href="/terms-conditions" className="underline underline-offset-2 hover:opacity-70 transition-opacity">Terms of Service</Link>
              </p>
            </div>

            {/* Trust badges */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { icon: <Truck className="h-4 w-4 text-[#e93a3a]" />, label: "Fast shipping" },
                { icon: <ShieldCheck className="h-4 w-4 text-emerald-500" />, label: "Secure payment" },
                { icon: <RotateCcw className="h-4 w-4 text-blue-500" />, label: "10-day returns" },
              ].map(b => (
                <div key={b.label} className={cn("rounded-xl p-3 text-center flex flex-col items-center justify-center", isDark ? "bg-white/[0.02] border border-white/[0.06]" : "bg-white border border-black/[0.07]")}>
                  <div className="mb-1">{b.icon}</div>
                  <p className={cn("text-[10px] font-semibold", isDark ? "text-white/40" : "text-black/40")}>{b.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
