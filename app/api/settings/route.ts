import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

const DEFAULTS = { free_shipping_above: 1000, shipping_rate: 150 }

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() {},
        },
      }
    )

    const { data } = await supabase
      .from("store_settings")
      .select("key, value")
      .in("key", ["free_shipping_above", "shipping_rate"])

    const out = { ...DEFAULTS }
    if (data) {
      for (const row of data) {
        let val: number
        try {
          val = typeof row.value === "string" ? Number(JSON.parse(row.value)) : Number(row.value)
        } catch {
          val = Number(row.value)
        }
        if (!isNaN(val)) {
          if (row.key === "free_shipping_above") out.free_shipping_above = val
          if (row.key === "shipping_rate") out.shipping_rate = val
        }
      }
    }
    return NextResponse.json(out)
  } catch (error) {
    console.error("[settings] Error:", error)
    return NextResponse.json(DEFAULTS)
  }
}
