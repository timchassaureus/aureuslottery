'use client';

import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAppStore } from '@/lib/store';

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
 * Syncs bonusTickets to Zustand store. Shows toasts on milestone and weekly rank rewards.
 */
export function useStreak(walletAddress: string | undefined): UseStreakResult {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [bonusTicketsAvailable, setBonusTicketsAvailable] = useState(0);
  const [nextRewardAt, setNextRewardAt] = useState(3);
  const [streakRewardJustUnlocked, setStreakRewardJustUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setBonusTickets = useAppStore((s) => s.setBonusTickets);
  const setCurrentStreakStore = useAppStore((s) => s.setCurrentStreak);

  const fetchStreak = useCallback(async () => {
    if (!walletAddress) {
      setCurrentStreak(0);
      setLongestStreak(0);
      setBonusTicketsAvailable(0);
      setNextRewardAt(3);
      setBonusTickets(0);
      setCurrentStreakStore(0);
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
      const streak = data.currentStreak ?? 0;
      const bonusTotal = data.totalBonusTickets ?? 0;

      setCurrentStreak(streak);
      setLongestStreak(data.longestStreak ?? 0);
      setBonusTicketsAvailable(bonusTotal);
      const next = MILESTONES.find((m) => m > streak) ?? 30;
      setNextRewardAt(next);

      // Sync to Zustand store so any component can read bonusTickets / currentStreak
      setBonusTickets(bonusTotal);
      setCurrentStreakStore(streak);

      // Show weekly rank reward notification (once per reward, tracked in localStorage)
      if (data.weeklyRankReward) {
        const { rank, amount, awardedAt } = data.weeklyRankReward;
        const notifKey = `aureus_notified_weekly_rank_${awardedAt?.slice(0, 10) ?? 'unknown'}`;
        if (typeof window !== 'undefined' && !localStorage.getItem(notifKey)) {
          localStorage.setItem(notifKey, '1');
          const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉';
          toast.success(
            `${rankEmoji} Leaderboard reward! You finished rank #${rank} last week and received +${amount} bonus tickets!`,
            { duration: 8000 }
          );
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setCurrentStreak(0);
      setLongestStreak(0);
      setBonusTicketsAvailable(0);
      setNextRewardAt(3);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, setBonusTickets, setCurrentStreakStore]);

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
      const granted = data.bonusTicketsGranted ?? 0;
      if (granted) {
        setBonusTicketsAvailable((prev) => prev + granted);
        setBonusTickets(bonusTicketsAvailable + granted);
      }

      // Toast on milestone unlock
      if (data.streakRewardJustUnlocked && granted > 0) {
        const streak = data.currentStreak ?? 0;
        const milestoneBonus = MILESTONE_TICKETS[streak] ?? 0;
        if (milestoneBonus > 0) {
          toast.success(
            `🔥 ${streak}-day streak milestone! +${milestoneBonus} bonus ticket${milestoneBonus > 1 ? 's' : ''} added to your pool!`,
            { duration: 6000 }
          );
        } else {
          toast.success(`🔥 Day ${streak} streak! +1 bonus ticket added.`, { duration: 4000 });
        }
      }

      await fetchStreak();
      return { bonusGranted: granted };
    },
    [fetchStreak, bonusTicketsAvailable, setBonusTickets]
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
