'use client';
import { useEffect, useState } from 'react';
import { Trophy, Sparkles, Crown } from 'lucide-react';

interface Props {
  winner?: string;
  winners?: Array<{ address: string; prize: number }>;
  prize?: number;
  drawType: '8pm' | '10pm';
  onClose: () => void;
}

export default function WinnerAnimation({ winner, winners, prize, drawType, onClose }: Props) {
  const [show, setShow] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const is10PMDraw = drawType === '10pm';
  const winnersPerPage = 10;
  const totalPages = is10PMDraw && winners ? Math.ceil(winners.length / winnersPerPage) : 1;

  useEffect(() => {
    setShow(true);
    
    // Auto close after 15 seconds for 10PM, 10 seconds for 8PM
    const timer = setTimeout(() => {
      onClose();
    }, is10PMDraw ? 15000 : 10000);

    return () => clearTimeout(timer);
  }, [onClose, is10PMDraw]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div className="relative max-w-4xl w-full text-center">
        {/* Confetti Animation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="confetti-container">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  backgroundColor: ['#f59e0b', '#8b5cf6', '#ec4899', '#10b981'][Math.floor(Math.random() * 4)],
                }}
              />
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="relative bg-gradient-to-br from-purple-900 to-black border-4 border-primary-500 rounded-3xl p-6 md:p-12 shadow-2xl">
          {/* Trophy Icon */}
          <div className="mb-6 md:mb-8 animate-bounce">
            <div className="inline-flex items-center justify-center w-20 h-20 md:w-32 md:h-32 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full border-4 border-white/20 shadow-2xl">
              <Crown className="w-10 h-10 md:w-16 md:h-16 text-white" />
            </div>
          </div>

          {/* Winner Text */}
          <h2 className="text-4xl md:text-8xl font-black mb-4 bg-gradient-to-r from-yellow-400 via-amber-300 via-yellow-200 via-amber-300 to-yellow-400 bg-clip-text text-transparent animate-pulse">
            {is10PMDraw ? '25 WINNERS!' : 'WINNER!'}
          </h2>

          {is10PMDraw && winners ? (
            /* 10PM Draw - Multiple Winners */
            <>
              <div className="mb-6">
                <p className="text-3xl text-violet-300 font-bold mb-2">🎁 10PM Bonus Draw 🎁</p>
                <p className="text-5xl font-black text-violet-400 animate-pulse">
                  {winners.length} Lucky Winners!
                </p>
                <p className="text-2xl text-violet-300 mt-2">
                  ${winners[0].prize} each
                </p>
              </div>

              {/* Winners List */}
              <div className="bg-gradient-to-br from-violet-900/40 to-fuchsia-900/40 rounded-2xl p-6 mb-6 border-2 border-violet-500/50 max-h-96 overflow-y-auto">
                <div className="grid md:grid-cols-2 gap-3">
                  {winners.slice(currentPage * winnersPerPage, (currentPage + 1) * winnersPerPage).map((w, idx) => (
                    <div
                      key={idx}
                      className="bg-violet-800/30 p-3 rounded-lg border border-violet-600/30 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🏆</span>
                        <span className="font-mono text-sm text-white truncate">
                          {w.address.slice(0, 6)}...{w.address.slice(-4)}
                        </span>
                      </div>
                      <span className="text-green-400 font-bold">${w.prize}</span>
                    </div>
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    {[...Array(totalPages)].map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentPage(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          idx === currentPage ? 'bg-violet-400 w-6' : 'bg-violet-700'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* 8PM Draw - Single Winner */
            <>
              <div className="mb-6 md:mb-8">
                <p className="text-2xl md:text-3xl text-yellow-300 font-bold mb-2">🏆 Main Jackpot 🏆</p>
                <div className="text-5xl md:text-9xl font-black text-yellow-400 animate-pulse drop-shadow-2xl">
                  ${prize?.toLocaleString('en-US')}
                </div>
              </div>

              {/* Winner Address */}
              <div className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-2xl p-4 md:p-6 mb-6 md:mb-8 border-2 border-yellow-500/50">
                <p className="text-xl text-yellow-300 mb-2">Won by</p>
                <p className="text-2xl md:text-3xl font-mono font-bold text-yellow-400 break-all">
                  {winner}
                </p>
              </div>
            </>
          )}

          {/* Sparkles */}
          <div className="flex items-center justify-center gap-3 md:gap-4 mb-6 md:mb-8">
            <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-yellow-400 animate-pulse" />
            <p className="text-xl md:text-2xl font-bold text-yellow-400">CONGRATULATIONS!</p>
            <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-yellow-400 animate-pulse" />
          </div>

          {/* Action Buttons for 8PM Draw */}
          {!is10PMDraw && prize && (
            <div className="space-y-4 mb-6 md:mb-8">
              {/* Important Notice for Large Wins */}
              {prize >= 10000 && (
                <div className="bg-gradient-to-r from-amber-900/40 to-orange-900/40 border-2 border-yellow-500/50 rounded-xl p-4 mb-4">
                  <p className="text-yellow-300 font-bold text-lg mb-2">⚠️ IMPORTANT</p>
                  <p className="text-yellow-200 text-sm leading-relaxed">
                    This is a large amount. Please watch our withdrawal guide before cashing out.
                  </p>
                </div>
              )}

              {/* Cash Out Guide Button */}
              <button
                onClick={() => window.open('https://www.youtube.com/watch?v=XXXXXX', '_blank')}
                className="group relative w-full max-w-md mx-auto overflow-hidden"
              >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 animate-gradient-x"></div>
                
                {/* Glow effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 blur-xl"></div>
                </div>
                
                {/* Button content */}
                <div className="relative py-3 md:py-4 px-6 md:px-8 rounded-xl border-2 border-white/40 backdrop-blur-sm">
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl md:text-3xl">📺</span>
                    <div className="text-left">
                      <div className="font-bold text-white text-base md:text-lg">How to Cash Out</div>
                      <div className="text-green-200 text-xs">Watch 5-min tutorial →</div>
                    </div>
                  </div>
                </div>
                
                {/* Shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </button>

              {/* Share on X Button */}
              <button
                onClick={() => {
                  const tweetText = `🚨 INCREDIBLE! 🚨\n\nA new crypto app just launched and I won $${prize?.toLocaleString('en-US')}! 🤯💰\n\n@AureusLottery this is INSANE! Daily draw at 9PM UTC, tickets only $1!\n\nThank you Aureus! 🙏✨\n\n#CryptoLottery #Web3 #Aureus`;
                  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
                  window.open(tweetUrl, '_blank');
                }}
                className="group relative w-full max-w-md mx-auto inline-flex items-center justify-center gap-3 px-6 md:px-8 py-3 md:py-4 bg-black hover:bg-gray-900 rounded-xl transition-all border-2 border-white/30 hover:border-white/50 overflow-hidden"
              >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                {/* Twitter/X icon */}
                <svg className="w-5 h-5 text-white relative z-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                
                <span className="text-white font-bold relative z-10">Share on X</span>
                
                {/* Shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </button>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 rounded-xl font-bold text-lg md:text-xl transition-all hover:scale-105 shadow-2xl border-2 border-white/30"
          >
            Continue
          </button>
        </div>

        {/* CSS for confetti */}
        <style jsx>{`
          .confetti-container {
            position: absolute;
            width: 100%;
            height: 100%;
            overflow: hidden;
            pointer-events: none;
          }

          .confetti {
            position: absolute;
            width: 10px;
            height: 10px;
            background-color: #f59e0b;
            animation: fall linear infinite;
          }

          @keyframes fall {
            0% {
              transform: translateY(-100vh) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) rotate(720deg);
              opacity: 0;
            }
          }

          @keyframes fade-in {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          .animate-fade-in {
            animation: fade-in 0.5s ease-in;
          }
        `}</style>
      </div>
    </div>
  );
}

