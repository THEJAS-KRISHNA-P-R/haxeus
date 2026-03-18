"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { hoverScale, tapScale } from "@/lib/animations"
import type { NewsletterConfig } from "@/types/homepage"
import { DEFAULT_HOMEPAGE_CONFIG } from "@/lib/homepage-defaults"

interface NewsletterSectionProps {
  config: NewsletterConfig
  isDark?: boolean
}

export function NewsletterSection({ config, isDark = true }: NewsletterSectionProps) {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "duplicate" | "error">("idle")

  const heading = config.heading ?? DEFAULT_HOMEPAGE_CONFIG.newsletter.heading
  const subtext = config.subtext ?? DEFAULT_HOMEPAGE_CONFIG.newsletter.subtext
  const ctaText = config.cta_text ?? DEFAULT_HOMEPAGE_CONFIG.newsletter.cta_text

  const handleSubmit = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return
    setStatus("loading")
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.error === "already_subscribed") {
          setStatus("duplicate")
        } else {
          setStatus("error")
        }
      } else {
        setStatus("success")
        setEmail("")
      }
      setTimeout(() => setStatus("idle"), 4000)
    } catch {
      setStatus("error")
      setTimeout(() => setStatus("idle"), 4000)
    }
  }

  return (
    <section className="relative py-20 md:py-32 flex items-center z-10 border-t border-theme overflow-x-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className={`text-2xl sm:text-3xl lg:text-5xl font-bold mb-6 leading-snug sm:leading-relaxed ${isDark ? "text-white" : "text-black"}`}>
            {heading}
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mt-8 mb-8"
        >
          <Link href="/products">
            <motion.div whileHover={hoverScale} whileTap={tapScale}>
              <Button size="lg" className="bg-theme text-theme border border-theme hover:bg-card-2 px-10 py-6 rounded-full text-lg font-semibold shadow-lg">
                {ctaText}
              </Button>
            </motion.div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex max-w-[calc(100%-2rem)] sm:max-w-md mx-auto shadow-2xl rounded-full overflow-hidden bg-[var(--bg-elevated)]/80 backdrop-blur-sm"
        >
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className={`flex-1 px-6 py-4 bg-transparent focus:outline-none text-lg min-w-0 ${isDark ? "text-white placeholder:text-white/30" : "text-black placeholder:text-black/30"}`}
          />
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleSubmit}
              disabled={status === "loading"}
              className="bg-[var(--accent)] hover:opacity-90 text-white px-8 h-full rounded-full font-semibold whitespace-nowrap disabled:opacity-50"
            >
              {status === "loading" ? "..." : "Subscribe"}
            </Button>
          </motion.div>
        </motion.div>
        {status === "success" && (
          <p className="text-sm mt-3 text-emerald-400 font-medium">You&apos;re in! Welcome to the movement.</p>
        )}
        {status === "duplicate" && (
          <p className="text-sm mt-3 text-[#e7bf04] font-medium">Already subscribed! You&apos;re part of the crew.</p>
        )}
        {status === "error" && (
          <p className="text-sm mt-3 text-[var(--accent)] font-medium">Something went wrong. Try again.</p>
        )}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-sm mt-4 text-white/70"
        >
          {subtext}
        </motion.p>
      </div>
    </section>
  )
}
