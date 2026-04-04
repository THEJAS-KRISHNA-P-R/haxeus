import type { Metadata } from "next"
import AboutPageClient from "./AboutPageClient"

export const metadata: Metadata = {
  title: "About HAXEUS",
  description:
    "The story behind HAXEUS — premium artistic streetwear from India. Born from a rebellion against boring merch.",
  alternates: { canonical: "https://haxeus.in/about" },
  openGraph: {
    url: "https://haxeus.in/about",
    title: "About HAXEUS | Premium Artistic Streetwear India",
    description:
      "The story behind HAXEUS — premium artistic streetwear from India. Born from a rebellion against boring merch.",
    images: ["https://haxeus.in/og-image.jpg"],
  },
}

export default function AboutPage() {
  return <AboutPageClient />
}

