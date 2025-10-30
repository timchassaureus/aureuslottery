'use client';

import { useState } from 'react';
import { Gift, Sparkles, Lock } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function DailyReward({ isOpen, onClose }: Props) {
  const [claimed, setClaimed] = useState(false);
  
  if (!isOpen) return null;

  const rewards = [
    { day: 1, reward: '1 FREE Ticket', unlocked: true },
    { day: 2, reward: '2 FREE Tickets', unlocked: true },
    { day: 3, reward: '3 FREE Tickets', unlocked: true },
    { day: 4, reward: '5 FREE Tickets', unlocked: true },
    { day: 5, reward: '7 FREE Tickets', unlocked: true },
    { day: 6, reward: '10 FREE Tickets', unlocked: true },
    { day: 7, reward: '20 FREE Tickets + 5% Bonus', unlocked: true },
  ];

  const handleClaim = () => {
    setClaimed(true);
    setTimeout(() => {
      onClose();
      setClaimed(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 border-2 border-yellow-500/50 rounded-3xl p-8 max-w-2xl w-full relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors text-2xl"
        >
          ✕
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-500/20 rounded-full mb-4 border-4 border-yellow-500/50 animate-pulse">
            <Gift className="w-10 h-10 text-yellow-400" />
          </div>
          <h2 className="text-4xl font-black mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Daily Rewards
          </h2>
          <p className="text-purple-300">Claim your FREE tickets every day!</p>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-6">
          {rewards.map((item, index) => (
            <div
              key={index}
              className={`relative p-4 rounded-xl border-2 text-center transition-all ${
                item.unlocked && !claimed
                  ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50 cursor-pointer hover:scale-110 animate-pulse'
                  : 'bg-purple-900/30 border-purple-700/30'
              }`}
              onClick={item.unlocked && !claimed ? handleClaim : undefined}
            >
              <div className="text-xs font-bold text-purple-300 mb-1">Day {item.day}</div>
              <div className="text-2xl mb-2">{item.unlocked && !claimed ? '🎁' : '🔒'}</div>
              <div className="text-xs text-purple-300">{item.reward}</div>
              {item.unlocked && !claimed && (
                <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-yellow-400 animate-bounce" />
              )}
            </div>
          ))}
        </div>

        {claimed && (
          <div className="text-center py-6 bg-green-900/20 border-2 border-green-500/50 rounded-xl">
            <p className="text-3xl font-black text-green-400 mb-2">🎉 CLAIMED!</p>
            <p className="text-green-300">Come back tomorrow for more!</p>
          </div>
        )}

        <div className="mt-6 p-4 bg-purple-900/30 rounded-xl border border-purple-700/50">
          <p className="text-sm text-center text-purple-300">
            💰 The more days you complete, the bigger the rewards! Week 2 offers even better prizes!
          </p>
        </div>
      </div>
    </div>
  );
}

