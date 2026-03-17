"use client"

import { motion } from "framer-motion"

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  size?: "sm" | "md" | "lg"
  label?: string
  labelPosition?: "left" | "right"
}

export function Toggle({
  checked,
  onChange,
  disabled = false,
  size = "md",
  label,
  labelPosition = "right"
}: ToggleProps) {
  const sizes = {
    sm: { track: "w-8 h-4",   thumb: "w-3 h-3",   translate: 16 },
    md: { track: "w-11 h-6",  thumb: "w-4 h-4",   translate: 20 },
    lg: { track: "w-14 h-7",  thumb: "w-5 h-5",   translate: 28 },
  }
  const s = sizes[size]

  return (
    <label className={`inline-flex items-center gap-2.5 ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}>
      {label && labelPosition === "left" && (
        <span className="text-sm font-medium select-none">{label}</span>
      )}

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex items-center flex-shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e93a3a]/50 ${s.track} ${
          checked ? "bg-[#e93a3a]" : "bg-white/[0.12] dark:bg-white/[0.12]"
        }`}
        style={{
          backgroundColor: checked ? "#e93a3a" : "rgba(128,128,128,0.25)"
        }}
      >
        <motion.div
          className={`rounded-full bg-white shadow-sm flex-shrink-0 ${s.thumb}`}
          animate={{ x: checked ? s.translate : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      </button>

      {label && labelPosition === "right" && (
        <span className="text-sm font-medium select-none">{label}</span>
      )}
    </label>
  )
}
