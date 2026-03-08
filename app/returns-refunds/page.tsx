"use client"

import { useTheme } from "@/components/ThemeProvider"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const sections = [
  {
    title: "Eligibility for Returns",
    content: [
      {
        subtitle: "10-Day Policy",
        text: "We offer a 10-day replacement policy from the date of delivery. If 10 days have gone by since your delivery, we unfortunately cannot offer you a return or exchange.",
      },
      {
        subtitle: "Condition on Arrival",
        text: "To be eligible for a return, your item must be unused and in the same condition that you received it. It must also be in the original packaging with all tags intact.",
      },
      {
        subtitle: "Exceptions",
        text: "Items purchased during clearance sales or using specific high-value promotional codes are not eligible for returns or refunds unless they arrive damaged.",
      },
    ],
  },
  {
    title: "Return Process",
    content: [
      {
        subtitle: "Initiating a Return",
        text: "To initiate a return, please send an email to haxeus.in@gmail.com with your Order ID and clear photos of the product and packaging.",
      },
      {
        subtitle: "Approval",
        text: "Once your request is received, we will inspect the photos and notify you of the approval or rejection of your return.",
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
        subtitle: "Processing Time",
        text: "Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. Refunds are processed within 7-10 business days.",
      },
      {
        subtitle: "Refund Method",
        text: "Refunds will be credited back to the original method of payment (via Razorpay). For COD orders, we will request your bank details for a direct transfer.",
      },
    ],
  },
  {
    title: "Exchanges",
    content: [
      {
        subtitle: "Size Exchanges",
        text: "We only replace items if they are defective, damaged, or require a size exchange. If you need to exchange it for the same item in a different size, send us an email at haxeus.in@gmail.com.",
      },
    ],
  },
  {
    title: "Contact Support",
    content: [
      {
        subtitle: "Email Assistance",
        text: "For any assistance regarding returns and refunds, please reach out to haxeus.in@gmail.com. We are here to help.",
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
            Returns & Refunds
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
            We want you to be completely satisfied with your HAXEUS purchase. This policy outlines how we handle returns, exchanges, and refunds to ensure a smooth shopping experience.
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
