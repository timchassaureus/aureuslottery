'use client';

import { useEffect, useMemo, useRef } from 'react';
import { emitInAppNotification } from '@/lib/notificationBus';
import { sendBrowserNotification, shouldNotifyOnce } from '@/lib/webNotifications';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function maybeNotify(marker: string, title: string, message: string, type: 'reminder' | 'jackpot' | 'winner') {
  if (!shouldNotifyOnce(marker, 1000 * 60 * 60 * 24)) return;
  emitInAppNotification({
    message,
    type,
    time: new Date().toLocaleTimeString(),
  });
  sendBrowserNotification(title, message);
}

export default function NotificationAutomation({
  timeLeft,
  jackpot,
  connected,
  userTicketsCount,
}: {
  timeLeft: { hours: number; minutes: number; seconds: number };
  jackpot: number;
  connected: boolean;
  userTicketsCount: number;
}) {
  const prevJackpotRef = useRef(jackpot);

  const totalSeconds = useMemo(
    () => timeLeft.hours * 3600 + timeLeft.minutes * 60 + timeLeft.seconds,
    [timeLeft]
  );

  useEffect(() => {
    const day = todayKey();

    // Draw reminders
    if (totalSeconds <= 3600 && totalSeconds > 3540) {
      maybeNotify(
        `draw-60m-${day}`,
        'Aureus Draw in 60 minutes',
        'The main draw starts in 1 hour. Time to secure your tickets.',
        'reminder'
      );
    }
    if (totalSeconds <= 900 && totalSeconds > 840) {
      maybeNotify(
        `draw-15m-${day}`,
        'Aureus Draw in 15 minutes',
        'Final call before the draw. Good luck!',
        'reminder'
      );
    }
    if (totalSeconds <= 300 && totalSeconds > 240) {
      maybeNotify(
        `draw-5m-${day}`,
        'Aureus Draw in 5 minutes',
        'Draw starts very soon. Stay in the live room.',
        'reminder'
      );
    }
  }, [totalSeconds]);

  useEffect(() => {
    // Welcome-back ping (best effort, when user reopens app)
    try {
      const key = 'aureus_last_seen_ts';
      const now = Date.now();
      const last = Number(localStorage.getItem(key) || 0);
      localStorage.setItem(key, String(now));

      if (last > 0 && now - last > 1000 * 60 * 60 * 18) {
        maybeNotify(
          `welcome-back-${todayKey()}`,
          'Welcome back to Aureus',
          'Tonight draw is waiting. Your streak can continue today.',
          'reminder'
        );
      }
    } catch {
      // Ignore localStorage failures
    }
  }, []);

  useEffect(() => {
    const previous = prevJackpotRef.current;
    prevJackpotRef.current = jackpot;

    if (jackpot <= previous) return;
    const increase = jackpot - previous;

    // Significant jump
    if (increase >= 500) {
      maybeNotify(
        `jackpot-jump-${todayKey()}-${Math.floor(jackpot / 500)}`,
        'Jackpot is rising fast',
        `+${increase.toFixed(0)}$ added recently. More players are joining now.`,
        'jackpot'
      );
    }

    // Milestones
    const milestones = [5000, 10000, 25000, 50000, 100000, 250000];
    for (const milestone of milestones) {
      if (previous < milestone && jackpot >= milestone) {
        maybeNotify(
          `jackpot-milestone-${todayKey()}-${milestone}`,
          `Jackpot reached ${milestone.toLocaleString('en-US')}$`,
          'Momentum is strong. This draw will be huge.',
          'jackpot'
        );
      }
    }
  }, [jackpot]);

  useEffect(() => {
    if (!connected || userTicketsCount > 0) return;
    const day = todayKey();
    maybeNotify(
      `nudge-no-ticket-${day}`,
      'No ticket yet today',
      'Grab at least one ticket to stay in the action tonight.',
      'reminder'
    );
  }, [connected, userTicketsCount]);

  return null;
}

