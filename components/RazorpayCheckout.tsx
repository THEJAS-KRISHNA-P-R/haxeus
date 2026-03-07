"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface CartItem {
    productId: string
    quantity: number
    size?: string
}

interface RazorpayCheckoutProps {
    items: CartItem[]
    couponCode?: string
    shippingAddressId?: string
    isDark?: boolean
    onSuccess?: (orderId: string) => void
    onError?: (error: string) => void
}

declare global {
    interface Window {
        Razorpay: any
    }
}

const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
        if (window.Razorpay) return resolve(true)
        const script = document.createElement("script")
        script.src = "https://checkout.razorpay.com/v1/checkout.js"
        // Note: Razorpay does not publish stable SRI hashes — using CSP to
        // restrict what the script can call (connect-src) instead (#15.1)
        script.onload = () => resolve(true)
        script.onerror = () => resolve(false)
        document.body.appendChild(script)
    })
}

export function RazorpayCheckout({
    items,
    couponCode,
    shippingAddressId,
    isDark = true,
    onSuccess,
    onError,
}: RazorpayCheckoutProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleCheckout = async () => {
        setLoading(true)
        setError(null)

        try {
            // Load Razorpay SDK
            const scriptLoaded = await loadRazorpayScript()
            if (!scriptLoaded) {
                throw new Error("Failed to load payment SDK. Please check your internet connection.")
            }

            // Create order on server (server calculates price — never trust client)
            const res = await fetch("/api/payment/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items, couponCode, shippingAddressId }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Failed to create order")

            // ── Sanity check on amount before opening modal (#15.2) ────────────
            if (
                !data.amount ||
                !Number.isInteger(data.amount) ||
                data.amount < 100 ||
                data.amount > 100_000_000 // ₹10 lakh max
            ) {
                throw new Error("Invalid order amount received from server")
            }

            // Open Razorpay checkout
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: data.amount,
                currency: data.currency,
                name: "HAXEUS",
                description: "Streetwear Drop",
                image: "/android-chrome-192x192.png",
                order_id: data.razorpayOrderId,
                theme: {
                    color: "#e93a3a",
                    backdrop_color: isDark ? "#0a0a0a" : "#ffffff",
                },
                modal: {
                    ondismiss: () => setLoading(false),
                },
                handler: async (response: {
                    razorpay_order_id: string
                    razorpay_payment_id: string
                    razorpay_signature: string
                }) => {
                    // Verify payment on server
                    const verifyRes = await fetch("/api/payment/verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderId: data.orderId,
                        }),
                    })

                    const verifyData = await verifyRes.json()
                    if (!verifyRes.ok) throw new Error(verifyData.error || "Payment verification failed")

                    onSuccess?.(data.orderId)
                    router.push(`/order-success?orderId=${data.orderId}`)
                },
            }

            const rzp = new window.Razorpay(options)
            rzp.on("payment.failed", (response: any) => {
                // Sanitise error message — don't render raw SDK objects
                const msg =
                    typeof response.error?.description === "string"
                        ? response.error.description.slice(0, 200)
                        : "Payment failed. Please try again."
                setError(msg)
                onError?.(msg)
                setLoading(false)
            })
            rzp.open()
        } catch (err: any) {
            const msg = typeof err.message === "string" ? err.message.slice(0, 200) : "Something went wrong"
            setError(msg)
            onError?.(msg)
            setLoading(false)
        }
    }

    return (
        <div className="w-full">
            {error && (
                <div className={cn(
                    "mb-4 rounded-xl px-4 py-3 text-sm border",
                    isDark
                        ? "bg-[#e93a3a]/[0.08] border-[#e93a3a]/20 text-[#ff6b6b]"
                        : "bg-[#e93a3a]/[0.06] border-[#e93a3a]/15 text-[#c02828]"
                )}>
                    {error}
                </div>
            )}

            <button
                id="razorpay-checkout-btn"
                onClick={handleCheckout}
                disabled={loading || !items.length}
                className={cn(
                    "w-full py-4 rounded-full font-bold tracking-widest text-sm transition-all",
                    "bg-[#e93a3a] hover:bg-[#ff4a4a] text-white shadow-lg shadow-[#e93a3a]/25",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    loading && "animate-pulse"
                )}
            >
                {loading ? "Processing…" : "Place Order"}
            </button>
        </div>
    )
}
