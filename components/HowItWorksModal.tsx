'use client';

import { X, CheckCircle, TrendingUp, Users, Shield, Zap } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function HowItWorksModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[999] overflow-y-auto py-4 md:py-8">
      <div className="min-h-screen flex items-start justify-center p-4">
        <div className="bg-gradient-to-br from-purple-900 to-indigo-900 border-2 border-purple-500/50 rounded-3xl p-6 md:p-8 max-w-3xl w-full relative">
          {/* Close Button - Fixed at top right */}
          <button
            onClick={onClose}
            className="sticky top-2 float-right text-white hover:text-red-400 transition-all z-[1000] bg-red-600 hover:bg-red-700 rounded-full p-3 shadow-2xl mb-4"
          >
            <X className="w-7 h-7" />
          </button>

          <div className="text-center mb-8 clear-both">
            <h2 className="text-5xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent mb-3">
              HOW TO WIN BIG! 🎰💰
            </h2>
            <p className="text-yellow-300 text-xl font-bold">It's RIDICULOUSLY simple. Let's GO! 🚀</p>
          </div>

        <div className="space-y-6">
          {/* Basic Concept */}
          <div className="bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-xl p-6 border-2 border-violet-400/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-yellow-400 mb-3">🎫 IT'S INSANELY SIMPLE!</h3>
                <ul className="space-y-3 text-white text-base">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-6 h-6 text-green-400 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-yellow-300">$1 per ticket</strong> - Buy <strong className="text-green-300">UNLIMITED</strong> tickets! Stack your chances! 🚀</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-6 h-6 text-green-400 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-violet-300">2 CHANCES TO WIN</strong> every day - Main jackpot at <strong>9PM</strong> + Bonus draw at <strong>9:30PM</strong>! 💎</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-6 h-6 text-green-400 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-fuchsia-300">More tickets = BETTER odds!</strong> Go ALL IN and increase your chances! 🔥</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Jackpot Funding */}
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-6 border-2 border-green-400/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-green-400 mb-3">💰 THE JACKPOT EXPLODES!</h3>
                <p className="text-white text-lg leading-relaxed font-semibold">
                  <span className="text-yellow-300 text-xl">NO LIMITS!</span> The jackpot grows with <strong className="text-green-300">EVERY. SINGLE. TICKET.</strong> sold! 🔥
                </p>
                <p className="text-white/90 text-lg leading-relaxed mt-3">
                  More players = <strong className="text-yellow-400">BIGGER PRIZES!</strong> Watch the pot EXPLODE in real-time as thousands join the rush! This could be YOUR life-changing moment! 💎🚀
                </p>
                <div className="mt-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-400/60 rounded-xl p-4">
                  <p className="text-yellow-300 text-base md:text-lg font-black text-center">
                    📣 Tell your friends! If everyone joins, this jackpot can hit <span className="text-white">MILLIONS</span> — <span className="text-white">EVERY SINGLE DAY</span>. Bring the crowd, grow the pot! 🔥
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Winner Selection */}
          <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-6 border-2 border-blue-400/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full flex items-center justify-center animate-pulse">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-blue-300 mb-3">🏆 2 SHOTS AT GLORY!</h3>
                <ul className="space-y-3 text-white text-base">
                  <li className="bg-yellow-500/10 rounded-lg p-3 border-2 border-yellow-400/50">
                    <strong className="text-yellow-300 text-xl">🎰 9PM UTC - MAIN JACKPOT</strong>
                    <p className="text-white mt-1 font-semibold">ONE lucky winner takes <strong className="text-green-300">THE ENTIRE POT!</strong> Could be $10K, $50K, $100K+! 💰💰💰</p>
                  </li>
                  <li className="bg-violet-500/10 rounded-lg p-3 border-2 border-violet-400/50">
                    <strong className="text-violet-300 text-xl">💎 9:30PM UTC - BONUS BLITZ</strong>
                    <p className="text-white mt-1 font-semibold"><strong className="text-yellow-300">25 WINNERS</strong> share the bonus pot! Bigger prizes for each winner! 🎉</p>
                  </li>
                  <li className="bg-blue-900/30 rounded-lg p-3 border border-cyan-500/50">
                    <p className="text-cyan-300 text-base font-bold">
                      🔐 <strong>100% FAIR</strong> - Powered by Chainlink VRF! Verifiable, transparent, IMPOSSIBLE to manipulate! Trust the blockchain! ⛓️
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Guaranteed Winner */}
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-6 border-2 border-yellow-400/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-yellow-300 mb-3">✅ SOMEONE WINS EVERY DAY!</h3>
                <p className="text-white text-xl font-bold mb-3">
                  <strong className="text-yellow-300">NO BULLSH*T.</strong> Someone WILL win tonight! 🔥
                </p>
                <ul className="space-y-2 text-white text-base">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 text-xl">✓</span>
                    <span><strong>Full jackpot paid out</strong> - NO rollover BS!</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 text-xl">✓</span>
                    <span><strong>Automatic draw at 9PM UTC</strong> - You just watch and win!</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 text-xl">✓</span>
                    <span><strong>INSTANT CASH to your wallet</strong> - No waiting, no excuses!</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Special Deals */}
          <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-6 border-2 border-orange-400/50">
            <h3 className="text-3xl font-black text-orange-400 mb-3">🔥 INSANE BULK DEALS!</h3>
            <p className="text-white text-lg font-bold mb-4">
              Go BIG = Save BIG! <strong className="text-yellow-300">The more you buy, the more you SAVE!</strong> 💰
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="bg-purple-800/50 rounded-lg p-3 text-center border-2 border-purple-500/50 hover:scale-105 transition-transform">
                <p className="text-yellow-300 font-black text-xl">5 tickets</p>
                <p className="text-green-400 text-lg font-bold">$4.90</p>
                <p className="text-white text-xs">Save $0.10!</p>
              </div>
              <div className="bg-purple-800/50 rounded-lg p-3 text-center border-2 border-purple-500/50 hover:scale-105 transition-transform">
                <p className="text-yellow-300 font-black text-xl">10 tickets</p>
                <p className="text-green-400 text-lg font-bold">$9.50</p>
                <p className="text-white text-xs">Save $0.50!</p>
              </div>
              <div className="bg-purple-800/50 rounded-lg p-3 text-center border-2 border-purple-500/50 hover:scale-105 transition-transform">
                <p className="text-yellow-300 font-black text-xl">20 tickets</p>
                <p className="text-green-400 text-lg font-bold">$18.40</p>
                <p className="text-white text-xs">Save $1.60!</p>
              </div>
              <div className="bg-purple-800/50 rounded-lg p-3 text-center border-2 border-purple-500/50 hover:scale-105 transition-transform">
                <p className="text-yellow-300 font-black text-xl">50 tickets</p>
                <p className="text-green-400 text-lg font-bold">$44.00</p>
                <p className="text-white text-xs">Save $6! 🔥</p>
              </div>
              <div className="bg-purple-800/50 rounded-lg p-3 text-center border-2 border-purple-500/50 hover:scale-105 transition-transform">
                <p className="text-yellow-300 font-black text-xl">100 tickets</p>
                <p className="text-green-400 text-lg font-bold">$85.00</p>
                <p className="text-white text-xs">Save $15! 💎</p>
              </div>
              <div className="bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-4 border-yellow-400 rounded-lg p-3 text-center animate-pulse-slow hover:scale-110 transition-transform">
                <p className="text-yellow-300 font-black text-xl">1000 tickets</p>
                <p className="text-yellow-400 text-lg font-black">$800.00</p>
                <p className="text-white text-xs font-bold">Save $200! 🚀🔥</p>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl p-6 text-center border-4 border-yellow-400 animate-pulse-slow">
            <p className="text-yellow-300 text-3xl font-black mb-2">
              🚀 TONIGHT COULD CHANGE YOUR LIFE!
            </p>
            <p className="text-white text-xl font-bold">
              Someone's winning the jackpot at 9PM UTC. Why not YOU?! 💰
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 rounded-xl font-black text-2xl transition-all hover:scale-105 shadow-2xl text-black"
        >
          LET'S GO! I'M READY TO WIN! 🔥💎
        </button>
        </div>
      </div>
    </div>
  );
}

