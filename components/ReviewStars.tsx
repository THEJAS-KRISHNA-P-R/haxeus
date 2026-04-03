"use client"

interface ReviewStarsProps {
  value: number
  onChange?: (value: number) => void
  size?: "sm" | "md" | "lg"
  interactive?: boolean
}

const SIZE_CLASS_MAP = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-8 w-8",
} as const

export function ReviewStars({ value, onChange, size = "md", interactive: interactiveProp }: ReviewStarsProps) {
  const isInteractive = interactiveProp ?? typeof onChange === "function"

  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1
        // Handle fractional values for display (e.g. 4.4)
        const isFull = starValue <= Math.floor(value)
        const isHalf = !isFull && starValue <= Math.ceil(value) && value % 1 !== 0
        const fill = isFull || isHalf ? "#ffa41c" : "transparent"
        const stroke = isFull || isHalf ? "#ffa41c" : "var(--border)"

        return (
          <button
            key={starValue}
            type="button"
            onClick={() => onChange?.(starValue)}
            disabled={!isInteractive}
            className={isInteractive ? "transition-all hover:scale-125 hover:drop-shadow-[0_0_12px_rgba(255,164,28,0.5)] active:scale-95" : "cursor-default"}
            aria-label={`Rate ${starValue} star${starValue > 1 ? "s" : ""}`}
          >
            <svg
              viewBox="0 0 24 24"
              className={SIZE_CLASS_MAP[size]}
              fill={fill}
              stroke={stroke}
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        )
      })}
    </div>
  )
}


