'use client';

import { Trophy, Gift } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function EnhancedWinnersHistory() {
  const { draws, secondaryDraws } = useAppStore();
  
  // Get last 5 main draws
  const recentDraws = [...draws].reverse().slice(0, 5);
  
  // Get last 3 secondary draws
  const recentSecondaryDraws = [...secondaryDraws].reverse().slice(0, 3);

  return (
    <div className="bg-gradient-to-br from-indigo-950/30 via-blue-950/30 to-slate-950/30 backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-yellow-400" />
        <h3 className="text-xl font-bold text-white">Recent Winners</h3>
      </div>

      {/* Main Jackpot Winners */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="text-lg">🏆</div>
          <h4 className="text-sm font-bold text-yellow-400">9PM Jackpot</h4>
        </div>
        
        {recentDraws.length === 0 ? (
          <p className="text-slate-400 text-center py-4 text-sm">No draws yet...</p>
        ) : (
          <div className="space-y-2">
            {recentDraws.map((draw, index) => {
              return (
                <div
                  key={`main-draw-${draw.id}-${draw.timestamp}`}
                  className="bg-white/5 hover:bg-white/10 p-3 rounded-lg border border-white/10 transition-all"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">
                          {index === 0 ? '🌟' : index === 1 ? '⭐' : '✨'}
                        </span>
                        <p className="font-mono text-white font-bold text-sm truncate">
                          {draw.winner.slice(0, 8)}...{draw.winner.slice(-6)}
                        </p>
                      </div>
                      <p className="text-xs text-slate-400">
                        {new Date(draw.timestamp).toLocaleDateString()} • {new Date(draw.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-black text-yellow-400">
                        ${draw.prize.toLocaleString('en-US')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Secondary Draw Winners */}
      {recentSecondaryDraws.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Gift className="w-4 h-4 text-violet-400" />
            <h4 className="text-sm font-bold text-violet-400">10PM Bonus Draw</h4>
          </div>
          
          <div className="space-y-2">
            {recentSecondaryDraws.map((draw) => {
              const prizePerWinner = draw.winners.length > 0 ? draw.winners[0].prize : 0;
              
              return (
                <div
                  key={`secondary-draw-${draw.id}-${draw.timestamp}`}
                  className="bg-white/5 hover:bg-white/10 p-3 rounded-lg border border-white/10 transition-all"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm">
                        {draw.winners.length} winners • ${prizePerWinner.toLocaleString('en-US')} each
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(draw.timestamp).toLocaleDateString()} • {new Date(draw.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-black text-violet-400">
                        ${draw.totalPot.toLocaleString('en-US')}
                      </p>
                    </div>
                  </div>
                  
                  {/* Show first 5 winners */}
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-1">
                    {draw.winners.slice(0, 5).map((winner, idx) => (
                      <div
                        key={idx}
                        className="bg-white/5 px-2 py-1 rounded text-center"
                      >
                        <p className="text-[10px] font-mono text-slate-300 truncate">
                          {winner.address.slice(0, 4)}...{winner.address.slice(-3)}
                        </p>
                      </div>
                    ))}
                    {draw.winners.length > 5 && (
                      <div className="bg-white/5 px-2 py-1 rounded text-center flex items-center justify-center">
                        <p className="text-[10px] text-violet-400 font-bold">
                          +{draw.winners.length - 5}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

