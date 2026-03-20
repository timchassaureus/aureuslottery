'use client';

import { X, Shield, Zap, Trophy, Clock } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const TREASURY = process.env.NEXT_PUBLIC_TREASURY_ADDRESS;
const BASESCAN = 'https://basescan.org/address/';

export default function HowItWorksModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[999] overflow-y-auto py-4 md:py-8">
      <div className="min-h-screen flex items-start justify-center p-4">
        <div className="border border-white/10 rounded-2xl p-6 md:p-8 max-w-2xl w-full relative" style={{ background: 'linear-gradient(160deg, #0e0d1a 0%, #09090f 100%)' }}>

          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">How Aureus works</h2>
            <p className="text-slate-400 text-sm">A daily on-chain lottery — transparent, automatic, verifiable.</p>
          </div>

          <div className="space-y-4">

            {/* Step 1 */}
            <div className="flex gap-4 p-4 rounded-xl border border-white/8 bg-white/[0.03]">
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-violet-500/15 flex items-center justify-center">
                <span className="text-violet-300 font-bold text-sm">1</span>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">Buy tickets — $1 each</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-3">
                  Each ticket costs 1 USDC on Base network. Volume discounts apply at 5, 10, 20, 50, and 100 tickets.
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    ['5 tickets', '$4.90', '2% off'],
                    ['10 tickets', '$9.50', '5% off'],
                    ['20 tickets', '$18.40', '8% off'],
                    ['50 tickets', '$44.00', '12% off'],
                    ['100 tickets', '$85.00', '15% off'],
                    ['1 000 tickets', '$800.00', '20% off'],
                  ].map(([qty, price, save]) => (
                    <div key={qty} className="bg-black/30 rounded-lg p-2 text-center border border-white/6">
                      <p className="text-slate-300 font-medium text-[10px]">{qty}</p>
                      <p className="text-white font-bold text-xs">{price}</p>
                      <p className="text-slate-500 text-[10px]">{save}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4 p-4 rounded-xl border border-white/8 bg-white/[0.03]">
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-violet-500/15 flex items-center justify-center">
                <Clock className="w-4 h-4 text-violet-300" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">Two automatic draws every day</h3>
                <p className="text-slate-400 text-sm mb-3">Every ticket enters both draws simultaneously. No action needed after purchase.</p>
                <div className="space-y-2">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/6 border border-yellow-500/15">
                    <Trophy className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-white text-sm font-medium">9:00 PM UTC — Main jackpot</p>
                      <p className="text-slate-400 text-xs mt-0.5">1 winner receives 85% of the day&apos;s total pot.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-violet-500/6 border border-violet-500/15">
                    <Zap className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-white text-sm font-medium">9:30 PM UTC — Bonus draw</p>
                      <p className="text-slate-400 text-xs mt-0.5">Up to 25 unique winners share 5% of the pot.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4 p-4 rounded-xl border border-white/8 bg-white/[0.03]">
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-violet-500/15 flex items-center justify-center">
                <Shield className="w-4 h-4 text-violet-300" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">Verifiable randomness, automatic payout</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Winners are selected using Chainlink VRF — a cryptographically verifiable random function. The result is provably fair and cannot be influenced by anyone, including the platform. Winnings are sent directly to the winner&apos;s wallet within minutes.
                </p>
              </div>
            </div>

            {/* Pot breakdown */}
            <div className="p-4 rounded-xl border border-white/8 bg-white/[0.03]">
              <h3 className="text-white font-semibold mb-3 text-sm">Pot distribution</h3>
              <div className="space-y-2 text-sm">
                {([
                  ['85%', 'Main jackpot winner', 'text-yellow-300'],
                  ['5%', 'Bonus draw — up to 25 winners', 'text-violet-300'],
                  ['10%', 'Platform operations', 'text-slate-400'],
                ] as const).map(([pct, label, color]) => (
                  <div key={pct} className="flex items-center gap-3">
                    <span className={`font-bold w-10 shrink-0 ${color}`}>{pct}</span>
                    <span className="text-slate-400">{label}</span>
                  </div>
                ))}
              </div>
              {TREASURY && (
                <a
                  href={`${BASESCAN}${TREASURY}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Verify treasury on BaseScan →
                </a>
              )}
            </div>

          </div>

          <button
            onClick={onClose}
            className="w-full mt-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold text-white text-sm transition-all"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
