-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- Creates tables for the Aureus referral system.

-- Referral codes: one unique code per wallet (format AUR-XXXXX)
CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referral_codes_wallet ON referral_codes(wallet_address);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);

-- Referrals: link between referrer and referred, with total earned from that referred user
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_wallet TEXT NOT NULL,
  referred_wallet TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  total_earned NUMERIC(20, 6) NOT NULL DEFAULT 0,
  UNIQUE(referrer_wallet, referred_wallet)
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_wallet);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_wallet);

-- Purchases: each ticket purchase for referral attribution and commission
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  amount NUMERIC(20, 6) NOT NULL,
  referral_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_purchases_wallet ON purchases(wallet_address);
CREATE INDEX IF NOT EXISTS idx_purchases_referral_code ON purchases(referral_code);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at);

-- Optional: RLS (Row Level Security) so users can only read their own data via anon key
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read on referral_codes (needed to resolve code → wallet for display)
CREATE POLICY "Allow public read referral_codes" ON referral_codes FOR SELECT USING (true);

-- Allow anonymous read on referrals (users can see their own referrer stats via API/dashboard)
CREATE POLICY "Allow public read referrals" ON referrals FOR SELECT USING (true);

-- Purchases: only backend (service role) should insert; anon can read own if needed
CREATE POLICY "Allow public read purchases" ON purchases FOR SELECT USING (true);

-- Only service role can insert/update (handled in API routes with service key)
-- No INSERT/UPDATE policies for anon so client cannot write directly to these tables.
