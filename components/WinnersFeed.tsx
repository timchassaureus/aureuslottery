'use client';

import { useEffect, useState } from 'react';

interface WinnerEntry {
  wallet_address: string;
  amount_usd: number;
  draw_type: string;
  draw_date: string;
  demo?: boolean;
}

function truncateAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

// Demo data for social proof when there are no real winners yet
const DEMO_WINNERS: WinnerEntry[] = [
  { wallet_address: '0x7f3a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6b2c1', amount_usd: 47.5, draw_type: 'bonus', draw_date: new Date().toISOString(), demo: true },
  { wallet_address: '0xa1b2c3d4e5f6789012345678901234567890abcd', amount_usd: 125, draw_type: 'main', draw_date: new Date().toISOString(), demo: true },
  { wallet_address: '0x1234567890abcdef1234567890abcdef12345678', amount_usd: 12.5, draw_type: 'bonus', draw_date: new Date().toISOString(), demo: true },
];

export default function WinnersFeed() {
  const [winners, setWinners] = useState<WinnerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWinners = async () => {
    try {
      const res = await fetch('/api/winners?limit=20');
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setWinners(data.map((r: WinnerEntry) => ({ ...r, demo: false })));
      } else {
        setWinners(DEMO_WINNERS);
      }
    } catch {
      setWinners(DEMO_WINNERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWinners();
    const interval = setInterval(fetchWinners, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-[#C9A84C]/ bg-black/40 p-4 h-32 flex items-center justify-center">
        <span className="text-[#F5F0E8]/ text-sm">Loading winners…</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#C9A84C]/ bg-black/40 overflow-hidden">
      <div className="px-4 py-2 border-b border-[#C9A84C]/">
        <h3 className="text-sm font-semibold text-[#F5F0E8]">Latest winners</h3>
      </div>
      <div className="max-h-48 overflow-y-auto divide-y divide-[#C9A84C]/10">
        {winners.map((w, i) => (
          <div
            key={`${w.wallet_address}-${w.draw_date}-${i}`}
            className="px-4 py-2 flex items-center justify-between gap-2 animate-in slide-in-from-top-2 duration-300"
          >
            <span className="text-gray-300 text-sm">
              🎉 {truncateAddress(w.wallet_address)} just won{' '}
              <span
                className={
                  w.draw_type === 'main'
                    ? 'text-[#C9A84C] font-semibold'
                    : 'text-gray-400 font-medium'
                }
              >
                ${w.amount_usd.toFixed(2)}
              </span>{' '}
              on the {w.draw_type === 'main' ? 'Jackpot' : 'Bonus Draw'}!
            </span>
            {w.demo && (
              <span className="shrink-0 text-xs text-[#C9A84C]/ border border-[#C9A84C]/ rounded px-1.5 py-0.5">
                Demo
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
