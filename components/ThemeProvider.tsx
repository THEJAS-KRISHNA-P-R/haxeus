"use client"
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light"

const ThemeContext = createContext<{
    theme: Theme
    toggle: () => void
    setTheme: (t: Theme) => void
}>({ theme: "dark", toggle: () => { }, setTheme: () => { } })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("dark")
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const stored = localStorage.getItem("haxeus-theme") as Theme | null
        const preferred = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"
        const initial = stored || preferred
        setThemeState(initial)
        document.documentElement.setAttribute("data-theme", initial)
    }, [])

    const setTheme = (t: Theme) => {
        setThemeState(t)
        localStorage.setItem("haxeus-theme", t)
        document.documentElement.setAttribute("data-theme", t)
    }

    const toggle = () => setTheme(theme === "dark" ? "light" : "dark")

    if (!mounted) return <div style={{ visibility: "hidden" }}>{children}</div>

    return (
        <ThemeContext.Provider value={{ theme, toggle, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => useContext(ThemeContext)
