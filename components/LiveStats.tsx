'use client';

import { useEffect, useState } from 'react';

export default function LiveStats() {
  const [onlinePlayers, setOnlinePlayers] = useState(287);
  const [recentWin, setRecentWin] = useState({ amount: 5420, time: '2 min ago' });
  const [ticketsSold, setTicketsSold] = useState(4287);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Random fluctuations to show "live" activity
      setOnlinePlayers(prev => Math.max(50, prev + Math.floor(Math.random() * 20) - 10));
      setTicketsSold(prev => prev + Math.floor(Math.random() * 5));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-900/95 via-indigo-900/95 to-blue-900/95 backdrop-blur-lg border-t border-white/10 py-3 px-4 z-50">
      <div className="container mx-auto flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm md:text-base">
        {/* Online Players */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 font-bold">{onlinePlayers}</span>
          <span className="text-white/80">playing now</span>
        </div>

        {/* Separator */}
        <div className="hidden md:block w-px h-6 bg-white/20"></div>

        {/* Recent Win */}
        <div className="flex items-center gap-2">
          <span className="text-xl">💰</span>
          <span className="text-yellow-400 font-bold">${recentWin.amount.toLocaleString('en-US')}</span>
          <span className="text-white/80">won {recentWin.time}</span>
        </div>

        {/* Separator */}
        <div className="hidden md:block w-px h-6 bg-white/20"></div>

        {/* Tickets Sold */}
        <div className="flex items-center gap-2">
          <span className="text-xl">🎫</span>
          <span className="text-blue-400 font-bold">{ticketsSold.toLocaleString('en-US')}</span>
          <span className="text-white/80">tickets today</span>
        </div>
      </div>
    </div>
  );
}

