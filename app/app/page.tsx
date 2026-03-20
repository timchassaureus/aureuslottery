'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Timer, Trophy, Ticket, ChevronDown, LogOut } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import AuthModal from '@/components/AuthModal';
import DepositAddress from '@/components/DepositAddress';
import BuyTicketsModal from '@/components/BuyTicketsModal';
import PremiumChat from '@/components/PremiumChat';
import PreDrawCountdown from '@/components/PreDrawCountdown';
import UserProfile from '@/components/UserProfile';
import WinnerAnimation from '@/components/WinnerAnimation';
import EpicDrawCeremony from '@/components/EpicDrawCeremony';
import MobileHome from '@/components/MobileHome';
import EnhancedWinnersHistory from '@/components/EnhancedWinnersHistory';
import TrustBadges from '@/components/TrustBadges';
import DisclaimerModal from '@/components/DisclaimerModal';
import UsernameModal from '@/components/UsernameModal';
import ViralShareModal from '@/components/ViralShareModal';
import AdminControls from '@/components/AdminControls';
import ReferralDashboard from '@/components/ReferralDashboard';
import JackpotCounter from '@/components/JackpotCounter';
import NotificationCenter from '@/components/NotificationCenter';
import NotificationAutomation from '@/components/NotificationAutomation';
import GroupNotificationAutomation from '@/components/GroupNotificationAutomation';
import { useAppStore } from '@/lib/store';
import { FORCED_MODE } from '@/lib/config';
import { AureusUser } from '@/lib/auth';
import { getCurrentUser } from '@/lib/userStorage';
import { sendBrowserNotification } from '@/lib/webNotifications';
import { emitInAppNotification } from '@/lib/notificationBus';

const QUICK_AMOUNTS = [1, 5, 10, 25, 50];

function PlayCard({ onPlay }: { onPlay: (n: number) => void }) {
  const [selected, setSelected] = useState(5);
  const { jackpot } = useAppStore();

  const prices: Record<number, number> = { 1: 1, 5: 4.9, 10: 9.5, 25: 22.25, 50: 44 };
  const price = prices[selected] ?? selected;

  return (
    <div
      className="mx-6 mb-8 rounded-2xl p-5"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#C9A84C]/50 mb-4 text-center">
        How many tickets?
      </p>
      <div className="flex justify-center gap-2 mb-5 flex-wrap">
        {QUICK_AMOUNTS.map(n => (
          <button
            key={n}
            onClick={() => setSelected(n)}
            className={`px-5 py-2 rounded-full text-sm font-black transition-all border ${
              selected === n
                ? 'text-[#0A0A0F] scale-105'
                : 'bg-white/[0.04] border-white/[0.08] text-[#8A8A95] hover:bg-white/[0.07] hover:text-white'
            }`}
            style={selected === n ? {
              background: '#C9A84C',
              border: '1px solid rgba(201,168,76,0.6)',
              boxShadow: '0 0 16px rgba(201,168,76,0.25)',
            } : {}}
          >
            {n}
          </button>
        ))}
      </div>
      <button
        onClick={() => onPlay(selected)}
        className="group relative w-full overflow-hidden rounded-xl transition-all hover:opacity-95"
        style={{
          background: '#C9A84C',
          boxShadow: '0 0 30px rgba(201,168,76,0.2), 0 4px 20px rgba(0,0,0,0.4)',
        }}
      >
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
        <div className="relative py-3.5 flex items-center justify-center gap-3">
          <span className="font-black text-[#0A0A0F] text-base">
            Play {selected} ticket{selected > 1 ? 's' : ''} — ${price.toFixed(2)}
          </span>
        </div>
      </button>
      <p className="text-center text-[11px] text-[#8A8A95]/60 mt-3">
        Every ticket enters both draws · $1 USDC each · Secured on Base
      </p>
    </div>
  );
}

export default function AppPage() {
  const router = useRouter();
  const {
    jackpot,
    secondaryPot,
    user,
    tickets,
    currentDrawNumber,
    performDraw,
    performSecondaryDraw,
    initDemo,
    mode,
    setMode,
    syncOnChainData,
    isSyncing,
    connectWallet,
  } = useAppStore();

  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [buyInitialCount, setBuyInitialCount] = useState(1);
  const [profileOpen, setProfileOpen] = useState(false);
  const [referralOpen, setReferralOpen] = useState(false);
  const [viralShareOpen, setViralShareOpen] = useState(false);
  const [custodialProfileOpen, setCustodialProfileOpen] = useState(false);
  const [lastPurchaseCount, setLastPurchaseCount] = useState(0);
  const [drawAnimation, setDrawAnimation] = useState<{
    winner?: string;
    winners?: Array<{ address: string; prize: number }>;
    prize?: number;
    drawType: '8pm' | '10pm';
  } | null>(null);
  const [epicDraw, setEpicDraw] = useState<{
    participants: Array<{ address: string; ticketCount: number; username?: string }>;
    winner: string;
    winnerUsername?: string;
    prize: number;
    totalTickets: number;
  } | null>(null);
  const [showPreDrawCountdown, setShowPreDrawCountdown] = useState(false);
  const [preDrawType, setPreDrawType] = useState<'8pm' | '10pm' | null>(null);
  const [hasTriggered8PM, setHasTriggered8PM] = useState(false);
  const [hasTriggered10PM, setHasTriggered10PM] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [aureusUser, setAureusUser] = useState<AureusUser | null>(null);
  const isLive = mode === 'live';

  useEffect(() => { setAureusUser(getCurrentUser()); }, []);

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)aureus_oauth_user=([^;]+)/);
    if (match) {
      try {
        const oauthUser: AureusUser = JSON.parse(decodeURIComponent(match[1]));
        import('@/lib/userStorage').then(({ saveUser }) => saveUser(oauthUser));
        setAureusUser(oauthUser);
        document.cookie = 'aureus_oauth_user=; Max-Age=0; path=/';
        toast.success(`Welcome ${oauthUser.name || oauthUser.email}! 🎉`);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (FORCED_MODE === 'live') {
      localStorage.removeItem('aureus_mode');
      localStorage.removeItem('aureus_demo_initialized');
      if (mode !== 'live') setMode('live');
    }
  }, [mode, setMode]);

  useEffect(() => {
    if (!isLive) return;
    syncOnChainData().catch(() => {});
    const interval = setInterval(() => {
      syncOnChainData(user?.address).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [isLive, user?.address, syncOnChainData]);

  useEffect(() => {
    if (FORCED_MODE || mode !== 'demo') return;
    const hasData = tickets.length > 0 || jackpot > 100;
    const demoInitialized = typeof window !== 'undefined' && localStorage.getItem('aureus_demo_initialized');
    if (!hasData && !demoInitialized) {
      initDemo();
      if (typeof window !== 'undefined') localStorage.setItem('aureus_demo_initialized', 'true');
      toast.success('Demo loaded!', { duration: 2000 });
    }
  }, [tickets.length, jackpot, initDemo, mode]);

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
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const totalSeconds = timeLeft.hours * 3600 + timeLeft.minutes * 60 + timeLeft.seconds;
    if (totalSeconds <= 120 && totalSeconds > 0 && !hasTriggered8PM && !showPreDrawCountdown) {
      setHasTriggered8PM(true);
      setPreDrawType('8pm');
      setShowPreDrawCountdown(true);
      toast('🎰 Main Draw Starting!', { duration: 5000 });
    }
    const now = new Date();
    if (now.getUTCHours() === 21 && now.getUTCMinutes() >= 28 && now.getUTCMinutes() <= 32 && !hasTriggered10PM && !showPreDrawCountdown) {
      setHasTriggered10PM(true);
      setPreDrawType('10pm');
      setShowPreDrawCountdown(true);
      toast('💎 Bonus Draw Starting!', { duration: 5000 });
    }
  }, [timeLeft, hasTriggered8PM, hasTriggered10PM, showPreDrawCountdown]);

  useEffect(() => {
    const now = new Date();
    if (now.getUTCHours() === 0 && now.getUTCMinutes() === 0) {
      setHasTriggered8PM(false);
      setHasTriggered10PM(false);
    }
  }, [timeLeft]);

  const handleCountdownComplete = async () => {
    setShowPreDrawCountdown(false);
    if (isLive) {
      const drawApiType = preDrawType === '8pm' ? 'main' : 'bonus';
      emitInAppNotification({ type: 'jackpot', message: drawApiType === 'main' ? '🎰 Draw in progress…' : '💎 Bonus draw in progress…' });
      let attempts = 0;
      const poll = async () => {
        attempts++;
        try {
          const today = new Date().toISOString().slice(0, 10);
          const res = await fetch('/api/winners?limit=30');
          if (!res.ok) return;
          const winners: Array<{ wallet_address: string; amount_usd: number; draw_type: string; draw_date: string }> = await res.json();
          const todayResults = winners.filter(w => w.draw_date?.startsWith(today) && w.draw_type === drawApiType);
          if (todayResults.length > 0) {
            if (drawApiType === 'main') {
              const top = todayResults[0];
              emitInAppNotification({ type: 'jackpot', message: `🎰 Main draw complete! Winner won $${top.amount_usd.toLocaleString('en-US')}` });
            } else {
              emitInAppNotification({ type: 'jackpot', message: `🎁 Bonus draw complete! ${todayResults.length} winners.` });
            }
            syncOnChainData(user?.address);
            return;
          }
        } catch { /* ignore */ }
        if (attempts < 6) setTimeout(poll, 10000);
      };
      setTimeout(poll, 10000);
      setPreDrawType(null);
      return;
    }

    if (preDrawType === '8pm') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const result = await performDraw();
      if (result && tickets.length > 0) {
        const ticketsInDraw = tickets.filter(t => t.drawNumber === currentDrawNumber);
        const participantsMap = new Map<string, number>();
        ticketsInDraw.forEach(t => participantsMap.set(t.owner, (participantsMap.get(t.owner) || 0) + 1));
        const participants = Array.from(participantsMap.entries()).map(([address, count]) => ({
          address, ticketCount: count,
          username: typeof window !== 'undefined' ? localStorage.getItem(`aureus_username_${address.toLowerCase()}`) || undefined : undefined,
        }));
        const winnerUsername = typeof window !== 'undefined' ? localStorage.getItem(`aureus_username_${result.winner.toLowerCase()}`) || undefined : undefined;
        setEpicDraw({ participants, winner: result.winner, winnerUsername, prize: result.prize, totalTickets: ticketsInDraw.length });
        const userAddr = (aureusUser?.walletAddress || user?.address || '').toLowerCase();
        if (userAddr && result.winner.toLowerCase() === userAddr) {
          sendBrowserNotification('🏆 You won!', `You won $${result.prize?.toLocaleString('en-US')} USDC!`);
          emitInAppNotification({ type: 'winner', message: `🏆 You won the jackpot! $${result.prize?.toLocaleString('en-US')} USDC` });
        }
      }
    } else if (preDrawType === '10pm') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await performSecondaryDraw();
      const ticketsInDraw = tickets.filter(t => t.drawNumber === currentDrawNumber);
      const numWinners = Math.min(25, ticketsInDraw.length);
      if (numWinners > 0) {
        const prizePerWinner = secondaryPot / numWinners;
        const shuffled = [...ticketsInDraw];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const rand = new Uint32Array(1);
          crypto.getRandomValues(rand);
          const j = rand[0] % (i + 1);
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        const winners = shuffled.slice(0, numWinners).map(t => ({ address: t.owner, prize: prizePerWinner }));
        setDrawAnimation({ winners, prize: prizePerWinner, drawType: '10pm' });
      }
    }
    setPreDrawType(null);
  };

  const userTicketsCount = user ? user.ticketCount ?? user.tickets.length : 0;

  return (
    <>
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(authUser) => {
          setAureusUser(authUser);
          connectWallet(authUser.walletAddress, true);
          setAuthModalOpen(false);
        }}
      />
      <DisclaimerModal />
      <UsernameModal />

      {/* Mobile UI */}
      <div className="md:hidden">
        <MobileHome />
      </div>

      {/* ── Desktop ── */}
      <div className="hidden md:block min-h-screen bg-[#0A0A0F] text-[#F5F0E8] relative overflow-x-hidden">

        {/* Ambient glow */}
        <div className="fixed inset-0 pointer-events-none">
          <div
            className="absolute -top-10 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.10) 0%, rgba(201,168,76,0.03) 50%, transparent 70%)' }}
          />
        </div>

        {/* Header */}
        <header
          className="sticky top-0 z-40 border-b border-[#C9A84C]/[0.08]"
          style={{ background: 'rgba(10,10,15,0.94)', backdropFilter: 'blur(24px)' }}
        >
          <div className="container mx-auto px-6 h-16 flex items-center justify-between gap-8">

            {/* Logo + status */}
            <div className="flex items-center gap-3 shrink-0">
              <Link href="/" className="text-xl font-black tracking-[0.2em]" style={{ color: '#C9A84C' }}>
                AUREUS
              </Link>
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400' : 'bg-[#8A8A95]'}`}
                  style={isLive ? { boxShadow: '0 0 6px rgba(52,211,153,0.9)', animation: 'pulse 2s infinite' } : {}}
                />
                <span className="text-[10px] text-[#8A8A95] uppercase tracking-widest font-medium">
                  {isSyncing ? 'sync…' : isLive ? 'live' : 'demo'}
                </span>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex items-center gap-1">
              <Link
                href="/"
                className="px-4 py-2 rounded-xl text-sm text-[#8A8A95] hover:text-[#F5F0E8] hover:bg-white/5 transition-all"
              >
                How it works
              </Link>
              <button
                onClick={() => setReferralOpen(true)}
                className="px-4 py-2 rounded-xl text-sm text-[#8A8A95] hover:text-[#F5F0E8] hover:bg-white/5 transition-all"
              >
                Invite &amp; Earn
              </button>
              <a
                href="/guide"
                className="px-4 py-2 rounded-xl text-sm text-[#C9A84C]/80 hover:text-[#C9A84C] hover:bg-[#C9A84C]/5 transition-all"
              >
                Beginner Guide
              </a>
            </nav>

            {/* Right */}
            <div className="flex items-center gap-3 shrink-0">
              {user && (
                <button
                  onClick={() => setProfileOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all"
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-[#0A0A0F]"
                    style={{ background: '#C9A84C' }}
                  >
                    {(user.username || user.address || '?')[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-[#F5F0E8]/70 font-medium">
                    {user.username || `${user.address?.slice(0, 6)}…${user.address?.slice(-4)}`}
                  </span>
                  <ChevronDown className="w-3 h-3 text-[#8A8A95]" />
                </button>
              )}
              {aureusUser && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCustodialProfileOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all"
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-[#0A0A0F]"
                      style={{ background: '#C9A84C' }}
                    >
                      {(aureusUser.name || aureusUser.email || '?')[0].toUpperCase()}
                    </div>
                    <span className="text-sm text-[#F5F0E8]/70 font-medium">
                      {aureusUser.name || aureusUser.email?.split('@')[0]}
                    </span>
                    <ChevronDown className="w-3 h-3 text-[#8A8A95]" />
                  </button>
                  <button
                    onClick={() => setAureusUser(null)}
                    className="p-1.5 text-[#8A8A95] hover:text-[#F5F0E8] transition-colors rounded-lg hover:bg-white/5"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
              {!user && !aureusUser && (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="px-5 py-2 rounded-full font-bold text-sm text-[#0A0A0F] transition-all hover:opacity-90"
                  style={{ background: '#C9A84C' }}
                >
                  Sign In
                </button>
              )}
              <button
                onClick={() => {
                  setBuyInitialCount(1);
                  if (aureusUser || user) setBuyModalOpen(true);
                  else setAuthModalOpen(true);
                }}
                className="px-6 py-2.5 rounded-full font-bold text-sm text-[#0A0A0F] transition-all hover:opacity-90"
                style={{ background: '#C9A84C', boxShadow: '0 0 16px rgba(201,168,76,0.2)' }}
              >
                Buy Tickets
              </button>
            </div>
          </div>
        </header>

        {isLive && (
          <div className="container mx-auto px-4 mt-4">
            <AdminControls />
          </div>
        )}

        <main className="container mx-auto px-4 py-8 pb-24">
          <div className="max-w-5xl mx-auto">

            {/* ── Hero card ── */}
            <div className="relative mb-10">
              <div
                className="relative backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden"
                style={{
                  background: 'linear-gradient(160deg, #12120A 0%, #0e0e0a 50%, #111108 100%)',
                  border: '1px solid rgba(201,168,76,0.25)',
                  boxShadow: '0 0 80px rgba(201,168,76,0.07), 0 8px 60px rgba(0,0,0,0.6)',
                }}
              >
                {/* Countdown bar */}
                <div
                  className="flex items-center justify-center gap-3 px-8 py-4 border-b"
                  style={{ borderColor: 'rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.2)' }}
                >
                  <Timer className="w-4 h-4 text-[#C9A84C]/40 shrink-0" />
                  <span className="text-xs font-black uppercase tracking-[0.25em] text-[#C9A84C]/40">
                    Next Draw in
                  </span>
                  <div className="flex items-center bg-black/40 border border-white/[0.07] px-4 py-1.5 rounded-xl">
                    <span className="tabular-nums font-mono font-bold text-white text-lg">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </span>
                    <span className="text-[#C9A84C]/30 mx-1">:</span>
                    <span className="tabular-nums font-mono font-bold text-white text-lg">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </span>
                    <span className="text-[#C9A84C]/30 mx-1">:</span>
                    <span className="tabular-nums font-mono font-bold text-white text-lg">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                  </div>
                </div>

                {/* Jackpot amounts */}
                <div
                  className="grid grid-cols-2 px-8 py-12 gap-0"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <div
                    className="flex flex-col items-center text-center pr-8 border-r"
                    style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                  >
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#C9A84C]/50 mb-3">
                      🏆 Main Jackpot
                    </p>
                    <div style={{ textShadow: '0 0 60px rgba(201,168,76,0.2)' }}>
                      {jackpot > 0 ? (
                        <JackpotCounter />
                      ) : (
                        <p className="text-2xl font-bold text-[#8A8A95] italic">
                          Jackpot building — be the first to play tonight
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-[#8A8A95] mt-3">1 winner · Daily 9 PM UTC</p>
                  </div>
                  <div className="flex flex-col items-center text-center pl-8">
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#C9A84C]/50 mb-3">
                      💎 Bonus Draw
                    </p>
                    <p
                      className="text-5xl xl:text-7xl font-black text-[#e8c97a] leading-none"
                      style={{ textShadow: '0 0 60px rgba(201,168,76,0.15)' }}
                    >
                      {secondaryPot > 0
                        ? `$${secondaryPot.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
                        : 'Building…'}
                    </p>
                    <p className="text-sm text-[#8A8A95] mt-3">25 winners · Daily 9:30 PM UTC</p>
                  </div>
                </div>

                {/* Ticket badge */}
                {userTicketsCount > 0 && (
                  <div className="flex justify-center pt-4 pb-2">
                    <div
                      className="inline-flex items-center gap-2 rounded-full px-6 py-2 border text-sm font-bold text-[#e8c97a]"
                      style={{ background: 'rgba(201,168,76,0.08)', borderColor: 'rgba(201,168,76,0.2)' }}
                    >
                      <Ticket className="w-4 h-4" />
                      {userTicketsCount} ticket{userTicketsCount !== 1 ? 's' : ''} in the next draw
                    </div>
                  </div>
                )}

                {/* Play card */}
                <PlayCard
                  onPlay={(n) => {
                    setBuyInitialCount(n);
                    if (aureusUser || user) setBuyModalOpen(true);
                    else setAuthModalOpen(true);
                  }}
                />
              </div>
            </div>

            {/* USDC guide — one clean block */}
            <a
              href="/guide"
              className="flex items-center gap-4 rounded-2xl px-6 py-5 mb-8 transition-all group border"
              style={{ background: 'rgba(201,168,76,0.03)', borderColor: 'rgba(201,168,76,0.12)' }}
            >
              <span className="text-3xl shrink-0">🔰</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#F5F0E8] text-base">No USDC yet? Read the beginner guide</p>
                <p className="text-sm text-[#8A8A95] mt-0.5">
                  How to get USDC on Base network and buy your first ticket in 10 minutes.
                </p>
              </div>
              <span className="text-[#C9A84C] text-sm shrink-0">→</span>
            </a>

            {/* Recent winners (hidden when no data) */}
            <div className="mb-8">
              <EnhancedWinnersHistory />
            </div>

            {/* Trust badges */}
            <TrustBadges />

          </div>
        </main>

        {/* Modals */}
        <BuyTicketsModal
          isOpen={buyModalOpen}
          initialCount={buyInitialCount}
          onClose={() => {
            const prevCount = userTicketsCount;
            setBuyModalOpen(false);
            setTimeout(() => {
              const newCount = useAppStore.getState().user?.tickets.length || 0;
              if (newCount > prevCount) {
                setLastPurchaseCount(newCount - prevCount);
                setViralShareOpen(true);
              }
            }, 500);
          }}
        />
        <UserProfile isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
        {referralOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setReferralOpen(false)}
          >
            <div
              className="rounded-2xl max-w-md w-full p-6 shadow-2xl border"
              style={{ background: 'linear-gradient(160deg, #12120A 0%, #0e0e0a 100%)', borderColor: 'rgba(201,168,76,0.15)' }}
              onClick={e => e.stopPropagation()}
            >
              <ReferralDashboard />
              <button
                onClick={() => setReferralOpen(false)}
                className="mt-4 w-full py-2 rounded-xl text-sm text-[#8A8A95] hover:text-[#F5F0E8] hover:bg-white/5 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Custodial profile modal */}
        {custodialProfileOpen && aureusUser && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setCustodialProfileOpen(false)}
          >
            <div
              className="rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border"
              style={{ background: 'linear-gradient(160deg, #12120A 0%, #0e0e0a 100%)', borderColor: 'rgba(201,168,76,0.15)' }}
              onClick={e => e.stopPropagation()}
            >
              <div
                className="flex items-center justify-between px-6 py-4 border-b"
                style={{ borderColor: 'rgba(255,255,255,0.05)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-[#0A0A0F]"
                    style={{ background: '#C9A84C' }}
                  >
                    {(aureusUser.name || aureusUser.email || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-[#F5F0E8]">{aureusUser.name || aureusUser.email?.split('@')[0]}</p>
                    <p className="text-xs text-[#8A8A95]">{aureusUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setCustodialProfileOpen(false)}
                  className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-all text-[#F5F0E8] text-xl"
                >
                  ×
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div
                  className="rounded-xl border p-4 flex items-center justify-between"
                  style={{ background: 'rgba(76,175,125,0.06)', borderColor: 'rgba(76,175,125,0.2)' }}
                >
                  <div>
                    <p className="text-[11px] text-[#8A8A95] uppercase tracking-widest mb-1">USDC Balance</p>
                    <p className="text-2xl font-black text-emerald-400">${(aureusUser.usdcBalance || 0).toFixed(2)}</p>
                  </div>
                  <span className="text-3xl">💰</span>
                </div>
                <DepositAddress walletAddress={aureusUser.walletAddress} usdcBalance={aureusUser.usdcBalance || 0} />
                <button
                  onClick={() => { setAureusUser(null); setCustodialProfileOpen(false); }}
                  className="w-full py-2 rounded-xl text-sm text-[#8A8A95] hover:text-[#F5F0E8] hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        )}

        <PremiumChat />
        <ViralShareModal
          isOpen={viralShareOpen}
          onClose={() => setViralShareOpen(false)}
          ticketCount={lastPurchaseCount}
          jackpot={jackpot}
        />
      </div>

      {/* Draw ceremonies — outside hidden wrapper */}
      {epicDraw && (
        <EpicDrawCeremony
          participants={epicDraw.participants}
          winner={epicDraw.winner}
          winnerUsername={epicDraw.winnerUsername}
          prize={epicDraw.prize}
          totalTickets={epicDraw.totalTickets}
          userAddress={aureusUser?.walletAddress || user?.address}
          userUsername={user?.username}
          onComplete={() => {
            const winnerAddr = epicDraw.winner.toLowerCase();
            const userAddr = (aureusUser?.walletAddress || user?.address || '').toLowerCase();
            const isWinner = Boolean(userAddr) && winnerAddr === userAddr;
            const prize = epicDraw.prize;
            setEpicDraw(null);
            if (isWinner) router.push(`/winner-guide?amount=${encodeURIComponent(String(prize))}`);
          }}
        />
      )}
      {drawAnimation && drawAnimation.drawType === '10pm' && (
        <WinnerAnimation
          winners={drawAnimation.winners}
          drawType={drawAnimation.drawType}
          userAddress={aureusUser?.walletAddress || user?.address}
          onClose={() => {
            const currentAddress = String(user?.address || '').toLowerCase();
            const myGain = currentAddress && drawAnimation.winners
              ? drawAnimation.winners.filter(e => e.address.toLowerCase() === currentAddress).reduce((s, e) => s + Number(e.prize || 0), 0)
              : 0;
            setDrawAnimation(null);
            if (myGain > 0) router.push(`/winner-guide?amount=${encodeURIComponent(String(myGain))}`);
          }}
        />
      )}

      <NotificationAutomation
        timeLeft={timeLeft}
        jackpot={jackpot}
        connected={Boolean(user || aureusUser)}
        userTicketsCount={userTicketsCount}
      />
      <GroupNotificationAutomation wallet={user?.address || aureusUser?.walletAddress || null} />
      <NotificationCenter />

      {showPreDrawCountdown && (
        <PreDrawCountdown
          timeLeft={120}
          jackpot={preDrawType === '8pm' ? jackpot : secondaryPot}
          totalPlayers={tickets.length}
          userTickets={userTicketsCount}
          onComplete={handleCountdownComplete}
        />
      )}
    </>
  );
}
