'use client';

import { useEffect, useState } from 'react';
import { Trophy, Zap } from 'lucide-react';

interface Props {
  participants: Array<{ address: string; ticketCount: number }>;
  winner: string;
  prize: number;
  onAnimationComplete: () => void;
}

// Generate fake names for demo
function generateFakeParticipants(count: number): Array<{ address: string; ticketCount: number }> {
  const firstNames = ['Alex', 'Jordan', 'Casey', 'Morgan', 'Riley', 'Taylor', 'Avery', 'Quinn', 'Sage', 'River', 'Phoenix', 'Skyler', 'Dakota', 'Cameron', 'Blake', 'Charlie', 'Jesse', 'Rowan', 'Finley', 'Parker'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee'];
  
  const participants = [];
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const randomNum = Math.floor(Math.random() * 9999);
    participants.push({
      address: `${firstName} ${lastName} #${randomNum}`,
      ticketCount: Math.floor(Math.random() * 50) + 1
    });
  }
  return participants;
}

export default function WheelAnimation({ participants: propParticipants, winner, prize, onAnimationComplete }: Props) {
  // Generate 5000 fake participants for demo
  const [participants] = useState(() => {
    if (propParticipants.length < 10) {
      return generateFakeParticipants(5000);
    }
    return propParticipants;
  });
  
  const [phase, setPhase] = useState<'rolling' | 'slowing' | 'winner'>('rolling');
  const [currentName, setCurrentName] = useState(participants[0]?.address || 'Loading...');
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  const totalTickets = participants.reduce((sum, p) => sum + p.ticketCount, 0);
  
  // Use the REAL winner from props, not a random one!
  const finalWinner = winner || participants[Math.floor(Math.random() * participants.length)].address;

  useEffect(() => {
    // Timer qui compte les secondes
    const timer = setInterval(() => {
      setSecondsElapsed(prev => prev + 1);
    }, 1000);

    // Noms qui défilent
    const nameInterval = setInterval(() => {
      const randomParticipant = participants[Math.floor(Math.random() * participants.length)];
      setCurrentName(randomParticipant.address);
    }, secondsElapsed < 5 ? 50 : secondsElapsed < 8 ? 300 : 1000);

    return () => {
      clearInterval(timer);
      clearInterval(nameInterval);
    };
  }, [participants, secondsElapsed]);

  // Changement de phase basé sur le temps
  useEffect(() => {
    if (secondsElapsed === 5) {
      setPhase('slowing');
    } else if (secondsElapsed === 12) {
      setCurrentName(finalWinner);
      setPhase('winner');
    } else if (secondsElapsed === 18) {
      onAnimationComplete();
    }
  }, [secondsElapsed, finalWinner, onAnimationComplete]);

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-hidden">
      {/* Close button */}
      <button
        onClick={onAnimationComplete}
        className="absolute top-4 right-4 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all border-2 border-white/30 hover:border-white/50"
      >
        <span className="text-white text-2xl font-bold">×</span>
      </button>

      {/* Animated particles background */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-4xl w-full">
        {/* Header info */}
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-4 animate-pulse">
            🎰 DRAWING WINNER 🎰
          </h2>
          <div className="flex items-center justify-center gap-8 text-lg">
            <span className="text-violet-300">
              👥 <strong className="text-2xl">{participants.length.toLocaleString('en-US')}</strong> Players
            </span>
            <span className="text-fuchsia-300">
              🎫 <strong className="text-2xl">{totalTickets.toLocaleString('en-US')}</strong> Tickets
            </span>
            <span className="text-yellow-300">
              💰 <strong className="text-2xl">${prize.toLocaleString('en-US')}</strong>
            </span>
          </div>
        </div>

        {phase !== 'winner' ? (
          /* Rolling names */
          <div className="relative">
            {/* Main display box */}
            <div className="relative mb-8">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 rounded-3xl blur-3xl opacity-50 animate-pulse"></div>
              
              {/* Content */}
              <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border-4 border-yellow-400 rounded-3xl p-12 md:p-20">
                <div className="flex items-center justify-center gap-6 mb-6">
                  <Zap className={`w-12 h-12 text-yellow-400 ${phase === 'rolling' ? 'animate-spin' : 'animate-pulse'}`} />
                  <Trophy className={`w-12 h-12 text-yellow-400 ${phase === 'rolling' ? 'animate-spin' : 'animate-pulse'}`} />
                  <Zap className={`w-12 h-12 text-yellow-400 ${phase === 'rolling' ? 'animate-spin' : 'animate-pulse'}`} />
                </div>
                
                <div className="text-center">
                  <div 
                    className={`text-3xl md:text-5xl font-black font-mono mb-4 transition-all duration-100 ${
                      phase === 'rolling' 
                        ? 'text-white blur-[2px]' 
                        : 'text-yellow-400 blur-none scale-110'
                    }`}
                  >
                    {currentName}
                  </div>
                  
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-yellow-500 rounded-full transition-all ${
                        phase === 'rolling' ? 'w-1/3' : 'w-2/3'
                      }`}
                      style={{
                        animation: phase === 'rolling' ? 'pulse 1s infinite' : 'none'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Status text */}
            <div className="text-center">
              <p className="text-2xl text-white font-bold animate-pulse">
                {phase === 'rolling' ? '⚡ Randomly selecting...' : '🎯 Almost there...'}
              </p>
            </div>
          </div>
        ) : (
          /* Winner reveal */
          <div className="text-center animate-in fade-in zoom-in duration-1000">
            {/* Improved Confetti effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(50)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-4 rounded-sm"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: '-10%',
                    backgroundColor: ['#fbbf24', '#a855f7', '#3b82f6', '#ec4899', '#10b981'][i % 5],
                    animation: `confetti-fall ${3 + Math.random() * 2}s linear ${Math.random() * 0.5}s infinite`,
                    opacity: 0.8,
                    transform: `rotate(${Math.random() * 360}deg)`
                  }}
                />
              ))}
            </div>
            
            <style jsx>{`
              @keyframes confetti-fall {
                0% {
                  transform: translateY(0) rotate(0deg);
                  opacity: 1;
                }
                100% {
                  transform: translateY(100vh) rotate(720deg);
                  opacity: 0;
                }
              }
            `}</style>

            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full border-4 border-white shadow-2xl mb-4 animate-bounce">
                <Trophy className="w-16 h-16 text-white" />
              </div>
            </div>

            <h2 className="text-7xl md:text-9xl font-black mb-6 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent animate-pulse">
              WINNER!
            </h2>

            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-3xl p-8 mb-6 border-4 border-yellow-400 max-w-3xl mx-auto backdrop-blur-xl">
              <p className="text-2xl text-yellow-300 font-bold mb-4">🎊 Congratulations to 🎊</p>
              <p className="text-4xl md:text-5xl font-mono font-black text-yellow-400 break-all mb-6">
                {finalWinner}
              </p>
              <div className="text-center">
                <p className="text-3xl text-white font-bold mb-2">Won</p>
                <div className="text-6xl md:text-8xl font-black text-yellow-400 drop-shadow-2xl">
                  ${prize.toLocaleString('en-US')}
                </div>
              </div>
            </div>

            <p className="text-3xl font-bold text-yellow-400 animate-pulse mb-6">
              🎉 AMAZING! 🎉
            </p>

            {/* Share on X Button */}
            <button
              onClick={() => {
                const tweetText = `🚨 INCROYABLE ! 🚨

Une nouvelle appli crypto vient de sortir et j'ai gagné $${prize.toLocaleString('en-US')} ! 🤯💰

@AureusLottery c'est de la FOLIE ! Tirage quotidien à 21h UTC, tickets à $1 seulement !

Merci Aureus ! 🙏✨

#CryptoLottery #Web3 #Aureus`;
                const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
                window.open(tweetUrl, '_blank');
              }}
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-black hover:bg-gray-900 rounded-full transition-all border-2 border-white/30 hover:border-white/50 overflow-hidden"
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              {/* Twitter/X icon */}
              <svg className="w-6 h-6 text-white relative z-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              
              <span className="text-white font-bold text-lg relative z-10">Share on X</span>
              
              {/* Shine effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

