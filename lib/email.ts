import { sendEmail } from "@/lib/resend"
import type { OrderStatus } from "@/lib/supabase"
import { formatPrice, CURRENCY_SYMBOL } from "@/lib/currency"

const FROM_ORDERS  = `HAXEUS <${process.env.FROM_EMAIL ?? "orders@haxeus.in"}>`
const FROM_UPDATES = `HAXEUS Updates <${process.env.UPDATES_EMAIL ?? "updates@haxeus.in"}>`
const REPLY_TO     = process.env.SUPPORT_EMAIL ?? "support@haxeus.in"
const APP_URL      = process.env.NEXT_PUBLIC_APP_URL ?? "https://haxeus.in"

// ─── Shared HTML helpers ──────────────────────────────────────────────────────

function emailHeader() {
  return `
    <div style="text-align:center;margin-bottom:40px;">
      <h1 style="color:#e93a3a;font-size:28px;font-weight:900;letter-spacing:5px;margin:0;font-family:-apple-system,sans-serif;">
        HAXEUS
      </h1>
      <p style="color:#444;font-size:11px;letter-spacing:3px;margin:5px 0 0;text-transform:uppercase;font-family:-apple-system,sans-serif;">
        Art You Can Wear
      </p>
    </div>
  `
}

function emailFooter(email?: string | null) {
  const unsubscribeUrl = email 
    ? `${APP_URL}/unsubscribe?email=${encodeURIComponent(email)}`
    : `${APP_URL}/unsubscribe`

  return `
    <div style="border-top:1px solid #1a1a1a;padding-top:24px;text-align:center;margin-top:40px;">
      <!-- Social -->
      <div style="text-align:center;margin-bottom:16px;">
        <a href="https://www.instagram.com/haxeus.in/"
           style="display:inline-flex;align-items:center;gap:8px;text-decoration:none;background:#111;border:1px solid #1a1a1a;border-radius:100px;padding:10px 20px;">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/240px-Instagram_icon.png"
            width="16"
            height="16"
            alt="Instagram"
            style="display:block;"
          />
          <span style="color:#888;font-size:13px;font-weight:600;">@haxeus.in</span>
        </a>
      </div>
      <!-- Copyright -->
      <p style="color:#333;font-size:11px;margin:0 0 8px;text-align:center;font-family:-apple-system,sans-serif;">
        © 2026 HAXEUS. Made with obsession in India.
        · <a href="${unsubscribeUrl}" style="color:#666;text-decoration:underline;">Unsubscribe</a>
      </p>
    </div>
  `
}

function baseTemplate(content: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <meta name="color-scheme" content="dark">
    </head>
    <body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <div style="max-width:580px;margin:0 auto;padding:40px 24px;">
        ${emailHeader()}
        ${content}
      </div>
    </body>
    </html>
  `
}

// ─── 1. ORDER CONFIRMATION ────────────────────────────────────────────────────

export interface OrderConfirmationParams {
  order_number: string
  customer_name: string
  customer_email: string
  items: Array<{
    name: string
    size: string
    color?: string | null
    quantity: number
    price: number
    is_preorder: boolean
    expected_date?: string | null
  }>
  subtotal: number
  shipping: number
  total: number
  shipping_address: {
    name: string
    address_1: string
    address_2?: string | null
    city: string
    state: string
    pincode: string
  }
  is_preorder: boolean
}

export async function sendOrderConfirmation(params: OrderConfirmationParams) {
  const itemsHtml = params.items.map(item => `
    <tr>
      <td style="padding:14px 0;border-bottom:1px solid #1a1a1a;vertical-align:top;">
        <p style="color:#ffffff;font-weight:700;margin:0 0 4px;font-size:14px;">${item.name}</p>
        <p style="color:#666;font-size:12px;margin:0;">
          Size: ${item.size}
          ${item.color ? ` · ${item.color}` : ""}
          · Qty: ${item.quantity}
          ${item.is_preorder ? `
            <span style="color:#e7bf04;margin-left:8px;font-weight:700;">PRE-ORDER</span>
            ${item.expected_date ? `
              <span style="color:#555;margin-left:4px;">· Ships ${item.expected_date}</span>
            ` : ""}
          ` : ""}
        </p>
      </td>
      <td style="padding:14px 0;border-bottom:1px solid #1a1a1a;text-align:right;vertical-align:top;">
        <p style="color:#ffffff;font-weight:600;margin:0;font-size:14px;">
          ${formatPrice(item.price * item.quantity)}
        </p>
      </td>
    </tr>
  `).join("")

  const content = `
    <h2 style="color:#ffffff;font-size:20px;font-weight:700;margin:0 0 8px;">
      ${params.is_preorder ? "Pre-Order Confirmed! 🎉" : "Order Confirmed! 🎉"}
    </h2>
    <p style="color:#666;font-size:14px;margin:0 0 28px;line-height:1.6;">
      Hi ${params.customer_name},
      ${params.is_preorder
        ? " your pre-order is locked in. We'll ship it as soon as it's ready and you'll get an update email."
        : " your order is confirmed and will be prepared shortly."
      }
    </p>

    <!-- Order number -->
    <div style="background:#111;border:1px solid #1a1a1a;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
      <p style="color:#555;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 4px;">Order Number</p>
      <p style="color:#e93a3a;font-size:22px;font-weight:700;margin:0;letter-spacing:2px;">${params.order_number}</p>
    </div>

    <!-- Items -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:4px;">
      ${itemsHtml}
    </table>

    <!-- Totals -->
    <div style="background:#111;border:1px solid #1a1a1a;border-radius:12px;padding:20px;margin:20px 0;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="color:#666;font-size:13px;padding:4px 0;">Subtotal</td>
          <td style="color:#fff;font-size:13px;text-align:right;padding:4px 0;">${formatPrice(params.subtotal)}</td>
        </tr>
        <tr>
          <td style="color:#666;font-size:13px;padding:4px 0;">Shipping</td>
          <td style="font-size:13px;text-align:right;padding:4px 0;color:${params.shipping === 0 ? "#4ade80" : "#fff"};">
            ${params.shipping === 0 ? "FREE" : `${CURRENCY_SYMBOL}${params.shipping}`}
          </td>
        </tr>
        <tr>
          <td style="color:#fff;font-size:15px;font-weight:700;padding:12px 0 4px;border-top:1px solid #1a1a1a;">Total</td>
          <td style="color:#e93a3a;font-size:18px;font-weight:700;text-align:right;padding:12px 0 4px;border-top:1px solid #1a1a1a;">
            ${formatPrice(params.total)}
          </td>
        </tr>
      </table>
    </div>

    <!-- Shipping address -->
    <div style="background:#111;border:1px solid #1a1a1a;border-radius:12px;padding:20px;margin-bottom:28px;">
      <p style="color:#555;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 10px;">Shipping To</p>
      <p style="color:#fff;margin:0;line-height:1.7;font-size:14px;">
        ${params.shipping_address.name}<br/>
        ${params.shipping_address.address_1}<br/>
        ${params.shipping_address.address_2 ? params.shipping_address.address_2 + "<br/>" : ""}
        ${params.shipping_address.city}, ${params.shipping_address.state} ${params.shipping_address.pincode}
      </p>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:8px;">
      <a href="${APP_URL}/orders"
         style="display:inline-block;background:#e93a3a;color:#fff;padding:14px 36px;border-radius:100px;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:0.5px;">
        View Your Order
      </a>
    </div>

    <p style="color:#666;font-size:13px;line-height:1.7;text-align:center;margin:20px 0 0;">
      Need a return or size exchange? Read the full policy here:
      <a href="${APP_URL}/returns-refunds" style="color:#e93a3a;text-decoration:underline;margin-left:4px;">
        Returns & Refunds
      </a>
    </p>

    ${emailFooter(params.customer_email)}
  `

  await sendEmail({
    from: FROM_ORDERS,
    to: params.customer_email,
    replyTo: REPLY_TO,
    subject: params.is_preorder
      ? `Pre-Order Confirmed — ${params.order_number} · HAXEUS`
      : `Order Confirmed — ${params.order_number} · HAXEUS`,
    html: baseTemplate(content)
  })
}

// ─── 2. WELCOME EMAIL ─────────────────────────────────────────────────────────

export interface WelcomeEmailParams {
  email: string
  name?: string | null
}

export async function sendWelcomeEmail(params: WelcomeEmailParams) {
  const content = `
    <h2 style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 16px;">
      Welcome${params.name ? `, ${params.name}` : ""}.
    </h2>
    <p style="color:#666;font-size:14px;line-height:1.8;margin:0 0 28px;">
      You're now part of something different. HAXEUS is built for those who
      refuse to blend in — every drop is a limited piece of wearable art,
      designed to say something without saying a word.
    </p>

    <!-- What to expect -->
    <div style="background:#111;border:1px solid #1a1a1a;border-radius:14px;padding:24px;margin-bottom:28px;">
      <p style="color:#444;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 18px;">
        What to expect
      </p>

      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;vertical-align:top;width:24px;">
            <span style="color:#e93a3a;font-size:16px;line-height:1;">→</span>
          </td>
          <td style="padding:8px 0 8px 10px;">
            <p style="color:#fff;margin:0;font-size:14px;line-height:1.5;">
              <strong>Limited drops</strong>
              <span style="color:#666;"> — each design has a hard cap. Once it's gone, it's gone.</span>
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;vertical-align:top;width:24px;">
            <span style="color:#e93a3a;font-size:16px;line-height:1;">→</span>
          </td>
          <td style="padding:8px 0 8px 10px;">
            <p style="color:#fff;margin:0;font-size:14px;line-height:1.5;">
              <strong>Early access</strong>
              <span style="color:#666;"> — subscribers hear about new drops before anyone else.</span>
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;vertical-align:top;width:24px;">
            <span style="color:#e93a3a;font-size:16px;line-height:1;">→</span>
          </td>
          <td style="padding:8px 0 8px 10px;">
            <p style="color:#fff;margin:0;font-size:14px;line-height:1.5;">
              <strong>No spam</strong>
              <span style="color:#666;"> — we only email when something real is happening.</span>
            </p>
          </td>
        </tr>
      </table>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:8px;">
      <a href="${APP_URL}/products"
         style="display:inline-block;background:#e93a3a;color:#fff;padding:14px 40px;border-radius:100px;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:0.5px;">
        See Current Drops
      </a>
    </div>

    ${emailFooter(params.email)}
  `

  await sendEmail({
    from: FROM_UPDATES,
    to: params.email,
    replyTo: REPLY_TO,
    subject: "Welcome to HAXEUS.",
    html: baseTemplate(content)
  })
}

// ─── 3. DROP / UPDATE ALERT ───────────────────────────────────────────────────

export interface DropAlertParams {
  product_name: string
  product_id: number
  product_image: string
  description: string
  price: number
  is_preorder: boolean
  expected_date?: string | null
  recipients: string[]
}

export async function sendDropAlert(params: DropAlertParams) {
  const content = `
    <!-- Drop label -->
    <div style="text-align:center;margin-bottom:28px;">
      <span style="background:#e93a3a;color:#fff;padding:6px 20px;border-radius:100px;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">
        ${params.is_preorder ? "New Pre-Order" : "New Drop"}
      </span>
    </div>

    <!-- Product image -->
    ${params.product_image ? `
      <div style="border-radius:16px;overflow:hidden;margin-bottom:24px;background:#111;line-height:0;">
        <img
          src="${params.product_image}"
          alt="${params.product_name}"
          style="width:100%;display:block;max-height:480px;object-fit:cover;"
        />
      </div>
    ` : ""}

    <!-- Product name -->
    <h2 style="color:#ffffff;font-size:26px;font-weight:900;letter-spacing:2px;margin:0 0 12px;text-transform:uppercase;">
      ${params.product_name}
    </h2>

    <!-- Description -->
    <p style="color:#666;font-size:14px;line-height:1.8;margin:0 0 20px;">
      ${params.description}
    </p>

    <!-- Price row -->
    <div style="margin-bottom:28px;">
      <span style="color:#e93a3a;font-size:26px;font-weight:700;">
        ${formatPrice(params.price)}
      </span>
      ${params.is_preorder && params.expected_date ? `
        <span style="background:#e7bf04;color:#000;padding:4px 14px;border-radius:100px;font-size:11px;font-weight:700;margin-left:12px;">
          Ships ${params.expected_date}
        </span>
      ` : ""}
    </div>

    <!-- Scarcity line -->
    <p style="color:#444;font-size:12px;margin:0 0 24px;text-align:center;letter-spacing:1px;text-transform:uppercase;">
      Limited pieces — first come, first served
    </p>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:8px;">
      <a href="${APP_URL}/products/${params.product_id}"
         style="display:inline-block;background:#e93a3a;color:#fff;padding:16px 48px;border-radius:100px;text-decoration:none;font-weight:700;font-size:15px;letter-spacing:0.5px;">
        ${params.is_preorder ? "Pre-Order Now" : "Shop Now"}
      </a>
    </div>

    ${emailFooter()}
  `

  const html = baseTemplate(content)
  const subject = params.is_preorder
    ? `New Pre-Order: ${params.product_name} — HAXEUS`
    : `New Drop: ${params.product_name} — HAXEUS`

  // Send in batches of 50 to respect Resend rate limits
  const BATCH_SIZE = 50
  for (let i = 0; i < params.recipients.length; i += BATCH_SIZE) {
    const batch = params.recipients.slice(i, i + BATCH_SIZE)

    await Promise.all(
      batch.map(email =>
        sendEmail({
          from: FROM_UPDATES,
          to: email,
          replyTo: REPLY_TO,
          subject,
          html
        })
      )
    )

    // 1 second pause between batches — avoids Resend rate limit
    if (i + BATCH_SIZE < params.recipients.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
}

// ─── Legacy compat shims — keep existing call sites working ──────────────────
// The payment/verify route uses sendOrderConfirmationEmail with old signature.
// This shim maps old params → new params so both work without touching the route.

export async function sendOrderConfirmationEmail(data: {
  orderId: string
  customerEmail: string
  customerName: string
  items: Array<{
    name: string
    size?: string
    quantity: number
    price: number
    is_preorder?: boolean
    expected_date?: string | null
  }>
  totalAmount: number
  shipping?: number
  shippingAddress: {
    fullName: string
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    pincode: string
    phone?: string
  }
  isPreorder?: boolean
}) {
  const subtotal = data.items.reduce((s, i) => s + i.price * i.quantity, 0)
  return sendOrderConfirmation({
    order_number: data.orderId,
    customer_name: data.customerName,
    customer_email: data.customerEmail,
    items: data.items.map(item => ({
      name: item.name,
      size: item.size ?? "N/A",
      color: null,
      quantity: item.quantity,
      price: item.price,
      is_preorder: item.is_preorder ?? false,
      expected_date: item.expected_date ?? null,
    })),
    subtotal,
    shipping: data.shipping ?? 0,
    total: data.totalAmount,
    shipping_address: {
      name: data.shippingAddress.fullName,
      address_1: data.shippingAddress.addressLine1,
      address_2: data.shippingAddress.addressLine2 ?? null,
      city: data.shippingAddress.city,
      state: data.shippingAddress.state,
      pincode: data.shippingAddress.pincode,
    },
    is_preorder: data.isPreorder ?? false,
  })
}

// ─── Additional legacy shims ─────────────────────────────────────────────────
// Kept so existing call sites compile without changes.

export async function sendNewsletterWelcomeEmail(email: string, name?: string) {
  return sendWelcomeEmail({ email, name: name ?? null })
}

export async function sendContactAutoReply(email: string, name: string) {
  const content = `
    <h2 style="color:#ffffff;font-size:20px;font-weight:700;margin:0 0 16px;">
      We got your message, ${name.split(" ")[0]}.
    </h2>
    <p style="color:#666;font-size:14px;line-height:1.8;margin:0 0 24px;">
      Thanks for reaching out. We've received your message and will get back to you within 24 hours.
    </p>
    <div style="text-align:center;margin-bottom:8px;">
      <a href="${APP_URL}/products"
         style="display:inline-block;background:#e93a3a;color:#fff;padding:14px 36px;border-radius:100px;text-decoration:none;font-weight:700;font-size:14px;">
        Browse Collection
      </a>
    </div>
    ${emailFooter()}
  `

  await sendEmail({
    from: FROM_ORDERS,
    to: email,
    replyTo: REPLY_TO,
    subject: "We got your message — HAXEUS",
    html: baseTemplate(content),
  })
}

export async function sendShippingUpdateEmail({
  orderId,
  customerEmail,
  customerName,
  status,
}: {
  orderId: string
  customerEmail: string
  customerName: string
  status: OrderStatus
}) {
  const statusLabel: Partial<Record<OrderStatus, { emoji: string; message: string }>> = {
    confirmed: { emoji: "✅", message: "Your order has been confirmed and is being prepared." },
    shipped: { emoji: "📦", message: "Your order is on its way. Tracking info will follow shortly." },
    delivered: { emoji: "🎉", message: "Your order has been delivered. We hope you love it." },
    cancelled: { emoji: "❌", message: "Your order has been cancelled. If this was unexpected, please contact us." },
  }

  const s = statusLabel[status] ?? { emoji: "📋", message: `Your order status has been updated to ${status}.` }

  const content = `
    <h2 style="color:#ffffff;font-size:20px;font-weight:700;margin:0 0 8px;">
      ${s.emoji} Order ${status.charAt(0).toUpperCase() + status.slice(1)}
    </h2>
    <p style="color:#666;font-size:13px;margin:0 0 16px;">Order #${orderId.slice(0, 8).toUpperCase()}</p>
    <p style="color:#666;font-size:14px;line-height:1.7;margin:0 0 28px;">
      Hi ${customerName.split(" ")[0]}, ${s.message}
    </p>
    <div style="text-align:center;margin-bottom:8px;">
      <a href="${APP_URL}/orders/${orderId}"
         style="display:inline-block;background:#e93a3a;color:#fff;padding:14px 36px;border-radius:100px;text-decoration:none;font-weight:700;font-size:14px;">
        View Order
      </a>
    </div>
    ${emailFooter()}
  `

  await sendEmail({
    from: FROM_ORDERS,
    to: customerEmail,
    replyTo: REPLY_TO,
    subject: `Order ${status.charAt(0).toUpperCase() + status.slice(1)} — #${orderId.slice(0, 8).toUpperCase()} · HAXEUS`,
    html: baseTemplate(content),
  })
}
