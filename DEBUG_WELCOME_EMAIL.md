# Debug Welcome Email Not Sending

## Step 1: Check if Email Was Queued

Run this in Supabase SQL Editor:

```sql
-- Check if any emails were queued
SELECT * FROM email_queue ORDER BY created_at DESC LIMIT 10;

-- Check specifically for welcome emails
SELECT * FROM email_queue WHERE email_type = 'welcome' ORDER BY created_at DESC;

-- Check if trigger exists
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

## Step 2: Check if Trigger is Working

```sql
-- Check if function exists
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'queue_welcome_email';

-- Manually test the function by inserting a test email
INSERT INTO email_queue (
  email_type,
  recipient_email,
  recipient_name,
  subject,
  template_data,
  status
) VALUES (
  'welcome',
  'test@example.com',
  'Test User',
  'Welcome to HAXEUZ!',
  '{"name": "Test User", "email": "test@example.com"}'::jsonb,
  'pending'
);

-- Check if it was inserted
SELECT * FROM email_queue WHERE recipient_email = 'test@example.com';
```

## Step 3: Check RLS Policies

The issue might be RLS blocking the trigger from inserting. Run this:

```sql
-- Check current policy on email_queue
SELECT * FROM pg_policies WHERE tablename = 'email_queue';

-- Temporarily disable RLS to test (DON'T DO IN PRODUCTION)
ALTER TABLE email_queue DISABLE ROW LEVEL SECURITY;

-- Try signing up again, then check
SELECT * FROM email_queue ORDER BY created_at DESC LIMIT 5;

-- Re-enable RLS
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
```

## Step 4: Fix - Grant Service Role Bypass

The trigger needs to bypass RLS. Add this policy:

```sql
-- Allow service role (used by trigger) to insert emails
DROP POLICY IF EXISTS "Service role can insert emails" ON email_queue;
CREATE POLICY "Service role can insert emails" ON email_queue 
  FOR INSERT 
  WITH CHECK (true);

-- Make sure "System can insert emails" policy exists
DROP POLICY IF EXISTS "System can insert emails" ON email_queue;
CREATE POLICY "System can insert emails" ON email_queue 
  FOR INSERT 
  WITH CHECK (true);
```

## Step 5: Alternative - Manual Welcome Email

If trigger doesn't work, you can queue emails manually in your signup code:

```typescript
// In your signup success handler
const { data: authData, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      name: fullName
    }
  }
})

if (!error && authData.user) {
  // Manually queue welcome email
  const { error: emailError } = await supabase
    .from('email_queue')
    .insert({
      email_type: 'welcome',
      recipient_email: authData.user.email,
      recipient_name: fullName,
      subject: 'Welcome to HAXEUZ!',
      template_data: {
        name: fullName,
        email: authData.user.email
      },
      status: 'pending'
    })
  
  if (emailError) {
    console.error('Failed to queue welcome email:', emailError)
  }
}
```

## Step 6: Test Email Processor

Make sure the processor runs:

```bash
# Test locally
curl -X POST http://localhost:3000/api/process-emails \
  -H "Authorization: Bearer hahahahhabahbaijs92387asjdbij+__@+_q0938e-12345"
```

## Step 7: Check Resend API Key

Verify your Resend API key is working:

```bash
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer re_demYbTCU_LvYxdf1Jya5XSNJB9EvsQAKM" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "HAXEUZ <onboarding@resend.dev>",
    "to": "delivered@resend.dev",
    "subject": "Test Email",
    "html": "<p>Test</p>"
  }'
```

## Most Likely Issues:

1. **RLS Blocking Trigger** - The trigger can't insert into email_queue due to RLS policies
2. **Trigger Not Enabled** - The trigger wasn't created successfully
3. **Email Processor Not Running** - Cron job only runs on Vercel, not locally
4. **Wrong Table Name** - Make sure you ran email_setup.sql to create email_queue table

## Quick Fix:

Run this in Supabase SQL Editor:

```sql
-- 1. Make sure table exists
SELECT * FROM email_queue LIMIT 1;

-- 2. Add permissive policy for system inserts
DROP POLICY IF EXISTS "Allow all inserts to email_queue" ON email_queue;
CREATE POLICY "Allow all inserts to email_queue" ON email_queue 
  FOR INSERT 
  WITH CHECK (true);

-- 3. Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION queue_welcome_email()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.email_queue (
    email_type,
    recipient_email,
    recipient_name,
    subject,
    template_data,
    status
  ) VALUES (
    'welcome',
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    'Welcome to HAXEUZ!',
    jsonb_build_object(
      'name', COALESCE(
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'full_name',
        split_part(NEW.email, '@', 1)
      ),
      'email', NEW.email
    ),
    'pending'
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to queue welcome email: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION queue_welcome_email();

-- 4. Test by signing up a new user
```

Run these queries in order and let me know what you find!
