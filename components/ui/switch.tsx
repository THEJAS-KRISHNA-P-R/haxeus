"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059e9b]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f4f0] dark:focus-visible:ring-[#07e4e1]/35 dark:focus-visible:ring-offset-[#060606] disabled:cursor-not-allowed disabled:opacity-50 data-[state=unchecked]:border-black/[0.12] data-[state=unchecked]:bg-black/[0.08] dark:data-[state=unchecked]:border-white/[0.12] dark:data-[state=unchecked]:bg-white/[0.08] data-[state=checked]:border-[#059e9b]/35 data-[state=checked]:bg-[#059e9b]/18 dark:data-[state=checked]:border-[#07e4e1]/35 dark:data-[state=checked]:bg-[#07e4e1]/18",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full shadow-sm ring-0 transition-all data-[state=unchecked]:translate-x-0 data-[state=unchecked]:bg-black/80 dark:data-[state=unchecked]:bg-white/90 data-[state=checked]:translate-x-5 data-[state=checked]:bg-[#059e9b] dark:data-[state=checked]:bg-[#07e4e1]"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
