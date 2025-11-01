'use client';

import { useEffect, useState } from 'react';
import { Trophy, Timer, User, Award } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import WalletButton from '@/components/WalletButton';
import BuyTicketsModal from '@/components/BuyTicketsModal';
import EnhancedWinnersHistory from '@/components/EnhancedWinnersHistory';
import HowItWorksModal from '@/components/HowItWorksModal';
import UserProfile from '@/components/UserProfile';
import Leaderboard from '@/components/Leaderboard';
import PremiumChat from '@/components/PremiumChat';
import UrgencyBanner from '@/components/UrgencyBanner';
import LiveStats from '@/components/LiveStats';
import InviteBar from '@/components/InviteBar';
import toast from 'react-hot-toast';

export default function MobileHome() {
  const { jackpot, secondaryPot, user } = useAppStore();
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [buyOpen, setBuyOpen] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const target = new Date();
      target.setUTCHours(21, 0, 0, 0);
      if (now.getUTCHours() >= 21) {
        target.setUTCDate(target.getUTCDate() + 1);
      }
      const diff = target.getTime() - now.getTime();
      return {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      };
    };
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    calculateTimeLeft();
    return () => clearInterval(timer);
  }, []);

  const userTicketsCount = user ? user.tickets.length : 0;

  return (
    <div className="md:hidden min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 via-purple-950 to-slate-900 text-white relative">
      {/* Animated gradient background */}
      <div className="fixed inset-0 bg-gradient-to-r from-violet-500/15 via-purple-500/20 via-violet-500/15 animate-pulse opacity-55 pointer-events-none" style={{
        backgroundSize: '400% 400%',
        animation: 'gradient 20s ease infinite'
      }} />

      {/* Header */}
      <header className="border-b border-indigo-700/40 backdrop-blur-sm bg-slate-900/60">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-8 h-8 text-primary-400" />
            <h1 className="text-2xl font-black bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              AUREUS
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setHowItWorksOpen(true)}
              className="p-2 bg-violet-700/50 hover:bg-violet-700/70 rounded-xl transition-all border border-violet-600/30"
            >
              <Award className="w-5 h-5 text-violet-300" />
            </button>
            {user && (
              <button
                onClick={() => setLeaderboardOpen(true)}
                className="p-2 bg-yellow-900/50 hover:bg-yellow-800/70 rounded-xl transition-all border border-yellow-700/30"
              >
                <Trophy className="w-5 h-5 text-yellow-400" />
              </button>
            )}
            {user && (
              <button
                onClick={() => setProfileOpen(true)}
                className="p-2 bg-blue-700/50 hover:bg-blue-700/70 rounded-xl transition-all"
              >
                <User className="w-5 h-5" />
              </button>
            )}
            <WalletButton />
          </div>
        </div>
      </header>

      {/* Urgency Banner */}
      <UrgencyBanner timeLeft={timeLeft} />

      {/* Main Content */}
      <main className="px-4 py-6 pb-28">
        {/* JACKPOT ÉNORME ET VISIBLE */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-primary-500/40 blur-3xl rounded-full animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-indigo-950/95 via-purple-950/95 via-purple-950/95 to-slate-950/95 backdrop-blur-2xl border-4 border-white/30 rounded-3xl p-6 shadow-2xl shadow-white/20">
            <div className="text-center">
              {/* Mini Countdown */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <Timer className="w-5 h-5 text-slate-400" />
                <span className="text-sm text-slate-400">Next Draw:</span>
                <div className="flex items-center gap-1 bg-black/30 px-3 py-1 rounded-lg">
                  <span className="text-lg font-bold text-white">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="text-slate-400">:</span>
                  <span className="text-lg font-bold text-white">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="text-slate-400">:</span>
                  <span className="text-lg font-bold text-white">{String(timeLeft.seconds).padStart(2, '0')}</span>
                </div>
              </div>

              <p className="text-xl text-primary-400 mb-4 font-bold uppercase tracking-wider">
                🎰 Current Jackpot 🎰
              </p>
              
              {/* Montant ENORME */}
              <div className="text-5xl font-black bg-gradient-to-r from-amber-300 from-5% via-yellow-200 via-30% via-yellow-200 via-70% to-amber-300 to-95% bg-clip-text text-transparent mb-4 leading-tight drop-shadow-2xl break-all" style={{ textShadow: '0 0 30px rgba(251, 191, 36, 0.5), 0 0 60px rgba(251, 191, 36, 0.3)' }}>
                ${jackpot.toLocaleString('en-US')}
              </div>

              <p className="text-lg text-primary-400 font-bold mt-4">
                🎯 Daily Draw at 9PM UTC
              </p>

              {userTicketsCount > 0 && (
                <div className="inline-block bg-gradient-to-r from-violet-500/20 to-blue-500/20 rounded-full px-6 py-2 border-2 border-white/30 mt-4">
                  <p className="text-base font-bold text-white">
                    Your tickets: <span className="text-yellow-300 font-black">{userTicketsCount}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Secondary Pot Display */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-purple-900/70 via-violet-900/70 to-purple-900/70 backdrop-blur-xl border-2 border-violet-500/50 rounded-2xl p-4 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              {/* Main Jackpot Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🏆</span>
                  <h3 className="text-base font-bold text-yellow-400">Main Jackpot</h3>
                </div>
                <p className="text-2xl font-black text-white mb-1">
                  ${jackpot.toLocaleString('en-US')}
                </p>
                <p className="text-xs text-slate-300">🕘 9PM UTC • 1 Winner</p>
              </div>

              {/* Divider */}
              <div className="w-px h-16 bg-white/20"></div>

              {/* Secondary Pot Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">💎</span>
                  <h3 className="text-base font-bold text-violet-400">Bonus Draw</h3>
                </div>
                <p className="text-2xl font-black text-white mb-1">
                  ${secondaryPot.toLocaleString('en-US')}
                </p>
                <p className="text-xs text-slate-300">🕚 11PM UTC • 25 Winners</p>
              </div>
            </div>

            {/* Info Banner */}
            <div className="mt-3 bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-500/30 rounded-lg p-2">
              <div className="text-center space-y-1">
                <p className="text-xs text-violet-200">
                  💡 <strong>Every ticket enters BOTH draws!</strong> Win big at 9PM or share the bonus pot at 11PM 🎉
                </p>
                <p className="text-xs text-yellow-300 font-bold">
                  📣 Invite your friends — more players = a BIGGER pot. Let's push the jackpot to <span className="text-white">MILLIONS daily</span>! 🚀
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions - Buy Tickets */}
        <div className="mb-6">
          <button
            onClick={() => {
              if (user) {
                setBuyOpen(true);
              } else {
                toast.error('Please connect your wallet first! 👛');
              }
            }}
            className="group relative w-full overflow-hidden cursor-pointer"
          >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 via-indigo-600 to-blue-600 animate-gradient-x pointer-events-none"></div>
            
            {/* Glow effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 blur-xl"></div>
            </div>
            
            {/* Button content */}
            <div className="relative py-5 px-6 rounded-3xl border-4 border-white/40 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl group-hover:scale-125 transition-transform">🎫</span>
                <span className="font-black text-2xl text-white drop-shadow-lg">
                  Buy Tickets Now
                </span>
                <span className="text-4xl group-hover:scale-125 transition-transform">💰</span>
              </div>
              <div className="mt-2 text-yellow-300 font-bold text-xs">
                ⚡ Instant Purchase • No Limits
              </div>
            </div>
            
            {/* Shine effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"></div>
          </button>
        </div>

        {/* Recent Winners - Social Proof! */}
        <div className="mb-6">
          <EnhancedWinnersHistory />
        </div>
      </main>

      {/* Modals */}
      <BuyTicketsModal isOpen={buyOpen} onClose={() => setBuyOpen(false)} />
      <UserProfile isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
      <Leaderboard isOpen={leaderboardOpen} onClose={() => setLeaderboardOpen(false)} />
      <HowItWorksModal isOpen={howItWorksOpen} onClose={() => setHowItWorksOpen(false)} />
      
      {/* Chat */}
      <PremiumChat />
      
      {/* Invite & Viral Bar */}
      <InviteBar />

      {/* Live Stats Bar - Bottom */}
      <LiveStats />
    </div>
  );
}
