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
    <section className="relative py-24 md:py-40 flex items-center z-10 border-t border-theme overflow-x-hidden bg-black/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <span className="text-[var(--accent)] text-sm font-bold tracking-[0.3em] uppercase mb-4 block">Newsletter</span>
          <h2 className={`text-3xl sm:text-4xl lg:text-6xl font-black mb-6 leading-tight tracking-tighter ${isDark ? "text-white" : "text-black"}`}>
            JOIN THE <span className="italic">MOVEMENT.</span>
          </h2>
          <p className={`text-lg max-w-2xl mx-auto mb-10 ${isDark ? "text-white/60" : "text-black/60"}`}>
            {subtext}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative max-w-xl mx-auto mb-16"
        >
          <div className="flex flex-col sm:flex-row gap-3 p-2 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-md shadow-2xl focus-within:border-[var(--accent)]/50 transition-all">
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className={`flex-1 px-6 py-4 bg-transparent outline-none text-lg min-w-0 ${isDark ? "text-white placeholder:text-white/20" : "text-black placeholder:text-black/20"}`}
            />
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleSubmit}
                disabled={status === "loading"}
                className="bg-[var(--accent)] hover:opacity-90 text-white px-10 h-full py-4 rounded-full font-bold text-lg whitespace-nowrap shadow-xl shadow-[var(--accent)]/20 active:shadow-none transition-all disabled:opacity-50 w-full sm:w-auto"
              >
                {status === "loading" ? "..." : "Join the List"}
              </Button>
            </motion.div>
          </div>

          {status === "success" && (
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-sm mt-4 text-emerald-400 font-bold tracking-wide uppercase italic">
              Verification link sent to your inbox.
            </motion.p>
          )}
          {status === "duplicate" && (
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-sm mt-4 text-[#e7bf04] font-bold tracking-wide uppercase italic">
              You&apos;re already on the list.
            </motion.p>
          )}
          {status === "error" && (
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-sm mt-4 text-red-500 font-bold tracking-wide uppercase italic">
              Something went wrong. Try again.
            </motion.p>
          )}
        </motion.div>

        {/* Dynamic CTA if configured */}
        {ctaText && ctaText !== "Shop Now" && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <Link href="/products">
              <motion.div whileHover={hoverScale} whileTap={tapScale} className="inline-block mt-4">
                <Button variant="link" className="text-white/40 hover:text-[var(--accent)] transition-colors text-sm font-bold uppercase tracking-widest">
                  {ctaText} →
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  )
}
