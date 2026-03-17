import { NextResponse } from "next/server";
import { invalidate } from "@/lib/redis";
import { v4 as uuidv4 } from "uuid";
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

async function getStats(supabaseAdmin: any) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const { count: captures_total, error: totalError } = await supabaseAdmin
        .from('popup_email_captures')
        .select('*', { count: 'exact', head: true });

    if (totalError) console.error("Error fetching total captures:", totalError);

    const { count: captures_today, error: todayError } = await supabaseAdmin
        .from('popup_email_captures')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayISO);
        
    if (todayError) console.error("Error fetching today's captures:", todayError);

    return {
        captures_today: captures_today ?? 0,
        captures_total: captures_total ?? 0,
    };
}


export async function GET() {
    const { supabaseAdmin, errorResponse } = await requireAdminRoute();
    if (errorResponse) return errorResponse;

    try {
        const campaigns = await getCampaigns(supabaseAdmin);
        const statsData = await getStats(supabaseAdmin);

        return NextResponse.json({
            campaigns: campaigns.sort((a, b) => a.sort_order - b.sort_order),
            stats: {
                total: campaigns.length,
                active: campaigns.filter(c => c.enabled).length,
                ...statsData,
            }
        });
    } catch (error) {
        console.error("Error in GET /api/admin/popups:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const { supabaseAdmin, errorResponse } = await requireAdminRoute();
    if (errorResponse) return errorResponse;

    try {
        const newCampaignData = await request.json();
        const currentCampaigns = await getCampaigns(supabaseAdmin);

        const newCampaign: PopupCampaign = {
            ...newCampaignData,
            id: uuidv4(),
            sort_order: currentCampaigns.length, // Append to the end
        };

        const updatedCampaigns = [...currentCampaigns, newCampaign];

        const { error } = await supabaseAdmin
            .from("store_settings")
            .update({ value: updatedCampaigns })
            .eq("key", "popup_campaigns");

        if (error) throw error;

        await invalidate("popup_campaigns");

        return NextResponse.json(newCampaign);
    } catch (error) {
        console.error("Error in POST /api/admin/popups:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
