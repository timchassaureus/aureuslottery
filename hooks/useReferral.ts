'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase';

const REFERRAL_STORAGE_KEY = 'aureus_referral_code';
const CODE_PREFIX = 'AUR-';
const CODE_LENGTH = 5;
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O, 1/I

function generateCode(): string {
  let s = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    s += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return CODE_PREFIX + s;
}

function getStoredReferralCode(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFERRAL_STORAGE_KEY);
}

function setStoredReferralCode(code: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REFERRAL_STORAGE_KEY, code);
}

export interface UseReferralResult {
  myReferralCode: string | null;
  referralLink: string;
  totalEarned: number;
  referredCount: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const APP_URL = typeof window !== 'undefined'
  ? window.location.origin
  : process.env.NEXT_PUBLIC_APP_URL || 'https://aureuslottery.app';

/**
 * Detects ?ref=CODE in current URL and saves to localStorage.
 * Call once on app load (e.g. in layout or page).
 */
export function detectAndStoreReferralFromUrl(): void {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  if (ref && ref.startsWith(CODE_PREFIX)) {
    setStoredReferralCode(ref.trim().toUpperCase());
  }
}

/**
 * Returns the referral code currently stored for the visitor (used when they make a purchase).
 */
export function getStoredReferralCodeForPurchase(): string | null {
  return getStoredReferralCode();
}

/**
 * Hook: referral data for the connected wallet.
 * - Ensures a unique code exists for this wallet (created on first connection).
 * - Exposes myReferralCode, referralLink, totalEarned, referredCount.
 */
export function useReferral(walletAddress: string | undefined): UseReferralResult {
  const [myReferralCode, setMyReferralCode] = useState<string | null>(null);
  const [totalEarned, setTotalEarned] = useState(0);
  const [referredCount, setReferredCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!walletAddress) {
      setMyReferralCode(null);
      setTotalEarned(0);
      setReferredCount(0);
      setIsLoading(false);
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const supabase = createClient();
      const normalizedWallet = walletAddress.toLowerCase();

      // 1) Ensure referral code exists (create via API so we can use service role if needed)
      const ensureRes = await fetch('/api/referral/ensure-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: normalizedWallet }),
      });
      if (!ensureRes.ok) {
        const err = await ensureRes.json().catch(() => ({}));
        throw new Error(err?.error || ensureRes.statusText || 'Failed to ensure referral code');
      }
      const { code } = await ensureRes.json();
      setMyReferralCode(code);

      // 2) Fetch referrals where I am the referrer (referred count + total earned)
      const { data: referrals, error: refError } = await supabase
        .from('referrals')
        .select('id, total_earned')
        .eq('referrer_wallet', normalizedWallet);

      if (refError) throw refError;
      const count = referrals?.length ?? 0;
      const earned = referrals?.reduce((sum, r) => sum + Number(r.total_earned || 0), 0) ?? 0;
      setReferredCount(count);
      setTotalEarned(earned);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setMyReferralCode(null);
      setTotalEarned(0);
      setReferredCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const referralLink = myReferralCode ? `${APP_URL}/ref/${myReferralCode}` : '';

  return {
    myReferralCode,
    referralLink,
    totalEarned,
    referredCount,
    isLoading,
    error,
    refresh: fetchData,
  };
}
