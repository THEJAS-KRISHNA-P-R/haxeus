import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server";
import { DEFAULT_HOMEPAGE_CONFIG } from "@/lib/homepage-defaults";
import { invalidate } from "@/lib/redis";

export async function POST() {
  const cookieStore = await cookies();

  // ── Cookie-based client for auth check (reads session from cookies) ──
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  // ── Service role client for DB write (bypasses RLS) ──
  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  // 1. Auth check using cookie client
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: roleData } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (!roleData) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 2. Build the reset config with fresh timestamps
  const resetConfig = {
    ...DEFAULT_HOMEPAGE_CONFIG,
    _version: 1,
    _updated_at: new Date().toISOString(),
  };

  // 3. Upsert using service role client
  const { error } = await supabaseAdmin
    .from("store_settings")
    .upsert({ key: "homepage_config", value: resetConfig }, { onConflict: "key" });

  if (error) {
    return NextResponse.json(
      { error: "Database error", detail: error.message },
      { status: 500 }
    );
  }

  // 4. Bust Redis cache
  await invalidate("config:homepage");

  return NextResponse.json({ success: true, config: resetConfig });
}
