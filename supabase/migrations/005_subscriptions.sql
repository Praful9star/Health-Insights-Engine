-- Server-trusted subscription entitlements.
-- Single source of truth for premium access — derived from payment events only.
-- getEntitlement() on the server reads ONLY this table; never from client claims.

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan                     TEXT        NOT NULL
                           CHECK (plan IN ('monthly', 'yearly', 'family_monthly', 'family_yearly')),
  status                   TEXT        NOT NULL DEFAULT 'active'
                           CHECK (status IN ('active', 'expired', 'cancelled')),
  current_period_end       TIMESTAMPTZ NOT NULL,
  razorpay_subscription_id TEXT,
  razorpay_payment_id      TEXT,
  razorpay_link_id         TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own subscriptions (billing transparency)
DO $$ BEGIN
  CREATE POLICY "users_own_subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Service role manages all records (payment webhook + activatePremium)
DO $$ BEGIN
  CREATE POLICY "service_manage_subscriptions" ON public.subscriptions
    FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL   ON public.subscriptions TO service_role;

-- Composite index optimised for the hot entitlement lookup
CREATE INDEX IF NOT EXISTS subscriptions_active_lookup_idx
  ON public.subscriptions (user_id, status, current_period_end DESC);

CREATE INDEX IF NOT EXISTS subscriptions_payment_idx
  ON public.subscriptions (razorpay_payment_id)
  WHERE razorpay_payment_id IS NOT NULL;
