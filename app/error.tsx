"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { useTheme } from "@/components/ThemeProvider"
import { cn } from "@/lib/utils"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className={cn("min-h-screen flex items-center justify-center p-4 transition-colors duration-300", isDark ? "bg-[#0a0a0a]" : "bg-[#f5f4f0]")}>
      <Card className={cn("max-w-md w-full border-none shadow-2xl", isDark ? "bg-[#111] text-white" : "bg-white text-black")}>
        <CardContent className="p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className={cn("p-4 rounded-full", isDark ? "bg-red-500/10" : "bg-red-50")}>
              <AlertCircle className="w-12 h-12 text-[#e93a3a]" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-black")}>Something went wrong!</h1>
            <p className={isDark ? "text-white/50" : "text-black/50"}>
              We encountered an unexpected error. Don't worry, it's not your fault.
            </p>
          </div>

          {error.message && (
            <div className={cn("p-4 rounded-lg text-left", isDark ? "bg-white/[0.05]" : "bg-black/[0.03]")}>
              <p className={cn("text-xs font-mono break-words", isDark ? "text-white/80" : "text-black/70")}>
                {error.message}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => reset()}
              className="flex-1 bg-[#e93a3a] hover:bg-[#ff4a4a] text-white font-bold rounded-full py-6"
            >
              Try Again
            </Button>
            <Button
              onClick={() => (window.location.href = "/")}
              variant="outline"
              className={cn("flex-1 rounded-full py-6 border-2", isDark ? "border-white/10 hover:bg-white/5" : "border-black/5 hover:bg-black/5")}
            >
              Go Home
            </Button>
          </div>

          <p className={isDark ? "text-white/30 text-[10px]" : "text-black/30 text-[10px]"}>
            If this problem persists, please contact our support team.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
