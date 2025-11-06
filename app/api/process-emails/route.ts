import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

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
            from: 'HAXEUZ <onboarding@resend.dev>',
            to: email.recipient_email,
            subject: email.subject,
            html: htmlBody,
            text: textBody,
          }),
        })

        if (!resendResponse.ok) {
          const errorData = await resendResponse.json()
          // Mark as failed
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
          console.log(`Sent email ${email.id} to ${email.recipient_email}`)
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
