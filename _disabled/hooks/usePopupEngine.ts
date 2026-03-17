"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { DEFAULT_POPUP_CAMPAIGNS } from "@/lib/popup-defaults"
import type { PopupCampaign, UserContext, PopupEngineState, TriggerType } from "@/types/popup"
import { usePathname } from "next/navigation"

type ClientPopupCampaign = Omit<PopupCampaign, "security">

const SESSION_KEY = "haxeus_popup_session"          // tracks what was shown this session
const VISITOR_KEY = "haxeus_returning_visitor"      // set on first load, detected on subsequent
const DISMISSED_KEY_PREFIX = "haxeus_popup_dim_"   // + campaign id + timestamp
const EMAIL_CAPTURED_KEY = "haxeus_email_captured"

// ── Audience matcher ────────────────────────────────────────────────
function matchesAudience(campaign: PopupCampaign, ctx: UserContext): boolean {
  switch (campaign.audience) {
    case "everyone": return true
    case "new_visitor": return ctx.isNewVisitor
    case "returning_visitor": return !ctx.isNewVisitor
    case "logged_in": return ctx.isLoggedIn
    case "first_time_buyer": return ctx.isLoggedIn && ctx.orderCount === 0
    case "returning_customer": return ctx.isLoggedIn && ctx.orderCount > 0
    default: return false
  }
}

// ── Cooldown checker ────────────────────────────────────────────────
function isCooledDown(campaign: ClientPopupCampaign): boolean {
  try {
    const key = DISMISSED_KEY_PREFIX + campaign.id
    const raw = localStorage.getItem(key)
    if (!raw) return true
    if (campaign.show_once_ever) return false
    const dismissedAt = parseInt(raw, 10)
    const hoursElapsed = (Date.now() - dismissedAt) / (1000 * 60 * 60)
    return hoursElapsed >= campaign.cooldown_hours
  } catch { return true }
}

// ── Session check ───────────────────────────────────────────────────
function shownThisSession(campaign: ClientPopupCampaign): boolean {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return false
    const shown: string[] = JSON.parse(raw)
    const count = shown.filter(id => id === campaign.id).length
    return count >= campaign.max_shows_per_session
  } catch { return false }
}

function recordShown(campaignId: string) {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    const shown: string[] = raw ? JSON.parse(raw) : []
    shown.push(campaignId)
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(shown))
  } catch {}
}

function recordDismiss(campaign: PopupCampaign) {
  try {
    localStorage.setItem(DISMISSED_KEY_PREFIX + campaign.id, Date.now().toString())
  } catch {}
}

function sanitizeCampaigns(raw: unknown): ClientPopupCampaign[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((c): c is PopupCampaign => !!c && typeof c === "object" && "enabled" in c)
    .filter((c) => c.enabled)
    .map(({ security, ...rest }) => rest)
    .sort((a, b) => a.sort_order - b.sort_order)
}

export function usePopupEngine(): {
  state: PopupEngineState
  dismiss: () => void
  recordEmailCapture: () => void
} {
  const [campaigns, setCampaigns] = useState<ClientPopupCampaign[]>([])
  const [userContext, setUserContext] = useState<UserContext>({
    isNewVisitor: true,
    isLoggedIn: false,
    orderCount: 0,
    emailCaptured: false,
    currentPage: "/",
    sessionDuration: 0,
    scrollDepth: 0
  })
  const [activeCampaign, setActiveCampaign] = useState<PopupCampaign | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const semaphore = useRef(false)                   // global no-overlap lock
  const scrollDepthRef = useRef(0)
  const sessionStartRef = useRef(Date.now())
  const scrollStopTimerRef = useRef<NodeJS.Timeout | null>(null)
  const triggeredCampaigns = useRef<Set<string>>(new Set())
  const userContextRef = useRef(userContext)
  const pathname = usePathname();

  useEffect(() => {
    userContextRef.current = userContext
  }, [userContext])

  // ── Fetch campaigns ─────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/popups")
        if (!res.ok) throw new Error("Failed to fetch popups");
        const data = await res.json()
        const nextCampaigns = sanitizeCampaigns(data)
        setCampaigns(nextCampaigns.length ? nextCampaigns : sanitizeCampaigns(DEFAULT_POPUP_CAMPAIGNS))
      } catch {
        setCampaigns(sanitizeCampaigns(DEFAULT_POPUP_CAMPAIGNS))
      }
    }
    load()
  }, [])

  // ── Realtime subscription ───────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel("popup_campaigns_changes")
      .on("postgres_changes", {
        event: "UPDATE", schema: "public",
        table: "store_settings", filter: "key=eq.popup_campaigns"
      }, (payload) => {
        const nextCampaigns = sanitizeCampaigns(payload.new?.value)
        if (nextCampaigns.length > 0) setCampaigns(nextCampaigns)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  // ── Build user context ──────────────────────────────────────────
  useEffect(() => {
    const isReturning = !!localStorage.getItem(VISITOR_KEY)
    localStorage.setItem(VISITOR_KEY, "1")       // mark as returning for next visit
    const emailCaptured = !!localStorage.getItem(EMAIL_CAPTURED_KEY)

    // Fetch server-side context (login + order count)
    fetch("/api/user/popup-context")
      .then(r => r.json())
      .then(data => {
        setUserContext(prev => ({
          ...prev,
          isNewVisitor: !isReturning,
          isLoggedIn: data.isLoggedIn,
          orderCount: data.orderCount,
          emailCaptured: emailCaptured || data.emailCaptured,
          currentPage: pathname
        }))
      })
      .catch(() => {
        setUserContext(prev => ({
          ...prev,
          isNewVisitor: !isReturning,
          emailCaptured,
          currentPage: pathname
        }))
      })
  }, [pathname])

  // ── Scroll depth tracker ────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const depth = el.scrollHeight - el.clientHeight === 0 ? 0 : Math.round((window.scrollY / (el.scrollHeight - el.clientHeight)) * 100)
      scrollDepthRef.current = depth
      setUserContext(prev => ({ ...prev, scrollDepth: depth }))
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll(); // Initial check
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // ── Session timer ───────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      const seconds = Math.floor((Date.now() - sessionStartRef.current) / 1000)
      setUserContext(prev => ({ ...prev, sessionDuration: seconds }))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // ── Try to trigger a campaign ───────────────────────────────────
  const tryTrigger = useCallback((triggerType: TriggerType) => {
    if (semaphore.current) return

    const ctx = userContextRef.current

    const eligible = campaigns
      .filter(c => c.trigger.type === triggerType)
      .filter(c => matchesAudience(c as PopupCampaign, ctx))
      .filter(c => isCooledDown(c))
      .filter(c => !shownThisSession(c))
      .filter(c => !triggeredCampaigns.current.has(c.id))

    if (eligible.length === 0) return

    const campaign = eligible[0]
    const delay = campaign.trigger.delay_ms ?? 0

    setTimeout(() => {
      if (semaphore.current) return
      semaphore.current = true
      triggeredCampaigns.current.add(campaign.id)
      recordShown(campaign.id)
      setActiveCampaign(campaign as PopupCampaign)
      setIsVisible(true)
    }, delay)
  }, [campaigns])

  // ── Exit intent trigger ─────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (e.clientY <= 0) tryTrigger("exit_intent")
    }
    document.addEventListener("mouseleave", handler)
    return () => document.removeEventListener("mouseleave", handler)
  }, [tryTrigger])

  // ── On load trigger ─────────────────────────────────────────────
  useEffect(() => {
    if (campaigns.length > 0) {
        tryTrigger("on_load")
    }
  }, [campaigns, tryTrigger])

  // ── Scroll stop trigger ─────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      if (scrollStopTimerRef.current) clearTimeout(scrollStopTimerRef.current)

      const stopCampaigns = campaigns.filter(c => c.trigger.type === "scroll_stop" && !triggeredCampaigns.current.has(c.id))
      if(stopCampaigns.length === 0) return;

      const minSeconds = stopCampaigns.reduce((min, c) => {
        return Math.min(min, c.trigger.scroll_stop_seconds ?? 25)
      }, Infinity)

      if(minSeconds === Infinity) return;

      scrollStopTimerRef.current = setTimeout(() => {
        tryTrigger("scroll_stop")
      }, minSeconds * 1000)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (scrollStopTimerRef.current) clearTimeout(scrollStopTimerRef.current)
    }
  }, [campaigns, tryTrigger])

  // ── Scroll depth trigger ────────────────────────────────────────
  useEffect(() => {
    const depthCampaigns = campaigns.filter(c => c.trigger.type === "scroll_depth");

    if (depthCampaigns.length > 0 && userContext.scrollDepth > 0) {
        depthCampaigns.forEach(c => {
            const target = c.trigger.scroll_depth_percent ?? 50;
            if (userContext.scrollDepth >= target) {
                tryTrigger("scroll_depth");
            }
        });
    }
  }, [userContext.scrollDepth, campaigns, tryTrigger]);

  // ── Time on page trigger ────────────────────────────────────────
  useEffect(() => {
    const timeCampaigns = campaigns.filter(c => c.trigger.type === "time_on_page")
    const timeTimers = timeCampaigns.map(c => {
      const ms = (c.trigger.time_on_page_seconds ?? 30) * 1000
      return setTimeout(() => tryTrigger("time_on_page"), ms)
    })

    return () => {
      timeTimers.forEach(clearTimeout)
    }
  }, [campaigns, tryTrigger])


  const dismiss = useCallback(() => {
    if (activeCampaign) recordDismiss(activeCampaign)
    setIsVisible(false)
    setTimeout(() => {
      setActiveCampaign(null)
      semaphore.current = false
    }, 350)
  }, [activeCampaign])

  const recordEmailCapture = useCallback(() => {
    try { localStorage.setItem(EMAIL_CAPTURED_KEY, "1") } catch {}
    setUserContext(prev => ({ ...prev, emailCaptured: true }))
  }, [])

  return {
    state: { activeCampaign, userContext, isVisible },
    dismiss,
    recordEmailCapture
  }
}
