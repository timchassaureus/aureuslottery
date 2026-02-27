-- ============================================================
-- AUREUS — Supabase RLS Hardening
-- À exécuter dans Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. purchases : lecture publique OK, écriture BLOQUÉE côté client ──
-- L'insertion ne se fait que via service_role (server-side), pas via anon key
DROP POLICY IF EXISTS "Allow public read purchases" ON purchases;
DROP POLICY IF EXISTS "Allow public write purchases" ON purchases;
DROP POLICY IF EXISTS "Allow public insert purchases" ON purchases;
CREATE POLICY "Public can read own purchases" ON purchases
  FOR SELECT USING (true);
-- INSERT/UPDATE/DELETE uniquement via service_role (API routes server-side)
-- Aucune policy INSERT → refusé pour anon/authenticated

-- ── 2. winners : lecture publique OK, écriture BLOQUÉE ──
DROP POLICY IF EXISTS "Allow public read winners" ON winners;
DROP POLICY IF EXISTS "Allow public write winners" ON winners;
DROP POLICY IF EXISTS "Allow public insert winners" ON winners;
CREATE POLICY "Public can read winners" ON winners
  FOR SELECT USING (true);

-- ── 3. bonus_tickets : lecture uniquement son propre wallet ──
DROP POLICY IF EXISTS "Allow public read bonus_tickets" ON bonus_tickets;
DROP POLICY IF EXISTS "Allow public write bonus_tickets" ON bonus_tickets;
-- Pas de policy → seul service_role peut lire/écrire
-- Si tu veux que le client lise ses propres tickets, décommente ci-dessous :
-- CREATE POLICY "User reads own bonus tickets" ON bonus_tickets
--   FOR SELECT USING (true);

-- ── 4. streaks : lecture publique OK, écriture BLOQUÉE côté client ──
DROP POLICY IF EXISTS "Allow public read streaks" ON streaks;
DROP POLICY IF EXISTS "Allow public write streaks" ON streaks;
DROP POLICY IF EXISTS "Allow public update streaks" ON streaks;
DROP POLICY IF EXISTS "Allow public insert streaks" ON streaks;
CREATE POLICY "Public can read streaks" ON streaks
  FOR SELECT USING (true);

-- ── 5. referral_codes : lecture publique OK, écriture BLOQUÉE ──
DROP POLICY IF EXISTS "Allow public read referral_codes" ON referral_codes;
DROP POLICY IF EXISTS "Allow public write referral_codes" ON referral_codes;
DROP POLICY IF EXISTS "Allow public insert referral_codes" ON referral_codes;
CREATE POLICY "Public can read referral codes" ON referral_codes
  FOR SELECT USING (true);

-- ── 6. referrals : lecture publique OK, écriture BLOQUÉE ──
DROP POLICY IF EXISTS "Allow public read referrals" ON referrals;
DROP POLICY IF EXISTS "Allow public write referrals" ON referrals;
DROP POLICY IF EXISTS "Allow public insert referrals" ON referrals;
CREATE POLICY "Public can read referrals" ON referrals
  FOR SELECT USING (true);

-- ── 7. groups : lecture publique, création OK, modification PROPRIÉTAIRE seulement ──
DROP POLICY IF EXISTS "Allow public read groups" ON groups;
DROP POLICY IF EXISTS "Allow public write groups" ON groups;
DROP POLICY IF EXISTS "Allow public update groups" ON groups;
DROP POLICY IF EXISTS "Allow public insert groups" ON groups;
CREATE POLICY "Public can read groups" ON groups
  FOR SELECT USING (true);
CREATE POLICY "Anyone can create a group" ON groups
  FOR INSERT WITH CHECK (true);
-- UPDATE uniquement pour le créateur (si colonne creator_wallet existe)
-- CREATE POLICY "Creator can update group" ON groups
--   FOR UPDATE USING (creator_wallet = current_setting('request.jwt.claims', true)::json->>'wallet');

-- ── 8. group_members : lecture publique, insertion OK, suppression BLOQUÉE ──
DROP POLICY IF EXISTS "Allow public read group_members" ON group_members;
DROP POLICY IF EXISTS "Allow public write group_members" ON group_members;
DROP POLICY IF EXISTS "Allow public insert group_members" ON group_members;
CREATE POLICY "Public can read group members" ON group_members
  FOR SELECT USING (true);
CREATE POLICY "Anyone can join a group" ON group_members
  FOR INSERT WITH CHECK (true);

-- ── 9. custodial_users : STRICTEMENT bloqué côté client ──
DROP POLICY IF EXISTS "Allow public read custodial_users" ON custodial_users;
DROP POLICY IF EXISTS "Allow public write custodial_users" ON custodial_users;
-- Aucune policy → tout refusé pour anon, seul service_role accède

-- ── 10. stripe_payments : STRICTEMENT bloqué côté client ──
DROP POLICY IF EXISTS "Allow public read stripe_payments" ON stripe_payments;
DROP POLICY IF EXISTS "Allow public write stripe_payments" ON stripe_payments;
-- Aucune policy → tout refusé pour anon, seul service_role accède

-- ── Contrainte unique sur tirages (anti-race condition) ──
-- Empêche deux tirages du même type le même jour au niveau DB
ALTER TABLE winners
  DROP CONSTRAINT IF EXISTS unique_draw_per_day_type;
ALTER TABLE winners
  ADD CONSTRAINT unique_draw_per_day_type
  UNIQUE (draw_type, draw_date::date);

-- ── Vérification : affiche les policies actives ──
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
