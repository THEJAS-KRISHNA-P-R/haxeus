import { sendEmail } from "./resend"

// ─── Shared layout wrapper ────────────────────────────────────────────────────
function emailWrapper(content: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding:0 0 32px;">
              <div style="font-size:26px;font-weight:900;letter-spacing:6px;color:#e93a3a;">HAXEUS</div>
            </td>
          </tr>

          ${content}

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:32px 0 0;">
              <p style="margin:0 0 6px;font-size:12px;color:rgba(255,255,255,0.25);">© 2026 HAXEUS. All rights reserved.</p>
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.15);">haxeus.in</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function card(content: string) {
  return `<tr>
    <td style="background-color:#111111;border-radius:16px;padding:40px;border:1px solid rgba(255,255,255,0.07);">
      ${content}
    </td>
  </tr>`
}

function divider() {
  return `<div style="width:40px;height:2px;background-color:#e93a3a;margin:20px 0;"></div>`
}

function ctaButton(href: string, label: string) {
  return `<a href="${href}" style="display:inline-block;background-color:#e93a3a;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:14px 32px;border-radius:100px;">${label}</a>`
}

// ─── Order Confirmation ───────────────────────────────────────────────────────
export async function sendOrderConfirmationEmail(data: {
  orderId: string
  customerEmail: string
  customerName: string
  items: Array<{ name: string; size?: string; quantity: number; price: number }>
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
}) {
  const itemsHtml = data.items.map((item) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.07);">
        <div style="font-size:14px;font-weight:700;color:#ffffff;">${item.name}</div>
        <div style="font-size:12px;color:rgba(255,255,255,0.4);margin-top:4px;letter-spacing:1px;text-transform:uppercase;">Size: ${item.size || "N/A"} &nbsp;·&nbsp; Qty: ${item.quantity}</div>
      </td>
      <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.07);text-align:right;font-size:14px;color:#ffffff;">
        ₹${(item.price * item.quantity).toLocaleString("en-IN")}
      </td>
    </tr>
  `).join("")

  const addr = data.shippingAddress

  const content = card(`
    <p style="margin:0 0 6px;font-size:11px;letter-spacing:3px;color:#e93a3a;text-transform:uppercase;">Order Confirmed</p>
    <h1 style="margin:0 0 4px;font-size:28px;font-weight:800;color:#ffffff;">Thanks, ${data.customerName.split(" ")[0]}.</h1>
    <p style="margin:0 0 0;font-size:14px;color:rgba(255,255,255,0.4);">Order #${data.orderId.substring(0, 8).toUpperCase()}</p>
    ${divider()}
    <p style="margin:0 0 20px;font-size:14px;color:rgba(255,255,255,0.6);line-height:1.6;">We're on it. Your order is being prepared and you'll receive a shipping update once it's on the way.</p>

    <!-- Items -->
    <div style="background-color:#0a0a0a;border-radius:12px;padding:24px;margin-bottom:24px;">
      <p style="margin:0 0 16px;font-size:11px;letter-spacing:2px;color:#e93a3a;text-transform:uppercase;">Your Items</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${itemsHtml}
        <tr>
          <td style="padding-top:16px;font-size:14px;font-weight:700;color:#ffffff;">Total</td>
          <td style="padding-top:16px;text-align:right;font-size:16px;font-weight:800;color:#e93a3a;">₹${data.totalAmount.toLocaleString("en-IN")}</td>
        </tr>
      </table>
    </div>

    <!-- Shipping address -->
    <div style="background-color:#0a0a0a;border-radius:12px;padding:24px;margin-bottom:32px;">
      <p style="margin:0 0 12px;font-size:11px;letter-spacing:2px;color:#e93a3a;text-transform:uppercase;">Shipping To</p>
      <p style="margin:0;font-size:14px;font-weight:700;color:#ffffff;">${addr.fullName}</p>
      <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.5);line-height:1.6;">
        ${addr.addressLine1}${addr.addressLine2 ? ", " + addr.addressLine2 : ""}<br>
        ${addr.city}, ${addr.state} — ${addr.pincode}<br>
        ${addr.phone}
      </p>
    </div>

    <div style="text-align:center;">
      ${ctaButton("https://haxeus.in/orders", "Track Your Order")}
    </div>
  `)

  return sendEmail({
    to: data.customerEmail,
    subject: `Order Confirmed — #${data.orderId.substring(0, 8).toUpperCase()}`,
    html: emailWrapper(content),
  })
}

// ─── Newsletter Welcome ───────────────────────────────────────────────────────
export async function sendNewsletterWelcomeEmail(email: string, name?: string) {
  const content = `
    ${card(`
      <p style="margin:0 0 8px;font-size:11px;letter-spacing:3px;color:#e93a3a;text-transform:uppercase;">Welcome to the movement</p>
      <h1 style="margin:0 0 4px;font-size:28px;font-weight:800;color:#ffffff;line-height:1.2;">You're in.<br/>We don't blend in.</h1>
      ${divider()}
      <p style="margin:0 0 16px;font-size:14px;color:rgba(255,255,255,0.6);line-height:1.7;">Hi ${name || "there"}, you're now on the list for early access to new drops, exclusive offers, and behind-the-scenes content before anyone else.</p>
      <p style="margin:0 0 32px;font-size:14px;color:rgba(255,255,255,0.6);line-height:1.7;">We refuse to blend in — and we know you do too.</p>
      <div style="text-align:center;">${ctaButton("https://haxeus.in/products", "Shop the Collection")}</div>
    `)}

    <!-- Perks row -->
    <tr><td style="padding:24px 0 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="33%" style="padding:0 6px 0 0;vertical-align:top;">
            <div style="background-color:#111111;border-radius:12px;padding:20px;border:1px solid rgba(255,255,255,0.07);text-align:center;">
              <div style="font-size:22px;margin-bottom:10px;">🔥</div>
              <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:#e93a3a;text-transform:uppercase;margin-bottom:6px;">Early Access</div>
              <div style="font-size:12px;color:rgba(255,255,255,0.5);line-height:1.5;">First look at new drops before they go live.</div>
            </div>
          </td>
          <td width="33%" style="padding:0 3px;vertical-align:top;">
            <div style="background-color:#111111;border-radius:12px;padding:20px;border:1px solid rgba(255,255,255,0.07);text-align:center;">
              <div style="font-size:22px;margin-bottom:10px;">⚡</div>
              <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:#e93a3a;text-transform:uppercase;margin-bottom:6px;">Exclusive Offers</div>
              <div style="font-size:12px;color:rgba(255,255,255,0.5);line-height:1.5;">Subscriber-only discounts and deals.</div>
            </div>
          </td>
          <td width="33%" style="padding:0 0 0 6px;vertical-align:top;">
            <div style="background-color:#111111;border-radius:12px;padding:20px;border:1px solid rgba(255,255,255,0.07);text-align:center;">
              <div style="font-size:22px;margin-bottom:10px;">🎯</div>
              <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:#e93a3a;text-transform:uppercase;margin-bottom:6px;">Behind the Scenes</div>
              <div style="font-size:12px;color:rgba(255,255,255,0.5);line-height:1.5;">Design stories and culture content.</div>
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  `

  return sendEmail({
    to: email,
    subject: "Welcome to HAXEUS",
    html: emailWrapper(content),
  })
}

// ─── Contact Auto-Reply ───────────────────────────────────────────────────────
export async function sendContactAutoReply(email: string, name: string) {
  const content = card(`
    <p style="margin:0 0 8px;font-size:11px;letter-spacing:3px;color:#e93a3a;text-transform:uppercase;">Message Received</p>
    <h1 style="margin:0 0 4px;font-size:26px;font-weight:800;color:#ffffff;">We got your message, ${name.split(" ")[0]}.</h1>
    ${divider()}
    <p style="margin:0 0 16px;font-size:14px;color:rgba(255,255,255,0.6);line-height:1.7;">Thanks for reaching out. We've received your message and will get back to you within 24 hours.</p>
    <p style="margin:0 0 32px;font-size:14px;color:rgba(255,255,255,0.6);line-height:1.7;">In the meantime, feel free to browse the collection.</p>
    <div style="text-align:center;">${ctaButton("https://haxeus.in/products", "Shop Collection")}</div>
  `)

  return sendEmail({
    to: email,
    subject: "We got your message — HAXEUS",
    html: emailWrapper(content),
  })
}

// ─── Account Welcome ──────────────────────────────────────────────────────────
export async function sendWelcomeEmail(email: string, name?: string) {
  const content = card(`
    <p style="margin:0 0 8px;font-size:11px;letter-spacing:3px;color:#e93a3a;text-transform:uppercase;">Account Created</p>
    <h1 style="margin:0 0 4px;font-size:26px;font-weight:800;color:#ffffff;">Welcome, ${name?.split(" ")[0] || "there"}.</h1>
    ${divider()}
    <p style="margin:0 0 16px;font-size:14px;color:rgba(255,255,255,0.6);line-height:1.7;">Your HAXEUS account is ready. We're stoked to have you with us.</p>
    <p style="margin:0 0 32px;font-size:14px;color:rgba(255,255,255,0.6);line-height:1.7;">We refuse to blend in — and now you don't have to either.</p>
    <div style="text-align:center;">${ctaButton("https://haxeus.in/products", "Shop Collection")}</div>
  `)

  return sendEmail({
    to: email,
    subject: "Welcome to HAXEUS",
    html: emailWrapper(content),
  })
}

// ─── Shipping Update ──────────────────────────────────────────────────────────
export async function sendShippingUpdateEmail({
  orderId,
  customerEmail,
  customerName,
  status,
}: {
  orderId: string
  customerEmail: string
  customerName: string
  status: string
}) {
  const statusLabel: Record<string, { emoji: string; message: string }> = {
    confirmed: { emoji: "✅", message: "Your order has been confirmed and is being prepared." },
    shipped: { emoji: "📦", message: "Your order is on its way. Tracking info will follow shortly." },
    delivered: { emoji: "🎉", message: "Your order has been delivered. We hope you love it." },
    cancelled: { emoji: "❌", message: "Your order has been cancelled. If this was unexpected, please contact us." },
  }

  const s = statusLabel[status.toLowerCase()] ?? { emoji: "📋", message: `Your order status has been updated to ${status}.` }

  const content = card(`
    <p style="margin:0 0 8px;font-size:11px;letter-spacing:3px;color:#e93a3a;text-transform:uppercase;">Order Update</p>
    <h1 style="margin:0 0 4px;font-size:26px;font-weight:800;color:#ffffff;">${s.emoji} ${status.charAt(0).toUpperCase() + status.slice(1)}</h1>
    <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.3);">Order #${orderId.slice(0, 8).toUpperCase()}</p>
    ${divider()}
    <p style="margin:0 0 8px;font-size:14px;color:rgba(255,255,255,0.6);line-height:1.7;">Hi ${customerName.split(" ")[0]},</p>
    <p style="margin:0 0 32px;font-size:14px;color:rgba(255,255,255,0.6);line-height:1.7;">${s.message}</p>
    <div style="text-align:center;">${ctaButton(`https://haxeus.in/orders/${orderId}`, "View Order")}</div>
  `)

  return sendEmail({
    to: customerEmail,
    subject: `Order ${status.charAt(0).toUpperCase() + status.slice(1)} — #${orderId.slice(0, 8).toUpperCase()}`,
    html: emailWrapper(content),
  })
}