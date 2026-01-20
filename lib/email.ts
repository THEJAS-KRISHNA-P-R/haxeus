import { supabase } from "./supabase"

/**
 * Email service using Supabase Edge Functions
 * This handles all transactional emails for the application
 */

interface OrderEmailData {
  orderId: string
  customerEmail: string
  customerName: string
  items: Array<{
    name: string
    size: string
    quantity: number
    price: number
  }>
  totalAmount: number
  shippingAddress: {
    fullName: string
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    pincode: string
    phone: string
  }
}

interface ShippingUpdateData {
  orderId: string
  customerEmail: string
  customerName: string
  status: string
  trackingNumber?: string
  estimatedDelivery?: string
}

interface NewsletterData {
  email: string
  name?: string
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<boolean> {
  try {
    console.log("Sending order confirmation email to:", data.customerEmail)

    // For now, we'll store the email in a queue table
    // Later, this will trigger a Supabase Edge Function
    const { error } = await supabase.from("email_queue").insert({
      email_type: "order_confirmation",
      recipient_email: data.customerEmail,
      recipient_name: data.customerName,
      subject: `Order Confirmation - #${data.orderId.slice(0, 8)}`,
      template_data: {
        orderId: data.orderId,
        items: data.items,
        totalAmount: data.totalAmount,
        shippingAddress: data.shippingAddress,
      },
      status: "pending",
    })

    if (error) {
      console.error("Error queuing order confirmation email:", error)
      return false
    }

    console.log("Order confirmation email queued successfully")
    return true
  } catch (error) {
    console.error("Error sending order confirmation email:", error)
    return false
  }
}

/**
 * Send shipping update email
 */
export async function sendShippingUpdateEmail(data: ShippingUpdateData): Promise<boolean> {
  try {
    console.log("Sending shipping update email to:", data.customerEmail)

    const { error } = await supabase.from("email_queue").insert({
      email_type: "shipping_update",
      recipient_email: data.customerEmail,
      recipient_name: data.customerName,
      subject: `Shipping Update - Order #${data.orderId.slice(0, 8)}`,
      template_data: {
        orderId: data.orderId,
        status: data.status,
        trackingNumber: data.trackingNumber,
        estimatedDelivery: data.estimatedDelivery,
      },
      status: "pending",
    })

    if (error) {
      console.error("Error queuing shipping update email:", error)
      return false
    }

    console.log("Shipping update email queued successfully")
    return true
  } catch (error) {
    console.error("Error sending shipping update email:", error)
    return false
  }
}

/**
 * Subscribe to newsletter
 */
export async function subscribeToNewsletter(data: NewsletterData): Promise<boolean> {
  try {
    console.log("Subscribing to newsletter:", data.email)

    // Check if already subscribed
    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("id")
      .eq("email", data.email)
      .single()

    if (existing) {
      console.log("Email already subscribed")
      return true
    }

    // Add to newsletter subscribers
    const { error: subError } = await supabase.from("newsletter_subscribers").insert({
      email: data.email,
      name: data.name,
      status: "active",
      subscribed_at: new Date().toISOString(),
    })

    if (subError) {
      console.error("Error subscribing to newsletter:", subError)
      return false
    }

    // Send welcome email
    const { error: emailError } = await supabase.from("email_queue").insert({
      email_type: "newsletter_welcome",
      recipient_email: data.email,
      recipient_name: data.name || "",
      subject: "Welcome to HAXEUS Newsletter!",
      template_data: {
        name: data.name,
      },
      status: "pending",
    })

    if (emailError) {
      console.error("Error queuing welcome email:", emailError)
    }

    console.log("Newsletter subscription successful")
    return true
  } catch (error) {
    console.error("Error subscribing to newsletter:", error)
    return false
  }
}

/**
 * Unsubscribe from newsletter
 */
export async function unsubscribeFromNewsletter(email: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("newsletter_subscribers")
      .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
      .eq("email", email)

    return !error
  } catch (error) {
    console.error("Error unsubscribing from newsletter:", error)
    return false
  }
}

/**
 * Send welcome email (triggered after user registration)
 */
export async function sendWelcomeEmail(email: string, name?: string): Promise<boolean> {
  try {
    console.log("Sending welcome email to:", email)

    const { error } = await supabase.from("email_queue").insert({
      email_type: "welcome",
      recipient_email: email,
      recipient_name: name || "",
      subject: "Welcome to HAXEUS!",
      template_data: {
        name: name,
      },
      status: "pending",
    })

    if (error) {
      console.error("Error queuing welcome email:", error)
      return false
    }

    console.log("Welcome email queued successfully")
    return true
  } catch (error) {
    console.error("Error sending welcome email:", error)
    return false
  }
}

/**
 * Note: Password reset emails are handled automatically by Supabase Auth
 * Configure them in Supabase Dashboard > Authentication > Email Templates
 */
