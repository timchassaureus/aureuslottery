'use client';

import { useEffect, useState } from 'react';

interface Props {
  timeLeft: number; // seconds
  jackpot: number;
  totalPlayers: number;
  userTickets: number;
  onComplete: () => void;
}

export default function PreDrawCountdown({ timeLeft, jackpot, totalPlayers, userTickets, onComplete }: Props) {
  const [seconds, setSeconds] = useState(timeLeft);

  useEffect(() => {
    if (seconds <= 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setSeconds(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds, onComplete]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black via-purple-900/50 to-black z-[999] flex items-center justify-center overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative text-center z-10 px-4">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-yellow-400 mb-8 animate-pulse drop-shadow-2xl">
          🎰 DRAW STARTING 🎰
        </h1>
        
        {/* Giant countdown */}
        <div className="text-8xl md:text-9xl lg:text-[12rem] font-black mb-8">
          <span className="bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 bg-clip-text text-transparent animate-pulse">
            {formatTime(seconds)}
          </span>
        </div>
        
        {/* Stats */}
        <div className="space-y-4 text-xl md:text-2xl lg:text-3xl text-white mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <p className="font-bold">
              💰 Jackpot: <span className="text-yellow-400">${jackpot.toLocaleString('en-US')}</span>
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <p className="font-bold">
              👥 Players: <span className="text-blue-400">{totalPlayers.toLocaleString('en-US')}</span>
            </p>
          </div>
          {userTickets > 0 && (
            <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 backdrop-blur-sm rounded-2xl p-4 border-2 border-green-400/50">
              <p className="font-bold">
                🎫 Your Tickets: <span className="text-green-400">{userTickets}</span>
              </p>
            </div>
          )}
        </div>
        
        {/* Good luck message */}
        <div className="text-yellow-300 text-2xl md:text-3xl font-bold animate-bounce">
          {seconds > 30 ? '🍀 Good luck to everyone! 🍀' : '🔥 HERE WE GO! 🔥'}
        </div>

        {seconds <= 10 && (
          <div className="mt-8 text-red-400 text-4xl font-black animate-pulse">
            {seconds}...
          </div>
        )}
      </div>
    </div>
  );
}

