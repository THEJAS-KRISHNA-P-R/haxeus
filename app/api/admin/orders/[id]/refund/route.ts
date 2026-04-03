import { NextRequest, NextResponse } from "next/server"
import { verifyAdminRequest } from "@/lib/admin-auth"
import { getSupabaseAdmin } from "@/lib/supabase-admin"
import { razorpay } from "@/lib/razorpay"

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await verifyAdminRequest()

    if (!auth.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // 1. Fetch order details
    const { data: order, error: fetchError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", id)
      .single()

    if (fetchError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (!order.razorpay_payment_id) {
      return NextResponse.json({ error: "No payment ID found for this order" }, { status: 400 })
    }

    if (order.status === "refunded") {
      return NextResponse.json({ error: "Order already refunded" }, { status: 400 })
    }

    // 2. Trigger Razorpay Refund
    // Amount is total_amount (INR) * 100 to get Paise
    const refundAmountPaise = Math.round(Number(order.total_amount) * 100)

    console.log(`[admin-refund] Initiating refund for order ${id}, payment ${order.razorpay_payment_id}, amount ${refundAmountPaise} paise`)

    try {
      await (razorpay as any).refunds.create({
        payment_id: order.razorpay_payment_id,
        amount: refundAmountPaise,
        notes: {
          reason: "Admin initiated refund from HAXEUS dashboard",
          order_id: order.id,
        }
      })
    } catch (rzpErr: any) {
      console.error("[admin-refund] Razorpay error:", rzpErr)
      return NextResponse.json({ 
        error: rzpErr.description || "Razorpay refund failed. Check if payment is already refunded or too old." 
      }, { status: 400 })
    }

    // 3. Update Supabase status
    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        status: "refunded",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (updateError) {
      console.error("[admin-refund] DB update error:", updateError)
      // The refund already happened in Razorpay, so this is a critical sync issue
      return NextResponse.json({ 
        success: true, 
        warning: "Refund successful in Razorpay but DB update failed. Manual status change required." 
      })
    }

    return NextResponse.json({ success: true, status: "refunded" })

  } catch (err) {
    console.error("[admin-refund] Internal error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
