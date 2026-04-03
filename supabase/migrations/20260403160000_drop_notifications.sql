-- Create drop_notifications table for tracking waitlist interests
CREATE TABLE IF NOT EXISTS "public"."drop_notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "drop_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "email" "text" NOT NULL,
    "notified" "boolean" DEFAULT false NOT NULL,
    "notified_at" "timestamp with time zone",
    "created_at" "timestamp with time zone" DEFAULT "now"() NOT NULL,
    
    CONSTRAINT "drop_notifications_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "drop_notifications_drop_id_fkey" FOREIGN KEY ("drop_id") REFERENCES "public"."drops"("id") ON DELETE CASCADE,
    CONSTRAINT "drop_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL
);

-- Ensure a user/email can only subscribe once per drop
CREATE UNIQUE INDEX IF NOT EXISTS "drop_notifications_drop_id_email_key" ON "public"."drop_notifications" ("drop_id", "email");

-- Enable RLS
ALTER TABLE "public"."drop_notifications" ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Allow service role full access
CREATE POLICY "Service Role full access on drop_notifications" 
ON "public"."drop_notifications" 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- 2. Allow users to insert their own notification (or any email, since it's a waitlist)
-- We'll restrict this to authenticated for more control, or leave open for guest waitlists.
-- Standard practice for HAXEUS: Allow any insert to support guest waitlists.
CREATE POLICY "Allow public insert on drop_notifications" 
ON "public"."drop_notifications" 
FOR INSERT 
WITH CHECK (true);

-- 3. Allow users to see their own notifications
CREATE POLICY "Users can see their own drop_notifications" 
ON "public"."drop_notifications" 
FOR SELECT 
USING (auth.uid() = user_id OR auth.jwt() ->> 'email' = email);

-- Index for cron performance
CREATE INDEX IF NOT EXISTS "idx_drop_notifications_pending" ON "public"."drop_notifications" ("notified") WHERE ("notified" = false);
