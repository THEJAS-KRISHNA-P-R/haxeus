"use client"

import { useState, useEffect, RefObject } from "react"

export type NavScheme = 'light' | 'dark'

export function useNavbarScheme(navbarRef: RefObject<HTMLElement | null>): NavScheme {
  const [navScheme, setNavScheme] = useState<NavScheme>('light')

  useEffect(() => {
    let rafId: number | null = null

    const parseLuminance = (r: number, g: number, b: number): number => {
      const toLinear = (c: number) => {
        const s = c / 255
        return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.145, 2.4)
      }
      return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
    }

    const parseCssLuminance = (cssColor: string): number => {
      const m = cssColor.match(/\d+/g)
      if (!m) return 0
      const [r, g, b] = m.map(Number)
      return parseLuminance(r, g, b)
    }

    const getComputedBg = (el: Element | null): string | null => {
      let node = el
      while (node && node !== document.documentElement) {
        // High-fidelity HAXEUS check: WebGL Canvas background is always 'Dark'
        if (node.tagName.toLowerCase() === 'canvas') return 'rgb(10, 4, 6)' 
        
        const style = window.getComputedStyle(node)
        const bg = style.backgroundColor
        // Ignore the navbar's own glass/blur by identifying common class names
        const isNavbarPart = node.classList.contains('glass-surface') || 
                             node.classList.contains('nav-pill-border')
        
        if (!isNavbarPart && bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return bg
        node = node.parentElement
      }
      // If we hit the root, default to a safe value based on general HAXEUS dark mode
      return null
    }

    const sampleNavbarBackground = () => {
      if (!navbarRef.current) return

      const rect = navbarRef.current.getBoundingClientRect()
      const navY = rect.top + rect.height / 2
      const sampleXs = [0.15, 0.30, 0.50, 0.70, 0.85].map(r => window.innerWidth * r)
      
      let totalLuminance = 0
      let samplesCounted = 0

      // Synchronously disable navbar hit-testing
      const originalPointerEvents = navbarRef.current.style.pointerEvents
      navbarRef.current.style.pointerEvents = 'none'

      sampleXs.forEach(x => {
        const el = document.elementFromPoint(x, navY)
        const bg = getComputedBg(el)
        
        if (bg) {
          totalLuminance += parseCssLuminance(bg)
          samplesCounted++
        } else {
          // Viewport sampling catch: assume dark space unless proven light
          totalLuminance += 0.05 // near-black
          samplesCounted++
        }
      })

      // Restore hit-testing
      navbarRef.current.style.pointerEvents = originalPointerEvents

      if (samplesCounted > 0) {
        const avgLuminance = totalLuminance / samplesCounted
        // 0.5 threshold to stay 'light' (white icons) until background is clearly bright (e.g. white grid)
        setNavScheme(avgLuminance >= 0.5 ? 'dark' : 'light')
      }
    }

    const onScroll = () => {
      if (rafId !== null) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        sampleNavbarBackground()
      })
    }

    // Initial check
    sampleNavbarBackground()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [navbarRef])

  return navScheme
}
