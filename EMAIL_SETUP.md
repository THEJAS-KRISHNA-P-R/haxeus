# Email & Notifications Setup Guide

## Overview
This application uses a queue-based email system with Supabase. Emails are queued in the database and can be processed by Supabase Edge Functions or external email services.

## Features Implemented

### ✅ 1. Order Confirmation Emails
- Triggered automatically when an order is placed
- Includes order details, items, shipping address, and total amount
- Queued in `email_queue` table

### ✅ 2. Shipping Update Emails
- Triggered when admin updates order status to "shipped" or "delivered"
- Includes order ID, status, and tracking information (if available)
- Sent from admin panel automatically

### ✅ 3. Newsletter Subscription
- Newsletter signup component added to footer
- Subscribers stored in `newsletter_subscribers` table
- Welcome email sent upon subscription
- Unsubscribe functionality included

### ✅ 4. Welcome Emails
- Triggered automatically after user registration
- Personalized with user's name
- Queued immediately after signup

### ✅ 5. Password Reset Emails
- Handled automatically by Supabase Auth
- Configure templates in Supabase Dashboard

## Database Setup

### Step 1: Run SQL Migration
Run the SQL file in your Supabase SQL Editor:

```bash
supabase/email_setup.sql
```

This creates:
- `email_queue` table - Stores emails to be sent
- `newsletter_subscribers` table - Newsletter subscribers
- `email_templates` table - Email template storage
- RLS policies for security
- Sample email templates

## Supabase Email Template Configuration

### Step 2: Configure Auth Email Templates

1. Go to Supabase Dashboard → Authentication → Email Templates

2. **Confirm Signup Template**
   - Subject: `Confirm Your Email - HAXEUZ`
   - Body: Include confirmation link with branding

3. **Reset Password Template**
   - Subject: `Reset Your Password - HAXEUZ`
   - Body: Include reset link with security notice

4. **Magic Link Template** (optional)
   - Subject: `Sign in to HAXEUZ`
   - Body: Include magic link for passwordless login

### Step 3: Configure SMTP Settings

Navigate to: **Project Settings → Auth → SMTP Settings**

#### Option A: Use Supabase's Built-in Email (Development)
- Default for testing
- Limited daily quota
- Not recommended for production

#### Option B: Custom SMTP (Production Recommended)

**Popular Email Services:**

1. **SendGrid** (Recommended)
   - Free tier: 100 emails/day
   - SMTP Host: `smtp.sendgrid.net`
   - SMTP Port: `587`
   - Username: `apikey`
   - Password: Your SendGrid API key

2. **Gmail SMTP**
   - SMTP Host: `smtp.gmail.com`
   - SMTP Port: `587`
   - Username: Your Gmail address
   - Password: App-specific password (not regular password)

3. **AWS SES**
   - SMTP Host: `email-smtp.us-east-1.amazonaws.com`
   - SMTP Port: `587`
   - Username: AWS SMTP credentials
   - Password: AWS SMTP credentials

4. **Resend** (Modern, Developer-Friendly)
   - SMTP Host: `smtp.resend.com`
   - SMTP Port: `587`
   - Username: `resend`
   - Password: Your Resend API key

## Email Processing

### Current Implementation: Database Queue

Emails are stored in the `email_queue` table with status `pending`.

To process emails, you have several options:

### Option 1: Supabase Edge Function (Recommended)

Create an Edge Function to process the queue:

```typescript
// supabase/functions/send-emails/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Get pending emails
  const { data: emails } = await supabase
    .from('email_queue')
    .select('*')
    .eq('status', 'pending')
    .limit(10)

  // Process each email with your email service
  for (const email of emails || []) {
    try {
      // Send email using Resend, SendGrid, etc.
      await sendEmail(email)
      
      // Mark as sent
      await supabase
        .from('email_queue')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', email.id)
    } catch (error) {
      // Mark as failed
      await supabase
        .from('email_queue')
        .update({ 
          status: 'failed', 
          error_message: error.message 
        })
        .eq('id', email.id)
    }
  }

  return new Response(JSON.stringify({ processed: emails?.length }))
})
```

Deploy with:
```bash
supabase functions deploy send-emails
```

Set up a cron job to run every minute:
```bash
supabase functions schedule send-emails --cron "* * * * *"
```

### Option 2: Database Trigger + Edge Function

Create a database trigger that calls an Edge Function whenever an email is queued.

### Option 3: External Service with Webhooks

Use a service like Zapier, n8n, or custom backend to poll the database and send emails.

## Email Templates

### Customizing Templates

Edit templates in the `email_templates` table or hardcode them in your Edge Function.

**Order Confirmation Template Example:**

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; }
    .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .order-items { margin: 20px 0; }
    .item { border-bottom: 1px solid #eee; padding: 10px 0; }
    .total { font-size: 20px; font-weight: bold; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>HAXEUZ</h1>
    <h2>Order Confirmation</h2>
  </div>
  <div class="content">
    <p>Hi {{customerName}},</p>
    <p>Thank you for your order! Here are the details:</p>
    
    <p><strong>Order ID:</strong> {{orderId}}</p>
    
    <div class="order-items">
      <h3>Items:</h3>
      {{#each items}}
        <div class="item">
          <p><strong>{{name}}</strong></p>
          <p>Size: {{size}} | Qty: {{quantity}} | ₹{{price}}</p>
        </div>
      {{/each}}
    </div>
    
    <div class="total">
      Total: ₹{{totalAmount}}
    </div>
    
    <p>We'll send you another email when your order ships.</p>
  </div>
</body>
</html>
```

## Testing Emails

### 1. Test Newsletter Signup
- Go to your website footer
- Enter an email address
- Check the `newsletter_subscribers` table
- Check `email_queue` for the welcome email

### 2. Test Order Confirmation
- Place a test order
- Check `email_queue` for order confirmation email
- Verify order details in `template_data` column

### 3. Test Shipping Updates
- Go to Admin Panel → Orders
- Update an order status to "shipped"
- Check `email_queue` for shipping update email

### 4. Test Password Reset
- Go to sign-in page
- Click "Forgot Password?"
- Enter email
- Should receive email immediately (handled by Supabase Auth)

## Monitoring

### View Email Queue (Admin Panel)

You can create an admin page to view the email queue:

```typescript
const { data: emails } = await supabase
  .from('email_queue')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(100)
```

### Email Status
- `pending`: Waiting to be sent
- `sent`: Successfully sent
- `failed`: Failed to send (check error_message)

## Production Checklist

- [ ] Set up custom SMTP provider (SendGrid/Resend recommended)
- [ ] Configure Supabase Auth email templates with your branding
- [ ] Deploy Edge Function for email processing
- [ ] Set up cron job for email queue processing
- [ ] Test all email types in production
- [ ] Set up email monitoring and alerts
- [ ] Add unsubscribe links to all marketing emails
- [ ] Ensure GDPR compliance for newsletter

## Troubleshooting

### Emails not sending
1. Check `email_queue` table - are emails being created?
2. Check Edge Function logs
3. Verify SMTP credentials
4. Check Supabase Auth email settings

### Users not receiving emails
1. Check spam folder
2. Verify email address is correct
3. Check email provider's bounce rate
4. Verify SMTP daily limits

### Newsletter signup not working
1. Check browser console for errors
2. Verify RLS policies on `newsletter_subscribers`
3. Check if email already exists in table

## Additional Features to Add

- [ ] Email analytics (open rates, click rates)
- [ ] A/B testing for email templates
- [ ] Scheduled newsletter campaigns
- [ ] Drip email campaigns
- [ ] Cart abandonment emails
- [ ] Product recommendation emails
- [ ] Birthday/anniversary emails

## Support

For issues:
1. Check Supabase logs
2. Review `email_queue` table for failed emails
3. Test with a simple email first
4. Verify all environment variables are set
