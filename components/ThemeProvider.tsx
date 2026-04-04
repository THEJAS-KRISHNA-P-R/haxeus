"use client"
import { createContext, useContext, useEffect, useState, useCallback } from "react"

type Theme = "dark" | "light"

interface ThemeContextType {
    theme: Theme
    toggle: () => void
    setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextType>({
    theme: "light",
    toggle: () => { },
    setTheme: () => { },
})

function applyTheme(t: Theme) {
    // Set on both <html> and <body> for maximum compatibility
    document.documentElement.setAttribute("data-theme", t)
    document.documentElement.classList.toggle("dark", t === "dark")
    document.documentElement.classList.toggle("light", t === "light")
    document.body.setAttribute("data-theme", t)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("light")
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        // Read from localStorage first, default to light
        const stored = localStorage.getItem("haxeus-theme") as Theme | null
        const resolved = stored ?? "light"
        applyTheme(resolved)
        setThemeState(resolved)
    }, [])

    const setTheme = useCallback((t: Theme) => {
        setThemeState(t)
        localStorage.setItem("haxeus-theme", t)
        applyTheme(t)
    }, [])

    const toggle = useCallback(() => {
        setTheme(theme === "dark" ? "light" : "dark")
    }, [theme, setTheme])

    // Block render until theme is resolved — prevents flash
    if (!mounted) {
        return (
            <script
                dangerouslySetInnerHTML={{
                    __html: `
            (function() {
              var stored = localStorage.getItem('haxeus-theme');
              var theme = stored || 'light';
              document.documentElement.setAttribute('data-theme', theme);
              document.documentElement.classList.add(theme);
            })();
          `,
                }}
            />
        )
    }

    return (
        <ThemeContext.Provider value={{ theme, toggle, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => useContext(ThemeContext)
