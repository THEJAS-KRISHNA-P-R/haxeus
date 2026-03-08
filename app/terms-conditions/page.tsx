"use client"

import { useTheme } from "@/components/ThemeProvider"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const sections = [
  {
    title: "General Terms",
    content: [
      {
        subtitle: "Operator Information",
        text: "HAXEUS is operated as an individual enterprise. We are not a registered company but operate within the legal frameworks of the Republic of India.",
      },
      {
        subtitle: "Agreement",
        text: "By accessing and using this website, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.",
      },
      {
        subtitle: "Order Acceptance",
        text: "Orders placed on HAXEUS are subject to availability and acceptance. We reserve the right to cancel any order for reasons including but not limited to inventory errors or suspicion of fraud.",
      },
    ],
  },
  {
    title: "Legal Compliance",
    content: [
      {
        subtitle: "Governing Law",
        text: "These terms are governed by the laws of India, including the Consumer Protection Act 2019 and the Information Technology Act 2000.",
      },
      {
        subtitle: "Jurisdiction",
        text: "Any legal disputes arising from the use of this website or purchases made on it shall be subject to the exclusive jurisdiction of the courts in Kerala, India.",
      },
    ],
  },
  {
    title: "Payments & Orders",
    content: [
      {
        subtitle: "Payment Processing",
        text: "All payments are processed securely via Razorpay. We do not store your credit/debit card information on our servers.",
      },
      {
        subtitle: "Binding Orders",
        text: "Once an order is confirmed and payment is processed, it constitutes a binding contract between the customer and HAXEUS.",
      },
      {
        subtitle: "Cancellation Policy",
        text: "Orders can only be cancelled before they are shipped. Once a tracking ID is generated, the order cannot be revoked.",
      },
    ],
  },
  {
    title: "Liability",
    content: [
      {
        subtitle: "Limitation of Liability",
        text: "HAXEUS shall not be liable for any indirect, incidental, or consequential damages. Our maximum liability is limited to the total value of the order placed by the customer.",
      },
    ],
  },
  {
    title: "Contact",
    content: [
      {
        subtitle: "Support",
        text: "For any questions regarding these terms, please contact us at haxeus.in@gmail.com. We typically respond within 48 hours.",
      },
    ],
  },
]

export default function TermsConditionsPage() {
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
            Terms & Conditions
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
            Please read these Terms and Conditions carefully before using the HAXEUS website. These terms govern your relationship with us and your use of our services.
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
