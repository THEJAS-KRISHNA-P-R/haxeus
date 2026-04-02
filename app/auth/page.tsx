import type { Metadata } from "next"
import { Suspense } from "react"
import AuthPageClient from "./AuthPageClient"

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in or create a HAXEUS account to track orders and access exclusive drops.",
  robots: { index: false, follow: false },
}

// Suspense wraps the client component because it uses useSearchParams
export default function AuthPage() {
  return (
    <Suspense>
      <AuthPageClient />
    </Suspense>
  )
}

