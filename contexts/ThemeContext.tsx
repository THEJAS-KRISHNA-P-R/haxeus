"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "haxeus-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(
    () => (typeof window !== "undefined" ? (localStorage.getItem(storageKey) as Theme) : defaultTheme) || defaultTheme
  )

  React.useEffect(() => {
    const root = window.document.documentElement

    // Remove both classes first
    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.add(systemTheme)
      root.setAttribute("data-theme", systemTheme)
    } else {
      root.classList.add(theme)
      root.setAttribute("data-theme", theme)
    }
  }, [theme])

  const value = React.useMemo(
    () => ({
      theme,
      setTheme: (theme: Theme) => {
        localStorage.setItem(storageKey, theme)
        setTheme(theme)
      },
    }),
    [theme, storageKey]
  )

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)

  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider")

  return context
}

// Dark Mode Toggle Button Component
export function DarkModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-full bg-white/[0.06] animate-pulse" />
    )
  }

  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`relative p-2 rounded-full flex items-center justify-center transition-all overflow-hidden ${isDark
          ? "text-white/45 hover:text-white hover:bg-white/[0.07]"
          : "text-black/45 hover:text-black hover:bg-black/[0.05]"
        }`}
      aria-label="Toggle dark mode"
    >
      {/* Sun Icon */}
      <Sun
        className={`absolute h-4 w-4 text-[#e7bf04] ${isDark
          ? "rotate-90 scale-0 opacity-0"
          : "rotate-0 scale-100 opacity-100"
          }`}
        style={{
          transition: 'transform 400ms cubic-bezier(0.4, 0, 0.2, 1), opacity 400ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />

      {/* Moon Icon */}
      <Moon
        className={`absolute h-4 w-4 text-theme-accent ${isDark
          ? "rotate-0 scale-100 opacity-100"
          : "-rotate-90 scale-0 opacity-0"
          }`}
        style={{
          transition: 'transform 400ms cubic-bezier(0.4, 0, 0.2, 1), opacity 400ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
    </button>
  )
}
