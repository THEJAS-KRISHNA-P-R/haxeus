"use client"

import { useTheme } from "@/components/ThemeProvider"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"

const steps = [
  { step: "01", title: "Initiate Return", desc: "Email returns@haxeus.com within 7 days of delivery with your order number and reason." },
  { step: "02", title: "Get Approval", desc: "We'll review and respond within 1–2 business days with a Return Authorisation (RA) number." },
  { step: "03", title: "Ship It Back", desc: "Pack the item securely, write your RA number on the outside, and ship to our address. Return shipping is at your cost unless the item is defective." },
  { step: "04", title: "Refund Issued", desc: "Once received and inspected, your refund will be processed within 5–7 business days to the original payment method." },
]

const eligible = [
  "Item received damaged or defective",
  "Wrong item or size shipped",
  "Item significantly different from listing",
  "Unworn, unwashed, with original tags attached",
  "Returned within 7 days of delivery",
]

const notEligible = [
  "Items marked as Final Sale",
  "Items worn, washed, or altered",
  "Items missing original tags or packaging",
  "Returns initiated after 7 days of delivery",
  "Customised or made-to-order items",
  "Damage caused by misuse or improper care",
]

export default function ReturnsRefundsPage() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isDark = mounted && (
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
  )

  return (
    <main
      className={cn(
        "min-h-screen pt-[88px] pb-20 px-4 md:px-8 transition-colors duration-300",
        isDark ? "bg-[#0a0a0a] text-white" : "bg-[#f5f4f0] text-black"
      )}
    >
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-12 pt-4">
          <p className={cn("text-xs tracking-[0.25em] font-medium mb-3 uppercase",
            isDark ? "text-white/30" : "text-black/35"
          )}>
            HAXEUS — Policy
          </p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Returns & Refunds
          </h1>
          <p className={cn("text-sm leading-relaxed max-w-xl",
            isDark ? "text-white/50" : "text-black/55"
          )}>
            We stand behind every piece we make. If something isn't right, we'll make it right.
          </p>
        </div>

        {/* Return window callout */}
        <div className={cn(
          "rounded-2xl p-6 border mb-10 flex items-start gap-4",
          isDark ? "bg-[#e93a3a]/[0.06] border-[#e93a3a]/20" : "bg-[#e93a3a]/[0.04] border-[#e93a3a]/15"
        )}>
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#e93a3a] mb-1">Return Window</p>
            <p className={cn("text-sm leading-relaxed", isDark ? "text-white/65" : "text-black/65")}>
              Returns must be initiated within <span className="font-semibold">7 days of delivery</span>. After this window, we're unable to process returns unless the item is faulty or incorrect.
            </p>
          </div>
        </div>

        {/* Process Steps */}
        <section className="mb-12">
          <h2 className="text-xl font-bold tracking-tight mb-6">How to Return</h2>
          <div className="space-y-4">
            {steps.map((s) => (
              <div
                key={s.step}
                className={cn(
                  "flex gap-5 rounded-xl p-5 border",
                  isDark ? "bg-white/[0.02] border-white/[0.06]" : "bg-black/[0.02] border-black/[0.06]"
                )}
              >
                <span className="text-2xl font-black text-[#e93a3a]/40 shrink-0 leading-none mt-0.5">
                  {s.step}
                </span>
                <div>
                  <p className={cn("font-semibold text-sm mb-1", isDark ? "text-white" : "text-black")}>
                    {s.title}
                  </p>
                  <p className={cn("text-sm leading-relaxed", isDark ? "text-white/55" : "text-black/60")}>
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Eligible / Not Eligible */}
        <section className="mb-12">
          <h2 className="text-xl font-bold tracking-tight mb-6">What Can Be Returned</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className={cn(
              "rounded-xl p-5 border",
              isDark ? "bg-white/[0.02] border-white/[0.06]" : "bg-black/[0.02] border-black/[0.06]"
            )}>
              <p className="text-xs font-bold tracking-[0.15em] uppercase text-emerald-500 mb-4">✓ Eligible</p>
              <ul className="space-y-2.5">
                {eligible.map((item, i) => (
                  <li key={i} className={cn("text-sm flex gap-2", isDark ? "text-white/60" : "text-black/65")}>
                    <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className={cn(
              "rounded-xl p-5 border",
              isDark ? "bg-white/[0.02] border-white/[0.06]" : "bg-black/[0.02] border-black/[0.06]"
            )}>
              <p className="text-xs font-bold tracking-[0.15em] uppercase text-[#e93a3a] mb-4">✗ Not Eligible</p>
              <ul className="space-y-2.5">
                {notEligible.map((item, i) => (
                  <li key={i} className={cn("text-sm flex gap-2", isDark ? "text-white/60" : "text-black/65")}>
                    <span className="text-[#e93a3a] mt-0.5 shrink-0">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Refund info */}
        <section className="mb-12">
          <h2 className={cn("text-xl font-bold tracking-tight mb-5 pb-3 border-b",
            isDark ? "border-white/[0.07]" : "border-black/[0.07]"
          )}>
            Refund Details
          </h2>
          <div className="space-y-5">
            {[
              { label: "Processing Time", text: "5–7 business days after we receive and inspect the returned item." },
              { label: "Refund Method", text: "Refunds are issued to the original payment method only. UPI, cards, and net banking refunds follow Razorpay's processing timeline (usually 3–5 days to reflect in your account)." },
              { label: "Partial Refunds", text: "If an item is returned in a condition that shows signs of use (not defective), we reserve the right to issue a partial refund of up to 50% of the item value." },
              { label: "Shipping Costs", text: "Original shipping charges are non-refundable. Return shipping is at your expense unless the error was ours." },
              { label: "Exchanges", text: "We don't do direct exchanges. Return the item for a refund and place a new order for the correct size or item." },
            ].map((item) => (
              <div key={item.label}>
                <p className={cn("text-xs font-bold tracking-[0.15em] uppercase mb-1.5",
                  isDark ? "text-white/45" : "text-black/50"
                )}>
                  {item.label}
                </p>
                <p className={cn("text-sm leading-relaxed", isDark ? "text-white/60" : "text-black/65")}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className={cn(
          "rounded-2xl p-6 border text-center",
          isDark ? "bg-white/[0.03] border-white/[0.07]" : "bg-black/[0.02] border-black/[0.07]"
        )}>
          <p className={cn("text-sm mb-4", isDark ? "text-white/55" : "text-black/60")}>
            Have a question about your return?
          </p>
          <Link
            href="/contact"
            className="inline-block px-6 py-2.5 bg-[#e93a3a] hover:bg-[#ff4a4a] text-white text-sm font-bold rounded-full transition-all tracking-wide shadow-lg shadow-[#e93a3a]/20"
          >
            Contact Us
          </Link>
        </div>

      </div>
    </main>
  )
}
