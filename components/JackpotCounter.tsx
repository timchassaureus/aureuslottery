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

  if (jackpot === 0) {
    return (
      <p className="text-2xl font-bold text-[#8A8A95] italic leading-snug">
        Jackpot building —<br className="md:hidden" /> be the first to play tonight
      </p>
    );
  }

  return (
    <div className="text-center">
      <div
        className={`inline-flex items-baseline gap-1 text-5xl md:text-7xl font-black tracking-tight ${
          isRising ? 'text-green-400' : 'text-[#C9A84C]'
        }`}
      >
        <span className="drop-shadow-[0_0_40px_rgba(201,168,76,0.25)]">
          $<AnimatedNumber value={jackpot} />
        </span>
      </div>
      {change24h !== 0 && (
        <p className={`mt-2 text-sm ${change24h >= 0 ? 'text-green-400/90' : 'text-red-400/90'}`}>
          {change24h >= 0 ? '+' : ''}${Math.abs(change24h).toFixed(0)} in the last 24h
        </p>
      )}
    </div>
  );
}
