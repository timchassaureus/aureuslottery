'use client';

import { useEffect, useRef, useState } from 'react';
import { Trophy, Timer, Award, Settings, LogOut } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { FORCED_MODE } from '@/lib/config';
import AuthModal from '@/components/AuthModal';
import BuyTicketsModal from '@/components/BuyTicketsModal';
import EnhancedWinnersHistory from '@/components/EnhancedWinnersHistory';
import HowItWorksModal from '@/components/HowItWorksModal';
import Leaderboard from '@/components/Leaderboard';
import PremiumChat from '@/components/PremiumChat';
import UrgencyBanner from '@/components/UrgencyBanner';
import LiveStats from '@/components/LiveStats';
import InviteBar from '@/components/InviteBar';
import toast from 'react-hot-toast';
import StreakDisplay from '@/components/StreakDisplay';
import WinnersFeed from '@/components/WinnersFeed';
import JackpotCounter from '@/components/JackpotCounter';
import DailyEngagementCard from '@/components/DailyEngagementCard';
import GroupDashboard from '@/components/GroupDashboard';
import JackpotHistoryChart from '@/components/JackpotHistoryChart';
import TrustBadges from '@/components/TrustBadges';
import ViralShareModal from '@/components/ViralShareModal';
import ReferralDashboard from '@/components/ReferralDashboard';
import { AureusUser } from '@/lib/auth';
import { getCurrentUser, saveUser, logout as logoutStorage } from '@/lib/userStorage';

/** Auto-create a guest wallet client-side — no server needed */
function getOrCreateGuestUser(): AureusUser {
  const stored = getCurrentUser();
  if (stored) return stored;

  const bytes = crypto.getRandomValues(new Uint8Array(20));
  const address = '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  const guest: AureusUser = {
    id: crypto.randomUUID(),
    name: 'Guest',
    walletAddress: address,
    usdcBalance: 0,
    createdAt: Date.now(),
  };
  saveUser(guest);
  return guest;
}

export default function MobileHome() {
  const { jackpot, secondaryPot, user, initDemo, mode, setMode, connectWallet, disconnectWallet } = useAppStore();

  // Force live mode on mobile — one-shot
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (FORCED_MODE === 'live') {
      localStorage.removeItem('aureus_mode');
      localStorage.removeItem('aureus_demo_initialized');
      if (mode !== 'live') setMode('live');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [buyOpen, setBuyOpen] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [referralOpen, setReferralOpen] = useState(false);
  const [viralShareOpen, setViralShareOpen] = useState(false);
  const [lastPurchaseCount, setLastPurchaseCount] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);

  // Local user state
  const [aureusUser, setAureusUser] = useState<AureusUser | null>(null);
  const connectedRef = useRef<string | null>(null);

  // On mount: load or auto-create guest wallet (no server needed)
  useEffect(() => {
    const u = getOrCreateGuestUser();
    setAureusUser(u);
  }, []);

  // Sync wallet into Zustand store (once per address)
  useEffect(() => {
    if (aureusUser?.walletAddress && connectedRef.current !== aureusUser.walletAddress) {
      connectedRef.current = aureusUser.walletAddress;
      connectWallet(aureusUser.walletAddress, true);
    }
  }, [aureusUser, connectWallet]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const target = new Date();
      target.setUTCHours(21, 0, 0, 0);
      if (now.getUTCHours() >= 21) target.setUTCDate(target.getUTCDate() + 1);
      const diff = target.getTime() - now.getTime();
      return {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      };
    };
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    calculateTimeLeft();
    return () => clearInterval(timer);
  }, []);

  const userTicketsCount = user ? user.ticketCount ?? user.tickets.length : 0;
  const isLive = mode === 'live';
  const isGuest = aureusUser?.name === 'Guest' && !aureusUser?.email;
  const displayName = aureusUser?.name && aureusUser.name !== 'Guest'
    ? aureusUser.name
    : aureusUser?.email?.split('@')[0] ?? null;

  // Auto-initialize demo mode
  useEffect(() => {
    if (mode !== 'demo') return;
    const hasData = jackpot > 100;
    const demoInitialized = typeof window !== 'undefined' && localStorage.getItem('aureus_demo_initialized');
    if (!hasData && !demoInitialized) {
      initDemo();
      if (typeof window !== 'undefined') localStorage.setItem('aureus_demo_initialized', 'true');
      toast.success('🎮 Demo loaded!', { duration: 2000 });
    }
  }, [jackpot, initDemo, mode]);

  const handleAuthSuccess = (authUser: AureusUser) => {
    saveUser(authUser);
    setAureusUser(authUser);
    connectedRef.current = null;
    setAuthModalOpen(false);
    toast.success(`Welcome ${authUser.name || 'back'} 👋`);
  };

  const handleSignOut = () => {
    logoutStorage();
    disconnectWallet();
    connectedRef.current = null;
    const newGuest = getOrCreateGuestUser();
    setAureusUser(newGuest);
    toast('Signed out');
  };

  return (
    <div className="md:hidden min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 via-purple-950 to-slate-900 text-white relative">
      {/* Animated gradient background */}
      <div className="fixed inset-0 bg-gradient-to-r from-violet-500/15 via-purple-500/20 via-violet-500/15 opacity-55 pointer-events-none" style={{
        backgroundSize: '400% 400%',
        animation: 'gradient 20s ease infinite',
      }} />

      {/* Header */}
      <header className="border-b border-indigo-700/40 backdrop-blur-sm bg-slate-900/60">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-8 h-8 text-primary-400" />
            <h1 className="text-2xl font-black bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              AUREUS
            </h1>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
              isLive
                ? 'bg-green-600/30 border-green-400/40 text-green-200'
                : 'bg-slate-800/60 border-white/20 text-white/80'
            }`}>
              {isLive ? 'Live' : 'Demo'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* How it works */}
            <button
              onClick={() => setHowItWorksOpen(true)}
              className="p-2 bg-violet-700/50 rounded-xl border border-violet-600/30"
            >
              <Award className="w-5 h-5 text-violet-300" />
            </button>

            {/* Leaderboard */}
            <button
              onClick={() => setLeaderboardOpen(true)}
              className="p-2 bg-yellow-900/50 rounded-xl border border-yellow-700/30"
            >
              <Trophy className="w-5 h-5 text-yellow-400" />
            </button>

            {/* Invite & Earn */}
            <button
              onClick={() => setReferralOpen(true)}
              className="p-2 bg-green-900/50 rounded-xl border border-green-700/30"
            >
              <span className="text-base leading-none">💸</span>
            </button>

            {/* Account button — opens profile if logged in, auth if guest */}
            <button
              onClick={() => isGuest ? setAuthModalOpen(true) : setProfileOpen(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                isGuest
                  ? 'bg-slate-800/60 border-white/20 text-white/70'
                  : 'bg-violet-700/50 border-violet-600/30 text-violet-200'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-[9px] font-black text-black">
                {displayName ? displayName[0].toUpperCase() : '?'}
              </div>
              <span className="max-w-[50px] truncate">
                {displayName ?? 'Compte'}
              </span>
              <Settings className="w-3 h-3 opacity-60" />
            </button>

            {/* Sign out — only for logged-in users */}
            {!isGuest && (
              <button
                onClick={handleSignOut}
                className="p-2 bg-red-900/40 rounded-xl border border-red-700/30"
                title="Se déconnecter"
              >
                <LogOut className="w-4 h-4 text-red-300" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Urgency Banner */}
      <UrgencyBanner timeLeft={timeLeft} />

      {/* Main Content */}
      <main className="px-4 py-6 pb-28">

        {/* Guest notice */}
        {isGuest && (
          <div className="mb-4 bg-yellow-900/30 border border-yellow-600/30 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-yellow-300 text-xs font-bold">🎭 Playing as Guest</p>
              <p className="text-yellow-200/70 text-xs">Save your account to keep your tickets &amp; winnings.</p>
            </div>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="shrink-0 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg font-bold text-xs"
            >
              Save
            </button>
          </div>
        )}

        {/* Jackpot */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-primary-500/40 blur-3xl rounded-full animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-indigo-950/95 via-purple-950/95 to-slate-950/95 backdrop-blur-2xl border-4 border-white/30 rounded-3xl p-6 shadow-2xl shadow-white/20">
            <div className="text-center">
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

              <div className="mt-2 flex justify-center">
                <JackpotCounter />
              </div>

              <p className="text-lg text-primary-400 font-bold mt-4">🎯 Daily Draws</p>

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

        {/* Secondary Pot */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-purple-900/70 via-violet-900/70 to-purple-900/70 backdrop-blur-xl border-2 border-violet-500/50 rounded-2xl p-4 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🏆</span>
                  <h3 className="text-base font-bold text-yellow-400">Main Jackpot</h3>
                </div>
                <p className="text-2xl font-black text-white mb-1">${jackpot.toLocaleString('en-US')}</p>
                <p className="text-xs text-slate-300">1 winner</p>
              </div>
              <div className="w-px h-16 bg-white/20"></div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">💎</span>
                  <h3 className="text-base font-bold text-violet-400">Bonus Draw</h3>
                </div>
                <p className="text-2xl font-black text-white mb-1">${secondaryPot.toLocaleString('en-US')}</p>
                <p className="text-xs text-slate-300">25 Winners</p>
              </div>
            </div>
            <div className="mt-3 bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-500/30 rounded-lg p-2 text-center">
              <p className="text-xs text-violet-200">
                💡 <strong>Every ticket enters BOTH draws!</strong> Win big or share the bonus pot 🎉
              </p>
              <p className="text-xs text-yellow-300 font-bold mt-1">
                📣 Invite friends — bigger pot = bigger jackpot 🚀
              </p>
            </div>
          </div>
        </div>

        {/* Buy Tickets */}
        <div className="mb-6">
          <button
            onClick={() => setBuyOpen(true)}
            className="group relative w-full overflow-hidden cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-blue-600 pointer-events-none"></div>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 blur-xl"></div>
            </div>
            <div className="relative py-5 px-6 rounded-3xl border-4 border-white/40 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl group-hover:scale-125 transition-transform">🎫</span>
                <span className="font-black text-2xl text-white drop-shadow-lg">Buy Tickets Now</span>
                <span className="text-4xl group-hover:scale-125 transition-transform">💰</span>
              </div>
              <div className="mt-2 text-yellow-300 font-bold text-xs">
                ⚡ Instant • Card or Crypto • No Wallet Required
              </div>
            </div>
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"></div>
          </button>
        </div>

        {/* Recent Winners */}
        <div className="mb-6">
          <EnhancedWinnersHistory />
        </div>

        {/* Engagement section */}
        <div className="space-y-4 mb-6">
          <StreakDisplay />
          <WinnersFeed />
          <DailyEngagementCard
            userTicketsCount={userTicketsCount}
            lifetimeTickets={user?.lifetimeTickets ?? 0}
            jackpot={jackpot}
          />
          <GroupDashboard />
        </div>

        {/* Jackpot History Chart */}
        <div className="mb-6">
          <JackpotHistoryChart />
        </div>

        {/* Trust Badges */}
        <div className="mb-6">
          <TrustBadges />
        </div>

      </main>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
      <BuyTicketsModal
        isOpen={buyOpen}
        onClose={() => {
          const prevCount = userTicketsCount;
          setBuyOpen(false);
          setTimeout(() => {
            const newCount = useAppStore.getState().user?.tickets.length || 0;
            if (newCount > prevCount) {
              setLastPurchaseCount(newCount - prevCount);
              setViralShareOpen(true);
            }
          }, 500);
        }}
      />
      <Leaderboard isOpen={leaderboardOpen} onClose={() => setLeaderboardOpen(false)} />
      <HowItWorksModal isOpen={howItWorksOpen} onClose={() => setHowItWorksOpen(false)} />
      <ViralShareModal
        isOpen={viralShareOpen}
        onClose={() => setViralShareOpen(false)}
        ticketCount={lastPurchaseCount}
        jackpot={jackpot}
      />

      {/* Profile modal */}
      {profileOpen && aureusUser && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setProfileOpen(false)}
        >
          <div
            className="w-full max-w-md bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 border border-white/10 rounded-t-3xl p-6 pb-10 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />

            {/* Avatar + name */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-xl font-black text-black">
                {displayName ? displayName[0].toUpperCase() : '?'}
              </div>
              <div>
                <p className="font-bold text-white text-lg">{displayName}</p>
                {aureusUser.email && (
                  <p className="text-sm text-slate-400">{aureusUser.email}</p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/10">
                <p className="text-2xl font-black text-yellow-300">{userTicketsCount}</p>
                <p className="text-xs text-slate-400 mt-1">Tickets actifs</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/10">
                <p className="text-2xl font-black text-green-300">${(aureusUser.usdcBalance ?? 0).toFixed(2)}</p>
                <p className="text-xs text-slate-400 mt-1">Balance USDC</p>
              </div>
            </div>

            {/* Wallet address */}
            <div className="bg-white/5 rounded-2xl p-4 mb-4 border border-white/10">
              <p className="text-xs text-slate-400 mb-1">Adresse portefeuille</p>
              <p className="text-sm font-mono text-white/80 break-all">
                {aureusUser.walletAddress?.slice(0, 10)}…{aureusUser.walletAddress?.slice(-8)}
              </p>
            </div>

            {/* Actions */}
            <button
              onClick={() => { setProfileOpen(false); setBuyOpen(true); }}
              className="w-full py-3 mb-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl font-bold text-white"
            >
              🎫 Acheter des tickets
            </button>
            <button
              onClick={() => { handleSignOut(); setProfileOpen(false); }}
              className="w-full py-3 rounded-2xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Se déconnecter
            </button>
          </div>
        </div>
      )}

      {/* Referral modal */}
      {referralOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setReferralOpen(false)}
        >
          <div
            className="bg-slate-900 border border-purple-500/30 rounded-2xl max-w-md w-full p-6 shadow-xl max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <ReferralDashboard />
            <button
              onClick={() => setReferralOpen(false)}
              className="mt-4 w-full py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Chat */}
      <PremiumChat />

      {/* Invite & Viral Bar */}
      <InviteBar />

      {/* Live Stats Bar */}
      <LiveStats />
    </div>
  );
}
