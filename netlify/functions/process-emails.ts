import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Config } from '@netlify/functions'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export default async (req: Request) => {
  try {
    const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey)

    // Get pending emails (limit to 50 per run)
    const { data: pendingEmails, error: fetchError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(50)

    if (fetchError) {
      console.error('Error fetching emails:', fetchError)
      return new Response(JSON.stringify({ error: 'Failed to fetch emails' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      return new Response(JSON.stringify({
        message: 'No pending emails',
        processed: 0
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    let successCount = 0
    let failCount = 0

    // Process each email
    for (const email of pendingEmails) {
      try {
        // Get template from database
        const { data: template } = await supabase
          .from('email_templates')
          .select('html_body, text_body')
          .eq('template_name', email.email_type)
          .single()

        let htmlBody = template?.html_body || email.subject
        let textBody = template?.text_body || email.subject

        // Replace variables in template
        if (email.template_data) {
          Object.keys(email.template_data).forEach(key => {
            const value = email.template_data[key]
            htmlBody = htmlBody.replace(new RegExp(`{${key}}`, 'g'), value)
            textBody = textBody.replace(new RegExp(`{${key}}`, 'g'), value)
          })
        }

        // Send email via Resend API
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'HAXEUS <onboarding@resend.dev>',
            to: email.recipient_email,
            subject: email.subject,
            html: htmlBody,
            text: textBody,
          }),
        })

        if (!resendResponse.ok) {
          const errorData = await resendResponse.json()
          await supabase
            .from('email_queue')
            .update({
              status: 'failed',
              error_message: errorData.message || 'Failed to send',
              updated_at: new Date().toISOString()
            })
            .eq('id', email.id)

          failCount++
          console.error(`Failed to send email ${email.id}:`, errorData)
        } else {
          await supabase
            .from('email_queue')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', email.id)

          successCount++
          console.log(`Sent email ${email.id} to ${email.recipient_email}`)
        }
      } catch (emailError) {
        await supabase
          .from('email_queue')
          .update({
            status: 'failed',
            error_message: emailError instanceof Error ? emailError.message : 'Unknown error',
            updated_at: new Date().toISOString()
          })
          .eq('id', email.id)

        failCount++
        console.error(`Error processing email ${email.id}:`, emailError)
      }
    }

    return new Response(JSON.stringify({
      message: 'Email processing complete',
      processed: pendingEmails.length,
      success: successCount,
      failed: failCount
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Email processor error:', error)
    return new Response(JSON.stringify({ error: 'Email processor failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Run every 5 minutes
export const config: Config = {
  schedule: '*/5 * * * *'
}
