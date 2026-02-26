'use client';

import { useStreak } from '@/hooks/useStreak';
import { useAppStore } from '@/lib/store';
import { Flame, Loader2, Ticket } from 'lucide-react';
import { useEffect, useState } from 'react';

const MILESTONES = [3, 5, 7, 14, 30] as const;
const MILESTONE_TICKETS: Record<number, number> = {
  3: 1,
  5: 2,
  7: 5,
  14: 10,
  30: 20,
};

export default function StreakDisplay() {
  const user = useAppStore((s) => s.user);
  const wallet = user?.address;
  const {
    currentStreak,
    longestStreak,
    nextRewardAt,
    bonusTicketsAvailable,
    streakRewardJustUnlocked,
    isLoading,
    error,
  } = useStreak(wallet);

  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (streakRewardJustUnlocked) {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 2500);
      return () => clearTimeout(t);
    }
  }, [streakRewardJustUnlocked]);

  if (!wallet) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-950/30 p-6 text-center">
        <p className="text-amber-200/80">
          Connect your wallet to see your streak and earn bonus tickets.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-950/30 p-8">
        <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
        <span className="text-amber-200/80">Loading streak…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-6 text-center">
        <p className="text-red-300">{error}</p>
      </div>
    );
  }

  const daysToNext = Math.max(0, nextRewardAt - currentStreak);
  const nextRewardTickets = MILESTONE_TICKETS[nextRewardAt] ?? 0;

  return (
    <div className="relative overflow-hidden rounded-xl border border-amber-500/40 bg-gradient-to-br from-amber-950/50 to-orange-950/30 p-6">
      {showConfetti && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-amber-400/10 animate-pulse" />
      )}

      <div className="flex items-center gap-3 mb-4">
        <div className="rounded-full bg-amber-500/20 p-2">
          <Flame className="h-8 w-8 text-amber-400 animate-pulse" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Streak</h3>
          <p className="text-amber-200/90 text-sm">
            {currentStreak === 0
              ? "Play today to start your streak! 🎯"
              : `${currentStreak} day${currentStreak > 1 ? 's' : ''} in a row`}
          </p>
        </div>
      </div>

      {currentStreak > 0 && (
        <>
          <div className="h-2 rounded-full bg-black/30 overflow-hidden mb-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
              style={{
                width: `${Math.min(100, (currentStreak / nextRewardAt) * 100)}%`,
              }}
            />
          </div>
          <p className="text-sm text-amber-200/80 mb-4">
            {daysToNext > 0
              ? `Only ${daysToNext} more day${daysToNext > 1 ? 's' : ''} to earn ${nextRewardTickets} bonus ticket${nextRewardTickets > 1 ? 's' : ''}!`
              : `Milestone reached: ${nextRewardTickets} bonus ticket(s)!`}
          </p>
        </>
      )}

      <div className="flex flex-wrap gap-4 pt-4 border-t border-amber-500/30">
        <div className="flex items-center gap-2">
          <Ticket className="h-5 w-5 text-amber-400" />
          <span className="text-white font-medium">{bonusTicketsAvailable}</span>
          <span className="text-amber-200/80 text-sm">bonus tickets</span>
        </div>
        <div className="text-amber-200/80 text-sm">
          Record: <span className="text-amber-300 font-medium">{longestStreak}</span> days
        </div>
      </div>
    </div>
  );
}
