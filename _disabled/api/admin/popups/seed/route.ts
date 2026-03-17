import { NextResponse } from "next/server";
import { invalidate } from "@/lib/redis";
import { DEFAULT_POPUP_CAMPAIGNS } from "@/lib/popup-defaults";
import type { PopupCampaign } from "@/types/popup";
import { requireAdminRoute } from "@/lib/admin-route";

export const revalidate = 0;

export async function POST() {
    const { supabaseAdmin, errorResponse } = await requireAdminRoute();
    if (errorResponse) return errorResponse;

    try {
        // Check if campaigns already exist
        const { data, error: fetchError } = await supabaseAdmin
            .from("store_settings")
            .select("value")
            .eq("key", "popup_campaigns")
            .maybeSingle();

        if (fetchError) throw fetchError;

        const campaigns = data?.value as PopupCampaign[] | undefined;

        // Only seed if the array is empty or doesn't exist
        if (campaigns && campaigns.length > 0) {
            return NextResponse.json({ message: "Campaigns already exist. Seed not required." });
        }

        // Seed with default campaigns
        const { error: updateError } = await supabaseAdmin
            .from("store_settings")
            .update({ value: DEFAULT_POPUP_CAMPAIGNS })
            .eq("key", "popup_campaigns");

        if (updateError) throw updateError;

        await invalidate("popup_campaigns");

        return NextResponse.json({ success: true, message: "Default popup campaigns seeded." });

    } catch (error) {
        console.error("Error in POST /api/admin/popups/seed:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
