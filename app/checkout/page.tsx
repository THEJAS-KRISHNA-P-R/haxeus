"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase, type UserAddress } from "@/lib/supabase"
import { useCart } from "@/contexts/CartContext"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "@/components/ThemeProvider"
import { ArrowLeft, CreditCard, MapPin, Check, Shield } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { RazorpayCheckout } from "@/components/RazorpayCheckout"
import { cn } from "@/lib/utils"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart } = useCart()
  const { toast } = useToast()
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isDark = mounted && theme === "dark"

  const [user, setUser] = useState<any>(null)
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [selectedAddress, setSelectedAddress] = useState<string>("")
  const [couponCode] = useState<string>("")

  useEffect(() => { checkAuth() }, [])

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push("/auth?redirect=/checkout"); return }
    setUser(user)
    await loadAddresses(user.id)
  }

  async function loadAddresses(userId: string) {
    const { data, error } = await supabase
      .from("user_addresses").select("*").eq("user_id", userId)
      .order("is_default", { ascending: false })
    if (error) { console.error("Error loading addresses:", error); return }
    setAddresses(data || [])
    const defaultAddr = data?.find((addr) => addr.is_default)
    if (defaultAddr) setSelectedAddress(defaultAddr.id)
    else if (data && data.length > 0) setSelectedAddress(data[0].id)
  }

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const shipping = subtotal > 1000 ? 0 : 150
  const total = subtotal + shipping

  // -- Shared style tokens ----------------------------------------------------
  const card = cn(
    "rounded-2xl border p-6 transition-colors duration-300",
    isDark ? "bg-white/[0.03] border-white/[0.07]" : "bg-white border-black/[0.08] shadow-sm"
  )
  const sectionLabel = cn(
    "text-xs font-bold tracking-[0.2em] uppercase mb-5 flex items-center gap-1.5",
    isDark ? "text-white/35" : "text-black/40"
  )
  const muted = isDark ? "text-white/50" : "text-black/50"
  const primary = isDark ? "text-white" : "text-black"

  if (items.length === 0) {
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

  return (
    <main className={cn(
      "min-h-screen pt-[88px] pb-16 px-4 md:px-8 transition-colors duration-300",
      isDark ? "bg-[#0a0a0a] text-white" : "bg-[#f5f4f0] text-black"
    )}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-10 pt-4">
          <Link href="/cart">
            <button className={cn(
              "p-2 rounded-full transition-all",
              isDark ? "text-white/45 hover:text-white hover:bg-white/[0.07]" : "text-black/45 hover:text-black hover:bg-black/[0.05]"
            )}>
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <p className={cn("text-xs tracking-[0.25em] font-medium uppercase mb-0.5", isDark ? "text-white/30" : "text-black/35")}>
              HAXEUS
            </p>
            <h1 className="text-2xl font-bold tracking-tight">Checkout</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">

          {/* -- Left column ----------------------------------------- */}
          <div className="space-y-5">

            {/* Delivery Address */}
            <div className={card}>
              <p className={sectionLabel}>
                <MapPin className="w-3 h-3" />
                Delivery Address
              </p>

              {addresses.length === 0 ? (
                <div className="text-center py-8">
                  <p className={cn("text-sm mb-4", muted)}>No saved addresses</p>
                  <Link href="/profile/addresses/new">
                    <button className="px-5 py-2 bg-[#e93a3a] hover:bg-[#ff4a4a] text-white font-bold rounded-full text-sm transition-all">
                      Add Address
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => {
                    const isSelected = selectedAddress === address.id
                    return (
                      <button
                        key={address.id}
                        onClick={() => setSelectedAddress(address.id)}
                        className={cn(
                          "w-full text-left rounded-xl p-4 border transition-all duration-200",
                          isSelected
                            ? "border-[#e93a3a] bg-[#e93a3a]/[0.06]"
                            : isDark
                              ? "border-white/[0.07] hover:border-white/15"
                              : "border-black/[0.08] hover:border-black/20"
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={cn("text-sm font-semibold", primary)}>{address.full_name}</span>
                              {address.is_default && (
                                <span className="text-[10px] font-bold tracking-widest uppercase text-[#e93a3a] bg-[#e93a3a]/10 px-2 py-0.5 rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className={cn("text-xs leading-relaxed", muted)}>
                              {address.address_line1}
                              {address.address_line2 && `, ${address.address_line2}`}
                              {" — "}{address.city}, {address.state} {address.pincode}
                            </p>
                            <p className={cn("text-xs mt-1", muted)}>+91 {address.phone}</p>
                          </div>
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all",
                            isSelected ? "border-[#e93a3a] bg-[#e93a3a]" : isDark ? "border-white/20" : "border-black/20"
                          )}>
                            {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                          </div>
                        </div>
                      </button>
                    )
                  })}

                  <Link href="/profile/addresses/new">
                    <button className={cn(
                      "w-full rounded-xl p-3.5 border border-dashed text-sm font-medium transition-all mt-1",
                      isDark
                        ? "border-white/[0.12] text-white/40 hover:text-white/70 hover:border-white/25"
                        : "border-black/[0.12] text-black/40 hover:text-black/70 hover:border-black/25"
                    )}>
                      + Add New Address
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {/* Payment Method — Razorpay only */}
            <div className={card}>
              <p className={sectionLabel}>
                <CreditCard className="w-3 h-3" />
                Payment Method
              </p>

              <div className={cn(
                "flex items-center gap-4 rounded-xl p-4 border",
                isDark ? "border-white/[0.07] bg-white/[0.02]" : "border-black/[0.07] bg-black/[0.02]"
              )}>
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                  isDark ? "bg-white/[0.06] text-white/60" : "bg-black/[0.05] text-black/60"
                )}>
                  <Shield className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-semibold", primary)}>Secure payment via Razorpay</p>
                  <p className={cn("text-xs", muted)}>Cards · UPI · NetBanking · Wallets</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <CreditCard className={cn("w-4 h-4", muted)} />
                </div>
              </div>
            </div>
          </div>

          {/* -- Right column — Order Summary ------------------------ */}
          <div>
            <div className={cn(card, "lg:sticky lg:top-24")}>
              <p className={sectionLabel}>Order Summary</p>

              <div className="space-y-4 mb-5">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.size}`} className="flex gap-3">
                    <div className={cn(
                      "relative h-14 w-14 rounded-xl overflow-hidden shrink-0",
                      isDark ? "bg-white/[0.05]" : "bg-black/[0.05]"
                    )}>
                      <Image
                        src={item.product.front_image || "/placeholder.svg"}
                        alt={item.product.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-medium truncate", primary)}>{item.product.name}</p>
                      <p className={cn("text-xs mt-0.5", muted)}>{item.size} · Qty {item.quantity}</p>
                      <p className={cn("text-sm font-bold mt-0.5", primary)}>
                        ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className={cn("h-px mb-4", isDark ? "bg-white/[0.06]" : "bg-black/[0.07]")} />

              <div className="space-y-2.5 mb-5">
                {[
                  { label: "Subtotal", value: `₹${subtotal.toLocaleString("en-IN")}` },
                  { label: "Shipping", value: shipping === 0 ? "Free" : `₹${shipping}` },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between text-sm">
                    <span className={muted}>{row.label}</span>
                    <span className={cn("font-medium", primary)}>{row.value}</span>
                  </div>
                ))}
                <div className={cn("h-px", isDark ? "bg-white/[0.06]" : "bg-black/[0.07]")} />
                <div className="flex justify-between">
                  <span className={cn("font-bold", primary)}>Total</span>
                  <span className="font-bold text-[#e93a3a] text-base">₹{total.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <RazorpayCheckout
                items={items.map((item) => ({
                  productId: String(item.product.id),
                  quantity: item.quantity,
                  size: item.size,
                }))}
                couponCode={couponCode || undefined}
                shippingAddressId={selectedAddress || undefined}
                isDark={isDark}
              />

              <p className={cn("text-xs text-center mt-3", muted)}>
                By placing your order you agree to our{" "}
                <Link href="/terms-conditions" className="underline underline-offset-2 hover:text-[#e93a3a] transition-colors">
                  terms
                </Link>
              </p>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
