'use client';

import { useEffect } from 'react';
import { detectAndStoreReferralFromUrl } from '@/hooks/useReferral';

/**
 * Runs once on mount: if URL has ?ref=CODE, saves it to localStorage for use at purchase.
 * Place once in layout so every page load is covered.
 */
export default function ReferralDetect() {
  useEffect(() => {
    detectAndStoreReferralFromUrl();
  }, []);
  return null;
}
