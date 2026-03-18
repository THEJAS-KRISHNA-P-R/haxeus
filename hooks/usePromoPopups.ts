"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { PromoPopup } from "@/types/promo-popup"

const COOLDOWN_KEY_PREFIX = "haxeus_promo_dismiss_"
const SHOW_ONCE_KEY_PREFIX = "haxeus_promo_shown_"

export function usePromoPopups() {
    const [popups, setPopups] = useState<PromoPopup[]>([])
    const [activePopup, setActivePopup] = useState<PromoPopup | null>(null)
    const [isVisible, setIsVisible] = useState(false)
    const semaphore = useRef(false)
    const triggeredPopups = useRef<Set<string>>(new Set())

    const isCooledDown = (popup: PromoPopup) => {
        try {
            if (popup.show_once) {
                if (localStorage.getItem(SHOW_ONCE_KEY_PREFIX + popup.id)) return false
            }
            const dismissedAt = localStorage.getItem(COOLDOWN_KEY_PREFIX + popup.id)
            if (!dismissedAt) return true
            const hoursElapsed = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60)
            return hoursElapsed >= popup.cooldown_hours
        } catch { return true }
    }

    const recordDismiss = (popup: PromoPopup) => {
        try {
            localStorage.setItem(COOLDOWN_KEY_PREFIX + popup.id, Date.now().toString())
            if (popup.show_once) {
                localStorage.setItem(SHOW_ONCE_KEY_PREFIX + popup.id, "true")
            }
        } catch {}
    }

    const fetchPopups = async () => {
        try {
            const res = await fetch("/api/promo-popups")
            const data = await res.json()
            setPopups(data || [])
        } catch (error) {
            console.error("Failed to fetch promo popups", error)
        }
    }

    useEffect(() => {
        fetchPopups()
    }, [])

    const tryTrigger = useCallback((triggerType: PromoPopup["trigger"]) => {
        if (semaphore.current) return

        const eligible = popups
            .filter(p => p.enabled)
            .filter(p => p.trigger === triggerType)
            .filter(p => !triggeredPopups.current.has(p.id))
            .filter(p => isCooledDown(p))

        if (eligible.length === 0) return

        // Pick the first one (can be expanded to priority order if needed)
        const popup = eligible[0]
        
        const delay = triggerType === "on_load" ? popup.delay_ms : 0

        setTimeout(() => {
            if (semaphore.current) return
            semaphore.current = true
            triggeredPopups.current.add(popup.id)
            setActivePopup(popup)
            setIsVisible(true)
        }, delay)
    }, [popups])

    // Exit intent
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (e.clientY <= 0) tryTrigger("exit_intent")
        }
        document.addEventListener("mouseleave", handler)
        return () => document.removeEventListener("mouseleave", handler)
    }, [tryTrigger])

    // On Load
    useEffect(() => {
        if (popups.length > 0) {
            tryTrigger("on_load")
        }
    }, [popups, tryTrigger])

    const close = useCallback(() => {
        if (activePopup) recordDismiss(activePopup)
        setIsVisible(false)
        setTimeout(() => {
            setActivePopup(null)
            semaphore.current = false
        }, 400)
    }, [activePopup])

    return {
        activePopup,
        isVisible,
        close
    }
}
