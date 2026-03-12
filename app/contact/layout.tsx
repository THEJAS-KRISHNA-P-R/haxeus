import type { Metadata } from "next"
import { FAQJsonLd } from "@/components/JsonLd"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://haxeus.in"

export const metadata: Metadata = {
  title: "Contact Us | HAXEUS",
  description:
    "Get in touch with HAXEUS. Have a question about your order, sizing, or anything else? We're here to help.",
  alternates: {
    canonical: `${SITE_URL}/contact`,
  },
  openGraph: {
    title: "Contact Us | HAXEUS",
    description:
      "Get in touch with HAXEUS. Have a question about your order, sizing, or anything else? We're here to help.",
    url: `${SITE_URL}/contact`,
    siteName: "HAXEUS",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us | HAXEUS",
    description:
      "Get in touch with HAXEUS. Have a question about your order, sizing, or anything else? We're here to help.",
  },
}

const faqs = [
  {
    question: "Do you offer returns?",
    answer:
      "We don't offer returns. We provide a 10-day replacement policy from the date of delivery for items that are defective or damaged. Items must be unworn, unwashed, with original tags attached. Email haxeus.in@gmail.com with your order ID and photos to initiate.",
  },
  {
    question: "How long does shipping take?",
    answer:
      "Orders are processed within 2 business days. Standard shipping then takes 7-10 business days across India.",
  },
  {
    question: "What sizes do you offer?",
    answer:
      "We offer sizes from S to XL. Please check our size guide on each product page for detailed measurements.",
  },
  {
    question: "Do you offer international shipping?",
    answer: "Currently, we only ship within India. We're working on expanding to international markets soon.",
  },
  {
    question: "How can I track my order?",
    answer:
      "Once your order ships, you'll receive a tracking number via email. You can use this to track your package on our website or the courier's website.",
  },
  {
    question: "What is your refund policy?",
    answer:
      "Refunds are only issued if a replacement is not available for your size. Once confirmed, refunds are processed within 7-10 business days to your original payment method.",
  },
]

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FAQJsonLd items={faqs} />
      {children}
    </>
  )
}
