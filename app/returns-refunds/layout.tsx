import type { Metadata } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://haxeus.in"

export const metadata: Metadata = {
  title: "Returns & Refunds | HAXEUS",
  description:
    "HAXEUS returns and refunds policy. Learn how to initiate a return, eligibility criteria, refund timelines, and how we handle exchanges.",
  alternates: {
    canonical: `${SITE_URL}/returns-refunds`,
  },
  openGraph: {
    title: "Returns & Refunds | HAXEUS",
    description:
      "Learn how to initiate a return at HAXEUS, eligibility criteria, refund timelines, and how we handle exchanges.",
    url: `${SITE_URL}/returns-refunds`,
    siteName: "HAXEUS",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Returns & Refunds | HAXEUS",
    description:
      "Learn how to initiate a return at HAXEUS, eligibility criteria, and refund timelines.",
  },
}

export default function ReturnsRefundsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
