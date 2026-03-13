import type { Metadata } from "next"

const SITE_NAME = "HAXEUS"

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Streetwear guides, styling tips, and insights from HAXEUS. Learn about oversized fits, graphic tees, streetwear India, and premium fashion.",
  openGraph: {
    title: `Journal | ${SITE_NAME}`,
    description: "Streetwear guides, styling tips, and insights from HAXEUS.",
  },
}

export default function JournalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
