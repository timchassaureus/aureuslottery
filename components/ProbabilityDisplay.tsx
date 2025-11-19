'use client';

import { TrendingUp, Users, Target } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function ProbabilityDisplay() {
  const { user, totalTicketsSold, currentDrawNumber } = useAppStore();

  if (!user || totalTicketsSold === 0) return null;

  const userTickets =
    user.ticketCount ??
    user.tickets.filter(t => t.drawNumber === currentDrawNumber).length;
  const probability = (userTickets / totalTicketsSold) * 100;
  const needForOnePercent = Math.ceil(totalTicketsSold * 0.01) - userTickets;

  return (
    <div className="bg-gradient-to-br from-indigo-950/50 via-purple-950/50 to-blue-950/50 backdrop-blur-xl border-2 border-white/10 rounded-2xl p-6 hover:border-white/30 transition-all">
      <div className="flex items-center gap-3 mb-4">
        <Target className="w-6 h-6 text-violet-400" />
        <h3 className="text-xl font-bold text-white">Your Chances</h3>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Your Tickets */}
        <div className="bg-violet-900/20 rounded-xl p-4 border border-violet-700/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-2xl">🎫</div>
            <span className="text-sm text-slate-300">Your Tickets</span>
          </div>
          <p className="text-3xl font-black text-violet-400">{userTickets}</p>
        </div>

        {/* Total Tickets */}
        <div className="bg-blue-900/20 rounded-xl p-4 border border-blue-700/30">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-slate-300">Total Tickets</span>
          </div>
          <p className="text-3xl font-black text-blue-400">{totalTicketsSold.toLocaleString()}</p>
        </div>

        {/* Probability */}
        <div className="bg-fuchsia-900/20 rounded-xl p-4 border border-fuchsia-700/30">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-fuchsia-400" />
            <span className="text-sm text-slate-300">Win Chance</span>
          </div>
          <p className="text-3xl font-black text-fuchsia-400">{probability.toFixed(3)}%</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-300">Progress to 1% odds</span>
          <span className="text-violet-400 font-bold">
            {probability >= 1 ? '🔥 1%+ Achieved!' : `${needForOnePercent} more tickets`}
          </span>
        </div>
        <div className="w-full bg-slate-800/50 rounded-full h-4 border border-white/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 transition-all duration-500 shadow-lg relative"
            style={{ width: `${Math.min(probability * 100, 100)}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
        {probability >= 1 && (
          <p className="text-xs text-center text-green-400 mt-2 font-bold">
            ⭐ You're in the top tier of players!
          </p>
        )}
      </div>

      {/* Motivation */}
      {probability < 1 && needForOnePercent > 0 && (
        <div className="mt-4 p-3 bg-violet-900/20 rounded-lg border border-violet-700/30">
          <p className="text-sm text-center text-violet-300">
            💡 Buy <span className="text-white font-bold">{needForOnePercent}</span> more tickets to reach{' '}
            <span className="text-violet-400 font-bold">1% odds</span>!
          </p>
        </div>
      )}
    </div>
  );
}

