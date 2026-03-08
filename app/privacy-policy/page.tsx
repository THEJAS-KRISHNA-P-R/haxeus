"use client"

import { useTheme } from "@/components/ThemeProvider"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const sections = [
  {
    title: "Information We Collect",
    content: [
      {
        subtitle: "Account & Order Data",
        text: "When you create an account or place an order, we collect your name, email address, shipping address, phone number, and payment information. Payment data is processed by Razorpay and never stored on our servers.",
      },
      {
        subtitle: "Usage Data",
        text: "We automatically collect information about how you interact with our site — pages viewed, time spent, referring URLs, browser type, and device information. This is collected via anonymised analytics.",
      },
      {
        subtitle: "Cookies",
        text: "We use essential cookies to keep you logged in and maintain your cart. We use analytics cookies (which you can opt out of) to understand how our store is used. We do not use advertising or third-party tracking cookies.",
      },
    ],
  },
  {
    title: "How We Use Your Information",
    content: [
      {
        subtitle: "Order Fulfilment",
        text: "Your name, address, and contact details are used solely to process and ship your order, send order confirmations, and handle returns or exchanges.",
      },
      {
        subtitle: "Communication",
        text: "We may email you about your order status. If you opt in, we will send you updates about new drops and restocks. You can unsubscribe at any time via the link in any email.",
      },
      {
        subtitle: "Improvement",
        text: "Aggregated, anonymised usage data helps us improve the site experience — fixing broken flows, improving page performance, and understanding which products interest you.",
      },
    ],
  },
  {
    title: "Data Sharing",
    content: [
      {
        subtitle: "We Do Not Sell Your Data",
        text: "HAXEUS does not sell, rent, or trade your personal information to any third party for marketing purposes. Period.",
      },
      {
        subtitle: "Service Providers",
        text: "We share minimum necessary data with: Razorpay (payment processing), our logistics partner (shipping fulfilment), and Supabase (secure database hosting). Each provider is bound by their own privacy policy and data processing agreements.",
      },
      {
        subtitle: "Legal Requirements",
        text: "We may disclose your information if required to do so by law, court order, or governmental authority.",
      },
    ],
  },
  {
    title: "Data Security",
    content: [
      {
        subtitle: "How We Protect Your Data",
        text: "All data is transmitted over HTTPS/TLS encryption. Passwords are hashed using bcrypt and never stored in plain text. Payment information is handled entirely by Razorpay's PCI-DSS compliant infrastructure — we never see or store your card details.",
      },
      {
        subtitle: "Legal Framework",
        text: "HAXEUS processes your data in compliance with the Information Technology Act 2000, the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules 2011, and the Digital Personal Data Protection (DPDP) Act 2023 as applicable.",
      },
      {
        subtitle: "Data Retention",
        text: "Order and account data is retained for 7 years to comply with Indian accounting regulations. You may request deletion of your account and personal data at any time — we will delete all data not required for legal compliance within 30 days.",
      },
    ],
  },
  {
    title: "Your Rights",
    content: [
      {
        subtitle: "Access & Portability",
        text: "You have the right to request a copy of all personal data we hold about you. We will provide this in a machine-readable format within 14 days of your request.",
      },
      {
        subtitle: "Correction & Deletion",
        text: "You may update your account information at any time from your profile page. To delete your account and associated data, contact us at haxeus.in@gmail.com.",
      },
      {
        subtitle: "Opt-Out",
        text: "You can opt out of marketing emails at any time. To opt out of analytics cookies, you can clear cookies and enable Do Not Track in your browser settings.",
      },
    ],
  },
  {
    title: "Your Rights Under DPDP Act 2023",
    content: [
      {
        subtitle: "Right to Access",
        text: "You have the right to obtain a summary of your personal data that we hold, along with information about how it is being processed.",
      },
      {
        subtitle: "Right to Correction",
        text: "You have the right to request correction of any inaccurate or misleading personal data, and to have incomplete data completed.",
      },
      {
        subtitle: "Right to Erasure",
        text: "You have the right to request erasure of your personal data, subject to any legal obligations that require us to retain certain records.",
      },
      {
        subtitle: "Right to Nominate",
        text: "You have the right to nominate another person to exercise your data rights on your behalf, in the event of your death or incapacity.",
      },
      {
        subtitle: "",
        text: "To exercise any of these rights, email haxeus.in@gmail.com with the subject line 'DPDP Rights Request'. We will respond within 14 business days.",
      },
    ],
  },
  {
    title: "Children's Privacy",
    content: [
      {
        subtitle: "",
        text: "HAXEUS is not directed at children under 13 years of age. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, contact us immediately and we will delete it.",
      },
    ],
  },
  {
    title: "Changes to This Policy",
    content: [
      {
        subtitle: "",
        text: "We may update this Privacy Policy from time to time. We will notify registered users by email of any material changes. Continued use of the site after changes constitutes acceptance of the revised policy. The date at the top of this page reflects when it was last updated.",
      },
    ],
  },
  {
    title: "Contact",
    content: [
      {
        subtitle: "",
        text: "For any privacy-related questions or requests, contact us at haxeus.in@gmail.com or through our Contact page. We aim to respond within 2 business days.",
      },
    ],
  },
]

export default function PrivacyPolicyPage() {
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

        {/* Header */}
        <div className="mb-12 pt-4">
          <p className={cn("text-xs tracking-[0.25em] font-medium mb-3 uppercase",
            isDark ? "text-white/30" : "text-black/35"
          )}>
            HAXEUS — Legal
          </p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Privacy Policy
          </h1>
          <p className={cn("text-xs", isDark ? "text-white/30" : "text-black/35")}>
            Last updated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        {/* Intro */}
        <div className={cn(
          "rounded-2xl p-6 border mb-10",
          isDark ? "bg-white/[0.03] border-white/[0.07]" : "bg-black/[0.02] border-black/[0.07]"
        )}>
          <p className={cn("text-sm leading-relaxed", isDark ? "text-white/65" : "text-black/65")}>
            HAXEUS ("we", "us", "our") is committed to protecting your privacy. This policy explains what personal information we collect, how we use it, and what rights you have over it. By using haxeus.com, you agree to the practices described here.
          </p>
        </div>

        {/* Sections */}
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
