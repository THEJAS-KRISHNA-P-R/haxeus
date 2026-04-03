"use client"

import { useRef, useState } from "react"

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description?: string
  image?: string
  order_id: string
  handler: (response: {
    razorpay_payment_id: string
    razorpay_order_id: string
    razorpay_signature: string
  }) => void
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  notes?: Record<string, string>
  theme?: {
    color?: string
  }
  modal?: {
    ondismiss?: () => void
    confirm_close?: boolean
  }
}

export function useRazorpay() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scriptLoaded = useRef(false)

  const loadScript = () => {
    return new Promise((resolve, reject) => {
      if (scriptLoaded.current || (window as any).Razorpay) {
        scriptLoaded.current = true
        resolve(true)
        return
      }

      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.async = true
      script.id = "razorpay-checkout-js"
      
      script.onload = () => {
        scriptLoaded.current = true
        resolve(true)
      }
      
      script.onerror = () => {
        setError("Failed to load Razorpay SDK")
        reject(new Error("Razorpay SDK load failed"))
      }
      
      document.body.appendChild(script)
    })
  }

  const openRazorpay = async (options: RazorpayOptions) => {
    setIsLoading(true)
    setError(null)
    
    try {
      await loadScript()
      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    } catch (err: any) {
      setError(err.message || "Failed to open Razorpay")
      console.error("[useRazorpay] Error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return { openRazorpay, isLoading, error }
}
