"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { subscribeToNewsletter } from "@/lib/email"
import { Mail, Check, AlertCircle } from "lucide-react"

export function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!email) {
      setStatus("error")
      setMessage("Please enter your email address")
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setStatus("error")
      setMessage("Please enter a valid email address")
      return
    }

    setLoading(true)
    setStatus("idle")
    setMessage("")

    try {
      const success = await subscribeToNewsletter({ email })

      if (success) {
        setStatus("success")
        setMessage("Thanks for subscribing! Check your email.")
        setEmail("")
      } else {
        setStatus("error")
        setMessage("Something went wrong. Please try again.")
      }
    } catch (error) {
      setStatus("error")
      setMessage("Failed to subscribe. Please try again.")
    } finally {
      setLoading(false)

      // Clear message after 5 seconds
      setTimeout(() => {
        setStatus("idle")
        setMessage("")
      }, 5000)
    }
  }

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading || status === "success"}
            className="pl-10 h-12 border-gray-300 focus:border-red-500 focus:ring-red-500"
          />
        </div>
        <Button
          type="submit"
          disabled={loading || status === "success"}
          className="h-12 px-8 bg-red-600 hover:bg-red-700 text-white"
        >
          {loading ? (
            "Subscribing..."
          ) : status === "success" ? (
            <>
              <Check className="w-5 h-5 mr-2" />
              Subscribed
            </>
          ) : (
            "Subscribe"
          )}
        </Button>
      </form>

      {/* Status Message */}
      {message && (
        <div
          className={`mt-3 p-3 rounded-lg flex items-start gap-2 text-sm ${status === "success"
              ? "bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/50 dark:text-green-200 dark:border-green-800"
              : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/50 dark:text-red-200 dark:border-red-800"
            }`}
        >
          {status === "success" ? (
            <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          )}
          <p>{message}</p>
        </div>
      )}
    </div>
  )
}
