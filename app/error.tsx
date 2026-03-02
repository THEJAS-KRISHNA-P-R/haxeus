"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-red-100 p-4 rounded-full">
              <AlertCircle className="w-12 h-12 text-[#e93a3a]" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">Something went wrong!</h1>
            <p className="text-white/50">
              We encountered an unexpected error. Don't worry, it's not your fault.
            </p>
          </div>

          {error.message && (
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-white/70 font-mono break-words">{error.message}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => reset()}
              className="flex-1 bg-[#e93a3a] hover:bg-[#e93a3a]/80"
            >
              Try Again
            </Button>
            <Button
              onClick={() => (window.location.href = "/")}
              variant="outline"
              className="flex-1"
            >
              Go Home
            </Button>
          </div>

          <p className="text-xs text-white/40">
            If this problem persists, please contact our support team.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
