'use client';

import { useState, useMemo } from 'react';
import { Trophy, Medal } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { getDisplayName } from '@/lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function Leaderboard({ isOpen, onClose }: Props) {
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const { tickets, draws, secondaryDraws, mode, currentDrawNumber } = useAppStore();

  if (!isOpen) return null;

  // Calculate leaderboard from real data
  const leaderboardData = useMemo(() => {
    // Filter tickets based on period
    let filteredTickets = tickets;
    const now = Date.now();
    
    if (selectedPeriod === 'daily') {
      const oneDayAgo = now - 24 * 60 * 60 * 1000;
      filteredTickets = tickets.filter(t => t.timestamp >= oneDayAgo);
    } else if (selectedPeriod === 'weekly') {
      const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
      filteredTickets = tickets.filter(t => t.timestamp >= oneWeekAgo);
    }
    // 'all-time' uses all tickets

    // Count tickets per address
    const ticketCounts = new Map<string, number>();
    filteredTickets.forEach(ticket => {
      ticketCounts.set(ticket.owner, (ticketCounts.get(ticket.owner) || 0) + 1);
    });

    // Calculate winnings from draws
    const winnings = new Map<string, number>();
    
    // Main draws
    draws.forEach(draw => {
      if (draw.winner && draw.prize) {
        winnings.set(draw.winner, (winnings.get(draw.winner) || 0) + draw.prize);
      }
    });
    
    // Secondary draws
    secondaryDraws.forEach(draw => {
      if (draw.winners) {
        draw.winners.forEach(winner => {
          if (winner.prize) {
            winnings.set(winner.address, (winnings.get(winner.address) || 0) + winner.prize);
          }
        });
      }
    });

    // Combine data and sort
    const players = Array.from(ticketCounts.entries()).map(([address, ticketCount]) => ({
      address,
      tickets: ticketCount,
      winnings: winnings.get(address) || 0,
    }));

    // Sort by tickets (primary) and winnings (secondary)
    players.sort((a, b) => {
      if (b.tickets !== a.tickets) {
        return b.tickets - a.tickets;
      }
      return b.winnings - a.winnings;
    });

    // Add rank and format
    return players.slice(0, 10).map((player, index) => ({
      rank: index + 1,
      address: player.address,
      tickets: player.tickets,
      winnings: player.winnings,
      change: '', // No change tracking for now
    }));
  }, [tickets, draws, secondaryDraws, selectedPeriod]);

  // In live mode, show empty state if no data
  const hasData = leaderboardData.length > 0;

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
          {!hasData && mode === 'live' ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-purple-400/50 mx-auto mb-4" />
              <p className="text-xl font-bold text-purple-300 mb-2">No players yet</p>
              <p className="text-purple-400">Be the first to buy tickets and appear on the leaderboard!</p>
            </div>
          ) : !hasData ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-purple-400/50 mx-auto mb-4" />
              <p className="text-xl font-bold text-purple-300 mb-2">No data available</p>
              <p className="text-purple-400">Start playing to see the leaderboard!</p>
            </div>
          ) : (
            leaderboardData.map((player, index) => (
              <div
                key={`${player.address}-${index}`}
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
                    <p className="font-mono font-bold text-lg">
                      {getDisplayName(player.address, undefined, undefined)}
                    </p>
                    <div className="flex gap-4 text-sm text-purple-300 mt-1">
                      <span>{player.tickets} ticket{player.tickets !== 1 ? 's' : ''}</span>
                      {player.winnings > 0 && (
                        <>
                          <span>•</span>
                          <span>${player.winnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} won</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
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
