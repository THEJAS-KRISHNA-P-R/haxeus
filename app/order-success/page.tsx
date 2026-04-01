"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useTheme } from "@/components/ThemeProvider"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { CheckCircle, Package, ArrowRight } from "lucide-react"
import { gaCommerceEvents } from "@/lib/ga-events"

export default function OrderSuccessPage() {
    const { theme } = useTheme()
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])
    const isDark = mounted && theme === "dark"

    const searchParams = useSearchParams()
    const router = useRouter()
    const orderId = searchParams?.get("orderId")

    const [order, setOrder] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!orderId) { router.push("/"); return }

        const fetchOrder = async () => {
            // ── Auth check (#6.1 IDOR fix) ────────────────────────────────────────
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push("/auth?redirect=/order-success?orderId=" + orderId)
                return
            }

            const { data } = await supabase
                .from("orders")
                .select("id, total_amount, status, created_at, order_items(product_id, quantity, price, product:products(name, category))")
                .eq("id", orderId)
                .eq("user_id", user.id) // Explicit ownership — don't rely on RLS alone
                .single()

            if (data) {
                setOrder(data)
                
                // GA4 Tracking
                gaCommerceEvents.purchase(
                    data.id,
                    data.total_amount,
                    data.order_items.map((item: any) => ({
                        id: item.product_id,
                        name: item.product?.name || "Product",
                        price: item.price,
                        quantity: item.quantity,
                        category: item.product?.category || "Streetwear"
                    }))
                )
            }
            setLoading(false)
        }

        fetchOrder()
    }, [orderId, router])

    if (loading) {
        return (
            <main className={cn("min-h-screen pt-[88px] flex items-center justify-center", isDark ? "bg-[#0a0a0a]" : "bg-[#f5f4f0]")}>
                <div className="w-8 h-8 rounded-full border-2 border-[#e93a3a] border-t-transparent animate-spin" />
            </main>
        )
    }

    if (!order) {
        return (
            <main className={cn("min-h-screen pt-[88px] flex items-center justify-center", isDark ? "bg-[#0a0a0a] text-white" : "bg-[#f5f4f0] text-black")}>
                <div className="text-center">
                    <p className={cn("text-sm mb-4", isDark ? "text-white/50" : "text-black/55")}>Order not found.</p>
                    <Link href="/products" className="text-[#e93a3a] text-sm font-medium hover:underline">
                        Continue Shopping
                    </Link>
                </div>
            </main>
        )
    }

    return (
        <main className={cn(
            "min-h-screen pt-[88px] pb-20 px-4 md:px-8 transition-colors duration-300",
            isDark ? "bg-[#0a0a0a] text-white" : "bg-[#f5f4f0] text-black"
        )}>
            <div className="max-w-lg mx-auto pt-8 text-center">

                <div className="flex justify-center mb-6">
                    <CheckCircle className="w-16 h-16 text-emerald-500" strokeWidth={1.5} />
                </div>

                <h1 className="text-2xl font-bold tracking-tight mb-2">Order Confirmed</h1>
                <p className={cn("text-sm mb-8", isDark ? "text-white/50" : "text-black/55")}>
                    We've received your order and will begin processing it shortly.
                </p>

                <div className={cn(
                    "rounded-2xl border text-left mb-8",
                    isDark ? "bg-white/[0.03] border-white/[0.07]" : "bg-black/[0.02] border-black/[0.07]"
                )}>
                    <div className={cn("px-5 py-4 border-b flex justify-between items-center",
                        isDark ? "border-white/[0.07]" : "border-black/[0.07]"
                    )}>
                        <span className={cn("text-xs font-bold tracking-[0.15em] uppercase", isDark ? "text-white/40" : "text-black/45")}>
                            Order #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium",
                            order.status === "confirmed"
                                ? "bg-emerald-500/10 text-emerald-500"
                                : "bg-yellow-500/10 text-yellow-500"
                        )}>
                            {order.status === "confirmed" ? "Paid" : "Processing"}
                        </span>
                    </div>

                    <div className="px-5 py-4 space-y-3">
                        {order.order_items?.map((item: any, i: number) => (
                            <div key={i} className="flex justify-between items-center">
                                <span className={cn("text-sm", isDark ? "text-white/70" : "text-black/70")}>
                                    {item.product?.name} × {item.quantity}
                                </span>
                                <span className={cn("text-sm font-medium", isDark ? "text-white" : "text-black")}>
                                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className={cn("px-5 py-4 border-t flex justify-between",
                        isDark ? "border-white/[0.07]" : "border-black/[0.07]"
                    )}>
                        <span className="font-bold text-sm">Total</span>
                        <span className="font-bold text-sm text-[#e93a3a]">
                            ₹{order.total_amount?.toLocaleString("en-IN")}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                        href="/profile?tab=orders"
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold border transition-all",
                            isDark
                                ? "border-white/[0.12] text-white/70 hover:text-white hover:border-white/20"
                                : "border-black/[0.12] text-black/70 hover:text-black hover:border-black/20"
                        )}
                    >
                        <Package className="w-4 h-4" /> Track Order
                    </Link>
                    <Link
                        href="/products"
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold bg-[#e93a3a] hover:bg-[#ff4a4a] text-white shadow-lg shadow-[#e93a3a]/20 transition-all"
                    >
                        Keep Shopping <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

            </div>
        </main>
    )
}
