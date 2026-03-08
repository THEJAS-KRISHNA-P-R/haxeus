"use client"

import { useTheme } from "@/components/ThemeProvider"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const sections = [
    {
        title: "Order Processing",
        content: [
            {
                subtitle: "Processing Time",
                text: "All orders are processed within 2–3 business days (excluding weekends and public holidays) after payment confirmation. You will receive a confirmation email once your order has been placed and another when it has been dispatched.",
            },
            {
                subtitle: "Order Confirmation",
                text: "Once your order is placed and payment is verified, you will receive a confirmation email with your order details. Please ensure your shipping address and contact information are accurate — HAXEUS is not responsible for delays due to incorrect addresses.",
            },
        ],
    },
    {
        title: "Shipping Coverage & Delivery",
        content: [
            {
                subtitle: "Domestic Shipping Only",
                text: "HAXEUS currently ships to all serviceable pin codes within India. We do not offer international shipping at this time. If you are located outside India, please check back — we plan to expand shipping in the future.",
            },
            {
                subtitle: "Delivery Timeframes",
                text: "Standard delivery takes 7–14 business days from the date of dispatch, depending on your location. Metro cities typically receive orders within 7–10 days, while remote areas may take up to 14 business days.",
            },
        ],
    },
    {
        title: "Shipping Charges",
        content: [
            {
                subtitle: "Standard Shipping",
                text: "A flat shipping fee of ₹150 is charged on all orders below ₹2,000. Orders above ₹2,000 qualify for free standard shipping across India.",
            },
            {
                subtitle: "No Hidden Fees",
                text: "The shipping charge displayed at checkout is final. There are no additional customs, handling, or packaging fees. What you see is what you pay.",
            },
        ],
    },
    {
        title: "Order Tracking",
        content: [
            {
                subtitle: "Tracking Number",
                text: "Once your order is dispatched, you will receive a tracking number via email. You can use this number on our courier partner's website to track your shipment in real time.",
            },
            {
                subtitle: "Tracking Updates",
                text: "Please allow 24–48 hours after receiving the dispatch email for tracking information to become active. If your tracking number does not show updates after 48 hours, please contact us at haxeus.in@gmail.com.",
            },
        ],
    },
    {
        title: "Delays & Issues",
        content: [
            {
                subtitle: "Courier Delays",
                text: "HAXEUS is not responsible for delays caused by the courier service, natural disasters, strikes, or other events beyond our control. We will, however, do our best to follow up with the courier on your behalf if a delay occurs.",
            },
            {
                subtitle: "Lost or Damaged Shipments",
                text: "If your package is lost in transit or arrives damaged, please contact us at haxeus.in@gmail.com within 48 hours of the expected delivery date. Include your order ID and, for damaged items, clear photographs of the package and product. We will coordinate with the courier to resolve the issue or send a replacement.",
            },
        ],
    },
    {
        title: "Undeliverable Packages",
        content: [
            {
                subtitle: "",
                text: "If a package is returned to us due to an incorrect address, refused delivery, or failed delivery attempts, we will contact you to arrange reshipment. Additional shipping charges may apply for reshipment.",
            },
        ],
    },
    {
        title: "Contact",
        content: [
            {
                subtitle: "",
                text: "For any shipping-related queries, contact us at haxeus.in@gmail.com or through our Contact page. We aim to respond within 2 business days.",
            },
        ],
    },
]

export default function ShippingPolicyPage() {
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
                        Shipping Policy
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
                        At HAXEUS, we want your order to reach you as quickly and safely as possible. This Shipping Policy outlines our processing times, delivery estimates, shipping charges, and what to do if something goes wrong. By placing an order, you agree to the terms described below.
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
