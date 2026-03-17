import { NextResponse } from "next/server";
import { invalidate } from "@/lib/redis";
import type { PopupCampaign } from "@/types/popup";
import { requireAdminRoute } from "@/lib/admin-route";

export const revalidate = 0;

async function getCampaigns(supabaseAdmin: any): Promise<PopupCampaign[]> {
    const { data, error } = await supabaseAdmin
        .from("store_settings")
        .select("value")
        .eq("key", "popup_campaigns")
        .maybeSingle();

    if (error || !data || !Array.isArray(data.value)) {
        return [];
    }
    return data.value as PopupCampaign[];
}

async function saveCampaigns(supabaseAdmin: any, campaigns: PopupCampaign[]) {
    const { error } = await supabaseAdmin
        .from("store_settings")
        .update({ value: campaigns })
        .eq("key", "popup_campaigns");

    if (error) throw error;

    await invalidate("popup_campaigns");
}

export async function POST(request: Request) {
    const { supabaseAdmin, errorResponse } = await requireAdminRoute();
    if (errorResponse) return errorResponse;

    try {
        const { ordered_ids } = await request.json();
        if (!Array.isArray(ordered_ids)) {
            return NextResponse.json({ error: "Invalid payload: ordered_ids must be an array" }, { status: 400 });
        }

        const campaigns = await getCampaigns(supabaseAdmin);
        
        // Create a map for quick lookup
        const campaignMap = new Map(campaigns.map(c => [c.id, c]));

        // Rebuild the array in the new order
        const reorderedCampaigns = ordered_ids
            .map((id, index) => {
                const campaign = campaignMap.get(id);
                if (campaign) {
                    return { ...campaign, sort_order: index };
                }
                return null;
            })
            .filter((c): c is PopupCampaign => c !== null);
        
        // Check if any campaigns were missing (optional but good practice)
        if (reorderedCampaigns.length !== campaigns.length) {
            console.warn("Warning: Mismatch in campaign count during reorder. Some IDs may have been invalid.");
        }

        await saveCampaigns(supabaseAdmin, reorderedCampaigns);

        return NextResponse.json({ success: true, campaigns: reorderedCampaigns });

    } catch (error) {
        console.error("Error in POST /api/admin/popups/reorder:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
