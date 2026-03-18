import { NextResponse } from "next/server"
import { verifyAdminRequest } from "@/lib/admin-auth"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  try {
    const auth = await verifyAdminRequest()
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const supabaseAdmin = getSupabaseAdmin()


    const { data: buckets, error } = await supabaseAdmin.storage.listBuckets()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ buckets })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}
