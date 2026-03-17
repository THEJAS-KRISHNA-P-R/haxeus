import { NextResponse } from "next/server";
import { invalidate } from "@/lib/redis";
import { requireAdminRoute } from "@/lib/admin-route";

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { supabaseAdmin, errorResponse } = await requireAdminRoute();
    if (errorResponse) return errorResponse;

    const { id } = params;
    const body = await request.json();

    // 1. Fetch item to check status
    const { data: item, error: fetchError } = await supabaseAdmin
        .from("preorder_items")
        .select("status")
        .eq("id", id)
        .maybeSingle();

    if (fetchError || !item) {
        return new NextResponse("Not Found", { status: 404 });
    }

    if (item.status === 'converted') {
        return NextResponse.json({ error: "converted_items_are_immutable" }, { status: 400 });
    }
    if (body.status === 'converted') {
        return NextResponse.json({ error: "cannot_set_converted_via_patch" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
        .from("preorder_items")
        .update(body)
        .eq("id", id)
        .select()
        .maybeSingle();

    if (error) {
        console.error(`Error updating preorder item ${id}:`, error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }

    await invalidate("preorders:public:list");

    return NextResponse.json(data);
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { supabaseAdmin, errorResponse } = await requireAdminRoute();
    if (errorResponse) return errorResponse;

    const { id } = params;

    const { error } = await supabaseAdmin
        .from("preorder_items")
        .delete()
        .eq("id", id);

    if (error) {
        console.error(`Error deleting preorder item ${id}:`, error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }

    await invalidate("preorders:public:list");

    return new NextResponse(null, { status: 204 });
}
