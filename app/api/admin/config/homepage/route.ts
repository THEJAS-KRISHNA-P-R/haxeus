import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { deepMerge } from "@/lib/deep-merge";
import { DEFAULT_HOMEPAGE_CONFIG } from "@/lib/homepage-defaults";
import { invalidate } from "@/lib/redis";
import type { HomepageConfig } from "@/types/homepage";

export async function PATCH(request: Request) {
  const cookieStore = await cookies();

  // ── Cookie-based client for auth check ──
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  // ── Service role client for DB ops ──
  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { data: roleData } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (!roleData) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const body = await request.json();

    const { data: existingData } = await supabaseAdmin
      .from("store_settings")
      .select("value")
      .eq("key", "homepage_config")
      .maybeSingle();

    const existingConfig = existingData?.value as HomepageConfig || DEFAULT_HOMEPAGE_CONFIG;

    const newConfig = deepMerge(existingConfig, body);
    newConfig._version = (existingConfig._version || 1) + 1;
    newConfig._updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("store_settings")
      .upsert({ key: "homepage_config", value: newConfig })
      .select()
      .single();

    if (error) {
      throw error;
    }

    await invalidate("config:homepage");

    return NextResponse.json({ success: true, config: data.value });
  } catch (error) {
    console.error("Error updating homepage config:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
