"use client"

interface ReviewStarsProps {
  value: number
  onChange?: (value: number) => void
  size?: "sm" | "md"
}

const SIZE_CLASS_MAP = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
} as const

export function ReviewStars({ value, onChange, size = "md" }: ReviewStarsProps) {
  const interactive = typeof onChange === "function"

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1
        const filled = starValue <= value

        return (
          <button
            key={starValue}
            type="button"
            onClick={() => onChange?.(starValue)}
            disabled={!interactive}
            className={interactive ? "transition-transform hover:scale-110" : "cursor-default"}
            aria-label={`Rate ${starValue} star${starValue > 1 ? "s" : ""}`}
          >
            <svg
              viewBox="0 0 24 24"
              className={SIZE_CLASS_MAP[size]}
              fill={filled ? "var(--color-accent-warm)" : "transparent"}
              stroke={filled ? "var(--color-accent-warm)" : "var(--color-border-strong)"}
              strokeWidth="1.8"
            >
              <path d="M12 3.8l2.6 5.27 5.82.85-4.21 4.1.99 5.79L12 17.03 6.8 19.8l.99-5.79-4.21-4.1 5.82-.85L12 3.8z" />
            </svg>
          </button>
        )
      })}
    </div>
  )
}

