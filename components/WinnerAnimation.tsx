'use client';
import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';

interface Props {
  winner?: string;
  winners?: Array<{ address: string; prize: number }>;
  prize?: number;
  drawType: '8pm' | '10pm';
  userAddress?: string;
  onClose: () => void;
}

export default function WinnerAnimation({ winners, drawType, userAddress, onClose }: Props) {
  const { user } = useAppStore();
  const [visible, setVisible] = useState(false);

  const effectiveAddress = (userAddress || user?.address || '').toLowerCase();
  const prizeEach = winners?.[0]?.prize ?? 0;
  const didWin = !!effectiveAddress && winners?.some(w => w.address.toLowerCase() === effectiveAddress);

  useEffect(() => {
    setVisible(true);
    const t = setTimeout(onClose, 18000);
    return () => clearTimeout(t);
  }, [onClose]);

  if (!visible || drawType !== '10pm' || !winners?.length) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-xl bg-gradient-to-br from-violet-950 via-purple-950 to-slate-900 border border-violet-500/40 rounded-3xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-8 pb-4 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-violet-400/70 mb-2">💎 Bonus Draw Results</p>
          <p className="text-4xl font-black text-white">
            {winners.length} Winners
          </p>
          <p className="text-lg text-violet-300 mt-1">
            ${prizeEach.toFixed(2)} <span className="text-slate-400 font-normal">each</span>
          </p>
        </div>

        {/* You won banner */}
        {didWin && (
          <div className="mx-6 mb-4 rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 px-5 py-4 text-center">
            <p className="text-2xl font-black text-green-400">🎉 You're a winner!</p>
            <p className="text-sm text-green-300/80 mt-1">${prizeEach.toFixed(2)} USDC will be sent to your wallet</p>
          </div>
        )}

        {/* Winners list */}
        <div className="mx-6 mb-4 max-h-64 overflow-y-auto rounded-xl border border-white/[0.06] bg-black/20">
          {winners.map((w, i) => {
            const isMe = !!effectiveAddress && w.address.toLowerCase() === effectiveAddress;
            return (
              <div
                key={i}
                className={`flex items-center justify-between px-4 py-2.5 border-b border-white/[0.04] last:border-b-0 ${isMe ? 'bg-green-500/10' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-slate-600 text-xs tabular-nums w-5">{i + 1}</span>
                  <span className={`font-mono text-sm ${isMe ? 'text-green-400 font-bold' : 'text-slate-300'}`}>
                    {w.address.slice(0, 6)}…{w.address.slice(-4)}
                    {isMe && <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full">you</span>}
                  </span>
                </div>
                <span className="text-green-400 font-bold text-sm">${w.prize.toFixed(2)}</span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-violet-700 hover:bg-violet-600 font-bold text-white transition-colors"
          >
            Continue
          </button>
          <p className="text-center text-xs text-slate-600 mt-3">Auto-closes in a few seconds</p>
        </div>

      </div>
    </div>
  );
}
