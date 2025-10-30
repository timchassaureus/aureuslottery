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
    <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 backdrop-blur-xl border-2 border-orange-500/30 rounded-2xl p-6 mb-8 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-500/20 rounded-full">
            <Flame className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-orange-400">Daily Streak</h3>
            <p className="text-sm text-orange-300">Keep playing to maintain your streak!</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-orange-400">{currentStreak}</div>
          <div className="text-xs text-orange-300">days in a row</div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-orange-300">Progress to next reward:</span>
          <span className="text-orange-400 font-bold">{currentStreak}/{maxStreak} days</span>
        </div>
        <div className="w-full bg-orange-900/50 rounded-full h-3 overflow-hidden">
          <div 
            className="h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
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

