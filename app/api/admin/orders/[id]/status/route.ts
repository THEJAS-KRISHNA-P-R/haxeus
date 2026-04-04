import { NextRequest, NextResponse } from "next/server"
import { verifyAdminRequest } from "@/lib/admin-auth"
import { getSupabaseAdmin } from "@/lib/supabase-admin"
import { sendShippingUpdateEmail } from "@/lib/email"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await verifyAdminRequest()

    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status })
    }

    const { status } = await req.json()
    const supabaseAdmin = getSupabaseAdmin()

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    // 1. Fetch current order to get customer info for email
    const { data: order, error: fetchError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", id)
      .single()

    if (fetchError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // 2. Perform Update
    const normalizedStatus = status.toLowerCase()
    const isDelivered = normalizedStatus === "delivered"
    const timestamp = new Date().toISOString()

    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        status: normalizedStatus,
        delivered_at: isDelivered ? timestamp : order.delivered_at,
        updated_at: timestamp,
      })
      .eq("id", id)

    if (updateError) {
      console.error("[admin-status] Update error:", updateError)
      return NextResponse.json({ error: "Failed to update order status" }, { status: 500 })
    }

    // 3. Trigger Email (Async)
    // We only send updates for specific statuses to avoid spamming
    const emailStatuses = ["confirmed", "shipped", "delivered", "cancelled"]
    if (emailStatuses.includes(normalizedStatus)) {
      try {
        await sendShippingUpdateEmail({
          orderId: order.id,
          customerEmail: order.shipping_email || order.email || "customer@haxeus.in",
          customerName: order.shipping_name || "Customer",
          status: normalizedStatus as any,
        })
      } catch (emailErr) {
        console.error("[admin-status] Email trigger failed:", emailErr)
        // We don't fail the request if email fails
      }
    }

    return NextResponse.json({ success: true, status, delivered_at: isDelivered ? timestamp : null })
  } catch (err) {
    console.error("[admin-status] Internal error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
