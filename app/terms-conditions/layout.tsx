import type { Metadata } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://haxeus.in"

export const metadata: Metadata = {
  title: "Terms & Conditions | HAXEUS",
  description:
    "Read the HAXEUS terms and conditions. Understand your rights and obligations when using our website and purchasing our products.",
  robots: {
    index: true,
    follow: false,
  },
  alternates: {
    canonical: `${SITE_URL}/terms-conditions`,
  },
  openGraph: {
    title: "Terms & Conditions | HAXEUS",
    description:
      "Read the HAXEUS terms and conditions governing use of our website and purchases.",
    url: `${SITE_URL}/terms-conditions`,
    siteName: "HAXEUS",
    type: "website",
  },
}

export default function TermsConditionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

