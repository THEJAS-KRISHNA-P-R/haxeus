"use client"

import { useState, useEffect, useCallback } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const STORAGE_KEY = "haxeus_exit_popup_shown"
const DISCOUNT_CODE = "WELCOME10"

export function ExitIntentPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClose = useCallback(() => {
    setIsOpen(false)
    setError(null)
    try {
      sessionStorage.setItem(STORAGE_KEY, "1")
    } catch {}
  }, [])

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return
    } catch {}

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !isOpen) {
        setIsOpen(true)
      }
    }

    document.addEventListener("mouseout", handleMouseLeave)
    return () => document.removeEventListener("mouseout", handleMouseLeave)
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.error === "already_subscribed") {
          setSubmitted(true)
        } else if (res.status === 429) {
          setError("Too many attempts. Please try again later.")
        } else {
          setError(data.error || "Something went wrong. Please try again.")
        }
        return
      }
      setSubmitted(true)
    } catch {
      setError("Could not subscribe. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-card border border-theme rounded-2xl shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 rounded-full text-theme-3 hover:text-theme hover:bg-theme/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-4">
            <p className="text-lg font-semibold text-theme mb-2">Check your email!</p>
            <p className="text-sm text-theme-2 mb-4">
              Use code <strong className="text-[var(--accent)]">{DISCOUNT_CODE}</strong> at checkout for 10% off your first order.
            </p>
            <Button onClick={handleClose} className="bg-[var(--accent)] hover:opacity-90">
              Start Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <p className="text-2xl font-bold text-theme mb-1">Wait! Get 10% off</p>
              <p className="text-sm text-theme-2">Subscribe and we&apos;ll send you a discount code for your first order.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError(null)
                }}
                required
                disabled={loading}
                className="h-11 bg-card border-theme text-theme placeholder:text-theme-3 focus-visible:ring-[var(--accent)]/40 focus-visible:border-[var(--accent)]/40 disabled:opacity-50"
              />
              {error && (
                <p className="text-sm text-[var(--accent)]">{error}</p>
              )}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--accent)] hover:opacity-90 h-11 disabled:opacity-50"
              >
                {loading ? "Subscribing…" : "Get 10% Off"}
              </Button>
            </form>
            <p className="text-xs text-theme-3 mt-4 text-center">
              Unsubscribe anytime. We respect your privacy.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
