import { NextResponse } from "next/server";
import { invalidate } from "@/lib/redis";
import { requireAdminRoute } from "@/lib/admin-route";

export async function GET(request: Request) {
    const { supabaseAdmin, errorResponse } = await requireAdminRoute();
    if (errorResponse) return errorResponse;

    const { data, error } = await supabaseAdmin.rpc('get_preorder_items_with_counts');

    if (error) {
        console.error("Error fetching admin preorder items:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const { supabaseAdmin, errorResponse } = await requireAdminRoute();
    if (errorResponse) return errorResponse;

    const body = await request.json();

    const sanitizedImages = Array.isArray(body.images)
        ? body.images.filter((image: unknown): image is string => typeof image === "string" && image.trim().length > 0)
        : []

    const sanitizedSizes = Array.isArray(body.sizes_available)
        ? body.sizes_available.filter((size: unknown): size is string => typeof size === "string" && size.trim().length > 0)
        : []

    if (!body.name || !body.price || body.price <= 0) {
        return new NextResponse("Missing required fields: name and price > 0", { status: 400 });
    }

    const { data, error } = await supabaseAdmin
        .from("preorder_items")
        .insert({
            name: body.name,
            description: body.description || null,
            price: body.price,
            original_price: body.original_price || null,
            front_image: body.front_image || null,
            images: sanitizedImages,
            sizes_available: sanitizedSizes,
            expected_date: body.expected_date || null,
            max_preorders: body.max_preorders || null,
            sort_order: body.sort_order || 0,
            status: body.status || 'active',
        })
        .select()
        .maybeSingle();

    if (error) {
        console.error("Error creating preorder item:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }

    await invalidate("preorders:public:list");

    return NextResponse.json(data, { status: 201 });
}
