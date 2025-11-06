import { supabase } from './supabase'

/**
 * Abandoned Cart Recovery System
 * - Track cart abandonment
 * - Automated email reminders
 * - Discount incentives
 * - Save for later functionality
 */

export async function trackAbandonedCart(userId: string, cartValue: number, itemsCount: number) {
  // Check if abandoned cart already exists
  const { data: existing } = await supabase
    .from('abandoned_carts')
    .select('id')
    .eq('user_id', userId)
    .eq('recovered', false)
    .single()

  if (existing) {
    // Update existing
    await supabase
      .from('abandoned_carts')
      .update({
        cart_value: cartValue,
        items_count: itemsCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)
  } else {
    // Create new
    await supabase
      .from('abandoned_carts')
      .insert({
        user_id: userId,
        cart_value: cartValue,
        items_count: itemsCount
      })
  }
}

export async function markCartAsRecovered(userId: string) {
  await supabase
    .from('abandoned_carts')
    .update({
      recovered: true,
      recovered_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq('recovered', false)
}

export async function getAbandonedCartsForEmail(): Promise<any[]> {
  // Get carts abandoned > 1 hour ago, not recovered, < 3 emails sent
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('abandoned_carts')
    .select(`
      *,
      auth.users (
        email
      )
    `)
    .eq('recovered', false)
    .lt('email_sent_count', 3)
    .lt('updated_at', oneHourAgo)

  if (error) {
    console.error('Error fetching abandoned carts:', error)
    return []
  }

  return data || []
}

export async function incrementEmailSentCount(abandonedCartId: string) {
  await supabase.rpc('increment_abandoned_cart_emails', {
    cart_id: abandonedCartId
  })
}

export async function saveForLater(userId: string, productId: number, size: string) {
  const { error } = await supabase
    .from('saved_for_later')
    .insert({
      user_id: userId,
      product_id: productId,
      size: size
    })

  return !error
}

export async function getSavedForLater(userId: string) {
  const { data, error } = await supabase
    .from('saved_for_later')
    .select(`
      *,
      products (
        *
      )
    `)
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching saved items:', error)
    return []
  }

  return data || []
}

export async function moveSavedToCart(userId: string, savedItemId: string) {
  // Get saved item
  const { data: savedItem } = await supabase
    .from('saved_for_later')
    .select('*')
    .eq('id', savedItemId)
    .single()

  if (!savedItem) return false

  // Add to cart
  const { error: cartError } = await supabase
    .from('cart_items')
    .insert({
      user_id: userId,
      product_id: savedItem.product_id,
      size: savedItem.size,
      quantity: 1
    })

  if (cartError) return false

  // Remove from saved
  await supabase
    .from('saved_for_later')
    .delete()
    .eq('id', savedItemId)

  return true
}

export async function getAbandonedCartStats() {
  const { data, error } = await supabase
    .from('abandoned_carts')
    .select('*')

  if (error || !data) {
    return {
      totalAbandoned: 0,
      totalRecovered: 0,
      recoveryRate: 0,
      totalValue: 0,
      recoveredValue: 0
    }
  }

  const totalAbandoned = data.length
  const recovered = data.filter(cart => cart.recovered)
  const totalRecovered = recovered.length
  const recoveryRate = totalAbandoned > 0 ? (totalRecovered / totalAbandoned) * 100 : 0
  const totalValue = data.reduce((sum, cart) => sum + cart.cart_value, 0)
  const recoveredValue = recovered.reduce((sum, cart) => sum + cart.cart_value, 0)

  return {
    totalAbandoned,
    totalRecovered,
    recoveryRate: Math.round(recoveryRate * 10) / 10,
    totalValue,
    recoveredValue
  }
}

/**
 * Process abandoned carts and send recovery emails
 * Should be called from cron job every hour
 */
export async function processAbandonedCarts(supabaseClient: any) {
  const results = {
    stage1Sent: 0,
    stage2Sent: 0,
    stage3Sent: 0,
    errors: [] as string[]
  }

  try {
    // Get abandoned carts that need emails
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)

    // Fetch abandoned carts
    const { data: abandonedCarts, error } = await supabaseClient
      .from('abandoned_carts')
      .select(`
        *,
        profiles:user_id (
          id,
          email,
          full_name
        )
      `)
      .eq('recovered', false)
      .lt('email_sent_count', 3)

    if (error) {
      console.error('Error fetching abandoned carts:', error)
      results.errors.push(`Database error: ${error.message}`)
      return results
    }

    if (!abandonedCarts || abandonedCarts.length === 0) {
      return results
    }

    // Process each cart
    for (const cart of abandonedCarts) {
      try {
        const cartUpdatedAt = new Date(cart.updated_at)
        const lastEmailSent = cart.last_email_sent_at ? new Date(cart.last_email_sent_at) : null
        const emailsSent = cart.email_sent_count || 0

        // Determine which stage email to send
        let shouldSendEmail = false
        let emailStage = 0

        if (emailsSent === 0 && cartUpdatedAt <= oneHourAgo) {
          // Stage 1: 1 hour after abandonment
          shouldSendEmail = true
          emailStage = 1
        } else if (emailsSent === 1 && cartUpdatedAt <= oneDayAgo && (!lastEmailSent || lastEmailSent <= oneHourAgo)) {
          // Stage 2: 24 hours after abandonment, at least 1 hour since last email
          shouldSendEmail = true
          emailStage = 2
        } else if (emailsSent === 2 && cartUpdatedAt <= threeDaysAgo && (!lastEmailSent || lastEmailSent <= oneDayAgo)) {
          // Stage 3: 3 days after abandonment, at least 24 hours since last email
          shouldSendEmail = true
          emailStage = 3
        }

        if (shouldSendEmail && cart.profiles?.email) {
          // Send email via Resend (you'll need to implement this based on your email setup)
          const emailSent = await sendAbandonedCartEmail(
            cart.profiles.email,
            cart.profiles.full_name || 'Customer',
            emailStage,
            cart.cart_value,
            cart.items_count
          )

          if (emailSent) {
            // Update cart record
            await supabaseClient
              .from('abandoned_carts')
              .update({
                email_sent_count: emailsSent + 1,
                last_email_sent_at: new Date().toISOString()
              })
              .eq('id', cart.id)

            if (emailStage === 1) results.stage1Sent++
            if (emailStage === 2) results.stage2Sent++
            if (emailStage === 3) results.stage3Sent++
          }
        }
      } catch (error) {
        const errorMsg = `Failed to process cart ${cart.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        console.error(errorMsg)
        results.errors.push(errorMsg)
      }
    }

  } catch (error) {
    const errorMsg = `Process abandoned carts failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    console.error(errorMsg)
    results.errors.push(errorMsg)
  }

  return results
}

/**
 * Send abandoned cart email via Resend
 */
async function sendAbandonedCartEmail(
  email: string,
  name: string,
  stage: number,
  cartValue: number,
  itemsCount: number
): Promise<boolean> {
  try {
    // Import email templates
    const { abandonedCartEmail1, abandonedCartEmail2 } = await import('./email-templates/enhanced-templates')
    
    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured')
      return false
    }

    let emailTemplate
    const cartItems = [
      {
        name: 'Sample Product',
        price: cartValue / itemsCount,
        image: 'https://via.placeholder.com/80',
        size: 'M',
        quantity: itemsCount
      }
    ]
    const checkoutUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://haxeuz.com'}/cart`

    switch (stage) {
      case 1:
        emailTemplate = abandonedCartEmail1({
          customerName: name,
          cartItems,
          cartTotal: cartValue,
          checkoutUrl
        })
        break
      case 2:
        emailTemplate = abandonedCartEmail2({
          customerName: name,
          cartTotal: cartValue,
          discountCode: 'COMEBACK10',
          checkoutUrl
        })
        break
      case 3:
        // For stage 3, use stage 2 template with different discount
        emailTemplate = abandonedCartEmail2({
          customerName: name,
          cartTotal: cartValue,
          discountCode: 'LASTCHANCE15',
          checkoutUrl
        })
        break
      default:
        return false
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'HAXEUZ <orders@haxeuz.com>',
        to: [email],
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error(`Failed to send email to ${email}:`, error)
      return false
    }

    return true
  } catch (error) {
    console.error(`Error sending abandoned cart email to ${email}:`, error)
    return false
  }
}
