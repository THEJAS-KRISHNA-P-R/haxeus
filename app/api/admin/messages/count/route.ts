import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { verifyAdminRequest } from "@/lib/admin-auth"

export async function GET() {
  try {
    const auth = await verifyAdminRequest()
    if (!auth.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    )

    const { count, error } = await supabaseAdmin
      .from('contact_messages')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'unread')

    if (error) {
       // If table doesn't exist yet, return 0 instead of error
       return NextResponse.json({ count: 0 })
    }

    return NextResponse.json({ count: count ?? 0 })
  } catch (err) {
    console.error("[api/admin/messages/count]", err)
    return NextResponse.json({ count: 0 })
  }
}
