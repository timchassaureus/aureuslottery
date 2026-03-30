'use client';

import { Flame, Calendar } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function DailyStreak() {
  const { user } = useAppStore();

  if (!user) return null;

  // Simulated streak data
  const currentStreak = 5;
  const maxStreak = 15;
  
  return (
    <div className="bg-[#C9A84C]/5 backdrop-blur-xl border-2 border-[#C9A84C]/30 rounded-2xl p-6 mb-8 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#C9A84C]/20 rounded-full">
            <Flame className="w-6 h-6 text-[#C9A84C]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#C9A84C]">Daily Streak</h3>
            <p className="text-sm text-[#e8c97a]">Keep playing to maintain your streak!</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-[#C9A84C]">{currentStreak}</div>
          <div className="text-xs text-[#e8c97a]">days in a row</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-[#e8c97a]">Progress to next reward:</span>
          <span className="text-[#C9A84C] font-bold">{currentStreak}/{maxStreak} days</span>
        </div>
        <div className="w-full bg-black/35 rounded-full h-3 overflow-hidden">
          <div
            className="h-3 bg-gradient-to-r from-[#C9A84C] to-red-500 rounded-full transition-all duration-500"
            style={{ width: `${(currentStreak / maxStreak) * 100}%` }}
          />
        </div>
      </div>

      {currentStreak >= 7 && (
        <div className="mt-4 p-3 bg-green-900/30 border border-green-700/50 rounded-xl">
          <div className="flex items-center gap-2 text-green-400">
            <Calendar className="w-5 h-5" />
            <span className="text-sm font-bold">+5 Free Tickets Unlocked Tomorrow!</span>
          </div>
        </div>
      )}
    </div>
  );
}

