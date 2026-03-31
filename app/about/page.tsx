import type { Metadata } from "next"
import AboutPageClient from "./AboutPageClient"

export const metadata: Metadata = {
  title: "About HAXEUS",
  description:
    "The story behind HAXEUS — premium artistic streetwear from India. Born from a rebellion against boring merch.",
  alternates: { canonical: "https://www.haxeus.in/about" },
  openGraph: {
    url: "https://www.haxeus.in/about",
    title: "About HAXEUS | Premium Artistic Streetwear India",
    description:
      "The story behind HAXEUS — premium artistic streetwear from India. Born from a rebellion against boring merch.",
  },
}

export default function AboutPage() {
  return <AboutPageClient />
}
