'use client';

import { Shield, Zap, Lock, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const LOTTERY_CONTRACT = process.env.NEXT_PUBLIC_LOTTERY_ADDRESS;
const BASESCAN_BASE = 'https://basescan.org/address/';

export default function TrustBadges() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Chainlink VRF */}
        <div className="flex flex-col items-center gap-2 p-3 bg-blue-900/20 border border-blue-700/30 rounded-xl text-center">
          <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
            <Zap className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-blue-300">Chainlink VRF</p>
            <p className="text-[10px] text-blue-400/80">Verifiable draw</p>
          </div>
        </div>

        {/* Smart Contract */}
        <div className="flex flex-col items-center gap-2 p-3 bg-green-900/20 border border-green-700/30 rounded-xl text-center">
          <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
            <Shield className="w-4 h-4 text-green-400" />
          </div>
          <div>
            {LOTTERY_CONTRACT ? (
              <a
                href={`${BASESCAN_BASE}${LOTTERY_CONTRACT}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-green-300 hover:text-green-200 flex items-center gap-1 justify-center"
              >
                Smart Contract <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <p className="text-xs font-bold text-green-300">Smart Contract</p>
            )}
            <p className="text-[10px] text-green-400/80">Open source</p>
          </div>
        </div>

        {/* Base Network */}
        <div className="flex flex-col items-center gap-2 p-3 bg-purple-900/20 border border-purple-700/30 rounded-xl text-center">
          <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
            <span className="text-purple-400 font-bold text-sm">⬡</span>
          </div>
          <div>
            <p className="text-xs font-bold text-purple-300">Base Network</p>
            <p className="text-[10px] text-purple-400/80">by Coinbase</p>
          </div>
        </div>

        {/* Sécurité */}
        <div className="flex flex-col items-center gap-2 p-3 bg-yellow-900/20 border border-yellow-700/30 rounded-xl text-center">
          <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
            <Lock className="w-4 h-4 text-yellow-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-yellow-300">100% On-chain</p>
            <p className="text-[10px] text-yellow-400/80">Transparent</p>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="flex justify-center gap-4 mt-4 text-xs text-purple-400">
        <Link href="/faq" className="hover:text-purple-200 transition-colors">FAQ</Link>
        <Link href="/terms" className="hover:text-purple-200 transition-colors">Terms</Link>
        <Link href="/privacy" className="hover:text-purple-200 transition-colors">Privacy</Link>
        <Link href="/winner-guide" className="hover:text-purple-200 transition-colors">Winner Guide</Link>
      </div>
    </div>
  );
}
