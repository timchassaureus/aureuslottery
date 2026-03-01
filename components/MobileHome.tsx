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
    <div className="md:hidden min-h-screen bg-[#06060F] text-[#F5F0E8] relative">
      {/* Subtle gold shimmer layer */}
      <div className="fixed inset-0 bg-gradient-to-b from-gold-500/[0.03] via-transparent to-gold-500/[0.02] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gold-500/20 backdrop-blur-md bg-[#06060F]/95">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-gold-500" />
            <h1 className="text-xl font-black tracking-[0.25em] text-gold-400">
              AUREUS
            </h1>
            <span className={`text-[9px] px-1.5 py-0.5 rounded tracking-wider uppercase font-bold ${
              isLive
                ? 'text-gold-500 border border-gold-500/40'
                : 'text-[#8A8070] border border-white/10'
            }`}>
              {isLive ? 'Live' : 'Demo'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* How it works */}
            <button
              onClick={() => setHowItWorksOpen(true)}
              className="p-2 rounded-xl border border-white/10 bg-white/[0.03] hover:border-gold-500/30 transition-colors"
            >
              <Award className="w-4 h-4 text-[#8A8070]" />
            </button>

            {/* Leaderboard */}
            <button
              onClick={() => setLeaderboardOpen(true)}
              className="p-2 rounded-xl border border-white/10 bg-white/[0.03] hover:border-gold-500/30 transition-colors"
            >
              <Trophy className="w-4 h-4 text-[#8A8070]" />
            </button>

            {/* Invite & Earn */}
            <button
              onClick={() => setReferralOpen(true)}
              className="p-2 rounded-xl border border-white/10 bg-white/[0.03] hover:border-gold-500/30 transition-colors"
            >
              <Award className="w-4 h-4 text-gold-500" />
            </button>

            {/* Account button */}
            <button
              onClick={() => isGuest ? setAuthModalOpen(true) : setProfileOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-gold-500/30 bg-gold-500/10 text-gold-400 text-xs font-bold transition-all hover:bg-gold-500/20"
            >
              <div className="w-5 h-5 rounded-full bg-gold-500 flex items-center justify-center text-[9px] font-black text-black">
                {displayName ? displayName[0].toUpperCase() : '?'}
              </div>
              <span className="max-w-[50px] truncate">
                {displayName ?? 'Compte'}
              </span>
              <Settings className="w-3 h-3 opacity-60" />
            </button>

            {/* Sign out */}
            {!isGuest && (
              <button
                onClick={handleSignOut}
                className="p-2 rounded-xl border border-white/10 bg-white/[0.03] hover:border-white/20 transition-colors"
                title="Se déconnecter"
              >
                <LogOut className="w-4 h-4 text-[#8A8070]" />
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
          <div className="mb-4 border border-gold-500/25 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 bg-gold-500/[0.06]">
            <div>
              <p className="text-gold-400 text-xs font-bold tracking-wide uppercase">Compte invité</p>
              <p className="text-[#8A8070] text-xs mt-0.5">Créez un compte pour garder vos tickets et gains.</p>
            </div>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="shrink-0 px-3 py-1.5 bg-gold-500 hover:bg-gold-400 text-black rounded-lg font-bold text-xs transition-colors"
            >
              Créer
            </button>
          </div>
        )}

        {/* Jackpot */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gold-500/10 blur-3xl rounded-full pointer-events-none"></div>
          <div className="relative bg-[#0D0D1A] border border-gold-500/25 rounded-3xl p-6 shadow-2xl">
            <div className="text-center">
              {/* Countdown */}
              <div className="flex items-center justify-center gap-2 mb-5">
                <Timer className="w-4 h-4 text-[#8A8070]" />
                <span className="text-xs text-[#8A8070] uppercase tracking-widest">Prochain tirage</span>
                <div className="flex items-center gap-1 bg-white/[0.04] px-3 py-1 rounded-lg border border-white/10">
                  <span className="text-base font-bold tabular-nums text-[#F5F0E8]">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="text-[#8A8070] text-sm">:</span>
                  <span className="text-base font-bold tabular-nums text-[#F5F0E8]">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="text-[#8A8070] text-sm">:</span>
                  <span className="text-base font-bold tabular-nums text-[#F5F0E8]">{String(timeLeft.seconds).padStart(2, '0')}</span>
                </div>
              </div>

              {/* Label */}
              <p className="text-xs text-[#8A8070] uppercase tracking-[0.2em] mb-3">
                Jackpot du soir
              </p>

              {/* Amount */}
              <div className="flex justify-center">
                <JackpotCounter />
              </div>

              {/* Tickets badge */}
              {userTicketsCount > 0 && (
                <div className="inline-flex items-center gap-2 mt-5 border border-gold-500/30 rounded-full px-5 py-1.5 bg-gold-500/[0.08]">
                  <span className="text-xs text-[#8A8070] uppercase tracking-wider">Mes tickets</span>
                  <span className="text-gold-400 font-black text-base">{userTicketsCount}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Secondary Pot */}
        <div className="mb-6">
          <div className="bg-[#0D0D1A] border border-gold-500/20 rounded-2xl p-4">
            <div className="flex items-stretch gap-4">
              <div className="flex-1">
                <p className="text-[9px] text-[#8A8070] uppercase tracking-[0.2em] mb-1.5">Jackpot Principal</p>
                <p className="text-xl font-black text-[#F5F0E8]">${jackpot.toLocaleString('en-US')}</p>
                <p className="text-[10px] text-[#8A8070] mt-1">1 gagnant</p>
              </div>
              <div className="w-px bg-gold-500/15"></div>
              <div className="flex-1">
                <p className="text-[9px] text-[#8A8070] uppercase tracking-[0.2em] mb-1.5">Tirage Bonus</p>
                <p className="text-xl font-black text-[#F5F0E8]">${secondaryPot.toLocaleString('en-US')}</p>
                <p className="text-[10px] text-[#8A8070] mt-1">25 gagnants</p>
              </div>
            </div>
            <div className="mt-3 border-t border-white/[0.05] pt-3">
              <p className="text-[11px] text-[#8A8070] text-center">
                Chaque ticket participe aux deux tirages · Invitez des amis pour augmenter le jackpot
              </p>
            </div>
          </div>
        </div>

        {/* Buy Tickets */}
        <div className="mb-6">
          <button
            onClick={() => setBuyOpen(true)}
            className="group relative w-full overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-gold-500 group-hover:bg-gold-400 transition-colors duration-200 pointer-events-none"></div>
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"></div>
            <div className="relative py-4 px-6 flex flex-col items-center gap-1">
              <span className="font-black text-xl text-black tracking-wide">Acheter des Tickets</span>
              <span className="text-black/60 text-[11px] font-medium tracking-wider uppercase">
                Carte bancaire · Paiement instantané
              </span>
            </div>
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
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setProfileOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#0D0D1A] border-t border-x border-gold-500/20 rounded-t-3xl p-6 pb-10 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="w-10 h-0.5 bg-gold-500/30 rounded-full mx-auto mb-6" />

            {/* Avatar + name */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-gold-500 flex items-center justify-center text-lg font-black text-black">
                {displayName ? displayName[0].toUpperCase() : '?'}
              </div>
              <div>
                <p className="font-bold text-[#F5F0E8] text-base">{displayName}</p>
                {aureusUser.email && (
                  <p className="text-xs text-[#8A8070] mt-0.5">{aureusUser.email}</p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gold-500/[0.06] rounded-2xl p-4 text-center border border-gold-500/20">
                <p className="text-2xl font-black text-gold-400">{userTicketsCount}</p>
                <p className="text-[10px] text-[#8A8070] uppercase tracking-wider mt-1">Tickets actifs</p>
              </div>
              <div className="bg-white/[0.03] rounded-2xl p-4 text-center border border-white/10">
                <p className="text-2xl font-black text-[#F5F0E8]">${(aureusUser.usdcBalance ?? 0).toFixed(2)}</p>
                <p className="text-[10px] text-[#8A8070] uppercase tracking-wider mt-1">Solde USDC</p>
              </div>
            </div>

            {/* Wallet address */}
            <div className="bg-white/[0.03] rounded-xl p-3 mb-5 border border-white/[0.06]">
              <p className="text-[9px] text-[#8A8070] uppercase tracking-widest mb-1">Adresse portefeuille</p>
              <p className="text-xs font-mono text-[#8A8070] break-all">
                {aureusUser.walletAddress?.slice(0, 10)}…{aureusUser.walletAddress?.slice(-8)}
              </p>
            </div>

            {/* Actions */}
            <button
              onClick={() => { setProfileOpen(false); setBuyOpen(true); }}
              className="w-full py-3.5 mb-3 bg-gold-500 hover:bg-gold-400 rounded-2xl font-bold text-black text-sm tracking-wide transition-colors"
            >
              Acheter des tickets
            </button>
            <button
              onClick={() => { handleSignOut(); setProfileOpen(false); }}
              className="w-full py-3 rounded-2xl text-xs text-[#8A8070] hover:text-[#F5F0E8] hover:bg-white/[0.04] transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              Se déconnecter
            </button>
          </div>
        </div>
      )}

      {/* Referral modal */}
      {referralOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setReferralOpen(false)}
        >
          <div
            className="bg-[#0D0D1A] border border-gold-500/20 rounded-2xl max-w-md w-full p-6 shadow-xl max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <ReferralDashboard />
            <button
              onClick={() => setReferralOpen(false)}
              className="mt-4 w-full py-2.5 rounded-xl border border-white/10 text-[#8A8070] hover:text-[#F5F0E8] text-sm font-medium transition-colors"
            >
              Fermer
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
