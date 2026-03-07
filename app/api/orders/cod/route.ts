import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies()

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll: () => cookieStore.getAll(),
                    setAll: (cookiesToSet) => {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    },
                },
            }
        )

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
        }

        const body = await req.json()
        const { items, shippingAddressId, paymentMethod } = body

        if (!["cod", "online"].includes(paymentMethod)) {
            return NextResponse.json({ error: "Invalid payment method" }, { status: 400 })
        }

        if (!items?.length || !shippingAddressId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Verify address belongs to this user
        const { data: address } = await supabase
            .from("user_addresses")
            .select("*")
            .eq("id", shippingAddressId)
            .eq("user_id", user.id)
            .maybeSingle()

        if (!address) {
            return NextResponse.json({ error: "Invalid shipping address" }, { status: 400 })
        }

        // Server-side price calculation — never trust client total
        const productIds = items.map((i: any) => i.product?.id ?? i.productId)
        const { data: products } = await supabase
            .from("products")
            .select("id, price, name")
            .in("id", productIds)

        if (!products?.length) {
            return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
        }

        for (const item of items) {
            if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) {
                return NextResponse.json({ error: "Invalid quantity" }, { status: 400 })
            }
        }

        let subtotal = 0
        const orderItems = items.map((item: any) => {
            const productId = item.product?.id ?? item.productId
            const product = products.find((p) => String(p.id) === String(productId))
            if (!product) throw new Error(`Product not found: ${productId}`)
            subtotal += product.price * item.quantity
            return {
                product_id: productId,
                quantity: item.quantity,
                size: item.size ?? null,
                unit_price: product.price,
            }
        })

        const shippingFee = subtotal > 2000 ? 0 : 150
        const serverTotal = subtotal + shippingFee

        // Stock check
        for (const item of items) {
            const productId = item.product?.id ?? item.productId
            const { data: inventory } = await supabase
                .from("product_inventory")
                .select("quantity")
                .eq("product_id", productId)
                .maybeSingle()

            const available = inventory?.quantity ?? 0
            const product = products.find((p) => String(p.id) === String(productId))
            if (available < item.quantity) {
                return NextResponse.json({
                    error: `"${product?.name}" only has ${available} left in stock`,
                }, { status: 400 })
            }
        }

        // Use service role to insert (bypasses RLS — safe, auth verified above)
        const supabaseAdmin = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { cookies: { getAll: () => [], setAll: () => { } } }
        )

        const { data: order, error: orderError } = await supabaseAdmin
            .from("orders")
            .insert({
                user_id: user.id,
                total_amount: serverTotal,
                subtotal_amount: subtotal,
                shipping_amount: shippingFee,
                status: "pending",
                shipping_address_id: shippingAddressId,
                payment_method: paymentMethod,
            })
            .select("id")
            .single()

        if (orderError || !order) {
            console.error("[cod-order] Order insert error:", { message: orderError?.message, code: orderError?.code })
            return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
        }

        const { error: itemsError } = await supabaseAdmin
            .from("order_items")
            .insert(orderItems.map((item: any) => ({ ...item, order_id: order.id })))

        if (itemsError) {
            console.error("[cod-order] Order items error:", itemsError?.message)
            return NextResponse.json({ error: "Failed to create order items" }, { status: 500 })
        }

        // Clear DB cart
        await supabaseAdmin.from("cart_items").delete().eq("user_id", user.id)

        return NextResponse.json({ success: true, orderId: order.id })
    } catch (err: any) {
        console.error("[cod-order]", { message: err?.message })
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
