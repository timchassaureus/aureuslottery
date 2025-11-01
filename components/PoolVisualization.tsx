'use client';

import { TrendingUp, DollarSign, Clock, Users2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useEffect, useState } from 'react';

export default function PoolVisualization() {
  const { jackpot, secondaryPot, totalTicketsSold } = useAppStore();
  const [previousJackpot, setPreviousJackpot] = useState(jackpot);
  const [jackpotIncrease, setJackpotIncrease] = useState(0);

  useEffect(() => {
    if (jackpot > previousJackpot) {
      setJackpotIncrease(jackpot - previousJackpot);
      setPreviousJackpot(jackpot);
      
      // Reset animation after 3s
      const timer = setTimeout(() => setJackpotIncrease(0), 3000);
      return () => clearTimeout(timer);
    }
  }, [jackpot, previousJackpot]);

  const totalPot = jackpot + secondaryPot;
  const secondaryWinnerPrize = Math.floor(secondaryPot / 25);

  return (
    <div className="bg-gradient-to-br from-indigo-950/50 via-purple-950/50 to-blue-950/50 backdrop-blur-xl border-2 border-white/10 rounded-2xl p-6 hover:border-white/30 transition-all">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <DollarSign className="w-6 h-6 text-green-400" />
          <h3 className="text-xl font-bold text-white">Live Pool Stats</h3>
        </div>
        {jackpotIncrease > 0 && (
          <div className="bg-green-500/20 px-4 py-2 rounded-full border border-green-500/30 animate-bounce">
            <p className="text-green-400 font-bold text-sm">
              +${jackpotIncrease.toLocaleString('en-US')} 🔥
            </p>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Main Jackpot */}
        <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 rounded-xl p-4 border-2 border-yellow-600/40 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 animate-pulse"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-2xl">🏆</div>
              <span className="text-xs text-yellow-300 font-bold">8PM JACKPOT</span>
            </div>
            <p className="text-3xl font-black text-yellow-400 mb-1">
              ${jackpot.toLocaleString('en-US')}
            </p>
            <p className="text-xs text-yellow-600">1 Winner • 85%</p>
          </div>
        </div>

        {/* Secondary Pot */}
        <div className="bg-gradient-to-br from-violet-900/30 to-fuchsia-900/30 rounded-xl p-4 border-2 border-violet-600/40 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 animate-pulse"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-2xl">🎁</div>
              <span className="text-xs text-violet-300 font-bold">10PM DRAW</span>
            </div>
            <p className="text-3xl font-black text-violet-400 mb-1">
              ${secondaryPot.toLocaleString('en-US')}
            </p>
            <p className="text-xs text-violet-600">25 Winners • ${secondaryWinnerPrize} each</p>
          </div>
        </div>

        {/* Total Tickets */}
        <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 rounded-xl p-4 border-2 border-blue-600/40">
          <div className="flex items-center gap-2 mb-2">
            <Users2 className="w-5 h-5 text-blue-400" />
            <span className="text-xs text-blue-300 font-bold">TOTAL TICKETS</span>
          </div>
          <p className="text-3xl font-black text-blue-400 mb-1">
            {totalTicketsSold.toLocaleString('en-US')}
          </p>
          <p className="text-xs text-blue-600">Sold Today</p>
        </div>

        {/* Total Prize Pool */}
        <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-xl p-4 border-2 border-green-600/40">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-xs text-green-300 font-bold">TOTAL POOL</span>
          </div>
          <p className="text-3xl font-black text-green-400 mb-1">
            ${totalPot.toLocaleString('en-US')}
          </p>
          <p className="text-xs text-green-600">Combined Prizes</p>
        </div>
      </div>

      {/* Live Activity Indicator */}
      <div className="mt-4 flex items-center justify-center gap-2 p-3 bg-slate-900/30 rounded-lg border border-white/10">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <Clock className="w-4 h-4 text-slate-400" />
        <span className="text-sm text-slate-300">Live Updates • Real-time Stats</span>
      </div>
    </div>
  );
}

