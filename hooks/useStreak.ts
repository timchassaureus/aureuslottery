'use client';

import { useEffect, useState, useCallback } from 'react';

const MILESTONES = [3, 5, 7, 14, 30] as const;
const MILESTONE_TICKETS: Record<number, number> = {
  3: 1,
  5: 2,
  7: 5,
  14: 10,
  30: 20,
};

export interface UseStreakResult {
  currentStreak: number;
  longestStreak: number;
  bonusTicketsAvailable: number;
  nextRewardAt: number;
  streakRewardJustUnlocked: boolean;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateStreak: (walletAddress: string) => Promise<{ bonusGranted: number }>;
}

/**
 * Hook : charge le streak du wallet connecté et expose updateStreak pour après un achat.
 */
export function useStreak(walletAddress: string | undefined): UseStreakResult {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [bonusTicketsAvailable, setBonusTicketsAvailable] = useState(0);
  const [nextRewardAt, setNextRewardAt] = useState(3);
  const [streakRewardJustUnlocked, setStreakRewardJustUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStreak = useCallback(async () => {
    if (!walletAddress) {
      setCurrentStreak(0);
      setLongestStreak(0);
      setBonusTicketsAvailable(0);
      setNextRewardAt(3);
      setIsLoading(false);
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/streak?wallet=${encodeURIComponent(walletAddress.toLowerCase())}`
      );
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setCurrentStreak(data.currentStreak ?? 0);
      setLongestStreak(data.longestStreak ?? 0);
      setBonusTicketsAvailable(data.totalBonusTickets ?? 0);
      const next = MILESTONES.find((m) => m > (data.currentStreak ?? 0)) ?? 30;
      setNextRewardAt(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setCurrentStreak(0);
      setLongestStreak(0);
      setBonusTicketsAvailable(0);
      setNextRewardAt(3);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  const updateStreak = useCallback(
    async (address: string): Promise<{ bonusGranted: number }> => {
      const res = await fetch('/api/streak/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address.toLowerCase() }),
      });
      if (!res.ok) return { bonusGranted: 0 };
      const data = await res.json();
      setCurrentStreak(data.currentStreak ?? 0);
      setLongestStreak(data.longestStreak ?? 0);
      setStreakRewardJustUnlocked(!!data.streakRewardJustUnlocked);
      if (data.bonusTicketsGranted) {
        setBonusTicketsAvailable((prev) => prev + data.bonusTicketsGranted);
      }
      await fetchStreak();
      return { bonusGranted: data.bonusTicketsGranted ?? 0 };
    },
    [fetchStreak]
  );

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  return {
    currentStreak,
    longestStreak,
    bonusTicketsAvailable,
    nextRewardAt,
    streakRewardJustUnlocked,
    isLoading,
    error,
    refresh: fetchStreak,
    updateStreak,
  };
}
