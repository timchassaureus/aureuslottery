'use client';

import { X, Trophy, Clock } from 'lucide-react';
import { useAppStore } from '@/lib/store';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function HistoryModal({ isOpen, onClose }: Props) {
  const { draws, user } = useAppStore();

  if (!isOpen) return null;

  const recentDraws = draws.slice(-5).reverse();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900 to-purple-800 border border-purple-500/30 rounded-3xl p-8 max-w-2xl w-full relative max-h-[80vh] overflow-hidden flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500/20 rounded-full mb-4">
            <Trophy className="w-8 h-8 text-primary-400" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Draw History</h2>
          <p className="text-purple-300">Last 5 winners</p>
        </div>

        <div className="overflow-y-auto flex-1 space-y-3">
          {recentDraws.length === 0 ? (
            <div className="text-center py-12 text-purple-400">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No draws yet</p>
              <p className="text-sm mt-2">Be the first to trigger a draw!</p>
            </div>
          ) : (
            recentDraws.map((draw) => {
              const date = new Date(draw.timestamp);
              const isUserWinner = user && draw.winner === user.address;
              
              return (
                <div
                  key={draw.id}
                  className={`bg-purple-800/30 rounded-xl p-4 border ${
                    isUserWinner
                      ? 'border-green-500/50 bg-green-900/10'
                      : 'border-purple-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Trophy
                        className={`w-5 h-5 ${
                          isUserWinner ? 'text-green-400' : 'text-primary-400'
                        }`}
                      />
                      <span className="font-bold">Draw #{draw.id}</span>
                    </div>
                    <span className="text-sm text-purple-300">
                      {date.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-purple-300 text-sm">Winner: </span>
                      <span
                        className={`font-mono ${
                          isUserWinner ? 'text-green-400 font-bold' : 'text-white'
                        }`}
                      >
                        {draw.winner.slice(0, 6)}...{draw.winner.slice(-4)}
                      </span>
                      {isUserWinner && (
                        <span className="ml-2 text-green-400 font-bold">
                          🎉 YOU!
                        </span>
                      )}
                    </div>
                    <span className="text-lg font-bold text-green-400">
                      ${draw.prize.toLocaleString('en-US')}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

