import { NextRequest, NextResponse } from "next/server";
import { cached } from "@/lib/redis";
import { DEFAULT_HOMEPAGE_CONFIG } from "@/lib/homepage-defaults";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const revalidate = 0;

async function getHomepageConfig() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("store_settings")
    .select("value")
    .eq("key", "homepage_config")
    .maybeSingle();

  if (error || !data) {
    return DEFAULT_HOMEPAGE_CONFIG;
  }

  return { ...DEFAULT_HOMEPAGE_CONFIG, ...data.value };
}

export async function GET(_req: NextRequest) {
  try {
    const config = await cached(
      "config:homepage",
      30,
      getHomepageConfig
    );
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json(DEFAULT_HOMEPAGE_CONFIG);
  }
}
