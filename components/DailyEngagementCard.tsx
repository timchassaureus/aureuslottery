'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bell, CheckCircle2, Crown, Gift, Sparkles, Star, Target, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';

type MissionState = {
  date: string;
  baselineTickets: number;
  completed: {
    visit: boolean;
    buy: boolean;
    share: boolean;
  };
  streakDays: number;
};

const STORAGE_KEY = 'aureus_daily_missions_v1';
const CHEST_STORAGE_KEY = 'aureus_daily_chest_v1';
const XP_STORAGE_KEY = 'aureus_xp_points_v1';

const VIP_TIERS = [
  { name: 'Bronze', minTickets: 0, color: 'text-amber-300' },
  { name: 'Silver', minTickets: 50, color: 'text-slate-200' },
  { name: 'Gold', minTickets: 200, color: 'text-yellow-300' },
  { name: 'Legend', minTickets: 1000, color: 'text-amber-300' },
] as const;

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getYesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function defaultState(userTicketsCount: number): MissionState {
  return {
    date: getTodayKey(),
    baselineTickets: userTicketsCount,
    completed: {
      visit: true,
      buy: false,
      share: false,
    },
    streakDays: 1,
  };
}

function getTodayTarget(userTicketsCount: number, jackpot: number) {
  if (jackpot > 100000) return Math.max(20, userTicketsCount + 10);
  if (userTicketsCount < 3) return 3;
  if (userTicketsCount < 10) return 10;
  return 20;
}

export default function DailyEngagementCard({
  userTicketsCount,
  lifetimeTickets,
  jackpot,
}: {
  userTicketsCount: number;
  lifetimeTickets: number;
  jackpot: number;
}) {
  const [state, setState] = useState<MissionState>(() => defaultState(userTicketsCount));
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('unsupported');
  const [chestClaimed, setChestClaimed] = useState(false);
  const [xpPoints, setXpPoints] = useState(0);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        setPermission(Notification.permission);
      }
      const xpRaw = localStorage.getItem(XP_STORAGE_KEY);
      if (xpRaw) {
        setXpPoints(Number(xpRaw) || 0);
      }

      const chestRaw = localStorage.getItem(CHEST_STORAGE_KEY);
      if (chestRaw) {
        const chest = JSON.parse(chestRaw) as { date: string; claimed: boolean };
        if (chest.date === getTodayKey()) {
          setChestClaimed(Boolean(chest.claimed));
        }
      }

      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState(userTicketsCount)));
        return;
      }

      const parsed = JSON.parse(raw) as MissionState;
      const today = getTodayKey();
      if (parsed.date === today) {
        setState(parsed);
        return;
      }

      const allDoneYesterday = Object.values(parsed.completed).every(Boolean);
      const nextStreak =
        allDoneYesterday && parsed.date === getYesterdayKey() ? parsed.streakDays + 1 : 1;
      const next = {
        ...defaultState(userTicketsCount),
        streakDays: nextStreak,
      };
      setState(next);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore localStorage parse failures
    }
  }, [userTicketsCount]);

  useEffect(() => {
    const buyCompleted = userTicketsCount > state.baselineTickets;
    if (buyCompleted && !state.completed.buy) {
      const next: MissionState = {
        ...state,
        completed: {
          ...state.completed,
          buy: true,
        },
      };
      setState(next);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore localStorage write failures
      }
    }
  }, [userTicketsCount, state]);

  const progress = useMemo(() => Object.values(state.completed).filter(Boolean).length, [state]);
  const completedAll = progress === 3;
  const todayTarget = getTodayTarget(userTicketsCount, jackpot);
  const targetProgress = Math.min(100, (userTicketsCount / todayTarget) * 100);

  const currentTier = useMemo(() => {
    return [...VIP_TIERS].reverse().find((tier) => lifetimeTickets >= tier.minTickets) ?? VIP_TIERS[0];
  }, [lifetimeTickets]);

  const nextTier = useMemo(() => {
    return VIP_TIERS.find((tier) => tier.minTickets > lifetimeTickets) ?? null;
  }, [lifetimeTickets]);

  const toNextTier = nextTier ? nextTier.minTickets - lifetimeTickets : 0;

  const markShareDone = () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://aureuslottery.app';
    const shareText = 'Join me on AUREUS. Daily draws, big jackpots, 1$ tickets.';
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: 'AUREUS', text: shareText, url: shareUrl }).catch(() => {});
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).catch(() => {});
    }

    if (state.completed.share) return;
    const next: MissionState = {
      ...state,
      completed: {
        ...state.completed,
        share: true,
      },
    };
    setState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore localStorage write failures
    }
  };

  const enableReminder = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermission('unsupported');
      return;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  const claimChest = () => {
    if (!completedAll) {
      toast.error('Complete all missions first to unlock the chest.');
      return;
    }
    if (chestClaimed) {
      toast('Daily chest already claimed.');
      return;
    }

    const rewardXp = Math.max(20, state.streakDays * 5);
    const nextXp = xpPoints + rewardXp;
    setXpPoints(nextXp);
    setChestClaimed(true);
    try {
      localStorage.setItem(XP_STORAGE_KEY, String(nextXp));
      localStorage.setItem(
        CHEST_STORAGE_KEY,
        JSON.stringify({ date: getTodayKey(), claimed: true })
      );
    } catch {
      // Ignore localStorage write failures
    }
    toast.success(`Chest opened! +${rewardXp} XP`);
  };

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-black/40 p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-300" />
          <h3 className="text-base font-bold text-white">Daily Missions</h3>
        </div>
        <div className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-200">
          <Trophy className="h-3.5 w-3.5" />
          {state.streakDays} day streak
        </div>
      </div>

      <p className="mt-2 text-sm text-amber-200/80">
        Complete all 3 missions each day to keep your momentum and return streak alive.
      </p>

      <div className="mt-4 space-y-2.5">
        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2">
          <span className="text-sm text-white/90">Open the app today</span>
          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2">
          <span className="text-sm text-white/90">Buy at least 1 ticket</span>
          {state.completed.buy ? (
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
          ) : (
            <span className="text-xs text-amber-300">Pending</span>
          )}
        </div>

        <button
          onClick={markShareDone}
          className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-left hover:border-amber-400/40 transition-colors"
        >
          <span className="text-sm text-white/90">Invite 1 friend / share link</span>
          {state.completed.share ? (
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
          ) : (
            <span className="text-xs text-amber-200">Tap to do</span>
          )}
        </button>
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-amber-200/80">Daily progress</span>
          <span className="text-white">{progress}/3</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-black/35">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 transition-all duration-500"
            style={{ width: `${(progress / 3) * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-3">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2">
            <Crown className={`h-4 w-4 ${currentTier.color}`} />
            <span className="text-sm text-white">
              VIP Tier: <span className={`font-semibold ${currentTier.color}`}>{currentTier.name}</span>
            </span>
          </div>
          <span className="text-xs text-amber-200/80">{lifetimeTickets} lifetime tickets</span>
        </div>
        {nextTier ? (
          <p className="mt-1 text-xs text-amber-200/80">
            {toNextTier} tickets to reach <span className={nextTier.color}>{nextTier.name}</span>
          </p>
        ) : (
          <p className="mt-1 text-xs text-amber-200">Max tier unlocked.</p>
        )}
      </div>

      <div className="mt-3 rounded-lg border border-white/10 bg-black/20 p-3">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1 text-amber-200/80">
            <Target className="h-3.5 w-3.5" />
            Today target
          </span>
          <span className="text-white">{userTicketsCount}/{todayTarget} tickets</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-black/35">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 transition-all duration-500"
            style={{ width: `${targetProgress}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={enableReminder}
          className="inline-flex items-center gap-2 rounded-lg border border-blue-400/30 bg-blue-500/10 px-3 py-1.5 text-xs text-blue-100 hover:bg-blue-500/20 transition-colors"
        >
          <Bell className="h-3.5 w-3.5" />
          {permission === 'granted' ? 'Draw reminder enabled' : 'Enable reminder'}
        </button>

        <span
          className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs ${
            completedAll
              ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
              : 'border-amber-400/30 bg-amber-500/10 text-amber-200'
          }`}
        >
          <Gift className="h-3.5 w-3.5" />
          {completedAll ? 'Daily missions complete' : 'Complete all missions today'}
        </span>

        <button
          onClick={claimChest}
          className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs transition-colors ${
            chestClaimed
              ? 'border-slate-500/30 bg-slate-500/10 text-slate-300'
              : 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20'
          }`}
        >
          <Star className="h-3.5 w-3.5" />
          {chestClaimed ? 'Chest claimed' : 'Open daily chest'}
        </button>
      </div>

      <p className="mt-2 text-[11px] text-amber-200/70">
        XP: <span className="font-semibold text-white">{xpPoints}</span> •
        {' '}Comeback bonus multiplier: <span className="font-semibold text-amber-200">x{Math.min(5, Math.max(1, state.streakDays))}</span>
      </p>
    </div>
  );
}

