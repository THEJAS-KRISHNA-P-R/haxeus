-- ============================================================================
-- HAXEUS — 'Pristine Orders' Migration
-- 1. Truncate existing orders history for a fresh start.
-- 2. Create payment_intents table for the new holding layer.
-- ============================================================================

-- ─── 1. Clean Up Legacy Order History ───────────────────────────────────────
-- This permanently deletes all existing orders and their line items.
TRUNCATE TABLE public.orders, public.order_items RESTART IDENTITY CASCADE;

-- ─── 2. Create Payment Intents Table ─────────────────────────────────────────
-- Stores cart and shipping metadata temporarily while waiting for payment.
CREATE TABLE IF NOT EXISTS public.payment_intents (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    razorpay_order_id text UNIQUE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    order_data jsonb NOT NULL,
    status text DEFAULT 'pending'CHECK (status IN ('pending', 'completed', 'failed')),
    created_at timestamptz DEFAULT now()
);

-- Index for high-velocity lookups during verification/webhooks
CREATE INDEX IF NOT EXISTS idx_payment_intents_razorpay_id ON public.payment_intents(razorpay_order_id);

-- Enable RLS
ALTER TABLE public.payment_intents ENABLE ROW LEVEL SECURITY;

-- ─── 3. RLS Policies for Payment Intents ────────────────────────────────────
-- Admins can view/manage all intents
CREATE POLICY "payment_intents_admin_all" ON public.payment_intents
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
    );

-- Users can only read their own intents
CREATE POLICY "payment_intents_user_read" ON public.payment_intents
    FOR SELECT USING (auth.uid() = user_id);

-- ─── 4. Schema Sync ─────────────────────────────────────────────────────────
NOTIFY pgrst, 'reload schema';
