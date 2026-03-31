import { NextResponse } from "next/server";
import { cached } from "@/lib/redis";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { PromoPopup } from "@/types/promo-popup";

export const revalidate = 0;

async function getPromoPopups() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("store_settings")
    .select("value")
    .eq("key", "promo_popups")
    .maybeSingle();

  if (error || !data || !Array.isArray(data.value)) {
    return [] as PromoPopup[];
  }
  return data.value as PromoPopup[];
}

export async function GET() {
  try {
    const popups = await cached<PromoPopup[]>(
      "promo_popups:public",
      30,
      getPromoPopups
    );

    const enabledPopups = popups.filter((p) => p.enabled);

    return NextResponse.json(enabledPopups);
  } catch (error) {
    console.error("Error fetching promo popups:", error);
    return NextResponse.json([]);
  }
}
