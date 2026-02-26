'use client';

import { useAppStore } from '@/lib/store';
import { useEffect, useState } from 'react';

/** Compteur animé type "rolling numbers" vers la valeur cible */
function AnimatedNumber({ value, duration = 600 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const start = display;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 2);
      setDisplay(Math.round(start + (value - start) * eased));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value, duration]);

  return <span>{display.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>;
}

export default function JackpotCounter() {
  const jackpot = useAppStore((s) => s.jackpot);
  const [previousJackpot, setPreviousJackpot] = useState(jackpot);
  const [change24h, setChange24h] = useState(0);

  const isRising = jackpot >= previousJackpot && jackpot > 0;

  useEffect(() => {
    if (jackpot !== previousJackpot) {
      setChange24h((prev) => prev + (jackpot - previousJackpot));
      setPreviousJackpot(jackpot);
    }
  }, [jackpot, previousJackpot]);

  return (
    <div className="rounded-xl border border-amber-500/40 bg-gradient-to-b from-amber-950/50 to-black/50 p-6 text-center">
      <p className="text-amber-200/80 text-sm uppercase tracking-wider mb-1">Jackpot</p>
      <div
        className={`inline-flex items-baseline gap-1 text-4xl font-bold tracking-tight ${
          isRising ? 'text-green-400' : 'text-amber-400'
        }`}
      >
        <span className="drop-shadow-[0_0_12px_rgba(251,191,36,0.4)]">
          $<AnimatedNumber value={jackpot} />
        </span>
      </div>
      {change24h !== 0 && (
        <p className={`mt-2 text-sm ${change24h >= 0 ? 'text-green-400/90' : 'text-red-400/90'}`}>
          {change24h >= 0 ? '+' : ''}
          {change24h.toFixed(0)}$ dans les dernières 24h
        </p>
      )}
    </div>
  );
}
