import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { requireAdmin, getAdminEmail } from "@/lib/admin";
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET() {
    try {
        const auth = await verifyAdminRequest();
        if (!auth.authorized) {
            return NextResponse.json({ authorized: false }, { status: auth.status });
        }

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

        const email = await getAdminEmail(user.id)

        return NextResponse.json({
            authorized: true,
            email: email ?? user.email ?? "admin",
        })
    } catch {
        return NextResponse.json({ authorized: false }, { status: 500 })
    }
}

