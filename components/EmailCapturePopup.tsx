"use client"

import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { useEffect, useState, type FormEvent } from "react"

import { isValidEmail } from "@/lib/validation"
import { supabase } from "@/lib/supabase"

const STORAGE_KEY = "haxeus-email-capture-dismissed"

export function EmailCapturePopup() {
  const prefersReducedMotion = useReducedMotion()
  const [isVisible, setIsVisible] = useState(false)
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isAlreadySubscribed, setIsAlreadySubscribed] = useState(false)
  const [discountCode, setDiscountCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Dynamic Settings state
  const [config, setConfig] = useState({
    title: "Get 10% off your first order",
    subtitle: "Join the list for early drop access and your welcome code.",
    enabled: false
  })

  useEffect(() => {
    async function initPopup() {
      try {
        console.log("EmailCapture: Initializing...")

        // 1. Check local storage first (fast path)
        if (window.localStorage.getItem(STORAGE_KEY)) {
          console.log("EmailCapture: Suppressed (Previously dismissed/subscribed)")
          return
        }

        // 2. Check if user is already signed in (Supabase Auth)
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          return
        }

        // 3. Fetch all relevant settings
        const { data: settingsData, error: fetchError } = await supabase
          .from("store_settings")
          .select("key, value")
          .in("key", ["email_popup_enabled", "email_popup_title", "email_popup_subtitle", "email_popup_coupon_id"])

        if (fetchError) {
          console.error("EmailCapture: Settings fetch error:", fetchError)
        }

        // Map settings with defaults if missing
        const settingsMap: Record<string, any> = {
          email_popup_enabled: true, // Default to true if not explicitly disabled
          email_popup_title: config.title,
          email_popup_subtitle: config.subtitle,
          email_popup_coupon_id: ""
        }

        if (settingsData) {
          settingsData.forEach(s => {
            // Supabase client returns jsonb as native JS types (Boolean, Object, etc.)
            settingsMap[s.key] = s.value
          })
        }

        console.log("EmailCapture: Config loaded", settingsMap)

        if (settingsMap.email_popup_enabled === false) {
          console.log("EmailCapture: Disabled in admin dashboard")
          return
        }

        // 4. Integrity Check: Verify linked coupon is still active (only if an ID is provided)
        if (settingsMap.email_popup_coupon_id && settingsMap.email_popup_coupon_id !== "") {
          const { data: coupon } = await supabase
            .from("coupons")
            .select("is_active")
            .eq("id", settingsMap.email_popup_coupon_id)
            .maybeSingle()

          if (!coupon || !coupon.is_active) {
            console.log("EmailCapture: Suppression triggered (Linked coupon is inactive or missing)")
            return
          }
        }

        // 5. Update UI config
        setConfig({
          enabled: true,
          title: settingsMap.email_popup_title,
          subtitle: settingsMap.email_popup_subtitle
        })

        // 6. Trigger visibility
        const timeout = window.setTimeout(() => {
          setIsVisible(true)
        }, 8000)
        return () => window.clearTimeout(timeout)
      } catch (err) {
        console.error("EmailCapture: Unexpected init error:", err)
      }
    }

    initPopup()
  }, [])

  function dismissPopup() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1")
    } catch { }
    setIsVisible(false)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.")
      return
    }

    setIsVerifying(true)
    setError(null)

    try {
      // 1. Deliverability Check (API)
      const verifyRes = await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })

      if (verifyRes.ok) {
        const { isValid } = await verifyRes.json()
        if (!isValid) {
          setError("This email inbox does not exist or cannot receive mail.")
          setIsVerifying(false)
          return
        }
      }

      setIsVerifying(false)
      setIsSubmitting(true)

      // 2. Original Subscription Logic
      const response = await fetch("/api/email-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "Something went wrong.")
        return
      }

      setDiscountCode(result.discountCode || "WELCOME10")
      setIsAlreadySubscribed(!!result.alreadySubscribed)

      try {
        window.localStorage.setItem(STORAGE_KEY, "1")
      } catch { }
    } catch (err) {
      setError("Something went wrong.")
      console.error("Verification/Subscription error:", err)
    } finally {
      setIsVerifying(false)
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
          layout="position"
          className="fixed inset-x-4 bottom-4 z-[75] mx-auto w-auto max-w-md"
        >
          <div
            className="rounded-[28px] border p-5 shadow-2xl backdrop-blur-xl transition-all"
            style={{
              borderColor: "var(--color-border)",
              background: "color-mix(in srgb, var(--color-surface) 92%, transparent)",
              color: "var(--color-foreground)",
            }}
          >
            <button
              type="button"
              onClick={dismissPopup}
              className="absolute right-4 top-4 text-sm transition-opacity hover:opacity-70"
              style={{ color: "var(--color-foreground-subtle)" }}
              aria-label="Dismiss popup"
            >
              Close
            </button>

            <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: "var(--color-accent-warm)" }}>
              {discountCode && isAlreadySubscribed ? "Welcome back" : "First order offer"}
            </p>
            <h3 className="mt-2 text-2xl font-bold tracking-tight">
              {discountCode && isAlreadySubscribed ? "You're already on the list!" : config.title}
            </h3>
            <p className="mt-2 text-sm leading-6" style={{ color: "var(--color-foreground-muted)" }}>
              {isAlreadySubscribed
                ? "You're already part of the HAXEUS mission. Stay tuned for our next drop!"
                : config.subtitle}
            </p>

            {discountCode && !isAlreadySubscribed ? (
              <div className="mt-5 rounded-2xl border p-4" style={{ borderColor: "var(--color-border)", background: "var(--color-surface-muted)" }}>
                <p className="text-xs uppercase tracking-[0.24em]" style={{ color: "var(--color-foreground-subtle)" }}>Your code</p>
                <p className="mt-2 text-2xl font-bold" style={{ color: "var(--color-accent)" }}>{discountCode}</p>
                <p className="mt-2 text-sm" style={{ color: "var(--color-foreground-muted)" }}>Use it at checkout on your first HAXEUS order.</p>
              </div>
            ) : (discountCode && isAlreadySubscribed) ? (
              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={dismissPopup}
                  className="w-full rounded-full py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: "var(--color-accent)" }}
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                  style={{ borderColor: "var(--color-border)", background: "var(--color-surface-muted)", color: "var(--color-foreground)" }}
                  required
                />
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isVerifying || isSubmitting}
                    className="rounded-full px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                    style={{ background: "var(--color-accent)" }}
                  >
                    {isVerifying ? "Verifying..." : isSubmitting ? "Subscribing..." : "Unlock Code"}
                  </button>
                  <button
                    type="button"
                    onClick={dismissPopup}
                    className="text-sm font-medium underline underline-offset-4"
                    style={{ color: "var(--color-foreground-muted)" }}
                  >
                    No thanks
                  </button>
                </div>
                {error && (
                  <p className="text-sm" style={{ color: "var(--color-accent)" }}>
                    {error}
                  </p>
                )}
              </form>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
