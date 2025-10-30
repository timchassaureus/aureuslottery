'use client';

import { useState } from 'react';
import { Trophy, Medal } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function Leaderboard({ isOpen, onClose }: Props) {
  const [selectedPeriod, setSelectedPeriod] = useState('daily');

  if (!isOpen) return null;

  // Mock leaderboard data
  const leaderboardData = [
    { rank: 1, address: '0x8f...3a4', tickets: 150, winnings: 45000, change: '+3' },
    { rank: 2, address: '0x9a...7b8', tickets: 120, winnings: 32000, change: '+1' },
    { rank: 3, address: '0x7c...2d6', tickets: 98, winnings: 28000, change: '-2' },
    { rank: 4, address: '0x6f...1c5', tickets: 87, winnings: 24500, change: '+5' },
    { rank: 5, address: '0x5e...9d4', tickets: 65, winnings: 18900, change: '-1' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 border-2 border-purple-500/30 rounded-3xl p-8 max-w-3xl w-full relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors text-2xl"
        >
          ✕
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500/20 rounded-full mb-4 border-2 border-yellow-500/50">
            <Trophy className="w-8 h-8 text-yellow-400" />
          </div>
          <h2 className="text-4xl font-black mb-2">Leaderboard</h2>
          <p className="text-purple-300">Top players this week</p>
        </div>

        {/* Period selector */}
        <div className="flex gap-2 mb-6 justify-center">
          {['daily', 'weekly', 'all-time'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                selectedPeriod === period
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white'
                  : 'bg-purple-800/30 text-purple-300 hover:bg-purple-800/50'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>

        {/* Leaderboard */}
        <div className="space-y-3">
          {leaderboardData.map((player, index) => (
            <div
              key={index}
              className={`bg-purple-800/30 rounded-xl p-4 border-2 ${
                player.rank === 1
                  ? 'border-yellow-500/50 bg-yellow-900/10'
                  : player.rank <= 3
                  ? 'border-primary-500/50'
                  : 'border-purple-700/30'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="flex items-center justify-center w-12 h-12 rounded-full font-black text-xl">
                  {player.rank === 1 ? (
                    <span className="text-yellow-400">🥇</span>
                  ) : player.rank === 2 ? (
                    <span className="text-gray-300">🥈</span>
                  ) : player.rank === 3 ? (
                    <span className="text-orange-400">🥉</span>
                  ) : (
                    <span className="text-purple-400">#{player.rank}</span>
                  )}
                </div>

                {/* Address */}
                <div className="flex-1">
                  <p className="font-mono font-bold text-lg">{player.address}</p>
                  <div className="flex gap-4 text-sm text-purple-300 mt-1">
                    <span>{player.tickets} tickets</span>
                    <span>•</span>
                    <span>${player.winnings.toLocaleString('en-US')} won</span>
                  </div>
                </div>

                {/* Change */}
                <div className={`text-sm font-bold ${
                  player.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
                }`}>
                  {player.change}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Rewards info */}
        <div className="mt-6 p-4 bg-gradient-to-r from-primary-500/10 to-primary-600/10 rounded-xl border border-primary-500/30">
          <p className="text-center text-sm text-purple-300">
            🏆 Top 3 players get special rewards at the end of each week
          </p>
        </div>
      </div>
    </div>
  );
}
