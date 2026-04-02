import type { Metadata } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://haxeus.in"

export const metadata: Metadata = {
  title: "Replacements Policy | HAXEUS",
  description:
    "HAXEUS replacement policy. Learn how to request a replacement, what qualifies, and the expected inspection and dispatch timeline.",
  alternates: {
    canonical: `${SITE_URL}/returns-refunds`,
  },
  openGraph: {
    title: "Replacements Policy | HAXEUS",
    description:
      "Learn how to request a replacement at HAXEUS, what qualifies, and the expected inspection timeline.",
    url: `${SITE_URL}/returns-refunds`,
    siteName: "HAXEUS",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Replacements Policy | HAXEUS",
    description:
      "Learn how to request a replacement at HAXEUS, what qualifies, and the expected inspection timeline.",
  },
}

export default function ReturnsRefundsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

