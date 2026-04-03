// supabase/functions/drop-reminder/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Resend } from "https://esm.sh/resend@3"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const EMAIL_FROM = Deno.env.get('EMAIL_FROM') || 'HAXEUS <orders@haxeus.in>'

const resend = new Resend(RESEND_API_KEY)
const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

Deno.serve(async () => {
  try {
    console.log('[drop-reminder] Checking for upcoming drops...')

    // 1. Find active drops starting in exactly 1 hour (window: 55-65 mins from now)
    const now = new Date()
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)
    const windowStart = new Date(oneHourFromNow.getTime() - 5 * 60 * 1000).toISOString()
    const windowEnd = new Date(oneHourFromNow.getTime() + 5 * 60 * 1000).toISOString()

    const { data: upcomingDrops, error: dropError } = await supabase
      .from('drops')
      .select('id, name, target_date')
      .eq('is_active', true)
      .gte('target_date', windowStart)
      .lte('target_date', windowEnd)

    if (dropError) throw dropError
    if (!upcomingDrops || upcomingDrops.length === 0) {
      return new Response(JSON.stringify({ message: 'No drops within reminder window.' }), { 
        headers: { 'Content-Type': 'application/json' } 
      })
    }

    console.log(`[drop-reminder] Found ${upcomingDrops.length} drops in window.`)

    const results = []

    for (const drop of upcomingDrops) {
      // 2. Fetch pending notifications for this drop
      const { data: pending, error: pendingError } = await supabase
        .from('drop_notifications')
        .select('id, email')
        .eq('drop_id', drop.id)
        .eq('notified', false)
        .limit(100) // process in batches if needed, but 100 is safe for now

      if (pendingError) throw pendingError
      if (!pending || pending.length === 0) continue

      console.log(`[drop-reminder] Sending ${pending.length} reminders for drop: ${drop.name}`)

      for (const entry of pending) {
        // 3. Send via Resend with Idempotency Key
        const { error: sendError } = await resend.emails.send({
          from: EMAIL_FROM,
          to: entry.email,
          subject: `FINAL WARNING: ${drop.name} drops in 60 minutes`,
          text: `HAXEUS — THE DROP IS NEAR. ${drop.name} launches in exactly 1 hour. Be ready at the storefront.`,
          headers: {
            'X-Entity-Ref-ID': `drop-reminder-${drop.id}-${entry.email.toLowerCase()}`
          }
        })

        if (!sendError) {
          // 4. Mark as notified
          await supabase
            .from('drop_notifications')
            .update({ 
               notified: true, 
               notified_at: new Date().toISOString() 
            })
            .eq('id', entry.id)
          
          results.push({ email: entry.email, status: 'sent' })
        } else {
          console.error(`[drop-reminder] Failed to send to ${entry.email}:`, sendError)
          results.push({ email: entry.email, status: 'failed', error: sendError })
        }
      }
    }

    return new Response(JSON.stringify({ results }), { 
      headers: { 'Content-Type': 'application/json' } 
    })

  } catch (err: any) {
    console.error('[drop-reminder] Exception:', err)
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    })
  }
})
