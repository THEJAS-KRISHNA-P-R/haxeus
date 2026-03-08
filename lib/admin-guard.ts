import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/admin"

export async function verifyAdmin() {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => cookieStore.getAll() } }
    )

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        redirect("/auth")
    }

    const isAdmin = await requireAdmin(user.id)
    if (!isAdmin) {
        redirect("/")
    }

    return user
}
