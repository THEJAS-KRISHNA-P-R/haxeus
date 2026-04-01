import { LockKeyhole, ShieldCheck, Truck, Undo2 } from "lucide-react"

interface TrustBadgeItem {
  label: string
  icon: typeof Truck
}

interface TrustBadgesProps {
  compact?: boolean
}

const TRUST_BADGES: TrustBadgeItem[] = [
  { label: "Free shipping above ₹999", icon: Truck },
  { label: "10-day easy replacements", icon: Undo2 },
  { label: "Made in India", icon: ShieldCheck },
  { label: "Secure checkout", icon: LockKeyhole },
]

export function TrustBadges({ compact = false }: TrustBadgesProps) {
  return (
    <div
      className={`w-full overflow-hidden rounded-[24px] border p-3 ${
        compact ? "grid grid-cols-1 gap-2 sm:grid-cols-2" : "grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4"
      }`}
      style={{
        borderColor: "var(--color-border)",
        background: "color-mix(in srgb, var(--color-surface) 92%, transparent)",
      }}
    >
      {TRUST_BADGES.map((badge) => {
        const Icon = badge.icon

        return (
          <div
            key={badge.label}
            className="flex min-w-0 items-center gap-3 overflow-hidden rounded-[18px] border px-3 py-3"
            style={{
              borderColor: "color-mix(in srgb, var(--color-border) 90%, transparent)",
              background: "color-mix(in srgb, var(--color-surface-muted) 80%, transparent)",
            }}
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
              style={{
                background: "color-mix(in srgb, var(--color-accent) 12%, transparent)",
                color: "var(--color-accent)",
              }}
            >
              <Icon className="h-4.5 w-4.5" strokeWidth={2} />
            </span>
            <span
              className="min-w-0 break-words text-sm font-medium leading-5 tracking-[-0.01em]"
              style={{ color: "var(--color-foreground-muted)" }}
            >
              {badge.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
