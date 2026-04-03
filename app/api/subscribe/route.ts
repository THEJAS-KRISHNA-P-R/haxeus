import { rateLimit } from '@/lib/redis'
import { createClient } from '@supabase/supabase-js'
import { sendWelcomeEmail } from '@/lib/email'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Get client IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? '127.0.0.1'

  // Layer 1: IP rate limit — 3 attempts per hour
  const ipLimited = await rateLimit(ip, 'email-subscribe', 3, 3600)
  if (ipLimited) {
    return NextResponse.json(
      { error: 'Too many requests. Try again later.' },
      { status: 429 }
    )
  }

  const body = await request.json()
  const email = body.email?.trim()?.toLowerCase()

  // Basic email validation
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  // Block obvious disposable email domains
  const blockedDomains = ['mailinator.com', 'guerrillamail.com', 'tempmail.com', '10minutemail.com', 'throwaway.email']
  const emailDomain = email.split('@')[1]
  if (blockedDomains.includes(emailDomain)) {
    // Return 200 to avoid revealing we blocked them (prevents domain enumeration)
    return NextResponse.json({ success: true })
  }

  // Create Supabase Admin client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  // Resolve discount code dynamically from settings if not specified
  let discountCode = 'WELCOME10'
  try {
    const { data: setting } = await supabase
      .from('store_settings')
      .select('value')
      .eq('key', 'email_popup_coupon_id')
      .maybeSingle()
    
    if (setting?.value) {
      const couponId = JSON.parse(setting.value)
      const { data: coupon } = await supabase
        .from('coupons')
        .select('code, is_active')
        .eq('id', couponId)
        .maybeSingle()
      
      if (coupon?.is_active) {
        discountCode = coupon.code
      }
    }
  } catch (err) {
    console.error('[subscribe] Discount resolution failed, using fallback:', err)
  }

  // Layer 2: Per-email check in Supabase
  const { data: existing } = await supabase
    .from('email_subscribers')
    .select('id, subscribed_at, welcome_email_sent_at')
    .eq('email', email)
    .maybeSingle()

  if (existing) {
    // Already subscribed
    const lastSentAt = existing.welcome_email_sent_at
    const hoursSinceLast = lastSentAt
      ? (Date.now() - new Date(lastSentAt).getTime()) / (1000 * 60 * 60)
      : Infinity

    if (hoursSinceLast < 24) {
      // Already sent welcome email within 24h — return success silently
      // Don't tell the user we're rate limiting (UX: they see "subscribed!" regardless)
      return NextResponse.json({ success: true })
    }
    // Re-subscriber after 24h — send email again, update record
  }

  // Upsert subscriber record
  await supabase.from('email_subscribers').upsert({
    email,
    subscribed_at: new Date().toISOString(),
    source: 'popup',
    discount_code: discountCode,
    is_active: true,
    welcome_email_sent_at: null,  // will update after email sends
  }, { onConflict: 'email' })

  // Send welcome email
  const emailResult = await sendWelcomeEmail({ email, discountCode })

  // Update welcome_email_sent_at regardless of email success/failure
  // (so we don't retry the email on the next subscribe attempt within 24h)
  await supabase.from('email_subscribers').update({
    welcome_email_sent_at: new Date().toISOString(),
    welcome_email_id: emailResult.id ?? null,
  }).eq('email', email)

  if (!emailResult.success) {
    console.error('[subscribe] welcome email failed:', emailResult.error, email)
  }

  return NextResponse.json({ success: true, discountCode })
}
