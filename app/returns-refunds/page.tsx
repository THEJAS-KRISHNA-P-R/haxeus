"use client"

import { useTheme } from "@/components/ThemeProvider"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const sections = [
  {
    title: "Replacement Eligibility",
    content: [
      {
        subtitle: "10-Day Replacement Policy",
        text: "We offer a 10-day replacement policy from the date of delivery. If 10 days have gone by since your delivery, we unfortunately cannot process a replacement request.",
      },
      {
        subtitle: "Condition on Arrival",
        text: "To be eligible for a replacement, your item must be unused and in the same condition that you received it. It must also be in the original packaging with all tags intact.",
      },
      {
        subtitle: "Exceptions",
        text: "Items purchased during clearance sales or using specific high-value promotional codes are not eligible for replacement unless they arrive defective or damaged.",
      },
    ],
  },
  {
    title: "Replacement Process",
    content: [
      {
        subtitle: "Initiating a Replacement",
        text: "To request a replacement, please send an email to haxeus.in@gmail.com with your Order ID and clear photos of the defective or damaged product and packaging.",
      },
      {
        subtitle: "Approval",
        text: "Once your request is received, we will inspect the photos and notify you of the approval or rejection of your replacement request.",
      },
      {
        subtitle: "Shipping the Item",
        text: "If approved, we will coordinate a reverse pickup if available in your pincode, or ask you to ship the item back to our facility in Kerala.",
      },
    ],
  },
  {
    title: "Refunds",
    content: [
      {
        subtitle: "When Refunds Apply",
        text: "Refunds are only issued if a replacement is not available for your size. We do not offer refunds as a substitute for replacement — refunds are a last resort when stock is unavailable.",
      },
      {
        subtitle: "Processing Time",
        text: "Once your returned item is received and inspected, we will notify you by email. Refunds are processed within 7-10 business days to your original payment method.",
      },
      {
        subtitle: "Refund Method",
        text: "Refunds will be credited back to the original method of payment (via Razorpay). For COD orders, we will request your bank details for a direct transfer.",
      },
    ],
  },
  {
    title: "Size Replacements",
    content: [
      {
        subtitle: "Wrong Size",
        text: "We replace items if they are defective, damaged, or if you require a size exchange. If you need to request a replacement in a different size, send us an email at haxeus.in@gmail.com with your Order ID.",
      },
    ],
  },
  {
    title: "Contact Support",
    content: [
      {
        subtitle: "Email Assistance",
        text: "For any assistance regarding replacements, please reach out to haxeus.in@gmail.com. We are here to help.",
      },
    ],
  },
]

export default function ReturnsRefundsPage() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isDark = mounted && theme === "dark"

  return (
    <main
      className={cn(
        "min-h-screen pt-[88px] pb-20 px-4 md:px-8 transition-colors duration-300",
        isDark ? "bg-[#0a0a0a] text-white" : "bg-[#f5f4f0] text-black"
      )}
    >
      <div className="max-w-3xl mx-auto">
        <div className="mb-12 pt-4">
          <p className={cn("text-xs tracking-[0.25em] font-medium mb-3 uppercase",
            isDark ? "text-white/30" : "text-black/35"
          )}>
            HAXEUS — Legal
          </p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Replacement Policy
          </h1>
          <p className={cn("text-xs", isDark ? "text-white/30" : "text-black/35")}>
            Last updated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        <div className={cn(
          "rounded-2xl p-6 border mb-10",
          isDark ? "bg-white/[0.03] border-white/[0.07]" : "bg-black/[0.02] border-black/[0.07]"
        )}>
          <p className={cn("text-sm leading-relaxed", isDark ? "text-white/65" : "text-black/65")}>
            We want you to be completely satisfied with your HAXEUS purchase. We offer a 10-day replacement policy for defective or damaged items. We do not offer returns for refunds — only replacements. Refunds are issued solely when a replacement cannot be fulfilled.
          </p>
        </div>

        <div className="space-y-10">
          {sections.map((section, i) => (
            <section key={i}>
              <h2 className={cn(
                "text-lg font-bold tracking-tight mb-5 pb-3 border-b",
                isDark ? "border-white/[0.07]" : "border-black/[0.07]"
              )}>
                {i + 1}. {section.title}
              </h2>
              <div className="space-y-5">
                {section.content.map((item, j) => (
                  <div key={j}>
                    {item.subtitle && (
                      <p className={cn(
                        "text-xs font-bold tracking-[0.15em] uppercase mb-2",
                        isDark ? "text-white/45" : "text-black/50"
                      )}>
                        {item.subtitle}
                      </p>
                    )}
                    <p className={cn(
                      "text-sm leading-relaxed",
                      isDark ? "text-white/60" : "text-black/65"
                    )}>
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
