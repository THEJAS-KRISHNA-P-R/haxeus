import type { Metadata } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://haxeus.in"

export const metadata: Metadata = {
  title: "Shipping Policy | HAXEUS",
  description:
    "Read the HAXEUS shipping policy. Learn about delivery timelines, shipping partners, free shipping thresholds, and order tracking across India.",
  alternates: {
    canonical: `${SITE_URL}/shipping-policy`,
  },
  openGraph: {
    title: "Shipping Policy | HAXEUS",
    description:
      "Learn about HAXEUS delivery timelines, shipping partners, free shipping thresholds, and order tracking across India.",
    url: `${SITE_URL}/shipping-policy`,
    siteName: "HAXEUS",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shipping Policy | HAXEUS",
    description:
      "Learn about HAXEUS delivery timelines, shipping partners, and order tracking across India.",
  },
}

export default function ShippingPolicyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
