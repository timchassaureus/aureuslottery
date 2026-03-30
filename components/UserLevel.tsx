'use client';

import { Trophy, Star, Crown } from 'lucide-react';
import { useAppStore } from '@/lib/store';

interface Level {
  name: string;
  min: number;
  icon: 'bronze' | 'silver' | 'gold' | 'platinum';
  color: string;
}

const LEVELS: Level[] = [
  { name: 'Novice', min: 0, icon: 'bronze', color: 'from-[#C9A84C] to-[#A68A3E]' },
  { name: 'Beginner', min: 50, icon: 'bronze', color: 'from-[#C9A84C] to-[#A68A3E]' },
  { name: 'Amateur', min: 100, icon: 'silver', color: 'from-slate-300 to-slate-500' },
  { name: 'Dedicated', min: 300, icon: 'silver', color: 'from-slate-400 to-zinc-500' },
  { name: 'Skilled', min: 500, icon: 'silver', color: 'from-zinc-400 to-gray-600' },
  { name: 'Expert', min: 800, icon: 'gold', color: 'from-yellow-400 to-yellow-600' },
  { name: 'Veteran', min: 1500, icon: 'gold', color: 'from-[#C9A84C] to-[#e8c97a]' },
  { name: 'Pro', min: 2000, icon: 'gold', color: 'from-[#C9A84C] to-[#A68A3E]' },
  { name: 'Master', min: 5000, icon: 'platinum', color: 'from-[#C9A84C] to-[#A68A3E]' },
  { name: 'Elite', min: 8000, icon: 'platinum', color: 'from-[#C9A84C] to-[#e8c97a]' },
  { name: 'Supreme', min: 12000, icon: 'platinum', color: 'from-[#C9A84C] to-[#e8c97a]' },
  { name: 'Legend', min: 20000, icon: 'platinum', color: 'from-[#C9A84C] via-[#e8c97a] to-[#A68A3E]' },
];

function getLevel(ticketCount: number): Level {
  return LEVELS.filter(l => ticketCount >= l.min).pop() || LEVELS[0];
}

function getLevelIcon(icon: string) {
  switch (icon) {
    case 'bronze':
      return <Trophy className="w-5 h-5 text-[#C9A84C]" />;
    case 'silver':
      return <Star className="w-5 h-5 text-gray-400" />;
    case 'gold':
      return <Star className="w-5 h-5 text-yellow-400" />;
    case 'platinum':
      return <Crown className="w-5 h-5 text-[#C9A84C]" />;
    default:
      return <Trophy className="w-5 h-5" />;
  }
}

export default function UserLevel() {
  const { user } = useAppStore();

  if (!user) return null;

  const ticketCount = user.ticketCount ?? user.tickets.length;
  const currentLevel = getLevel(ticketCount);
  const nextLevel = LEVELS.find(l => l.min > ticketCount) || LEVELS[LEVELS.length - 1];
  const progress = nextLevel ? ((ticketCount / nextLevel.min) * 100) : 100;

  return (
    <div className="bg-gradient-to-br from-[#0A0A0F] to-[#09090f] backdrop-blur-xl border-2 border-white/10 rounded-2xl p-6 hover:border-white/30 transition-all">
      <div className="flex items-center gap-3 mb-4">
        {getLevelIcon(currentLevel.icon)}
        <div>
          <h3 className="font-bold text-lg text-white">Level: {currentLevel.name}</h3>
          <p className="text-sm text-slate-300">
            {ticketCount} ticket{ticketCount > 1 ? 's' : ''} purchased
          </p>
        </div>
      </div>

      {nextLevel && ticketCount < LEVELS[LEVELS.length - 1].min && (
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-300">Next level: {nextLevel.name}</span>
            <span className="text-[#C9A84C] font-bold">
              {ticketCount}/{nextLevel.min}
            </span>
          </div>
          <div className="w-full bg-slate-800/50 rounded-full h-3 border border-white/10">
            <div
              className={`h-full bg-gradient-to-r ${currentLevel.color} rounded-full transition-all duration-500 shadow-lg`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {nextLevel.min - ticketCount} more ticket{nextLevel.min - ticketCount > 1 ? 's' : ''} to next level
          </p>
        </div>
      )}

      {ticketCount >= LEVELS[LEVELS.length - 1].min && (
        <div className="text-center py-4">
          <Crown className="w-8 h-8 text-yellow-400 mx-auto mb-2 animate-pulse drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
          <p className="text-yellow-400 font-bold text-lg">MAX LEVEL REACHED! 🔥</p>
          <p className="text-xs text-slate-400 mt-1">You are a true Legend</p>
        </div>
      )}
    </div>
  );
}

