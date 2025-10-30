'use client';

import { User, Trophy, DollarSign, TrendingUp, Award } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import UserLevel from './UserLevel';
import DailyStreak from './DailyStreak';
import AchievementSystem from './AchievementSystem';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfile({ isOpen, onClose }: Props) {
  const { user, draws } = useAppStore();

  if (!isOpen || !user) return null;

  const lifetimeTickets = user.lifetimeTickets;
  const totalSpent = user.totalSpent;
  const totalWon = user.totalWon;
  const wins = draws.filter(d => d.winner === user.address).length;
  const winRate = lifetimeTickets > 0 ? ((wins / lifetimeTickets) * 100).toFixed(1) : '0';
  
  // Get user level
  const getLevel = () => {
    if (lifetimeTickets >= 500) return { name: 'Légende', icon: '👑', color: 'from-yellow-400 to-pink-500' };
    if (lifetimeTickets >= 100) return { name: 'Maître', icon: '💎', color: 'from-purple-400 to-pink-500' };
    if (lifetimeTickets >= 50) return { name: 'Expert', icon: '🏆', color: 'from-yellow-400 to-orange-500' };
    if (lifetimeTickets >= 10) return { name: 'Amateur', icon: '⭐', color: 'from-gray-300 to-gray-500' };
    return { name: 'Débutant', icon: '🎯', color: 'from-orange-400 to-red-500' };
  };

  const level = getLevel();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-indigo-950 via-purple-950 to-blue-950 border-2 border-white/20 rounded-2xl p-6 max-w-2xl w-full relative max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-all"
        >
          <span className="text-white text-xl">×</span>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-violet-500/20 to-indigo-600/20 rounded-full mb-3 border-2 border-white/30">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-white">My Profile</h2>
          <p className="text-slate-400 text-xs font-mono truncate">{user.address}</p>
        </div>

        {/* Main Stats - Compact */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-center">
            <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-yellow-400">{wins}</p>
            <p className="text-xs text-slate-400">Wins</p>
          </div>

          <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-center">
            <DollarSign className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-green-400">${totalWon.toLocaleString('en-US')}</p>
            <p className="text-xs text-slate-400">Total Won</p>
          </div>

          <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-center">
            <TrendingUp className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-blue-400">${totalSpent.toLocaleString('en-US')}</p>
            <p className="text-xs text-slate-400">Invested</p>
          </div>

          <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-center">
            <Award className="w-5 h-5 text-violet-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-violet-400">{lifetimeTickets}</p>
            <p className="text-xs text-slate-400">Tickets</p>
          </div>
        </div>

        {/* ROI */}
        {totalWon > 0 && totalSpent > 0 && (
          <div className="bg-green-900/20 rounded-lg p-3 border border-green-700/30 mb-4 text-center">
            <p className="text-xs text-slate-300 mb-1">ROI</p>
            <p className="text-2xl font-bold text-green-400">
              {((totalWon / totalSpent) * 100).toFixed(1)}%
            </p>
          </div>
        )}

        {/* Level, Streak, Achievements - Compact */}
        <div className="space-y-3">
          <UserLevel />
          <DailyStreak />
          <AchievementSystem />
        </div>
      </div>
    </div>
  );
}

