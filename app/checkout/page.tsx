"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useCart } from "@/contexts/CartContext"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "@/components/ThemeProvider"
import { ArrowLeft, MapPin, Check, Gift, Loader2, ShieldCheck, Info } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { useStoreSettings } from "@/hooks/useStoreSettings"
import { FreeShippingBar } from "@/components/ui/FreeShippingBar"
import { formatPrice } from "@/lib/currency"
import { useRazorpay } from "@/hooks/use-razorpay"

// ─── Validation Schemas ───────────────────────────────────────────────────────

const addressSchema = z.object({
  name: z.string().min(3, "Full name must be at least 3 characters"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number (starts with 6-9)"),
  address_1: z.string().min(5, "Address Line 1 is too short"),
  address_2: z.string().optional(),
  city: z.string().min(2, "City name is too short"),
  state: z.string().min(2, "State name is too short"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be exactly 6 digits"),
})

type AddressFormValues = z.infer<typeof addressSchema>

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart } = useCart()
  const { settings } = useStoreSettings()
  const { toast } = useToast()
  const { theme } = useTheme()
  const { openRazorpay } = useRazorpay()

  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [couponCode, setCouponCode] = useState("")
  const [couponData, setCouponData] = useState<any>(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("")

  // 0. Cart Watcher (Bullet-Proof Sync)
  // If items change during checkout, we must reset the state to ensure the final order 
  // reflects the LATEST cart items.
  useEffect(() => {
    if (checkoutLoading && loadingMessage.includes("Razorpay")) {
      toast({ 
        title: "Cart Updated", 
        description: "Your cart was modified. Please re-submit your details to ensure your order total is accurate.",
        variant: "destructive" 
      })
      setCheckoutLoading(false)
      setLoadingMessage("")
    }
  }, [items])

  // 1. Initialize Form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: "",
      phone: "",
      address_1: "",
      address_2: "",
      city: "",
      state: "",
      pincode: "",
    },
  })

  useEffect(() => {
    setMounted(true)
    checkAuth()
  }, [])

  const isDark = mounted && theme === "dark"

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/auth?redirect=/checkout")
      return
    }
    setUser(user)
    loadDefaultAddress(user.id)
  }

  async function loadDefaultAddress(userId: string) {
    const { data } = await supabase
      .from("user_addresses")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (data) {
      setValue("name", data.full_name || "")
      setValue("phone", data.phone || "")
      setValue("address_1", data.address_line1 || "")
      setValue("address_2", data.address_line2 || "")
      setValue("city", data.city || "")
      setValue("state", data.state || "")
      setValue("pincode", data.pincode || "")
    }
  }

  // Pincode lookup
  const pincode = watch("pincode")
  useEffect(() => {
    if (pincode?.length === 6) {
      handlePincodeLookup(pincode)
    }
  }, [pincode])

  async function handlePincodeLookup(code: string) {
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${code}`)
      const data = await res.json()
      if (data[0]?.Status === "Success") {
        const post = data[0].PostOffice[0]
        setValue("city", post.District)
        setValue("state", post.State)
      }
    } catch (err) {
      // Manual entry fallback
    }
  }

  // 2. Coupon Application
  async function applyCoupon() {
    if (!couponCode) return
    setCouponLoading(true)
    try {
      const res = await fetch("/api/payment/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          coupon_code: couponCode, 
          subtotal: subtotal 
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setCouponData(data)
        toast({ title: "Coupon Applied!", description: `You saved ${formatPrice(data.discount_amount)}` })
      } else {
        toast({ title: "Oops!", description: data.error, variant: "destructive" })
        setCouponData(null)
      }
    } catch (err) {
      toast({ title: "Error", description: "Coupon validation failed.", variant: "destructive" })
    } finally {
      setCouponLoading(false)
    }
  }

  // 3. Totals
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const shipping = subtotal >= settings.free_shipping_above ? 0 : settings.shipping_rate
  const discount = couponData?.discount_amount ?? 0
  const total = subtotal + shipping - discount

  // 4. Main Checkout Logic
  const onAddressSubmit = async (data: AddressFormValues) => {
    setCheckoutLoading(true)
    setLoadingMessage("Creating Secure Order...")
    
    try {
      // A. Create DB Order
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart_items: items.map(t => ({
            product_id: t.product_id,
            size: t.size,
            quantity: t.quantity,
          })),
          coupon_code: couponData?.coupon_code,
          shipping_address: {
            full_name: data.name,
            phone: data.phone,
            address_line1: data.address_1,
            address_line2: data.address_2 || "",
            city: data.city,
            state: data.state,
            pincode: data.pincode,
            country: "India",
          },
        }),
      })
 
      const orderResult = await res.json()
      if (!res.ok) {
        if (orderResult.error === "OUT_OF_STOCK") {
          const item = items.find(i => i.product_id === orderResult.product_id)
          toast({ 
            title: "Stock Issue", 
            description: `${item?.product.name || "A product"} is out of stock in ${orderResult.size || "selected size"}. Please remove it to continue.`, 
            variant: "destructive" 
          })
          return
        }
        throw new Error(orderResult.error || "Failed to finalize order")
      }

      setLoadingMessage("Opening Razorpay Secure Check...")

      // B. Open Razorpay Modal
      await openRazorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: orderResult.amount_paise,
        currency: "INR",
        name: "HAXEUS",
        description: "Premium Artistic Streetwear",
        image: "https://www.haxeus.in/logo.png",
        order_id: orderResult.razorpay_order_id,
        prefill: {
          name: data.name,
          contact: data.phone,
          email: user?.email,
        },
        theme: { color: "#e93a3a" },
        modal: {
          ondismiss: () => {
            setCheckoutLoading(false)
            setLoadingMessage("")
          },
        },
        handler: async (response) => {
          // C. Verification (Client-side trigger)
          setCheckoutLoading(true)
          setLoadingMessage("Verifying Payment with HAXEUS Server...")
          
          try {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response
              }),
            })

            const verifyData = await verifyRes.json()

            if (verifyRes.ok && verifyData.success) {
              const newOrderId = verifyData.order_id
              await clearCart()
              localStorage.removeItem('haxeus-cart')
              router.push(`/orders/${newOrderId}?payment=success`)
            } else {
              // Redirect to generic error or home if order wasn't created
              toast({ title: "Verification Failed", description: "Payment was captured but order verification failed. Please contact support.", variant: "destructive" })
              router.push("/products")
            }
          } catch (err) {
            toast({ title: "Fatal Error", description: "Connection lost during verification.", variant: "destructive" })
            setCheckoutLoading(false)
          }
        },
      })
    } catch (err: any) {
      toast({ title: "Checkout Error", description: err.message || "Connection issue. Please check your internet and try again.", variant: "destructive" })
    } finally {
      // Don't unset loading if we are redirecting
      const isRedirecting = window.location.pathname.includes('/orders/')
      if (!isRedirecting) {
        setCheckoutLoading(false)
        setLoadingMessage("")
      }
    }
  }

  // Styles
  const cardCls = cn(
    "rounded-2xl border p-6 transition-colors duration-300 backdrop-blur-md",
    isDark ? "bg-white/[0.03] border-white/[0.07]" : "bg-white border-black/[0.08] shadow-sm"
  )
  const inputCls = cn(
    "w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all",
    isDark
      ? "bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/30 focus:border-[#e93a3a]/40"
      : "bg-black/[0.02] border-black/[0.10] text-black placeholder:text-black/30 focus:border-[#e93a3a]/40"
  )
  const labelCls = cn("block text-xs font-semibold mb-1.5", isDark ? "text-white/50" : "text-black/50")
  const mutedText = isDark ? "text-white/40" : "text-black/40"

  if (!mounted || items.length === 0) {
    if (mounted && items.length === 0) {
      return (
        <div className="min-h-screen pt-[88px] flex items-center justify-center bg-[var(--bg)]">
          <div className="text-center">
            <p className="text-lg font-semibold mb-4">Your cart is empty.</p>
            <Link href="/products" className="px-6 py-2.5 bg-[#e93a3a] text-white font-bold rounded-full text-sm">
              Shop Now
            </Link>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <main className="min-h-screen pt-[88px] pb-16 px-4 md:px-8 bg-[var(--bg)]">
      {/* Premium Loading Overlay */}
      {checkoutLoading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center backdrop-blur-xl bg-black/60">
            <div className="relative mb-8">
                <div className="w-16 h-16 rounded-full border-2 border-white/10" />
                <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-2 border-t-[#e93a3a] animate-spin" />
            </div>
            <p className="text-[#e93a3a] font-bold tracking-[0.3em] uppercase text-[10px] animate-pulse">
                {loadingMessage || "Processing..."}
            </p>
            <p className="mt-4 text-white/30 text-[9px] uppercase tracking-widest">Secure HAXEUS Gateway</p>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        
        {/* Progress */}
        <div className="flex items-center gap-3 pt-6 mb-8">
          <Link href="/cart" className={cn("p-2 rounded-full", isDark ? "hover:bg-white/10" : "hover:bg-black/5")}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <p className={cn("text-xs tracking-widest uppercase font-medium", mutedText)}>HAXEUS Shipping</p>
            <h1 className="text-2xl font-bold tracking-tight">Checkout</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          
          <form onSubmit={handleSubmit(onAddressSubmit)} className="space-y-6">
            <div className={cardCls}>
              <div className="flex items-center gap-2 mb-6 text-[#e93a3a]">
                <MapPin className="w-4 h-4" />
                <p className="text-xs font-bold tracking-[0.2em] uppercase">Delivery Address</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelCls}>Recipient Name *</label>
                  <input {...register("name")} className={inputCls} placeholder="e.g. John Doe" />
                  {errors.name && <p className="text-[10px] text-red-500 mt-1">{errors.name.message}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className={labelCls}>Contact Number *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold opacity-40">+91</span>
                    <input {...register("phone")} className={cn(inputCls, "pl-12")} placeholder="9876543210" maxLength={10} />
                  </div>
                  {errors.phone && <p className="text-[10px] text-red-500 mt-1">{errors.phone.message}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className={labelCls}>Street / Flat / House *</label>
                  <input {...register("address_1")} className={inputCls} placeholder="e.g. 123 Street Ave" />
                  {errors.address_1 && <p className="text-[10px] text-red-500 mt-1">{errors.address_1.message}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className={labelCls}>Landmark (Optional)</label>
                  <input {...register("address_2")} className={inputCls} placeholder="e.g. Near Metro Station" />
                </div>

                <div>
                  <label className={labelCls}>Pincode *</label>
                  <input {...register("pincode")} className={inputCls} placeholder="6 Digits" maxLength={6} />
                  {errors.pincode && <p className="text-[10px] text-red-500 mt-1">{errors.pincode.message}</p>}
                </div>

                <div>
                  <label className={labelCls}>City *</label>
                  <input {...register("city")} className={inputCls} placeholder="City" />
                  {errors.city && <p className="text-[10px] text-red-500 mt-1">{errors.city.message}</p>}
                </div>

                <div>
                  <label className={labelCls}>State *</label>
                  <input {...register("state")} className={inputCls} placeholder="State" />
                  {errors.state && <p className="text-[10px] text-red-500 mt-1">{errors.state.message}</p>}
                </div>

                <div>
                  <label className={labelCls}>Country</label>
                  <input value="India" className={cn(inputCls, "opacity-50")} readOnly />
                </div>
              </div>
            </div>

            {/* Payment Selector */}
            <div className={cardCls}>
              <p className={cn("text-xs font-bold tracking-[0.2em] uppercase mb-6 text-[#e93a3a]")}>Payment Method</p>
              <div className="space-y-3">
                <div className={cn("flex items-center justify-between p-4 rounded-xl border transition-all ring-1 ring-[#e93a3a]/20 border-[#e93a3a]/30 bg-[#e93a3a]/5")}>
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-[#e93a3a]" />
                    <div>
                      <p className="text-sm font-bold">Online Payment</p>
                      <p className="text-xs opacity-50">Cards, UPI, Wallets, NetBanking</p>
                    </div>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-emerald-400 opacity-60" />
                </div>
                
                <div className={cn("flex items-center justify-between p-4 rounded-xl border grayscale opacity-40 cursor-not-allowed", isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10")}>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border-2 border-dashed border-white/40" />
                    <p className="text-sm font-bold">Cash on Delivery</p>
                  </div>
                  <span className="text-[9px] font-bold tracking-widest uppercase bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full">Coming Soon</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={checkoutLoading}
              className="w-full py-4 rounded-full bg-[#e93a3a] hover:bg-[#ff4a4a] text-white font-bold tracking-wide text-lg shadow-lg shadow-[#e93a3a]/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checkoutLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-bold uppercase tracking-widest">{loadingMessage || "Please wait..."}</span>
                </>
              ) : (
                <>
                  PROCEED TO PAY
                  <span>{formatPrice(total)}</span>
                </>
              )}
            </button>
          </form>

          {/* Sidebar */}
          <aside className="space-y-6">
            <FreeShippingBar subtotal={subtotal} className="mb-4" />

            <div className={cardCls}>
              <p className={cn("text-xs font-bold tracking-[0.2em] uppercase mb-4", mutedText)}>Order Summary</p>
              <div className="space-y-4 mb-6">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3 text-xs">
                    <div className="w-12 h-12 rounded-lg bg-black/5 relative overflow-hidden flex-shrink-0">
                      <Image src={item.product?.front_image || "/placeholder.svg"} alt="Item" fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">{item.product?.name}</p>
                      <p className="opacity-50">{item.size} · Qty {item.quantity}</p>
                    </div>
                    <p className="font-bold">{formatPrice(item.product.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                    <input 
                      placeholder="COUPON" 
                      className={cn(inputCls, "pl-9 py-2 uppercase font-mono tracking-widest")}
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    />
                  </div>
                  <button 
                    onClick={applyCoupon}
                    disabled={couponLoading}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold hover:bg-white/10 transition-colors uppercase"
                  >
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </div>
              </div>

              {/* Calculations */}
              <div className="mt-6 space-y-3 pt-6 border-t border-white/10 text-sm">
                <div className="flex justify-between">
                  <span className={mutedText}>Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={mutedText}>Shipping</span>
                  <span className={cn("font-medium", shipping === 0 ? "text-emerald-400" : "")}>
                    {shipping === 0 ? "FREE" : formatPrice(shipping)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-white/10">
                  <span className="font-bold">Total</span>
                  <span className="font-black text-xl text-[#e93a3a]">{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            <div className={cn("p-4 rounded-2xl flex items-start gap-3", isDark ? "bg-white/[0.02]" : "bg-black/[0.02]")}>
              <Info className="w-4 h-4 text-[#e93a3a] flex-shrink-0 mt-0.5" />
              <p className="text-[10px] opacity-60 leading-relaxed uppercase tracking-wider font-medium">
                Orders are usually delivered within 3-5 business days. 
                Refunds are processed within 48 hours for failed payments.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
