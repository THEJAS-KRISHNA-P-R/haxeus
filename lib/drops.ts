import "server-only"

import { createClient } from "@/lib/supabase-server"
import type { ActiveDrop } from "@/types/drops"

export async function getActiveDrop(): Promise<ActiveDrop | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("drops")
      .select("id, name, description, target_date, is_active, product_ids")
      .eq("is_active", true)
      .order("target_date", { ascending: true })
      .limit(1)
      .maybeSingle()

    if (error || !data) {
      return null
    }

    return data as ActiveDrop
  } catch {
    return null
  }
}
