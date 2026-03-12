import type { Metadata } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://haxeus.in"

export const metadata: Metadata = {
  title: "Privacy Policy | HAXEUS",
  description:
    "Read the HAXEUS privacy policy. Learn how we collect, use, and protect your personal data when you shop with us.",
  robots: {
    index: true,
    follow: false,
  },
  alternates: {
    canonical: `${SITE_URL}/privacy-policy`,
  },
  openGraph: {
    title: "Privacy Policy | HAXEUS",
    description:
      "Learn how HAXEUS collects, uses, and protects your personal data.",
    url: `${SITE_URL}/privacy-policy`,
    siteName: "HAXEUS",
    type: "website",
  },
}

export default function PrivacyPolicyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
