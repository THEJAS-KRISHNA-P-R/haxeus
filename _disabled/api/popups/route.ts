import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { cached } from "@/lib/redis";
import { DEFAULT_POPUP_CAMPAIGNS } from "@/lib/popup-defaults";
import type { PopupCampaign } from "@/types/popup";

export const revalidate = 0;

async function getPopupCampaigns() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("store_settings")
    .select("value")
    .eq("key", "popup_campaigns")
    .maybeSingle();

  if (error || !data || !Array.isArray(data.value) || data.value.length === 0) {
    return DEFAULT_POPUP_CAMPAIGNS;
  }
  return data.value as PopupCampaign[];
}

export async function GET() {
  try {
    const campaigns = await cached<PopupCampaign[]>(
      "popup_campaigns",
      30,
      getPopupCampaigns
    );

    const enabledCampaigns = campaigns.filter((c) => c.enabled);

    const sanitizedCampaigns = enabledCampaigns.map(({ security, ...rest }) => rest);

    const sortedCampaigns = sanitizedCampaigns.sort(
      (a, b) => a.sort_order - b.sort_order
    );

    return NextResponse.json(sortedCampaigns);
  } catch (error) {
    console.error("Error fetching popup campaigns:", error);
    const sanitizedDefaults = DEFAULT_POPUP_CAMPAIGNS
        .filter(c => c.enabled)
        .map(({ security, ...rest }) => rest)
        .sort((a, b) => a.sort_order - b.sort_order);

    return NextResponse.json(sanitizedDefaults);
  }
}
