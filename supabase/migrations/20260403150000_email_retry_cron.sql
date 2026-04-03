-- Enable pg_cron extension if not present
create extension if not exists "pg_cron" with schema "extensions";

-- 1. Schedule for 'retry-order-emails' edge function
-- Optimized Frequency: Every 15 minutes (Safe balance for free tier invocations)
SELECT cron.schedule(
  'retry-order-emails-15m',
  '*/15 * * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://' || (SELECT value FROM public.store_settings WHERE key = 'supabase_project_ref') || '.supabase.co/functions/v1/retry-order-emails',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (SELECT value FROM public.store_settings WHERE key = 'supabase_service_role_key')
      ),
      body := '{}'
    ) as request_id;
  $$
);

-- 2. Schedule for 'drop-reminder' edge function
-- Frequency: Every 5 minutes (Ensures we capture the 60-minute window with high precision)
SELECT cron.schedule(
  'drop-reminder-5m',
  '*/5 * * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://' || (SELECT value FROM public.store_settings WHERE key = 'supabase_project_ref') || '.supabase.co/functions/v1/drop-reminder',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (SELECT value FROM public.store_settings WHERE key = 'supabase_service_role_key')
      ),
      body := '{}'
    ) as request_id;
  $$
);

-- Note: 'supabase_project_ref' and 'supabase_service_role_key' must exist in store_settings for these to work.
-- If they don't, we can fallback to hardcoded env vars or another config table.
