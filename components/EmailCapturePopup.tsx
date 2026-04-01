"use client"

import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { useEffect, useState, type FormEvent } from "react"

const STORAGE_KEY = "haxeus-email-capture-dismissed"

export function EmailCapturePopup() {
  const prefersReducedMotion = useReducedMotion()
  const [isVisible, setIsVisible] = useState(false)
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [discountCode, setDiscountCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY)) {
        return
      }
    } catch {
      return
    }

    const timeout = window.setTimeout(() => setIsVisible(true), 8000)
    return () => window.clearTimeout(timeout)
  }, [])

  function dismissPopup() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1")
    } catch {}
    setIsVisible(false)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
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
      try {
        window.localStorage.setItem(STORAGE_KEY, "1")
      } catch {}
    } catch {
      setError("Something went wrong.")
    } finally {
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
            className="rounded-[28px] border p-5 shadow-2xl backdrop-blur-xl"
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
              First order offer
            </p>
            <h3 className="mt-2 text-2xl font-bold tracking-tight">Get 10% off your first order</h3>
            <p className="mt-2 text-sm leading-6" style={{ color: "var(--color-foreground-muted)" }}>
              Join the list for early drop access and your welcome code.
            </p>

            {discountCode ? (
              <div className="mt-5 rounded-2xl border p-4" style={{ borderColor: "var(--color-border)", background: "var(--color-surface-muted)" }}>
                <p className="text-xs uppercase tracking-[0.24em]" style={{ color: "var(--color-foreground-subtle)" }}>Your code</p>
                <p className="mt-2 text-2xl font-bold" style={{ color: "var(--color-accent)" }}>{discountCode}</p>
                <p className="mt-2 text-sm" style={{ color: "var(--color-foreground-muted)" }}>Use it at checkout on your first HAXEUS order.</p>
              </div>
            ) : (
              <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="email@example.com"
                  className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                  style={{ borderColor: "var(--color-border)", background: "var(--color-surface-muted)", color: "var(--color-foreground)" }}
                  required
                />
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-full px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                    style={{ background: "var(--color-accent)" }}
                  >
                    {isSubmitting ? "Subscribing..." : "Unlock 10% Off"}
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
