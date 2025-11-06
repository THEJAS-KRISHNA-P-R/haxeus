/**
 * Enhanced Email Templates
 * - Abandoned Cart Recovery (3 stages)
 * - Newsletter campaigns
 * - Price drop alerts
 * - Back in stock notifications
 */

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

// ABANDONED CART - Email 1 (After 1 hour)
export function abandonedCartEmail1(data: {
  customerName: string
  cartItems: Array<{
    name: string
    price: number
    image: string
    size: string
    quantity: number
  }>
  cartTotal: number
  checkoutUrl: string
}): EmailTemplate {
  return {
    subject: '🛒 You left something behind!',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your cart is waiting</title>
</head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f7f7f7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f7;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding:40px 40px 20px;text-align:center;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;">HAXEUZ</h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;color:#1a1a1a;font-size:24px;">Hey ${data.customerName}! 👋</h2>
              <p style="margin:0 0 24px;color:#666;font-size:16px;line-height:1.6;">
                We noticed you left some awesome items in your cart. Don't worry - we saved them for you!
              </p>
              
              <!-- Cart Items -->
              ${data.cartItems.map(item => `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;border:1px solid #efefef;border-radius:8px;overflow:hidden;">
                <tr>
                  <td width="100" style="padding:16px;">
                    <img src="${item.image}" alt="${item.name}" style="width:80px;height:80px;object-fit:cover;border-radius:4px;">
                  </td>
                  <td style="padding:16px;">
                    <h3 style="margin:0 0 8px;color:#1a1a1a;font-size:16px;font-weight:600;">${item.name}</h3>
                    <p style="margin:0;color:#666;font-size:14px;">Size: ${item.size} • Qty: ${item.quantity}</p>
                    <p style="margin:8px 0 0;color:#667eea;font-size:18px;font-weight:700;">₹${item.price.toLocaleString()}</p>
                  </td>
                </tr>
              </table>
              `).join('')}
              
              <!-- Total -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                <tr>
                  <td style="padding:16px;background:#f9f9f9;border-radius:8px;">
                    <table width="100%">
                      <tr>
                        <td style="color:#666;font-size:16px;">Cart Total:</td>
                        <td align="right" style="color:#1a1a1a;font-size:20px;font-weight:700;">₹${data.cartTotal.toLocaleString()}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0;">
                <tr>
                  <td align="center">
                    <a href="${data.checkoutUrl}" style="display:inline-block;padding:16px 48px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#ffffff;text-decoration:none;border-radius:8px;font-size:16px;font-weight:600;box-shadow:0 4px 12px rgba(102,126,234,0.3);">
                      Complete My Order
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin:24px 0 0;color:#999;font-size:14px;text-align:center;">
                🚚 Free shipping on orders above ₹999 | 💯 100% Authentic
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding:24px;background:#f9f9f9;text-align:center;">
              <p style="margin:0 0 8px;color:#666;font-size:14px;">© 2024 HAXEUZ. All rights reserved.</p>
              <p style="margin:0;color:#999;font-size:12px;">
                <a href="#" style="color:#667eea;text-decoration:none;">Unsubscribe</a>
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `Hey ${data.customerName}!\n\nYou left some items in your cart:\n\n${data.cartItems.map(item => `${item.name} - Size ${item.size} - ₹${item.price}`).join('\n')}\n\nTotal: ₹${data.cartTotal}\n\nComplete your order: ${data.checkoutUrl}`
  }
}

// ABANDONED CART - Email 2 (After 24 hours with 10% discount)
export function abandonedCartEmail2(data: {
  customerName: string
  cartTotal: number
  discountCode: string
  checkoutUrl: string
}): EmailTemplate {
  return {
    subject: '🎁 10% OFF Your Cart - Limited Time!',
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f7f7f7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f7;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;">
          
          <tr>
            <td style="padding:40px;text-align:center;">
              <h1 style="margin:0 0 16px;color:#1a1a1a;font-size:32px;">Don't Miss Out! 🎉</h1>
              <p style="margin:0 0 32px;color:#666;font-size:18px;">
                Your cart is still waiting, ${data.customerName}
              </p>
              
              <!-- Discount Badge -->
              <div style="display:inline-block;padding:24px 48px;background:linear-gradient(135deg,#f093fb 0%,#f5576c 100%);border-radius:16px;margin:24px 0;">
                <p style="margin:0 0 8px;color:#ffffff;font-size:16px;font-weight:500;">Special offer just for you!</p>
                <p style="margin:0;color:#ffffff;font-size:48px;font-weight:700;">10% OFF</p>
              </div>
              
              <!-- Coupon Code -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0;">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;padding:16px 32px;background:#f9f9f9;border:2px dashed #667eea;border-radius:8px;">
                      <p style="margin:0 0 4px;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Your code</p>
                      <p style="margin:0;color:#667eea;font-size:24px;font-weight:700;letter-spacing:2px;">${data.discountCode}</p>
                    </div>
                  </td>
                </tr>
              </table>
              
              <p style="margin:0 0 32px;color:#666;font-size:16px;">
                Save ₹${Math.round(data.cartTotal * 0.1)} on your order of ₹${data.cartTotal.toLocaleString()}
              </p>
              
              <!-- CTA -->
              <a href="${data.checkoutUrl}" style="display:inline-block;padding:18px 56px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#ffffff;text-decoration:none;border-radius:8px;font-size:18px;font-weight:600;">
                Claim My Discount
              </a>
              
              <p style="margin:24px 0 0;color:#ff6b6b;font-size:14px;font-weight:600;">
                ⏰ Offer expires in 24 hours
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `Hey ${data.customerName}!\n\nSpecial offer: 10% OFF your cart!\n\nUse code: ${data.discountCode}\nSave ₹${Math.round(data.cartTotal * 0.1)}\n\nCheckout now: ${data.checkoutUrl}\n\nOffer expires in 24 hours!`
  }
}

// PRICE DROP ALERT
export function priceDropEmail(data: {
  customerName: string
  productName: string
  oldPrice: number
  newPrice: number
  savings: number
  productImage: string
  productUrl: string
}): EmailTemplate {
  const savingsPercent = Math.round((data.savings / data.oldPrice) * 100)
  
  return {
    subject: `🔥 Price Drop Alert: ${data.productName} - ${savingsPercent}% OFF!`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;background:#f7f7f7;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;">
          
          <tr>
            <td style="padding:40px;text-align:center;">
              <h1 style="margin:0 0 16px;color:#1a1a1a;font-size:28px;">🎯 Price Drop Alert!</h1>
              <p style="margin:0 0 24px;color:#666;font-size:16px;">
                Great news, ${data.customerName}! The item you wanted is now cheaper.
              </p>
              
              <img src="${data.productImage}" alt="${data.productName}" style="width:300px;height:300px;object-fit:cover;border-radius:12px;margin-bottom:24px;">
              
              <h2 style="margin:0 0 16px;color:#1a1a1a;font-size:22px;">${data.productName}</h2>
              
              <!-- Price Comparison -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                <tr>
                  <td align="center">
                    <p style="margin:0 0 8px;color:#999;font-size:18px;text-decoration:line-through;">₹${data.oldPrice.toLocaleString()}</p>
                    <p style="margin:0 0 8px;color:#667eea;font-size:36px;font-weight:700;">₹${data.newPrice.toLocaleString()}</p>
                    <div style="display:inline-block;padding:8px 16px;background:#ff6b6b;color:#ffffff;border-radius:20px;font-size:14px;font-weight:600;">
                      Save ₹${data.savings.toLocaleString()} (${savingsPercent}% OFF)
                    </div>
                  </td>
                </tr>
              </table>
              
              <a href="${data.productUrl}" style="display:inline-block;margin-top:24px;padding:16px 48px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#ffffff;text-decoration:none;border-radius:8px;font-size:16px;font-weight:600;">
                Shop Now
              </a>
              
              <p style="margin:24px 0 0;color:#ff6b6b;font-size:14px;">⚡ Hurry! Limited stock at this price</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `Price Drop Alert!\n\n${data.productName}\nWas: ₹${data.oldPrice}\nNow: ₹${data.newPrice}\n\nSave ₹${data.savings} (${savingsPercent}% OFF)\n\nShop now: ${data.productUrl}`
  }
}

// BACK IN STOCK
export function backInStockEmail(data: {
  customerName: string
  productName: string
  productImage: string
  productUrl: string
  size?: string
}): EmailTemplate {
  return {
    subject: `✨ Back in Stock: ${data.productName}`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;background:#f7f7f7;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;">
          
          <tr>
            <td style="padding:40px;text-align:center;">
              <div style="font-size:48px;margin-bottom:16px;">🎉</div>
              <h1 style="margin:0 0 16px;color:#1a1a1a;font-size:28px;">It's Back!</h1>
              <p style="margin:0 0 32px;color:#666;font-size:16px;">
                ${data.customerName}, the item you wanted is back in stock!
              </p>
              
              <img src="${data.productImage}" alt="${data.productName}" style="width:300px;height:300px;object-fit:cover;border-radius:12px;margin-bottom:24px;">
              
              <h2 style="margin:0 0 8px;color:#1a1a1a;font-size:22px;">${data.productName}</h2>
              ${data.size ? `<p style="margin:0 0 24px;color:#666;font-size:16px;">Size: ${data.size}</p>` : ''}
              
              <a href="${data.productUrl}" style="display:inline-block;padding:16px 48px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#ffffff;text-decoration:none;border-radius:8px;font-size:16px;font-weight:600;">
                Get It Now
              </a>
              
              <p style="margin:24px 0 0;color:#ff6b6b;font-size:14px;">⚡ Stock is limited - don't miss out again!</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `Back in Stock!\n\n${data.productName}${data.size ? ` (Size: ${data.size})` : ''}\n\nGet it now before it's gone: ${data.productUrl}`
  }
}

// NEWSLETTER TEMPLATE
export function newsletterTemplate(data: {
  subject: string
  heading: string
  mainContent: string
  ctaText: string
  ctaUrl: string
  featuredProducts?: Array<{
    name: string
    price: number
    image: string
    url: string
  }>
}): EmailTemplate {
  return {
    subject: data.subject,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;background:#f7f7f7;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;">
          
          <!-- Header -->
          <tr>
            <td style="padding:40px 40px 20px;text-align:center;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);">
              <h1 style="margin:0;color:#ffffff;font-size:32px;font-weight:700;">HAXEUZ</h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 24px;color:#1a1a1a;font-size:28px;text-align:center;">${data.heading}</h2>
              <div style="color:#666;font-size:16px;line-height:1.8;margin-bottom:32px;">
                ${data.mainContent}
              </div>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0;">
                <tr>
                  <td align="center">
                    <a href="${data.ctaUrl}" style="display:inline-block;padding:16px 48px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#ffffff;text-decoration:none;border-radius:8px;font-size:16px;font-weight:600;">
                      ${data.ctaText}
                    </a>
                  </td>
                </tr>
              </table>
              
              ${data.featuredProducts && data.featuredProducts.length > 0 ? `
              <h3 style="margin:48px 0 24px;color:#1a1a1a;font-size:22px;text-align:center;">Featured Products</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  ${data.featuredProducts.slice(0, 3).map((product, i) => `
                  <td width="33.33%" style="padding:8px;${i > 0 ? 'padding-left:8px;' : ''}${i < 2 ? 'padding-right:8px;' : ''}" valign="top">
                    <a href="${product.url}" style="text-decoration:none;display:block;">
                      <img src="${product.image}" alt="${product.name}" style="width:100%;height:auto;border-radius:8px;margin-bottom:12px;">
                      <p style="margin:0 0 8px;color:#1a1a1a;font-size:14px;font-weight:600;">${product.name}</p>
                      <p style="margin:0;color:#667eea;font-size:16px;font-weight:700;">₹${product.price.toLocaleString()}</p>
                    </a>
                  </td>
                  `).join('')}
                </tr>
              </table>
              ` : ''}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding:24px;background:#f9f9f9;text-align:center;">
              <p style="margin:0 0 16px;color:#666;font-size:14px;">Follow us on social media</p>
              <p style="margin:0 0 16px;">
                <a href="#" style="display:inline-block;margin:0 8px;color:#667eea;text-decoration:none;">Instagram</a>
                <a href="#" style="display:inline-block;margin:0 8px;color:#667eea;text-decoration:none;">Facebook</a>
                <a href="#" style="display:inline-block;margin:0 8px;color:#667eea;text-decoration:none;">Twitter</a>
              </p>
              <p style="margin:0;color:#999;font-size:12px;">
                <a href="#" style="color:#999;text-decoration:none;">Unsubscribe</a> | 
                <a href="#" style="color:#999;text-decoration:none;">Update Preferences</a>
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `${data.heading}\n\n${data.mainContent}\n\n${data.ctaText}: ${data.ctaUrl}`
  }
}
