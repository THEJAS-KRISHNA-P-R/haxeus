import { sendOrderConfirmationEmail } from "@/lib/email"

interface OrderCompletionProps {
  orderId: string
  razorpayPaymentId: string
  razorpaySignature: string
  supabaseAdmin: any // Service role client
  eventId?: string // For webhook idempotency tracking
}

/**
 * Handles the idempotent completion of an order after payment verification.
 * Aligned with Section 2 production-grade requirements.
 */
export async function completeOrder({
  orderId,
  razorpayPaymentId,
  razorpaySignature,
  supabaseAdmin,
  eventId,
}: OrderCompletionProps) {
  // ── 1. Fetch current order state ───────────────────────────────────────────
  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .select(`
      *,
      order_items(*)
    `)
    .eq("id", orderId)
    .single()

  if (orderError || !order) {
    throw new Error(`Order ${orderId} not found`)
  }

  // Idempotency: If already confirmed, skip logic but return success
  if (order.status !== "pending") {
    return { success: true, alreadyProcessed: true }
  }

  // ── 2. Update Order Status ────────────────────────────────────────────────
  const { error: updateError } = await supabaseAdmin
    .from("orders")
    .update({
      status: "confirmed",
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
      razorpay_event_id: eventId,
      payment_captured_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .eq("status", "pending") // Atomic check

  if (updateError) {
    throw new Error(`Failed to update order ${orderId}: ${updateError.message}`)
  }

  // ── 3. Atomic Inventory Decrement & Fetch Details for Email ────────────────
  const { data: items } = await supabaseAdmin
    .from("order_items")
    .select("product_id, quantity, size, unit_price, product:products(name, front_image)")
    .eq("order_id", orderId)

  if (items) {
    for (const item of items) {
      try {
        await supabaseAdmin.rpc("decrement_inventory_rpc", {
          p_product_id: item.product_id,
          p_size: item.size,
          p_quantity: item.quantity,
        })
      } catch (err) {
        console.error(`[inventory] Failed to decrement for ${item.product_id}:`, err)
        // Log for manual resolution but don't fail the order completion
      }
    }
  }

  // ── 4. Clear User's Cart ──────────────────────────────────────────────────
  if (order.user_id) {
    await supabaseAdmin
      .from("cart_items")
      .delete()
      .eq("user_id", order.user_id)
  }

  // ── 5. Coupon Usage Increment ─────────────────────────────────────────────
  if (order.coupon_code) {
    await supabaseAdmin.rpc("increment_coupon_usage", { p_coupon_code: order.coupon_code })
  }

  // ── 6. Async Side Effects (Email) ──────────────────────────────────────────
  try {
    const emailResult = await sendOrderConfirmationEmail({
      to: order.shipping_email || "customer@haxeus.in",
      orderId: order.id, // Strictly use UUID for idempotency
      displayOrderId: order.order_number,
      orderItems: (items || []).map((item: any) => ({
        name: item.product?.name || "HAXEUS Piece",
        size: item.size,
        quantity: item.quantity,
        price: item.unit_price || 0,
      })),
      subtotal: order.subtotal || 0,
      shipping: order.shipping_amount ?? 0,
      discount: order.discount_amount || 0,
      total: order.total_amount || 0,
      shippingAddress: {
        name: order.shipping_name || "Customer",
        addressLine1: order.shipping_address?.address_1 || "",
        city: order.shipping_address?.city || "",
        pincode: order.shipping_address?.pincode || "",
      },
    })

    if (emailResult.success) {
      await supabaseAdmin
        .from("orders")
        .update({
          confirmation_email_sent: true,
          confirmation_email_sent_at: new Date().toISOString(),
          confirmation_email_resend_id: emailResult.id,
        })
        .eq("id", orderId)
    }
  } catch (emailErr) {
    console.error(`[email] Failed to send for order ${order.id}:`, emailErr)
  }

  return { success: true, order: { ...order, order_items: items } }
}
