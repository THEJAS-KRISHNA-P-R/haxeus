import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function requireAdminRoute() {
  const cookieStore = await cookies()

  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
      },
    }
  )

  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  )

  const {
    data: { user },
  } = await supabaseAuth.auth.getUser()

  if (!user) {
    return {
      supabaseAdmin,
      user: null,
      errorResponse: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }

  const { data: roleData } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle()

  if (!roleData) {
    return {
      supabaseAdmin,
      user,
      errorResponse: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    }
  }

  return {
    supabaseAdmin,
    user,
    errorResponse: null,
  }
}