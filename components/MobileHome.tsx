'use client';

import { useEffect, useState } from 'react';
import { Trophy, Timer, User } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import WalletButton from '@/components/WalletButton';
import BuyTicketsModal from '@/components/BuyTicketsModal';
import EnhancedWinnersHistory from '@/components/EnhancedWinnersHistory';
import toast from 'react-hot-toast';

export default function MobileHome() {
  const { jackpot, secondaryPot, user } = useAppStore();
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
  const [buyOpen, setBuyOpen] = useState(false);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const target = new Date();
      target.setUTCHours(21, 0, 0, 0);
      if (now.getUTCHours() >= 21) target.setUTCDate(target.getUTCDate() + 1);
      const diff = target.getTime() - now.getTime();
      setTimeLeft({
        h: Math.max(0, Math.floor(diff / 3600000)),
        m: Math.max(0, Math.floor((diff % 3600000) / 60000)),
        s: Math.max(0, Math.floor((diff % 60000) / 1000)),
      });
    };
    const id = setInterval(tick, 1000);
    tick();
    return () => clearInterval(id);
  }, []);

  return (
    <div className="md:hidden min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 text-white">
      {/* Header */}
      <header className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-primary-400" />
          <span className="text-xl font-black">AUREUS</span>
        </div>
        <div className="flex items-center gap-2">
          {user && (
            <button className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 text-sm flex items-center gap-1">
              <User className="w-4 h-4" /> Profile
            </button>
          )}
          <WalletButton />
        </div>
      </header>

      {/* Countdown + Jackpot */}
      <main className="px-4 pb-28">
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300">
            <Timer className="w-4 h-4" />
            Next draw in {String(timeLeft.h).padStart(2,'0')}:{String(timeLeft.m).padStart(2,'0')}:{String(timeLeft.s).padStart(2,'0')}
          </div>
          <div className="mt-3 text-primary-400 text-sm font-bold">Current Jackpot</div>
          <div className="mt-1 text-5xl font-black bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
            ${jackpot.toLocaleString('en-US')}
          </div>
          <div className="mt-1 text-xs text-slate-300">Daily at 9PM UTC • 1 Winner</div>
        </div>

        {/* CTA */}
        <div className="mt-5">
          <button
            onClick={() => {
              if (!user) return toast.error('Connect your wallet first 👛');
              setBuyOpen(true);
            }}
            className="w-full py-4 rounded-2xl text-lg font-black bg-gradient-to-r from-violet-600 to-indigo-600 border-2 border-white/20 shadow-lg"
          >
            🎫 Buy Tickets Now
          </button>
          <p className="text-center text-yellow-300 text-xs mt-2">Every ticket also enters the 11PM Bonus Draw (${secondaryPot.toLocaleString('en-US')})</p>
        </div>

        {/* Winners */}
        <div className="mt-6">
          <EnhancedWinnersHistory />
        </div>
      </main>

      {/* Sticky bottom action */}
      <div className="fixed bottom-0 inset-x-0 px-4 pb-[max(env(safe-area-inset-bottom,0px),12px)] pt-2 bg-slate-950/70 backdrop-blur border-t border-white/10">
        <button
          onClick={() => {
            if (!user) return toast.error('Connect your wallet first 👛');
            setBuyOpen(true);
          }}
          className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 text-black"
        >
          Buy for $1 USDC
        </button>
      </div>

      <BuyTicketsModal isOpen={buyOpen} onClose={() => setBuyOpen(false)} />
    </div>
  );
}


