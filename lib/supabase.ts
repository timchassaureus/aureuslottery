import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Client-side Supabase client (use in components / hooks).
 * Uses anon key; RLS can restrict access.
 */
export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Server-side client is in lib/supabase-server.ts (uses SUPABASE_SERVICE_ROLE_KEY)

export type ReferralCodeRow = {
  id: string;
  wallet_address: string;
  code: string;
  created_at: string;
};

export type ReferralRow = {
  id: string;
  referrer_wallet: string;
  referred_wallet: string;
  created_at: string;
  total_earned: number;
};

export type PurchaseRow = {
  id: string;
  wallet_address: string;
  amount: number;
  referral_code: string | null;
  created_at: string;
};
