import type { Metadata } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://haxeus.in"

export const metadata: Metadata = {
  title: "About Us | HAXEUS",
  description:
    "Learn about HAXEUS — our story, values, and commitment to sustainable streetwear crafted in India. Bold designs, quality fabrics, made for you.",
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  openGraph: {
    title: "About Us | HAXEUS",
    description:
      "Learn about HAXEUS — our story, values, and commitment to sustainable streetwear crafted in India.",
    url: `${SITE_URL}/about`,
    siteName: "HAXEUS",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | HAXEUS",
    description:
      "Learn about HAXEUS — our story, values, and commitment to sustainable streetwear crafted in India.",
  },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
