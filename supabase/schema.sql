-- Aureus Lottery - Schéma Supabase complet
-- Exécuter dans Supabase SQL Editor (Dashboard → SQL Editor)

-- ========== REFERRAL CODES ==========
CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_referral_codes_wallet ON referral_codes(wallet_address);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);

-- ========== REFERRALS ==========
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

-- ========== PURCHASES ==========
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  amount_usd NUMERIC(20, 6) NOT NULL,
  tickets_count INTEGER NOT NULL DEFAULT 1,
  referral_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_purchases_wallet ON purchases(wallet_address);
CREATE INDEX IF NOT EXISTS idx_purchases_referral_code ON purchases(referral_code);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at);

-- Migration: si ancienne table purchases a "amount" sans "amount_usd" / "tickets_count"
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchases' AND column_name = 'amount_usd') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchases' AND column_name = 'amount') THEN
      ALTER TABLE purchases RENAME COLUMN amount TO amount_usd;
    END IF;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchases' AND column_name = 'tickets_count') THEN
    ALTER TABLE purchases ADD COLUMN tickets_count INTEGER NOT NULL DEFAULT 1;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ========== STREAKS ==========
CREATE TABLE IF NOT EXISTS streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL UNIQUE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_play_date DATE,
  total_bonus_tickets INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_streaks_wallet ON streaks(wallet_address);

-- ========== BONUS TICKETS ==========
CREATE TABLE IF NOT EXISTS bonus_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_bonus_tickets_wallet ON bonus_tickets(wallet_address);
CREATE INDEX IF NOT EXISTS idx_bonus_tickets_used ON bonus_tickets(wallet_address, used);

-- ========== WINNERS ==========
CREATE TABLE IF NOT EXISTS winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  amount_usd NUMERIC(20, 6) NOT NULL,
  draw_type TEXT NOT NULL,
  draw_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  tx_hash TEXT
);
CREATE INDEX IF NOT EXISTS idx_winners_wallet ON winners(wallet_address);
CREATE INDEX IF NOT EXISTS idx_winners_draw_date ON winners(draw_date DESC);

-- ========== GROUPS / SYNDICATION ==========
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  creator_wallet TEXT NOT NULL,
  invite_code TEXT NOT NULL UNIQUE,
  max_members INTEGER NOT NULL DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  draw_date DATE NOT NULL,
  total_pool NUMERIC(20, 6) NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_groups_creator_wallet ON groups(creator_wallet);
CREATE INDEX IF NOT EXISTS idx_groups_invite_code ON groups(invite_code);
CREATE INDEX IF NOT EXISTS idx_groups_draw_date ON groups(draw_date);

CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  amount_contributed NUMERIC(20, 6) NOT NULL,
  share_percentage NUMERIC(10, 4) NOT NULL DEFAULT 0,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending',
  UNIQUE(group_id, wallet_address)
);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_wallet ON group_members(wallet_address);

CREATE TABLE IF NOT EXISTS group_winnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  total_won NUMERIC(20, 6) NOT NULL,
  draw_date TIMESTAMPTZ NOT NULL,
  distributed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_group_winnings_group_id ON group_winnings(group_id);
CREATE INDEX IF NOT EXISTS idx_group_winnings_draw_date ON group_winnings(draw_date DESC);

-- ========== CUSTODIAL USERS (Social auth + card payments) ==========
CREATE TABLE IF NOT EXISTS custodial_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  provider TEXT NOT NULL DEFAULT 'email',
  wallet_address TEXT NOT NULL UNIQUE,
  usdc_balance NUMERIC(20, 6) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_custodial_users_email ON custodial_users(email);
CREATE INDEX IF NOT EXISTS idx_custodial_users_wallet ON custodial_users(wallet_address);

-- ========== STRIPE PAYMENTS ==========
CREATE TABLE IF NOT EXISTS stripe_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT NOT NULL UNIQUE,
  customer_email TEXT,
  amount_usd NUMERIC(20, 6) NOT NULL,
  tickets_count INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_stripe_payments_session ON stripe_payments(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_stripe_payments_email ON stripe_payments(customer_email);

-- ========== RLS ==========
ALTER TABLE custodial_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_payments ENABLE ROW LEVEL SECURITY;
-- custodial_users: no public read (service role only via API routes)
-- stripe_payments: no public read (service role only via webhook)
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bonus_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_winnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read referral_codes" ON referral_codes FOR SELECT USING (true);
CREATE POLICY "Allow public read referrals" ON referrals FOR SELECT USING (true);
CREATE POLICY "Allow public read purchases" ON purchases FOR SELECT USING (true);
CREATE POLICY "Allow public read streaks" ON streaks FOR SELECT USING (true);
CREATE POLICY "Allow public read bonus_tickets" ON bonus_tickets FOR SELECT USING (true);
CREATE POLICY "Allow public read winners" ON winners FOR SELECT USING (true);
CREATE POLICY "Allow public read groups" ON groups FOR SELECT USING (true);
CREATE POLICY "Allow public read group_members" ON group_members FOR SELECT USING (true);
CREATE POLICY "Allow public read group_winnings" ON group_winnings FOR SELECT USING (true);

-- Politiques permissives pour accélérer le prototypage produit.
-- À durcir en production avec authentification wallet signée.
CREATE POLICY "Allow public write groups" ON groups FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update groups" ON groups FOR UPDATE USING (true);
CREATE POLICY "Allow public write group_members" ON group_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update group_members" ON group_members FOR UPDATE USING (true);
CREATE POLICY "Allow public write group_winnings" ON group_winnings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update group_winnings" ON group_winnings FOR UPDATE USING (true);
