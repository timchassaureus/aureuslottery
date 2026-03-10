-- Migration 001 — Prevent duplicate draws on the same day
-- Run this in Supabase SQL Editor before going live.
--
-- Creates a unique index on (draw_type, date of draw_date) so that even if two
-- cron jobs fire simultaneously, the second INSERT will fail with error 23505
-- and the API returns 409 instead of inserting a duplicate draw.

CREATE UNIQUE INDEX IF NOT EXISTS idx_winners_draw_type_day
  ON winners (draw_type, DATE(draw_date AT TIME ZONE 'UTC'));

-- Also add a unique constraint on stripe_payments.stripe_session_id
-- (Stripe can retry webhooks; we must never issue duplicate tickets)
ALTER TABLE stripe_payments
  ADD CONSTRAINT IF NOT EXISTS stripe_payments_session_id_unique
  UNIQUE (stripe_session_id);
