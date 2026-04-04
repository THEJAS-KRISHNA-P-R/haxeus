import { sendOrderConfirmationEmail } from "@/lib/email"

interface OrderCompletionProps {
  orderId?: string // Optional if order already exists (legacy)
  intentData?: any // New: Full order metadata for creation-on-success
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
  supabaseAdmin: any // Service role client
  eventId?: string // For webhook idempotency tracking
}

/**
 * Handles the idempotent completion of an order after payment verification.
 * Supports the 'Pristine Orders' flow (Creation-on-Success).
 */
export async function completeOrder({
  orderId,
  intentData,
  razorpayOrderId,
  razorpayPaymentId,
  supabaseAdmin,
}: OrderCompletionProps) {
  
  let finalOrderId = orderId;
  let orderToProcess = null;

  // ── 1. Idempotency Check & Order Retrieval/Creation ──────────────────────────
  const { data: existingOrder } = await supabaseAdmin
    .from("orders")
    .select("*, order_items(*)")
    .eq("razorpay_order_id", razorpayOrderId)
    .maybeSingle();

  if (existingOrder) {
    if (existingOrder.status !== "pending") {
      return { success: true, alreadyProcessed: true, order: existingOrder };
    }
    finalOrderId = existingOrder.id;
    orderToProcess = existingOrder;
  } else if (intentData) {
    // ── 2. Atomic Order Creation (First appearance in DB) ───────────────────
    const { data: newOrder, error: createError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: intentData.user_id,
        status: "confirmed", // Created directly as confirmed
        subtotal_amount: intentData.order_data.subtotal,
        shipping_amount: intentData.order_data.shipping,
        discount_amount: intentData.order_data.discount,
        total_amount: intentData.order_data.total,
        coupon_code: intentData.order_data.coupon_code,
        shipping_address: intentData.order_data.shipping_address,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        payment_method: "online",
        payment_status: "paid",
        // Add flat shipping columns for reliability
        shipping_name: intentData.order_data.shipping_address.full_name,
        shipping_email: intentData.order_data.shipping_address.email, // fallback if present
        shipping_phone: intentData.order_data.shipping_address.phone,
        shipping_address_1: intentData.order_data.shipping_address.address_line1,
        shipping_address_2: intentData.order_data.shipping_address.address_line2,
        shipping_city: intentData.order_data.shipping_address.city,
        shipping_state: intentData.order_data.shipping_address.state,
        shipping_pincode: intentData.order_data.shipping_address.pincode,
      })
      .select()
      .single();

    if (createError) throw new Error(`Failed to create order: ${createError.message}`);
    
    finalOrderId = newOrder.id;
    orderToProcess = newOrder;

    // Insert order items
    const { error: itemsError } = await supabaseAdmin.from("order_items").insert(
      intentData.order_data.items.map((item: any) => ({
        order_id: finalOrderId,
        product_id: item.product_id,
        quantity: item.quantity,
        size: item.size,
        price: item.price || item.unit_price, // Support both mappings
      }))
    );

    if (itemsError) {
      console.error("[completeOrder] Items insertion failure:", itemsError);
      throw new Error(`Failed to record order items: ${itemsError.message}`);
    }
    
    // Mark intent as completed
    await supabaseAdmin
      .from("payment_intents")
      .update({ status: "completed" })
      .eq("razorpay_order_id", razorpayOrderId);

  } else {
    throw new Error(`Order or Intent not found for ${razorpayOrderId}`);
  }

  // ── 3. Profile & Email Resolution ──────────────────────────────────────────
  let customerEmail = orderToProcess.shipping_email;
  if (!customerEmail && orderToProcess.user_id) {
    try {
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(orderToProcess.user_id);
      customerEmail = authUser?.user?.email;
    } catch (e) {
      console.error("[completeOrder] Auth resolution failed:", e);
    }
  }

  // ── 4. Post-Creation Fulfillment (Stock, Cart, Coupon) ──────────────────────
  
  // A. Inventory Decrement
  const { data: items } = await supabaseAdmin
    .from("order_items")
    .select("product_id, quantity, size, price, product:products(name, is_preorder)")
    .eq("order_id", finalOrderId);

  if (items) {
    for (const item of items) {
      try {
        // A1. Standard Inventory Decrement
        await supabaseAdmin.rpc("decrement_inventory_rpc", {
          p_product_id: item.product_id,
          p_size: item.size,
          p_quantity: item.quantity,
        });

        // A2. Pre-Order Specific Sync (If product is marked is_preorder)
        const isPreorder = (item.product as any)?.is_preorder;
        if (isPreorder) {
          // Increment the public preorder count (Quantity-sensitive)
          for (let q = 0; q < item.quantity; q++) {
            await supabaseAdmin.rpc("increment_preorder_count", { 
              p_product_id: item.product_id 
            });
          }

          // Log into preorder_registrations so it shows in Admin Pre-Orders list
          // We use upsert to avoid duplicate registration errors for the same email
          if (customerEmail) {
            await supabaseAdmin
              .from("preorder_registrations")
              .upsert({
                product_id: item.product_id,
                email: customerEmail,
                name: orderToProcess.shipping_name || "Customer",
                size: item.size,
                user_id: orderToProcess.user_id || null,
              }, { onConflict: 'product_id,email' });
          }
        }
      } catch (err) {
        console.error(`[fulfillment] Fulfillment sync failed for ${item.product_id}:`, err);
      }
    }
  }

  // B. Clear User Cart
  if (orderToProcess.user_id) {
    await supabaseAdmin.from("cart_items").delete().eq("user_id", orderToProcess.user_id);
  }

  // C. Coupon Usage
  if (orderToProcess.coupon_code) {
    await supabaseAdmin.rpc("increment_coupon_usage", { p_coupon_code: orderToProcess.coupon_code });
  }

  // ── 4. Email Confirmation ──────────────────────────────────────────────────
  try {
    if (customerEmail) {
      const emailResult = await sendOrderConfirmationEmail({
        to: customerEmail,
        orderId: finalOrderId!,
        displayOrderId: orderToProcess.order_number,
        orderItems: (items || []).map((i: any) => ({
          name: i.product?.name || "HAXEUS Piece",
          size: i.size,
          quantity: i.quantity,
          price: i.price,
        })),
        subtotal: orderToProcess.subtotal_amount || 0,
        shipping: orderToProcess.shipping_amount ?? 0,
        discount: orderToProcess.discount_amount || 0,
        total: orderToProcess.total_amount || 0,
        shippingAddress: {
          name: orderToProcess.shipping_name || "Customer",
          addressLine1: orderToProcess.shipping_address_1 || "",
          city: orderToProcess.shipping_city || "",
          pincode: orderToProcess.shipping_pincode || "",
        },
      });

      if (emailResult.success) {
        await supabaseAdmin.from("orders").update({
          confirmation_email_sent: true,
          confirmation_email_sent_at: new Date().toISOString(),
        }).eq("id", finalOrderId);
      }
    }
  } catch (emailErr) {
    console.error("[completeOrder] Email failed:", emailErr);
  }

  return { success: true, order: { ...orderToProcess, order_items: items } };
}
