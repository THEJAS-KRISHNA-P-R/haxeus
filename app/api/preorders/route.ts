import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { cached } from "@/lib/redis";

export const revalidate = 0;

async function getPublicPreorders() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("products")
        .select(`
            id, name, price, description, front_image,
            is_preorder, preorder_status, expected_date,
            max_preorders, preorder_count,
            product_images (image_url, is_primary, display_order)
        `)
        .eq("is_preorder", true)
        .in("preorder_status", ["active", "sold_out"])
        .order("id");

    if (error) {
        console.error("Error fetching public preorders:", error);
        return [];
    }
    return data;
}

export async function GET() {
    try {
        const items = await cached(
            "preorders:public:list",
            60,
            getPublicPreorders
        );
        return NextResponse.json(items);
    } catch (error) {
        return NextResponse.json([], { status: 500 });
    }
}
