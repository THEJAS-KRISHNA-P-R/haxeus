import { NextResponse } from "next/server";
import { invalidate } from "@/lib/redis";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { PromoPopup } from "@/types/promo-popup";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await verifyAdminRequest();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabaseAdmin = getSupabaseAdmin();


  const { id } = await params;
  const updates = await request.json();

  const { data: currentData, error: fetchError } = await supabaseAdmin
    .from("store_settings")
    .select("value")
    .eq("key", "promo_popups")
    .maybeSingle();

  if (fetchError) {
    console.error("Error fetching promo popups for update:", fetchError);
    return new NextResponse("Internal Server Error", { status: 500 });
  }

  const popups: PromoPopup[] = Array.isArray(currentData?.value) ? currentData.value : [];
  const index = popups.findIndex((p) => p.id === id);

  if (index === -1) {
    return new NextResponse("Popup not found", { status: 404 });
  }

  popups[index] = {
    ...popups[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  const { error: updateError } = await supabaseAdmin
    .from("store_settings")
    .upsert({ key: "promo_popups", value: popups });

  if (updateError) {
    console.error("Error updating promo popup:", updateError);
    return new NextResponse("Internal Server Error", { status: 500 });
  }

  await invalidate("promo_popups:public");

  return NextResponse.json(popups[index]);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await verifyAdminRequest();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabaseAdmin = getSupabaseAdmin();


  const { id } = await params;

  const { data: currentData, error: fetchError } = await supabaseAdmin
    .from("store_settings")
    .select("value")
    .eq("key", "promo_popups")
    .maybeSingle();

  if (fetchError) {
    console.error("Error fetching promo popups for deletion:", fetchError);
    return new NextResponse("Internal Server Error", { status: 500 });
  }

  const popups: PromoPopup[] = Array.isArray(currentData?.value) ? currentData.value : [];
  const updatedPopups = popups.filter((p) => p.id !== id);

  const { error: updateError } = await supabaseAdmin
    .from("store_settings")
    .upsert({ key: "promo_popups", value: updatedPopups });

  if (updateError) {
    console.error("Error deleting promo popup:", updateError);
    return new NextResponse("Internal Server Error", { status: 500 });
  }

  await invalidate("promo_popups:public");

  return new NextResponse(null, { status: 204 });
}
