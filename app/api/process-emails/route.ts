import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/resend'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // 60 seconds timeout

export async function POST(request: Request) {
  try {
    // Optional: Verify cron secret if set (for security)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey)

    // Get pending emails (limit to 50 per run to avoid timeout)
    const { data: pendingEmails, error: fetchError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(50)

    if (fetchError) {
      console.error('Error fetching emails:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch emails' }, { status: 500 })
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      return NextResponse.json({
        message: 'No pending emails',
        processed: 0
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

        // Replace variables in template (safe string replacement, no RegExp from user data)
        if (email.template_data) {
          Object.keys(email.template_data).forEach(key => {
            // Escape value for HTML context to prevent XSS in emails
            const raw = String(email.template_data[key] ?? '')
            const safe = raw.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
            const placeholder = `{${key}}`
            while (htmlBody.includes(placeholder)) htmlBody = htmlBody.replace(placeholder, safe)
            while (textBody.includes(placeholder)) textBody = textBody.replace(placeholder, raw)
          })
        }

        // Send email via our centralized Resend utility
        const { success, error: sendError } = await sendEmail({
          to: email.recipient_email,
          subject: email.subject,
          html: htmlBody,
          // from is handled by default in sendEmail as 'orders@haxeus.in'
        })

        if (!success) {
          // Mark as failed
          await supabase
            .from('email_queue')
            .update({
              status: 'failed',
              error_message: typeof sendError === 'string' ? sendError : JSON.stringify(sendError) || 'Failed to send',
              updated_at: new Date().toISOString()
            })
            .eq('id', email.id)

          failCount++
          console.error(`Failed to send email ${email.id}:`, sendError)
        } else {
          // Mark as sent
          await supabase
            .from('email_queue')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', email.id)

          successCount++
        }
      } catch (emailError) {
        // Mark as failed
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

    return NextResponse.json({
      message: 'Email processing complete',
      processed: pendingEmails.length,
      success: successCount,
      failed: failCount
    })

  } catch (error) {
    console.error('Email processor error:', error)
    return NextResponse.json(
      { error: 'Email processor failed' },
      { status: 500 }
    )
  }
}

// Allow GET for manual testing
export async function GET() {
  return NextResponse.json({
    message: 'Email processor endpoint',
    usage: 'POST with Bearer token to process emails'
  })
}
