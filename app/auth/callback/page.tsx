"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { sendWelcomeEmail } from "@/lib/email"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleOAuthRedirect = async () => {
      try {
        // Get the current session
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Auth callback error:", error)
          router.push("/auth")
          return
        }

        if (session?.user) {
          // Check if this is a new user (created in the last 5 seconds)
          const createdAt = new Date(session.user.created_at || "")
          const now = new Date()
          const diffSeconds = (now.getTime() - createdAt.getTime()) / 1000
          const isNewUser = diffSeconds < 5
          
          // Send welcome email for new users
          if (isNewUser && session.user.email) {
            await sendWelcomeEmail(
              session.user.email,
              session.user.user_metadata?.full_name || 
              session.user.user_metadata?.name ||
              session.user.email.split("@")[0]
            )
          }

          // Redirect to home page after successful login
          router.push("/")
        } else {
          router.push("/auth")
        }
      } catch (error) {
        console.error("Callback error:", error)
        router.push("/auth")
      }
    }
    
    handleOAuthRedirect()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Completing sign in...</p>
      </div>
    </div>
  )
}