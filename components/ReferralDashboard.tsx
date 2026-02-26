'use client';

import { useReferral } from '@/hooks/useReferral';
import { useAppStore } from '@/lib/store';
import { Copy, Share2, Users, DollarSign, Loader2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const TWITTER_TEXT =
  'I play @AureusLottery and the jackpot is growing! Join me — we can win together 🎰💰 #Aureus #Crypto';
const APP_URL = typeof window !== 'undefined' ? window.location.origin : 'https://aureuslottery.app';

export default function ReferralDashboard() {
  const user = useAppStore((s) => s.user);
  const wallet = user?.address;
  const {
    myReferralCode,
    referralLink,
    totalEarned,
    referredCount,
    isLoading,
    error,
    refresh,
  } = useReferral(wallet);

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(TWITTER_TEXT)}&url=${encodeURIComponent(referralLink)}`;
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(TWITTER_TEXT)}`;

  if (!wallet) {
    return (
      <div className="rounded-xl border border-purple-500/30 bg-purple-900/20 p-6 text-center">
        <p className="text-purple-300">Connect your wallet to get your referral link and earn 3% on every ticket your friends buy.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-purple-500/30 bg-purple-900/20 p-8">
        <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
        <span className="text-purple-300">Loading referral data…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-900/20 p-6 text-center">
        <p className="text-red-300">{error}</p>
        <button
          onClick={refresh}
          className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-purple-500/30 bg-purple-900/20 p-6 space-y-6">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <Share2 className="w-5 h-5 text-primary-400" />
        Invite friends — grow the jackpot 🚀
      </h3>

      {/* How it works */}
      <div className="rounded-xl border border-purple-500/20 bg-purple-800/10 p-4 space-y-3">
        <p className="text-sm font-semibold text-white">How it works</p>
        <ol className="space-y-2 text-sm text-purple-200">
          <li className="flex gap-2"><span className="text-yellow-400 font-bold shrink-0">1.</span> Copy your unique referral link below.</li>
          <li className="flex gap-2"><span className="text-yellow-400 font-bold shrink-0">2.</span> Share it anywhere — WhatsApp, Telegram, X, Instagram...</li>
          <li className="flex gap-2"><span className="text-yellow-400 font-bold shrink-0">3.</span> When a friend opens your link and buys tickets, you automatically earn <strong className="text-white">3% of their purchase</strong>, paid directly to your wallet in USDC.</li>
        </ol>
        <p className="text-xs text-purple-400 border-t border-purple-600/30 pt-2">
          No cap, no expiry. The more friends you bring, the more you earn — even while you sleep.
        </p>
      </div>
      {referredCount >= 10 && (
        <div className="rounded-lg bg-amber-500/20 border border-amber-500/50 px-3 py-2 flex items-center gap-2 text-amber-300 font-medium">
          🏆 Super Referrer
        </div>
      )}

      {myReferralCode && (
        <>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="flex-1 rounded-lg border border-purple-600/50 bg-purple-800/50 px-4 py-3 text-sm text-white font-mono"
            />
            <button
              onClick={handleCopy}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-3 font-medium text-white hover:bg-primary-700 transition-colors"
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href={twitterShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[#1DA1F2]/20 border border-[#1DA1F2]/40 px-4 py-2 text-sm font-medium text-white hover:bg-[#1DA1F2]/30 transition-colors"
            >
              Share on X (Twitter)
            </a>
            <a
              href={telegramShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[#0088cc]/20 border border-[#0088cc]/40 px-4 py-2 text-sm font-medium text-white hover:bg-[#0088cc]/30 transition-colors"
            >
              Share on Telegram
            </a>
          </div>
        </>
      )}

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-purple-600/40">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-purple-800/50 p-3">
            <Users className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{referredCount}</p>
            <p className="text-xs text-purple-400">Friends referred</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-purple-800/50 p-3">
            <DollarSign className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              ${totalEarned.toFixed(2)}
            </p>
            <p className="text-xs text-purple-400">Total earned</p>
          </div>
        </div>
      </div>
    </div>
  );
}
