import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { requireAdmin, getAdminEmail } from "@/lib/admin"

export async function GET() {
    try {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { cookies: { getAll: () => cookieStore.getAll() } }
        )

        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) {
            return NextResponse.json({ authorized: false }, { status: 401 })
        }

        const isAdmin = await requireAdmin(user.id)
        if (!isAdmin) {
            return NextResponse.json({ authorized: false }, { status: 403 })
        }

        const email = await getAdminEmail(user.id)

        return NextResponse.json({
            authorized: true,
            email: email ?? user.email ?? "admin",
        })
    } catch {
        return NextResponse.json({ authorized: false }, { status: 500 })
    }
}
