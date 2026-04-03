import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { verifyAdminRequest } from "@/lib/admin-auth";

export async function POST(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check authentication & admin status
  const auth = await verifyAdminRequest();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status });
  }

  const orderId = params.id;

  // Use service role for admin operations
  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  try {
    // 1. Fetch full order details including items and products
    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (
          quantity, size, unit_price,
          product:products (name)
        )
      `)
      .eq('id', orderId)
      .single();

    if (fetchError || !order) throw new Error("Order not found");

    // 2. Fetch customer email from Auth
    const { data: { user: authUser } } = await supabaseAdmin.auth.admin.getUserById(order.user_id);
    const toEmail = authUser?.email || order.shipping_email;

    if (!toEmail) throw new Error("Customer email not found");

    // 3. Trigger Resend
    const emailResult = await sendOrderConfirmationEmail({
      to: toEmail,
      orderId: order.id,
      displayOrderId: order.order_number,
      orderItems: (order.order_items || []).map((i: any) => ({
        name: (i as any).product?.name || "HAXEUS Piece",
        size: i.size,
        quantity: i.quantity,
        price: i.unit_price,
      })),
      subtotal: order.subtotal_amount ?? order.total_amount,
      shipping: order.shipping_amount ?? 0,
      discount: order.discount_amount ?? 0,
      total: order.total_amount,
      shippingAddress: {
        name: order.shipping_name,
        addressLine1: order.shipping_address?.address_1 || "",
        city: order.shipping_address?.city || "",
        pincode: order.shipping_address?.pincode || "",
      },
    });

    if (!emailResult.success) throw new Error(emailResult.error || "Failed to send email");

    // 4. Update order tracking
    await supabaseAdmin.from('orders').update({
      confirmation_email_sent: true,
      confirmation_email_sent_at: new Date().toISOString(),
      confirmation_email_resend_id: emailResult.id
    }).eq('id', orderId);

    return NextResponse.json({ success: true, resend_id: emailResult.id });

  } catch (err: any) {
    console.error("[admin-resend] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
