'use client'

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get("code")
    const type = searchParams.get("type")

    const handleOAuthRedirect = async () => {
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          console.error("OAuth exchange error:", error.message)
        }
      } else {
        console.warn("No code in URL — cannot exchange session")
      }

      router.push("/")
    }

    handleOAuthRedirect()
  }, [router, searchParams])

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <p>Redirecting...</p>
    </div>
  )
}
