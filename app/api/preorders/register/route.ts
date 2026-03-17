import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
    const supabase = await createClient();
    const body = await request.json();
    const { email, name, size } = body;

    // Coerce and validate product_id as a positive integer
    const product_id = parseInt(body.product_id, 10);
    if (!product_id || isNaN(product_id) || product_id <= 0) {
        return new NextResponse("Invalid input", { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return new NextResponse("Invalid input", { status: 400 });
    }

    // 1. Fetch item and check status — use maybeSingle() to avoid throws on missing row
    const { data: item, error: itemError } = await supabase
        .from("products")
        .select("is_preorder, preorder_status, max_preorders, preorder_count")
        .eq("id", product_id)
        .eq("is_preorder", true)   // validate it's actually a preorder product
        .maybeSingle();

    if (itemError || !item) {
        return new NextResponse("Pre-order product not found", { status: 404 });
    }
    if (!item.is_preorder || item.preorder_status !== 'active') {
        return NextResponse.json({ error: "not_active" }, { status: 409 });
    }
    if (item.max_preorders && item.preorder_count >= item.max_preorders) {
        return NextResponse.json({ error: "sold_out" }, { status: 409 });
    }

    // 2. Check for duplicate registration
    const { data: existingReg, error: existingRegError } = await supabase
        .from("preorder_registrations")
        .select("id")
        .eq("product_id", product_id)
        .eq("email", email)
        .maybeSingle();

    if (existingReg) {
        return NextResponse.json({ error: "already_registered" }, { status: 409 });
    }

    // 3. Get user_id if logged in
    const { data: { user } } = await supabase.auth.getUser();

    // 4. Insert registration
    const { error: insertError } = await supabase
        .from("preorder_registrations")
        .insert({
            product_id,
            email,
            name,
            size,
            user_id: user?.id || null,
        });

    if (insertError) {
        console.error("Error inserting preorder registration:", insertError);
        return new NextResponse("Could not register", { status: 500 });
    }

    // 5. Increment count
    const { error: rpcError } = await supabase.rpc('increment_preorder_count', { p_product_id: product_id });

    if (rpcError) {
        // This is a critical error, might need to handle rollback manually if needed
        console.error("Error incrementing preorder count:", rpcError);
        // Don't expose detailed error to client
        return new NextResponse("Could not finalize registration", { status: 500 });
    }

    return NextResponse.json({ success: true });
}
