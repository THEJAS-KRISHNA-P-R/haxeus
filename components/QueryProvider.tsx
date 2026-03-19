"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useState } from "react"

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            retry: (failureCount, error: unknown) => {
              const status = (error as { status?: number })?.status
              if (status === 404 || status === 401 || status === 403) return false
              return failureCount < 2
            },
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <DevTools />
    </QueryClientProvider>
  )
}

function DevTools() {
  if (process.env.NODE_ENV !== "development") return null
  return <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
}
