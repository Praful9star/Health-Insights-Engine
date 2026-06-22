-- Add premium fields to user_profiles
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS is_premium         BOOLEAN      NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMPTZ;

-- Payments audit log — one row per Razorpay payment link event
CREATE TABLE IF NOT EXISTS payments (
  id                    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  razorpay_payment_id   TEXT,
  razorpay_link_id      TEXT,
  plan                  TEXT         NOT NULL CHECK (plan IN ('monthly', 'annual')),
  amount_paise          INTEGER      NOT NULL,
  currency              TEXT         NOT NULL DEFAULT 'INR',
  status                TEXT         NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'expired')),
  source                TEXT         NOT NULL DEFAULT 'callback' CHECK (source IN ('callback', 'webhook')),
  raw_payload           JSONB,
  created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- RLS: users can only see their own payment records
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

-- Service-role can insert/update (used by API server via service key)
CREATE POLICY "service_manage_payments" ON payments
  FOR ALL USING (true) WITH CHECK (true);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS payments_user_id_idx        ON payments(user_id);
CREATE INDEX IF NOT EXISTS payments_razorpay_link_idx  ON payments(razorpay_link_id);
CREATE INDEX IF NOT EXISTS payments_razorpay_pay_idx   ON payments(razorpay_payment_id);
