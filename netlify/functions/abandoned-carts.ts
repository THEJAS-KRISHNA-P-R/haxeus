import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Config } from '@netlify/functions'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export default async (req: Request) => {
  try {
    const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey)

    // Get abandoned carts older than 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

    const { data: abandonedCarts, error } = await supabase
      .from('abandoned_carts')
      .select('*')
      .eq('recovered', false)
      .lt('created_at', oneHourAgo)
      .is('last_email_sent_at', null)
      .limit(50)

    if (error) {
      console.error('Error fetching abandoned carts:', error)
      return new Response(JSON.stringify({ error: 'Failed to fetch carts' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    let processedCount = 0

    for (const cart of abandonedCarts || []) {
      // Get user email
      const { data: user } = await supabase.auth.admin.getUserById(cart.user_id)
      
      if (user?.user?.email) {
        // Queue abandoned cart email
        await supabase.from('email_queue').insert({
          email_type: 'abandoned_cart',
          recipient_email: user.user.email,
          recipient_name: user.user.user_metadata?.name || user.user.email.split('@')[0],
          subject: '🛒 You left something behind!',
          template_data: {
            customerName: user.user.user_metadata?.name || user.user.email.split('@')[0],
            cartTotal: cart.cart_value,
            checkoutUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/cart`
          },
          status: 'pending'
        })

        // Update abandoned cart record
        await supabase
          .from('abandoned_carts')
          .update({
            email_sent_count: 1,
            last_email_sent_at: new Date().toISOString()
          })
          .eq('id', cart.id)

        processedCount++
      }
    }

    return new Response(JSON.stringify({
      message: 'Abandoned cart processing complete',
      processed: processedCount
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Abandoned cart processor error:', error)
    return new Response(JSON.stringify({ error: 'Processing failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Run every hour
export const config: Config = {
  schedule: '0 * * * *'
}
