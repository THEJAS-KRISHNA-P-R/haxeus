import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"

export async function GET() {
  try {
    const cookieStore = await cookies()
    
    // Cookie client for auth check
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll() } }
    )

    // Service role for storage
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    )

    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const isAdmin = await requireAdmin(user.id)
    if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { data: buckets, error } = await supabaseAdmin.storage.listBuckets()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ buckets })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}
