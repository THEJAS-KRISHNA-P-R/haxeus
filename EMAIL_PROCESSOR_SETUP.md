# Email Processor Setup Guide

## ✅ What's Included

The email processor automatically sends queued emails from your database via Resend API.

### Components Created:

1. **API Route**: `/app/api/process-emails/route.ts`
   - Fetches pending emails from `email_queue` table
   - Sends them via Resend API
   - Updates status to 'sent' or 'failed'
   - Processes 50 emails per run (to avoid timeouts)

2. **Cron Job**: Runs every 5 minutes
   - Configured in `vercel.json`
   - Schedule: `*/5 * * * *` (every 5 minutes)
   - Secured with CRON_SECRET

3. **Database Trigger**: Automatic welcome emails
   - File: `supabase/welcome_email_trigger.sql`
   - Triggers on new user signup
   - Queues welcome email automatically

## 🚀 Setup Steps

### 1. Run Database Scripts (In Supabase SQL Editor)

Run these in order:

```sql
-- Already done:
-- ✅ complete_ecommerce_schema.sql (creates user_roles table)
-- ✅ email_setup.sql (creates email_queue table)

-- New: Run this to enable automatic welcome emails
-- 📄 welcome_email_trigger.sql
```

### 2. Environment Variables (Already Set)

Your `.env.local` already has:
```env
RESEND_API_KEY=re_demYbTCU_LvYxdf1Jya5XSNJB9EvsQAKM
CRON_SECRET=hahahahhabahbaijs92387asjdbij+__@+_q0938e-12345
```

### 3. Vercel Deployment

When you deploy to Vercel:

1. **Add Environment Variables**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `RESEND_API_KEY` = `re_demYbTCU_LvYxdf1Jya5XSNJB9EvsQAKM`
   - Add: `CRON_SECRET` = `hahahahhabahbaijs92387asjdbij+__@+_q0938e-12345`
   - Add all your Supabase variables too

2. **Cron Jobs Auto-Enable**:
   - Vercel will automatically detect `vercel.json`
   - Cron jobs will run on schedule
   - Check: Vercel Dashboard → Your Project → Cron Jobs

### 4. Custom Domain (Optional - For Better Deliverability)

Currently using: `onboarding@resend.dev` (works but shows as "via resend.dev")

To use your own domain:

1. Go to Resend Dashboard → Domains → Add Domain
2. Add your domain (e.g., `haxeuz.com`)
3. Add DNS records they provide
4. Update line 48 in `/app/api/process-emails/route.ts`:
   ```typescript
   from: 'HAXEUZ <no-reply@yourdomain.com>',
   ```

## 📧 Email Types Supported

The processor handles all email types in `email_queue`:

- ✅ `welcome` - New user welcome email
- ✅ `newsletter_welcome` - Newsletter subscription confirmation
- ✅ `order_confirmation` - Order placed confirmation
- ✅ `shipping_update` - Shipping status updates
- ✅ `abandoned_cart` - Cart recovery emails (3 stages)
- ✅ `password_reset` - Password reset emails

## 🧪 Testing

### Test Locally:

```bash
# Start your dev server
npm run dev

# In another terminal, trigger the processor manually
curl -X POST http://localhost:3000/api/process-emails \
  -H "Authorization: Bearer hahahahhabahbaijs92387asjdbij+__@+_q0938e-12345"
```

### Test Welcome Email:

1. Sign up a new user on your site
2. Check Supabase → `email_queue` table (should see pending email)
3. Wait 5 minutes OR manually trigger processor
4. Check email inbox (or Resend dashboard → Logs)

### Manual Queue Insert (Testing):

```sql
-- Insert test welcome email
INSERT INTO email_queue (
  email_type,
  recipient_email,
  recipient_name,
  subject,
  template_data,
  status
) VALUES (
  'welcome',
  'your-email@example.com',
  'Test User',
  'Welcome to HAXEUZ!',
  '{"name": "Test User", "email": "your-email@example.com"}'::jsonb,
  'pending'
);
```

## 📊 Monitoring

### Check Email Status:

```sql
-- View pending emails
SELECT * FROM email_queue WHERE status = 'pending';

-- View sent emails (last 24 hours)
SELECT * FROM email_queue 
WHERE status = 'sent' 
AND sent_at > NOW() - INTERVAL '24 hours'
ORDER BY sent_at DESC;

-- View failed emails
SELECT * FROM email_queue WHERE status = 'failed';
```

### Vercel Logs:

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on your deployment → Functions
3. Click on `/api/process-emails` to see execution logs

## 🔄 How It Works

### Flow:

1. **User signs up** → Database trigger fires
2. **Trigger queues email** → Inserts into `email_queue` (status: pending)
3. **Cron runs every 5 min** → Calls `/api/process-emails`
4. **Processor fetches** → Gets up to 50 pending emails
5. **Sends via Resend** → Uses templates from `email_templates` table
6. **Updates status** → Marks as 'sent' or 'failed'

### Retry Logic:

- Failed emails stay in queue with 'failed' status
- You can manually retry by updating status back to 'pending'
- Or implement automatic retry logic later

## 🎯 Next Steps

1. ✅ Deploy to Vercel
2. ✅ Add environment variables in Vercel
3. ✅ Run `welcome_email_trigger.sql` in Supabase
4. ✅ Test with a signup
5. 📧 Monitor Resend dashboard for sent emails
6. 🎨 Customize email templates in database

## 🔐 Security

- Cron endpoint protected by `CRON_SECRET`
- Only Vercel cron jobs can call it
- RLS policies protect email_queue table
- Admins can view queue, system can insert

## 💡 Tips

- Check Resend dashboard for delivery rates
- Monitor failed emails in database
- Update templates in `email_templates` table anytime
- Adjust cron frequency in `vercel.json` if needed
- Use professional email templates from `lib/email-templates/`

---

**You're all set!** 🎉 When you deploy to Vercel, emails will automatically send every 5 minutes.
