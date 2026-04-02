import type { Metadata } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://haxeus.in"

export const metadata: Metadata = {
  title: "Size Guide | HAXEUS",
  description:
    "Find your perfect fit with the HAXEUS size guide. Detailed measurements for T-shirts, hoodies, and all our apparel — chest, length, and more.",
  alternates: {
    canonical: `${SITE_URL}/size-guide`,
  },
  openGraph: {
    title: "Size Guide | HAXEUS",
    description:
      "Find your perfect fit with the HAXEUS size guide. Detailed measurements for T-shirts, hoodies, and all our apparel.",
    url: `${SITE_URL}/size-guide`,
    siteName: "HAXEUS",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Size Guide | HAXEUS",
    description:
      "Find your perfect fit with the HAXEUS size guide. Detailed measurements for T-shirts, hoodies, and all our apparel.",
  },
}

export default function SizeGuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

