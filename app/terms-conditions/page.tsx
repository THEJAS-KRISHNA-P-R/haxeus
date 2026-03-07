"use client"

import { useTheme } from "@/components/ThemeProvider"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const sections = [
  {
    title: "Acceptance of Terms",
    content: "By accessing or using haxeus.com, placing an order, or creating an account, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our site. We reserve the right to update these terms at any time; continued use of the site after changes constitutes acceptance.",
  },
  {
    title: "Products & Pricing",
    content: "All products are subject to availability. We reserve the right to discontinue any product at any time. Prices are listed in Indian Rupees (INR) and include applicable taxes unless otherwise stated. We reserve the right to change prices without prior notice. In the event of a pricing error, we will contact you before processing your order.",
  },
  {
    title: "Orders & Payment",
    content: "An order confirmation email does not constitute acceptance of your order. We reserve the right to refuse or cancel any order at our discretion — for example in cases of suspected fraud, payment failure, or stock unavailability. Payment is processed securely by Razorpay. By providing payment details you confirm you are authorised to use the payment method. All transactions are subject to Razorpay's Terms of Service.",
  },
  {
    title: "Shipping & Delivery",
    content: "We aim to dispatch orders within 2–3 business days. Delivery timelines are estimates and not guaranteed. HAXEUS is not responsible for delays caused by logistics partners, customs, natural events, or other circumstances beyond our control. Risk of loss or damage passes to you upon delivery. If your order arrives damaged, contact us within 48 hours with photographic evidence.",
  },
  {
    title: "Returns & Refunds",
    content: "Returns are governed by our Returns & Refunds Policy, which forms part of these Terms. By placing an order, you agree to the conditions described in that policy. Please review it before purchasing.",
  },
  {
    title: "Intellectual Property",
    content: "All content on haxeus.com — including but not limited to text, graphics, logos, images, product designs, and software — is the exclusive property of HAXEUS or its licensors and is protected by applicable intellectual property laws. You may not reproduce, distribute, modify, or create derivative works without our prior written consent. Unauthorised use will be pursued legally.",
  },
  {
    title: "User Accounts",
    content: "You are responsible for maintaining the confidentiality of your account credentials. You are liable for all activity that occurs under your account. You must notify us immediately of any unauthorised access. We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or abuse our services.",
  },
  {
    title: "Prohibited Conduct",
    content: "You agree not to: use our site for any unlawful purpose; submit false or misleading information; attempt to circumvent any security measure; scrape, harvest, or collect user data; upload viruses or malicious code; interfere with the proper operation of the site; or use automated tools to access the site without our permission.",
  },
  {
    title: "Limitation of Liability",
    content: "To the maximum extent permitted by law, HAXEUS and its affiliates, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our site or products. Our total liability for any claim arising from a purchase shall not exceed the amount you paid for the relevant order.",
  },
  {
    title: "Disclaimer of Warranties",
    content: "Our site and products are provided on an 'as is' and 'as available' basis without warranties of any kind, either express or implied. We do not warrant that the site will be uninterrupted, error-free, or free of viruses. Product colours may vary slightly from what is displayed on screen due to monitor calibration differences.",
  },
  {
    title: "Governing Law",
    content: "These Terms are governed by the laws of India. Any disputes arising from these Terms or your use of our services shall be subject to the exclusive jurisdiction of the courts of Kerala, India.",
  },
  {
    title: "Contact",
    content: "For any questions about these Terms, contact us at legal@haxeus.com or through our Contact page.",
  },
]

export default function TermsConditionsPage() {
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
            HAXEUS — Legal
          </p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Terms & Conditions
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
            Please read these Terms and Conditions carefully before using our website or making a purchase. These terms constitute a legally binding agreement between you and HAXEUS.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section, i) => (
            <section key={i}>
              <h2 className={cn(
                "text-base font-bold tracking-tight mb-3 pb-2.5 border-b",
                isDark ? "border-white/[0.07]" : "border-black/[0.07]"
              )}>
                {i + 1}. {section.title}
              </h2>
              <p className={cn("text-sm leading-relaxed", isDark ? "text-white/60" : "text-black/65")}>
                {section.content}
              </p>
            </section>
          ))}
        </div>

      </div>
    </main>
  )
}
