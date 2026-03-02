"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// ─── Standard shadcn Button (kept for compatibility) ────────────────────────

const buttonVariants = cva(
  "inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-primary-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

// ─── Liquid Glass Button (HAXEUS Secondary) ────────────────────────────────

const liquidbuttonVariants = cva(
  "inline-flex items-center transition-colors justify-center cursor-pointer gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-[color,box-shadow,transform] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[#01f3f3]/50",
  {
    variants: {
      variant: {
        default: "bg-transparent hover:scale-105 duration-300 transition text-white dark:text-white",
        cyan: "bg-transparent hover:scale-105 duration-300 transition text-[#01f3f3]",
        pink: "bg-transparent hover:scale-105 duration-300 transition text-[#c23b9a]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 text-xs gap-1.5 px-4",
        lg: "h-10 px-6",
        xl: "h-12 px-8",
        xxl: "h-14 px-10",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "xxl",
    },
  }
)

export interface LiquidButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof liquidbuttonVariants> {
  asChild?: boolean
}

function LiquidButton({
  className,
  variant,
  size,
  asChild = false,
  children,
  ...props
}: LiquidButtonProps) {
  const Comp = asChild ? Slot : "button"

  return (
    <>
      <Comp
        data-slot="button"
        className={cn(
          "relative",
          liquidbuttonVariants({ variant, size, className })
        )}
        {...props}
      >
        {/* Glass morphism layer — light/dark aware */}
        <div className={cn(
          "absolute top-0 left-0 z-0 h-full w-full rounded-full transition-all duration-300",
          // Light mode: subtle white glass
          "shadow-[0_0_6px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3px_rgba(255,255,255,0.5),inset_-3px_-3px_0.5px_-3px_rgba(255,255,255,0.45),inset_1px_1px_1px_-0.5px_rgba(255,255,255,0.5),inset_-1px_-1px_1px_-0.5px_rgba(255,255,255,0.45),inset_0_0_6px_6px_rgba(255,255,255,0.08),inset_0_0_2px_2px_rgba(255,255,255,0.04),0_0_12px_rgba(1,243,243,0.06)]",
          // Dark mode: brighter inner highlights + cyan glow
          "dark:shadow-[0_0_8px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3.5px_rgba(255,255,255,0.12),inset_-3px_-3px_0.5px_-3.5px_rgba(255,255,255,0.9),inset_1px_1px_1px_-0.5px_rgba(255,255,255,0.65),inset_-1px_-1px_1px_-0.5px_rgba(255,255,255,0.65),inset_0_0_6px_6px_rgba(255,255,255,0.14),inset_0_0_2px_2px_rgba(255,255,255,0.07),0_0_16px_rgba(1,243,243,0.1)]",
          "hover:shadow-[0_0_6px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.12),inset_3px_3px_0.5px_-3px_rgba(255,255,255,0.65),inset_-3px_-3px_0.5px_-3px_rgba(255,255,255,0.6),inset_1px_1px_1px_-0.5px_rgba(255,255,255,0.65),inset_-1px_-1px_1px_-0.5px_rgba(255,255,255,0.6),inset_0_0_8px_8px_rgba(255,255,255,0.12),0_0_20px_rgba(1,243,243,0.18)]",
          "backdrop-blur-[1px]",
        )} />

        {/* Refraction layer */}
        <div
          className="absolute top-0 left-0 isolate -z-10 h-full w-full overflow-hidden rounded-full"
          style={{ backdropFilter: 'url("#liquid-glass-haxeus")' }}
        />

        <div className="pointer-events-none relative z-10">
          {children}
        </div>
      </Comp>

      <GlassFilter />
    </>
  )
}

// SVG filter for liquid refraction effect
function GlassFilter() {
  return (
    <svg className="pointer-events-none absolute" style={{ width: 0, height: 0, position: "absolute" }}>
      <defs>
        <filter
          id="liquid-glass-haxeus"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.05 0.05"
            numOctaves="1"
            seed="2"
            result="turbulence"
          />
          <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="blurredNoise"
            scale="60"
            xChannelSelector="R"
            yChannelSelector="B"
            result="displaced"
          />
          <feGaussianBlur in="displaced" stdDeviation="3" result="finalBlur" />
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  )
}

export { Button, buttonVariants, liquidbuttonVariants, LiquidButton, GlassFilter }
