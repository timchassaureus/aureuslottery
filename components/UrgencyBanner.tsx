'use client';

import { useAppStore } from '@/lib/store';

interface Props {
  timeLeft: { hours: number; minutes: number; seconds: number };
}

export default function UrgencyBanner({ timeLeft }: Props) {
  const jackpot = useAppStore((s) => s.jackpot);
  const totalMinutes = timeLeft.hours * 60 + timeLeft.minutes;

  // Hide if no pot yet (nothing to be urgent about) or more than 30 min left
  if (jackpot === 0 || totalMinutes > 30) return null;

  const isLastMinutes = totalMinutes <= 5;
  const bgColor = isLastMinutes ? 'from-red-600 to-[#e8c97a]' : 'from-[#C9A84C] to-yellow-600';
  const text = isLastMinutes ? '🚨 LAST MINUTES!' : '⚠️ LAST 30 MINUTES!';

  return (
    <div className={`fixed top-0 left-0 right-0 bg-gradient-to-r ${bgColor} py-2 px-4 z-[100] animate-pulse`}>
      <div className="container mx-auto text-center">
        <p className="text-white font-black text-lg md:text-xl uppercase tracking-wide">
          {text} Draw closing soon! Don't miss out!
        </p>
      </div>
    </div>
  );
}

