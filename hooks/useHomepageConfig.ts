"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase as supabaseClient } from "@/lib/supabase"
import { DEFAULT_HOMEPAGE_CONFIG } from "@/lib/homepage-defaults"
import type { HomepageConfig } from "@/types/homepage"
import { deepMerge } from "@/lib/deep-merge"

interface UseHomepageConfigReturn {
  config: HomepageConfig
  loading: boolean
  error: string | null
  updateConfig: (newConfig: HomepageConfig) => Promise<{ success: boolean, error: string | null }>
}

export function useHomepageConfig(): UseHomepageConfigReturn {
  const [config, setConfig] = useState<HomepageConfig>(DEFAULT_HOMEPAGE_CONFIG)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = supabaseClient

  const fetchConfig = useCallback(async (_signal?: AbortSignal) => {
    setLoading(true)
    try {
      const { data, error: fetchError } = await supabase
        .from("store_settings")
        .select("value")
        .eq("key", "homepage_config")
        .maybeSingle()

      if (fetchError) {
        throw fetchError
      }

      if (data?.value) {
        setConfig(deepMerge(DEFAULT_HOMEPAGE_CONFIG, data.value as any))
      } else {
        setConfig(DEFAULT_HOMEPAGE_CONFIG)
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return
      setError(err.message || "Failed to load config")
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    const controller = new AbortController()
    fetchConfig(controller.signal)
    return () => controller.abort()
  }, [fetchConfig])

  const updateConfig = useCallback(async (newConfig: HomepageConfig) => {
    try {
      const { error: updateError } = await supabase
        .from("store_settings")
        .update({ value: newConfig })
        .eq("key", "homepage_config")

      if (updateError) throw updateError

      // The realtime subscription will update the local state
      return { success: true, error: null }
    } catch (err: any) {
      return { success: false, error: err.message || "An unknown error occurred" }
    }
  }, [supabase])

  // REALTIME DISABLED — re-enable when needed
  /*
  useEffect(() => {
    const channel = supabase
      .channel("homepage_config_changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "store_settings",
          filter: `key=eq.homepage_config`
        },
        (payload) => {
          if (payload.new?.value) {
            setConfig(deepMerge(DEFAULT_HOMEPAGE_CONFIG, payload.new.value as any))
          }
        }
      )
      .subscribe((status, err) => {
        if (err) {
          setError('Realtime subscription failed');
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])
  */

  return { config, loading, error, updateConfig }
}
