import { NextResponse } from "next/server";

import { deepMerge } from "@/lib/deep-merge";
import { DEFAULT_HOMEPAGE_CONFIG } from "@/lib/homepage-defaults";
import { invalidate } from "@/lib/redis";
import type { HomepageConfig } from "@/types/homepage";

import { verifyAdminRequest } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function PATCH(request: Request) {
  const auth = await verifyAdminRequest();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabaseAdmin = getSupabaseAdmin();

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
