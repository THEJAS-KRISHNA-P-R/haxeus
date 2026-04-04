// lib/email.ts — server only, never import in client components
import { Resend } from 'resend'
import OrderConfirmationEmail from '@/emails/order-confirmation'
import WelcomeEmail from '@/emails/welcome'

if (!process.env.RESEND_API_KEY) {
  // During build time on Vercel, this might not be set. 
  // We handle it gracefully to allow builds to pass.
  console.warn('RESEND_API_KEY is not set. Email sending will be disabled.')
}

export const resend = new Resend(process.env.RESEND_API_KEY || 're_stub')

export const EMAIL_FROM = process.env.EMAIL_FROM ?? 'HAXEUS <orders@haxeus.in>'

// Email type classification — used to decide whether to rate limit
export type EmailType = 'order_confirmation' | 'welcome' | 'password_reset' | 'shipping_update' | 'drop_alert'

export interface SendEmailResult {
  success: boolean
  id?: string      // Resend email ID
  error?: string
}

/**
 * Send an order confirmation email.
 * Uses Resend idempotency key (X-Entity-Ref-ID) to guarantee exactly-once delivery.
 * orderId MUST be the Supabase UUID for consistent deduplication.
 * Never throws — always returns a result.
 */
export async function sendOrderConfirmationEmail(params: {
  to: string
  orderId: string        // Supabase UUID for idempotency
  displayOrderId?: string // e.g. #HX1001 for the subject line
  orderItems: Array<{ name: string; size: string; quantity: number; price: number }>
  subtotal: number
  shipping: number
  discount: number
  total: number
  shippingAddress: { name: string; addressLine1: string; city: string; pincode: string }
}): Promise<SendEmailResult> {
  try {
    const subjectId = params.displayOrderId || params.orderId.slice(-8).toUpperCase()
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: params.to,
      subject: `Order confirmed — HAXEUS #${subjectId}`,
      react: OrderConfirmationEmail({
        orderId: params.orderId,
        displayOrderId: subjectId,
        orderItems: params.orderItems,
        subtotal: params.subtotal,
        shipping: params.shipping,
        discount: params.discount,
        total: params.total,
        shippingAddress: params.shippingAddress,
      }),
      headers: {
        'X-Entity-Ref-ID': `order-confirmed-${params.orderId}`,
      },
    })

    if (error) {
      console.error(`[email] order confirmation failed for ${params.orderId}:`, error)
      return { success: false, error: error.message }
    }

    return { success: true, id: data?.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[email] order confirmation exception for ${params.orderId}:`, message)
    return { success: false, error: message }
  }
}

/**
 * Send a welcome email.
 * Rate limited in the API route — call this only after checking Redis.
 */
export async function sendWelcomeEmail(params: {
  email: string
  discountCode: string
  customerName?: string
}): Promise<SendEmailResult> {
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: params.email,
      subject: "Welcome to HAXEUS — here's your 10% off",
      react: WelcomeEmail({
        customerName: params.customerName,
        discountCode: params.discountCode,
      }),
      headers: {
        'X-Entity-Ref-ID': `welcome-${params.email}`,
      },
    })

    if (error) {
      console.error(`[email] welcome email failed for ${params.email}:`, error)
      return { success: false, error: error.message }
    }

    return { success: true, id: data?.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[email] welcome email exception for ${params.email}:`, message)
    return { success: false, error: message }
  }
}

// ─── Unified Multi-Purpose Helpers ───────────────────────────────────────────

/**
 * Unified subscription email handler (Newsletter / Popup / Waitlist).
 */
export async function sendSubscriptionWelcome(email: string, name?: string, code: string = 'WELCOME10') {
    return sendWelcomeEmail({ email, customerName: name, discountCode: code })
}

/**
 * Legacy Shims (Maintained for dashboard compatibility, redirected to primary logic)
 */
export async function sendOrderConfirmation(params: any) {
    return sendOrderConfirmationEmail({
        to: params.customer_email || params.email,
        orderId: params.id, // Ensure UUID is used
        displayOrderId: params.order_number,
        orderItems: (params.items || params.order_items || []).map((i: any) => ({
            name: i.name || i.product?.name || "HAXEUS Piece",
            size: i.size,
            quantity: i.quantity,
            price: i.price || i.unit_price
        })),
        subtotal: params.subtotal || params.subtotal_amount,
        shipping: params.shipping || params.shipping_amount || 0,
        discount: params.discount || params.discount_amount || 0,
        total: params.total || params.total_amount,
        shippingAddress: {
            name: params.shipping_name || params.shipping_address?.name,
            addressLine1: params.shipping_address?.address_1 || params.shipping_address?.addressLine1,
            city: params.shipping_address?.city,
            pincode: params.shipping_address?.pincode
        }
    })
}

export async function sendShippingUpdateEmail({
    orderId,
    customerEmail,
    customerName,
    status
}: {
    orderId: string;
    customerEmail: string;
    customerName: string;
    status: string;
}) {
    return resend.emails.send({
        from: EMAIL_FROM,
        to: customerEmail,
        subject: `Order Update — #${orderId.slice(-8).toUpperCase()} is ${status.toUpperCase()}`,
        text: `Hi ${customerName}, your HAXEUS order #${orderId.slice(-8).toUpperCase()} has been updated to: ${status}.`,
        headers: {
            'X-Entity-Ref-ID': `shipping-update-${orderId}-${status.toLowerCase().replace(/\s+/g, '-')}`
        }
    })
}

/**
 * Send a drop reminder 1 hour before launch.
 */
export async function sendDropReminderEmail(params: {
    to: string
    dropId: string
    dropName: string
    dropDate: string
    productPreviewUrls?: string[]
}) {
    // Note: If DropReminderEmail template doesn't exist yet, we'll use a high-fidelity text fallback or 
    // create a simple wrapper. Assume DropReminder template is needed.
    return resend.emails.send({
        from: EMAIL_FROM,
        to: params.to,
        subject: `FINAL WARNING: ${params.dropName} drops in 60 minutes`,
        // Using text for now until the React component is requested/created
        text: `HAXEUS — THE DROP IS NEAR. ${params.dropName} launches at ${params.dropDate}. Be ready.`,
        headers: {
            'X-Entity-Ref-ID': `drop-reminder-${params.dropId}-${params.to.toLowerCase()}`,
        }
    })
}

/**
 * Send a full product drop alert to multiple recipients.
 */
export async function sendDropProductAlertEmail(params: {
    product_name: string
    product_id: number
    product_image: string
    description: string
    price: number
    is_preorder: boolean
    expected_date: string | null
    recipients: string[]
}) {
    // Note: In production, you might want to use a BCC or batching for many recipients.
    // For now, we'll send to the list provided.
    return resend.emails.send({
        from: EMAIL_FROM,
        to: params.recipients,
        subject: `NEW DROP: ${params.product_name} is now available`,
        text: `HAXEUS — ${params.product_name} has just dropped. ${params.description}. Price: ${params.price}. Shop now at https://haxeus.in/products/${params.product_id}`,
        headers: {
            'X-Entity-Ref-ID': `drop-alert-${params.product_id}-${Date.now().toString().slice(0, 7)}`,
        }
    })
}

export const sendDropAlert = sendDropProductAlertEmail;
export const sendNewsletterWelcomeEmail = (email: string, name?: string) => sendSubscriptionWelcome(email, name);
export const sendContactAutoReply = async (email: string, name: string) => {
    return resend.emails.send({
        from: EMAIL_FROM,
        to: email,
        subject: 'We got your message — HAXEUS',
        text: `Hi ${name}, thanks for reaching out. We've received your message and will get back to you within 24 hours.`,
        headers: {
            'X-Entity-Ref-ID': `contact-reply-${email.toLowerCase()}-${Date.now().toString().slice(0, 7)}` // semi-idempotent per ~2hr window
        }
    })
}
