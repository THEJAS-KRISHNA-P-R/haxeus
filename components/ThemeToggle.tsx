"use client"
import { useTheme } from "@/components/ThemeProvider"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle({ className = "" }: { className?: string }) {
    const { theme, toggle } = useTheme()

    return (
        <button
            onClick={toggle}
            aria-label="Toggle theme"
            className={`relative p-2 rounded-full transition-all duration-200 
        hover:bg-[var(--border-hover)] text-[var(--text-2)] hover:text-[var(--text)] 
        ${className}`}
        >
            {theme === "dark" ? (
                <Sun className="h-4 w-4" />
            ) : (
                <Moon className="h-4 w-4" />
            )}
        </button>
    )
}
