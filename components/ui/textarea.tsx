import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-xl border border-white/[0.08] bg-[#0d0d0d] px-3 py-2 text-base text-white ring-offset-transparent placeholder:text-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e93a3a]/40 focus-visible:ring-offset-0 focus-visible:border-[#e93a3a]/40 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-colors",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
