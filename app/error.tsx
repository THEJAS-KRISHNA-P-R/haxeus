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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-red-100 p-4 rounded-full">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Something went wrong!</h1>
            <p className="text-gray-600">
              We encountered an unexpected error. Don't worry, it's not your fault.
            </p>
          </div>

          {error.message && (
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-700 font-mono break-words">{error.message}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => reset()}
              className="flex-1 bg-red-600 hover:bg-red-700"
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

          <p className="text-xs text-gray-500">
            If this problem persists, please contact our support team.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
