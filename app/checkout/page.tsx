"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useCart, type CartItem } from "@/contexts/CartContext"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "@/components/ThemeProvider"
import { ArrowLeft, MapPin, Check } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { useStoreSettings } from "@/hooks/useStoreSettings"
import { FreeShippingBar } from "@/components/ui/FreeShippingBar"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Address {
  name: string
  phone: string
  address_1: string
  address_2: string
  city: string
  state: string
  pincode: string
  country: string
}

interface RazorpayResponse {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

type CheckoutStep = "address" | "review" | "payment"

const STEPS: CheckoutStep[] = ["address", "review", "payment"]
const STEP_LABELS: Record<CheckoutStep, string> = {
  address: "Address",
  review: "Review",
  payment: "Payment",
}

const EMPTY_ADDRESS: Address = {
  name: "",
  phone: "",
  address_1: "",
  address_2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart } = useCart()
  const { settings } = useStoreSettings()
  const { toast } = useToast()
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Load Razorpay script on checkout page only
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    document.body.appendChild(script)
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script)
    }
  }, [])

  const isDark = mounted && theme === "dark"

  const [user, setUser] = useState<any>(null)
  const [step, setStep] = useState<CheckoutStep>("address")
  const [address, setAddress] = useState<Address>(EMPTY_ADDRESS)
  const [saveAddress, setSaveAddress] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [pincodeLoading, setPincodeLoading] = useState(false)

  // Shared styles
  const card = cn(
    "rounded-2xl border p-6 transition-colors duration-300",
    isDark ? "bg-white/[0.03] border-white/[0.07]" : "bg-white border-black/[0.08] shadow-sm"
  )
  const inputCls = cn(
    "w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors",
    isDark
      ? "bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/30 focus:border-white/30"
      : "bg-black/[0.02] border-black/[0.10] text-black placeholder:text-black/30 focus:border-black/30"
  )
  const labelCls = cn("block text-xs font-semibold mb-1.5", isDark ? "text-white/50" : "text-black/50")
  const muted = isDark ? "text-white/50" : "text-black/50"
  const primary = isDark ? "text-white" : "text-black"

  // Auth check
  useEffect(() => {
    checkAuth()
  }, [])

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
      .limit(5)

    if (!data?.length) return
    const def = data.find(a => a.is_default) ?? data[0]
    setAddress({
      name: def.full_name ?? "",
      phone: def.phone ?? "",
      address_1: def.address_line1 ?? "",
      address_2: def.address_line2 ?? "",
      city: def.city ?? "",
      state: def.state ?? "",
      pincode: def.pincode ?? "",
      country: def.country ?? "India",
    })
  }

  // Pricing
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const shipping = subtotal >= settings.free_shipping_above ? 0 : settings.shipping_rate
  const total = subtotal + shipping

  // Pincode auto-fill
  async function handlePincodeBlur(pincode: string) {
    if (pincode.length !== 6) return
    setPincodeLoading(true)
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`)
      const data = await res.json()
      if (data[0]?.Status === "Success") {
        const post = data[0].PostOffice[0]
        setAddress(prev => ({
          ...prev,
          city: post.District,
          state: post.State,
        }))
      }
    } catch {
      // silent fail — user fills manually
    } finally {
      setPincodeLoading(false)
    }
  }

  // Address validation
  function validateAddress(): boolean {
    const required: Array<keyof Address> = ["name", "phone", "address_1", "city", "state", "pincode"]
    const missing = required.find(f => !address[f]?.trim())
    if (missing) {
      setError(`Please fill in ${missing.replace("_", " ")}`)
      return false
    }
    if (!/^\d{6}$/.test(address.pincode)) {
      setError("Please enter a valid 6-digit pincode")
      return false
    }
    if (!/^[6-9]\d{9}$/.test(address.phone)) {
      setError("Please enter a valid 10-digit Indian mobile number (starts with 6-9)")
      return false
    }
    return true
  }

  function handleAddressNext() {
    setError(null)
    if (!validateAddress()) return
    setStep("review")
  }

  function handleReviewNext() {
    setStep("payment")
  }

  useEffect(() => {
    if (step === "payment") {
      initiatePayment()
    }
  }, [step])

  async function initiatePayment() {
    setPaymentLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.product_id,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            is_preorder: item.is_preorder,
          })),
          address: {
            full_name: address.name,
            phone: address.phone,
            address_line1: address.address_1,
            address_line2: address.address_2 || null,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            country: address.country,
          },
          save_address: saveAddress,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create order")
      openRazorpay(data.razorpayOrderId, data.amount, data.orderId)
    } catch (err) {
      setError((err as Error).message)
      setStep("review")
    } finally {
      setPaymentLoading(false)
    }
  }

  function openRazorpay(razorpayOrderId: string, amount: number, internalOrderId: string) {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount,
      currency: "INR",
      name: "HAXEUS",
      description: "Premium Streetwear",
      image: "/logo.png",
      order_id: razorpayOrderId,
      handler: async (response: RazorpayResponse) => {
        await verifyPayment(response, internalOrderId)
      },
      prefill: {
        name: address.name,
        contact: address.phone,
        email: user?.email ?? "",
      },
      theme: { color: "#e93a3a" },
      modal: {
        ondismiss: () => {
          setStep("review")
          setError("Payment cancelled. Your cart is still saved.")
        },
      },
    }
    const rzp = new (window as any).Razorpay(options)
    rzp.open()
  }

  async function verifyPayment(response: RazorpayResponse, internalOrderId: string) {
    try {
      const res = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          orderId: internalOrderId,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Payment verification failed")

      await clearCart()
      router.push(`/orders/${internalOrderId}?confirmed=true`)
    } catch (err) {
      toast({
        title: "Payment issue",
        description: "Your payment was received but verification failed. Please contact support.",
        variant: "destructive",
      })
    }
  }

  // Empty cart guard
  if (mounted && items.length === 0 && step !== "payment") {
    return (
      <div className={cn("min-h-screen pt-[88px] flex items-center justify-center", isDark ? "bg-[#0a0a0a]" : "bg-[#f5f4f0]")}>
        <div className="text-center">
          <p className={cn("text-lg font-semibold mb-4", primary)}>Your cart is empty</p>
          <Link href="/products">
            <button className="px-6 py-2.5 bg-[#e93a3a] hover:bg-[#ff4a4a] text-white font-bold rounded-full text-sm transition-all shadow-lg shadow-[#e93a3a]/20">
              Shop Now
            </button>
          </Link>
        </div>
      </div>
    )
  }

  if (!mounted) return null

  return (
    <main className={cn("min-h-screen pt-[88px] pb-16 px-4 md:px-8 transition-colors duration-300", isDark ? "bg-[#0a0a0a] text-white" : "bg-[#f5f4f0] text-black")}>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 pt-6 mb-8">
          <Link href="/cart">
            <button className={cn("p-2 rounded-full transition-all", isDark ? "text-white/45 hover:text-white hover:bg-white/[0.07]" : "text-black/45 hover:text-black hover:bg-black/[0.05]")}>
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <p className={cn("text-xs tracking-[0.25em] font-medium uppercase mb-0.5", isDark ? "text-white/30" : "text-black/35")}>HAXEUS</p>
            <h1 className="text-2xl font-bold tracking-tight">Checkout</h1>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => {
            const stepIndex = STEPS.indexOf(step)
            const isDone = stepIndex > i
            const isActive = step === s
            return (
              <div key={s} className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                  isDone
                    ? "bg-emerald-500 text-white"
                    : isActive
                      ? "bg-[#e93a3a] text-white"
                      : isDark ? "bg-white/[0.08] text-white/40" : "bg-black/[0.08] text-black/40"
                )}>
                  {isDone ? <Check className="w-4 h-4" strokeWidth={3} /> : i + 1}
                </div>
                <span className={cn("text-sm font-medium hidden sm:block", isActive ? primary : isDark ? "text-white/40" : "text-black/40")}>
                  {STEP_LABELS[s]}
                </span>
                {i < STEPS.length - 1 && (
                  <div className={cn("w-8 h-px ml-1", isDark ? "bg-white/[0.10]" : "bg-black/[0.10]")} />
                )}
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">

          {/* Main content */}
          <div>
            {/* STEP 1 — Address */}
            {step === "address" && (
              <div className={card}>
                <div className="flex items-center gap-2 mb-6">
                  <MapPin className={cn("w-4 h-4", isDark ? "text-white/40" : "text-black/40")} />
                  <p className={cn("text-xs font-bold tracking-[0.2em] uppercase", isDark ? "text-white/40" : "text-black/40")}>Delivery Address</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Full Name *</label>
                    <input
                      className={inputCls}
                      placeholder="As on your ID"
                      value={address.name}
                      onChange={e => setAddress(a => ({ ...a, name: e.target.value }))}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelCls}>Mobile Number *</label>
                    <input
                      className={inputCls}
                      type="tel"
                      placeholder="10-digit Indian mobile"
                      maxLength={10}
                      value={address.phone}
                      onChange={e => setAddress(a => ({ ...a, phone: e.target.value.replace(/\D/g, "") }))}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelCls}>Address Line 1 *</label>
                    <input
                      className={inputCls}
                      placeholder="House/Flat no., Street, Area"
                      value={address.address_1}
                      onChange={e => setAddress(a => ({ ...a, address_1: e.target.value }))}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelCls}>Address Line 2 <span className={isDark ? "text-white/25" : "text-black/25"}>(optional)</span></label>
                    <input
                      className={inputCls}
                      placeholder="Landmark, Building name"
                      value={address.address_2}
                      onChange={e => setAddress(a => ({ ...a, address_2: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Pincode *</label>
                    <div className="relative">
                      <input
                        className={inputCls}
                        placeholder="6-digit pincode"
                        maxLength={6}
                        value={address.pincode}
                        onChange={e => setAddress(a => ({ ...a, pincode: e.target.value.replace(/\D/g, "") }))}
                        onBlur={e => handlePincodeBlur(e.target.value)}
                      />
                      {pincodeLoading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className={cn("w-4 h-4 rounded-full border-2 border-t-transparent animate-spin", isDark ? "border-white/30" : "border-black/30")} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>City *</label>
                    <input
                      className={inputCls}
                      placeholder="City"
                      value={address.city}
                      onChange={e => setAddress(a => ({ ...a, city: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>State *</label>
                    <input
                      className={inputCls}
                      placeholder="State"
                      value={address.state}
                      onChange={e => setAddress(a => ({ ...a, state: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Country</label>
                    <input
                      className={cn(inputCls, "opacity-60")}
                      value={address.country}
                      readOnly
                    />
                  </div>
                </div>

                {/* Save address toggle — logged-in only */}
                {user && (
                  <label className="flex items-center gap-3 mt-5 cursor-pointer group">
                    <button
                      role="checkbox"
                      aria-checked={saveAddress}
                      onClick={() => setSaveAddress(v => !v)}
                      className={cn(
                        "w-10 h-6 rounded-full transition-colors flex-shrink-0 relative",
                        saveAddress ? "bg-[#e93a3a]" : isDark ? "bg-white/[0.12]" : "bg-black/[0.12]"
                      )}
                    >
                      <span className={cn(
                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                        saveAddress ? "left-5" : "left-1"
                      )} />
                    </button>
                    <span className={cn("text-sm", isDark ? "text-white/60" : "text-black/60")}>
                      Save this address for future orders
                    </span>
                  </label>
                )}

                {error && (
                  <p className="mt-4 text-sm text-red-400">{error}</p>
                )}

                <button
                  onClick={handleAddressNext}
                  className="w-full mt-6 py-4 rounded-full bg-[#e93a3a] hover:bg-[#ff4a4a] text-white font-bold tracking-wide text-base shadow-lg shadow-[#e93a3a]/20 transition-colors"
                >
                  Continue to Review
                </button>
              </div>
            )}

            {/* STEP 2 — Review */}
            {step === "review" && (
              <div className="space-y-4">
                {/* Address summary */}
                <div className={card}>
                  <div className="flex items-center justify-between mb-4">
                    <p className={cn("text-xs font-bold tracking-[0.2em] uppercase", isDark ? "text-white/40" : "text-black/40")}>Delivery To</p>
                    <button
                      onClick={() => setStep("address")}
                      className={cn("text-xs font-semibold transition-colors", isDark ? "text-white/50 hover:text-white" : "text-black/50 hover:text-black")}
                    >
                      Edit
                    </button>
                  </div>
                  <p className={cn("font-bold", primary)}>{address.name}</p>
                  <p className={cn("text-sm mt-1 leading-relaxed", muted)}>
                    {address.address_1}
                    {address.address_2 ? `, ${address.address_2}` : ""}
                    <br />
                    {address.city}, {address.state} — {address.pincode}
                  </p>
                  <p className={cn("text-sm mt-1", muted)}>+91 {address.phone}</p>
                </div>

                {/* Items */}
                <div className={card}>
                  <p className={cn("text-xs font-bold tracking-[0.2em] uppercase mb-4", isDark ? "text-white/40" : "text-black/40")}>Your Order</p>
                  <div className="space-y-4">
                    {items.map(item => (
                      <div key={item.id} className="flex gap-3">
                        <div className={cn("relative h-14 w-14 rounded-xl overflow-hidden flex-shrink-0", isDark ? "bg-white/[0.05]" : "bg-black/[0.05]")}>
                          <Image src={item.product.front_image || "/placeholder.svg"} alt={`${item.product.name} — HAXEUS streetwear`} fill sizes="56px" className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm font-medium truncate", primary)}>{item.product.name}</p>
                          <p className={cn("text-xs mt-0.5", muted)}>
                            {item.size}{item.color ? ` · ${item.color}` : ""} · Qty {item.quantity}
                          </p>
                          {item.is_preorder && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-[#e7bf04]/20 text-[#e7bf04]">PRE-ORDER</span>
                              {item.preorder_expected_date && <span className={cn("text-[10px]", muted)}>Ships {item.preorder_expected_date}</span>}
                            </div>
                          )}
                        </div>
                        <p className={cn("text-sm font-bold flex-shrink-0", primary)}>
                          ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-amber-400 font-medium px-1">{error}</p>
                )}

                <button
                  onClick={handleReviewNext}
                  disabled={paymentLoading}
                  className="w-full py-4 rounded-full bg-[#e93a3a] hover:bg-[#ff4a4a] text-white font-bold tracking-wide text-base shadow-lg shadow-[#e93a3a]/20 transition-colors disabled:opacity-60"
                >
                  {paymentLoading ? "Preparing payment..." : "Place Order — Pay Now"}
                </button>

                <p className={cn("text-xs text-center", muted)}>
                  By placing your order you agree to our{" "}
                  <Link href="/terms-conditions" className="underline underline-offset-2 hover:text-[#e93a3a] transition-colors">terms</Link>
                </p>
              </div>
            )}

            {/* STEP 3 — Payment (loading state only — Razorpay modal opens automatically) */}
            {step === "payment" && (
              <div className={cn(card, "flex flex-col items-center justify-center py-16 text-center")}>
                <div className={cn("w-10 h-10 rounded-full border-2 border-t-transparent animate-spin mb-4", isDark ? "border-white/30" : "border-black/30")} />
                <p className={cn("font-semibold", primary)}>Opening payment...</p>
                <p className={cn("text-sm mt-1", muted)}>Razorpay is loading. Please don't close this window.</p>
              </div>
            )}
          </div>

          {/* Right — Order Summary (sticky) */}
          <div className="lg:sticky lg:top-24 h-fit">
            <FreeShippingBar subtotal={subtotal} className="mb-4" />
            <div className={cn(card)}>
              <p className={cn("text-xs font-bold tracking-[0.2em] uppercase mb-4", isDark ? "text-white/35" : "text-black/40")}>
                Order Summary
              </p>

              <div className="space-y-2.5 mb-4">
                <div className="flex justify-between text-sm">
                  <span className={muted}>Subtotal ({items.length} items)</span>
                  <span className={cn("font-medium", primary)}>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={muted}>Shipping</span>
                  <span className={cn("font-medium", shipping === 0 ? "text-emerald-400" : primary)}>
                    {shipping === 0 ? "FREE" : `₹${shipping}`}
                  </span>
                </div>
                <div className={cn("h-px", isDark ? "bg-white/[0.07]" : "bg-black/[0.07]")} />
                <div className="flex justify-between">
                  <span className={cn("font-bold", primary)}>Total</span>
                  <span className="font-bold text-lg text-[#e93a3a]">₹{total.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Trust */}
              <div className={cn("rounded-xl p-3 flex items-center gap-2 text-xs", isDark ? "bg-white/[0.03]" : "bg-black/[0.02]")}>
                <span>🔒</span>
                <span className={muted}>Secured by Razorpay. Cards · UPI · NetBanking · Wallets.</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
