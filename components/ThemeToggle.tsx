"use client"
import { useTheme } from "@/components/ThemeProvider"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle({ className = "" }: { className?: string }) {
    const { theme, toggle } = useTheme()
    return (
        <button
            onClick={toggle}
            aria-label="Toggle theme"
            className={`relative p-2 rounded-full transition-colors
        hover:bg-[var(--bg-elevated)] text-[var(--text-2)] hover:text-[var(--text)]
        ${className}`}
        >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
    )
}
