import { NextResponse } from "next/server";

import { DEFAULT_HOMEPAGE_CONFIG } from "@/lib/homepage-defaults";
import { invalidate } from "@/lib/redis";

import { verifyAdminRequest } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST() {
  const auth = await verifyAdminRequest();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabaseAdmin = getSupabaseAdmin();

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
