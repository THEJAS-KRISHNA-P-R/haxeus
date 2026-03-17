import { NextResponse } from "next/server";
import { invalidate } from "@/lib/redis";
import { requireAdminRoute } from "@/lib/admin-route";
import type { PromoPopup } from "@/types/promo-popup";

export async function GET() {
  const { supabaseAdmin, errorResponse } = await requireAdminRoute();
  if (errorResponse) return errorResponse;

  const { data, error } = await supabaseAdmin
    .from("store_settings")
    .select("value")
    .eq("key", "promo_popups")
    .maybeSingle();

  if (error) {
    console.error("Error fetching promo popups:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }

  return NextResponse.json(data?.value || []);
}

export async function POST(request: Request) {
  const { supabaseAdmin, errorResponse } = await requireAdminRoute();
  if (errorResponse) return errorResponse;

  const body = await request.json();
  const newPopup: PromoPopup = {
    ...body,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data: currentData, error: fetchError } = await supabaseAdmin
    .from("store_settings")
    .select("value")
    .eq("key", "promo_popups")
    .maybeSingle();

  if (fetchError) {
    console.error("Error fetching current promo popups:", fetchError);
    return new NextResponse("Internal Server Error", { status: 500 });
  }

  const currentPopups = Array.isArray(currentData?.value) ? currentData.value : [];
  const updatedPopups = [...currentPopups, newPopup];

  const { error: updateError } = await supabaseAdmin
    .from("store_settings")
    .upsert({ key: "promo_popups", value: updatedPopups });

  if (updateError) {
    console.error("Error updating promo popups:", updateError);
    return new NextResponse("Internal Server Error", { status: 500 });
  }

  await invalidate("promo_popups:public");

  return NextResponse.json(newPopup, { status: 201 });
}
