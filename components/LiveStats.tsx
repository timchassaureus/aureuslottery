'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';

export default function LiveStats() {
  const { draws, totalTicketsSold, mode } = useAppStore();
  const [ticketsSold, setTicketsSold] = useState(4287);

  // Get yesterday's main jackpot win (last draw)
  const yesterdayWin = draws.length > 0 ? draws[draws.length - 1] : null;

  // Simulate live updates (tickets only en mode demo)
  useEffect(() => {
    const interval = setInterval(() => {
      if (mode !== 'live') {
        setTicketsSold(prev => prev + Math.floor(Math.random() * 5));
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [mode]);

  const displayedTickets = mode === 'live' ? totalTicketsSold : ticketsSold;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-900/95 via-indigo-900/95 to-blue-900/95 backdrop-blur-lg border-t border-white/10 py-3 px-4 z-50">
      <div className="container mx-auto flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm md:text-base">
        {/* Yesterday's Main Jackpot Win */}
        {yesterdayWin ? (
          <div className="flex items-center gap-2">
            <span className="text-xl">💰</span>
            <span className="text-yellow-400 font-bold">${yesterdayWin.prize.toLocaleString('en-US')}</span>
            <span className="text-white/80">yesterday's main jackpot</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xl">💰</span>
            <span className="text-yellow-400 font-bold">$0</span>
            <span className="text-white/80">yesterday's main jackpot</span>
          </div>
        )}

        {/* Separator */}
        <div className="hidden md:block w-px h-6 bg-white/20"></div>

        {/* Tickets Sold */}
        <div className="flex items-center gap-2">
          <span className="text-xl">🎫</span>
          <span className="text-blue-400 font-bold">{displayedTickets.toLocaleString('en-US')}</span>
          <span className="text-white/80">tickets today</span>
        </div>
      </div>
    </div>
  );
}

