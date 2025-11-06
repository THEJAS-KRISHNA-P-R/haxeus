# Netlify Email Setup

## ✅ What I Just Created:

### 1. **Netlify Scheduled Functions** (instead of Vercel cron)
   - `netlify/functions/process-emails.ts` - Runs every 5 minutes
   - `netlify/functions/abandoned-carts.ts` - Runs every hour

### 2. **Updated netlify.toml**
   - Configured scheduled functions
   - Proper build settings

## 🚀 Deployment Steps:

### 1. Add Environment Variables in Netlify

Go to: **Netlify Dashboard → Your Site → Site Settings → Environment Variables**

Add these:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=re_demYbTCU_LvYxdf1Jya5XSNJB9EvsQAKM
NEXT_PUBLIC_SITE_URL=https://your-site.netlify.app
```

### 2. Install Netlify CLI (Optional - for local testing)

```bash
npm install -g netlify-cli

# Login
netlify login

# Link to your site
netlify link

# Test functions locally
netlify dev

# Test scheduled function
netlify functions:invoke process-emails
```

### 3. Deploy to Netlify

```bash
# Option 1: Git push (automatic deploy)
git add .
git commit -m "Add Netlify scheduled functions for emails"
git push

# Option 2: Netlify CLI
netlify deploy --prod
```

### 4. Verify Scheduled Functions

After deployment:
1. Go to **Netlify Dashboard → Your Site → Functions**
2. You should see:
   - `process-emails` (runs every 5 min)
   - `abandoned-carts` (runs every hour)
3. Click on a function to see:
   - Schedule
   - Recent invocations
   - Logs

## 🧪 Testing

### Test Email Processing Manually:

```bash
# Test locally with Netlify Dev
netlify functions:invoke process-emails

# Test deployed function
curl https://your-site.netlify.app/.netlify/functions/process-emails
```

### Check if Emails Are Being Sent:

```sql
-- In Supabase SQL Editor
SELECT 
  email_type,
  recipient_email,
  status,
  error_message,
  created_at,
  sent_at
FROM email_queue 
ORDER BY created_at DESC 
LIMIT 20;
```

## 📊 Monitoring

### View Function Logs in Netlify:

1. Go to **Functions** tab
2. Click on `process-emails`
3. View **Recent invocations**
4. Check logs for errors

### View Email Status in Resend:

1. Go to [Resend Dashboard](https://resend.com/emails)
2. Check **Logs** section
3. See delivered emails

## 🔍 Troubleshooting

### If emails still not sending:

1. **Check function is running:**
   ```bash
   # View function logs
   netlify functions:log process-emails
   ```

2. **Check Supabase permissions:**
   ```sql
   -- Make sure RLS allows inserts
   SELECT * FROM pg_policies WHERE tablename = 'email_queue';
   ```

3. **Test Resend API key:**
   ```bash
   curl -X POST https://api.resend.com/emails \
     -H "Authorization: Bearer re_demYbTCU_LvYxdf1Jya5XSNJB9EvsQAKM" \
     -H "Content-Type: application/json" \
     -d '{
       "from": "HAXEUZ <onboarding@resend.dev>",
       "to": "delivered@resend.dev",
       "subject": "Test",
       "html": "<p>Test</p>"
     }'
   ```

4. **Manually trigger function:**
   ```bash
   curl https://your-site.netlify.app/.netlify/functions/process-emails
   ```

## ⚡ Quick Test Flow:

1. Sign up a new user on your site
2. Check Supabase `email_queue` table (should see pending email)
3. Wait 5 minutes (or manually trigger function)
4. Check `email_queue` again (status should be 'sent')
5. Check email inbox (or Resend dashboard)

## 🎯 Important Notes:

- **Netlify Scheduled Functions** are only available on **Pro plan or higher**
- **Free tier** doesn't support scheduled functions
- Alternative: Use **Supabase Edge Functions** with cron (free)
- Or manually trigger via webhook/API route

## 🆓 Free Alternative - Supabase Cron:

If you're on Netlify free tier, use Supabase pg_cron instead:

```sql
-- In Supabase SQL Editor (requires Pro plan)
SELECT cron.schedule(
  'process-emails',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-site.netlify.app/.netlify/functions/process-emails',
    headers := '{}'::jsonb
  );
  $$
);
```

---

**Once deployed, emails will automatically send every 5 minutes!** 📧
