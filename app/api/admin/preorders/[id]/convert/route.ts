import { NextResponse } from "next/server";
import { invalidate } from "@/lib/redis";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const auth = await verifyAdminRequest();
    if (!auth.authorized) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = getSupabaseAdmin();


    const { id: preorderId } = await props.params;
    const { initial_stock_per_size = 0 } = await request.json();

    // 1. Fetch preorder item
    const { data: preorderItem, error: fetchError } = await supabase
        .from("preorder_items")
        .select("*")
        .eq("id", preorderId)
        .single();

    if (fetchError || !preorderItem) {
        return new NextResponse("Preorder item not found", { status: 404 });
    }
    if (preorderItem.status === 'converted') {
        return NextResponse.json({ error: "already_converted" }, { status: 400 });
    }

    // 2. Create product
    const { data: newProduct, error: productError } = await supabase
        .from("products")
        .insert({
            name: preorderItem.name,
            description: preorderItem.description,
            price: preorderItem.price,
            front_image: preorderItem.front_image,
            // other fields might need mapping
        })
        .select()
        .single();

    if (productError || !newProduct) {
        console.error("Failed to create product from preorder:", productError);
        return new NextResponse("Failed to create product", { status: 500 });
    }

    // 3. Create inventory
    const inventoryToInsert = preorderItem.sizes_available.map(size => ({
        product_id: newProduct.id,
        size,
        stock_quantity: initial_stock_per_size,
    }));

    const { error: inventoryError } = await supabase
        .from("product_inventory")
        .insert(inventoryToInsert);

    if (inventoryError) {
        console.error("Failed to create inventory for new product:", inventoryError);
        // Manual rollback
        await supabase.from("products").delete().eq("id", newProduct.id);
        return new NextResponse("Failed to create inventory", { status: 500 });
    }

    // 4. Update preorder item status
    const { error: updateError } = await supabase
        .from("preorder_items")
        .update({
            status: 'converted',
            converted_product_id: newProduct.id,
        })
        .eq("id", preorderId);

    if (updateError) {
        // This is tricky. The product is created. We should probably log this for manual review.
        console.error(`CRITICAL: Failed to update preorder item ${preorderId} to converted status after creating product ${newProduct.id}. Manual cleanup required.`);
        // Still, return success to the user as the main action (product creation) succeeded.
    }

    // 5. Invalidate caches
    await invalidate("preorders:public:list");
    await invalidate("products:all"); // Assuming a general products cache key

    return NextResponse.json({ success: true, product_id: newProduct.id });
}
