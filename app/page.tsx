'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Timer, Trophy, Ticket, ChevronDown, LogOut } from 'lucide-react';
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
import Leaderboard from '@/components/Leaderboard';
import EnhancedWinnersHistory from '@/components/EnhancedWinnersHistory';
import TrustBadges from '@/components/TrustBadges';
import DisclaimerModal from '@/components/DisclaimerModal';
import HowItWorksModal from '@/components/HowItWorksModal';
import UsernameModal from '@/components/UsernameModal';
import LiveStats from '@/components/LiveStats';
import UrgencyBanner from '@/components/UrgencyBanner';
// import StickyBuyButton from '@/components/StickyBuyButton';
import ViralShareModal from '@/components/ViralShareModal';
import InviteBar from '@/components/InviteBar';
import AdminControls from '@/components/AdminControls';
import ReferralDashboard from '@/components/ReferralDashboard';
import StreakDisplay from '@/components/StreakDisplay';
import WinnersFeed from '@/components/WinnersFeed';
import JackpotCounter from '@/components/JackpotCounter';
import DailyEngagementCard from '@/components/DailyEngagementCard';
import NotificationCenter from '@/components/NotificationCenter';
import NotificationAutomation from '@/components/NotificationAutomation';
import GroupDashboard from '@/components/GroupDashboard';
import GroupNotificationAutomation from '@/components/GroupNotificationAutomation';
import JackpotHistoryChart from '@/components/JackpotHistoryChart';
import { useAppStore } from '@/lib/store';
import { FORCED_MODE, DEFAULT_CHAIN_ID } from '@/lib/config';
import { AureusUser } from '@/lib/auth';
import { getCurrentUser } from '@/lib/userStorage';
import { sendBrowserNotification } from '@/lib/webNotifications';
import { emitInAppNotification } from '@/lib/notificationBus';

const QUICK_AMOUNTS = [1, 5, 10, 25, 50];

function PlayCard({ onPlay }: { onPlay: (n: number) => void }) {
  const [selected, setSelected] = useState(5);
  return (
    <div className="mx-6 mb-8 rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-400/50 mb-4 text-center">
        How many tickets?
      </p>
      {/* Amount chips */}
      <div className="flex justify-center gap-2 mb-5 flex-wrap">
        {QUICK_AMOUNTS.map(n => (
          <button
            key={n}
            onClick={() => setSelected(n)}
            className={`px-5 py-2 rounded-full text-sm font-black transition-all border ${
              selected === n
                ? 'text-black scale-105'
                : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:bg-white/[0.07] hover:text-white'
            }`}
            style={selected === n ? {
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              border: '1px solid rgba(245,158,11,0.5)',
              boxShadow: '0 0 16px rgba(245,158,11,0.3)',
            } : {}}
          >
            {n}
          </button>
        ))}
      </div>
      {/* Play button */}
      <button
        onClick={() => onPlay(selected)}
        className="group relative w-full overflow-hidden rounded-xl"
        style={{
          background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
          boxShadow: '0 0 30px rgba(245,158,11,0.25)',
        }}
      >
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
        <div className="relative py-3.5 flex items-center justify-center gap-3">
          <span className="font-black text-black text-base">
            Play {selected} ticket{selected > 1 ? 's' : ''} — ${selected}.00
          </span>
          <span className="text-black/50 text-sm">→</span>
        </div>
      </button>
      <p className="text-center text-[11px] text-slate-600 mt-3">
        Every ticket enters both draws · $1 USDC each · Secured on Base
      </p>
    </div>
  );
}

export default function Home() {
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
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [referralOpen, setReferralOpen] = useState(false);
  const [viralShareOpen, setViralShareOpen] = useState(false);
  const [custodialProfileOpen, setCustodialProfileOpen] = useState(false);
  const [lastPurchaseCount, setLastPurchaseCount] = useState(0);
  const [drawAnimation, setDrawAnimation] = useState<{ 
    winner?: string; 
    winners?: Array<{ address: string; prize: number }>; 
    prize?: number; 
    drawType: '8pm' | '10pm' 
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
  // Defer localStorage read to client-only (avoids SSR hydration mismatch)
  const [aureusUser, setAureusUser] = useState<AureusUser | null>(null);
  const isLive = mode === 'live';

  // Load aureusUser from localStorage on client mount (avoids SSR hydration mismatch)
  useEffect(() => {
    setAureusUser(getCurrentUser());
  }, []);

  // Pick up user after OAuth redirect (Google/Apple) via short-lived cookie
  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)aureus_oauth_user=([^;]+)/);
    if (match) {
      try {
        const oauthUser: AureusUser = JSON.parse(decodeURIComponent(match[1]));
        import('@/lib/userStorage').then(({ saveUser }) => saveUser(oauthUser));
        setAureusUser(oauthUser);
        // Clear the cookie immediately
        document.cookie = 'aureus_oauth_user=; Max-Age=0; path=/';
        toast.success(`Welcome ${oauthUser.name || oauthUser.email}! 🎉`);
      } catch {}
    }
  }, []);

  // Force live mode if FORCED_MODE is set, and clear localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Always force live mode (FORCED_MODE defaults to 'live')
    if (FORCED_MODE === 'live') {
      // Clear any stored demo mode and enforce live mode once
      localStorage.removeItem('aureus_mode');
      localStorage.removeItem('aureus_demo_initialized');
      if (mode !== 'live') {
        setMode('live');
      }
      return;
    }
    
    // Only restore from localStorage if not forced to live
    if (FORCED_MODE === 'demo') {
      const storedMode = localStorage.getItem('aureus_mode') as 'demo' | 'live' | null;
      if (storedMode && storedMode !== mode) {
        setMode(storedMode);
      }
    }
  }, [mode, setMode]);

  useEffect(() => {
    if (!isLive) return;
    // Force sync immediately on mount, even without wallet connected
    // This ensures we get fresh data from blockchain
    syncOnChainData().catch(err => {
      console.error('⚠️ Failed to sync on mount (non-critical):', err);
      // Don't throw - sync errors shouldn't break the app
    });
    const interval = setInterval(() => {
      syncOnChainData(user?.address).catch(err => {
        console.error('⚠️ Failed to sync on interval (non-critical):', err);
        // Don't throw - sync errors shouldn't break the app
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [isLive, user?.address, syncOnChainData]);

  // Auto-initialize demo mode on first load (if no data exists)
  // Skip if FORCED_MODE is set (we're in live mode)
  useEffect(() => {
    if (FORCED_MODE) return; // Don't auto-init demo if forced to live
    if (mode !== 'demo') return;
    const hasData = tickets.length > 0 || jackpot > 100;
    const demoInitialized = typeof window !== 'undefined' && localStorage.getItem('aureus_demo_initialized');
    
    // Auto-init demo if no data and not already initialized
    if (!hasData && !demoInitialized) {
      initDemo();
      if (typeof window !== 'undefined') {
        localStorage.setItem('aureus_demo_initialized', 'true');
      }
      toast.success('🎮 Demo mode loaded!', { duration: 3000 });
    }
  }, [tickets.length, jackpot, initDemo, mode]);

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

    return () => clearInterval(timer);
  }, []);

  // Auto-trigger draw countdown (demo + live mode)
  useEffect(() => {
    const totalSeconds = timeLeft.hours * 3600 + timeLeft.minutes * 60 + timeLeft.seconds;

    // Trigger 9PM main draw countdown (2 minutes before 21:00 UTC)
    if (totalSeconds <= 120 && totalSeconds > 0 && !hasTriggered8PM && !showPreDrawCountdown) {
      setHasTriggered8PM(true); // Set BEFORE countdown to prevent race condition
      setPreDrawType('8pm');
      setShowPreDrawCountdown(true);
      toast('🎰 Main Draw Starting!', { duration: 5000 });
    }

    // Trigger 9:30PM bonus draw countdown (21:28–21:32 UTC)
    const now = new Date();
    const currentHour = now.getUTCHours();
    const currentMinute = now.getUTCMinutes();

    if (currentHour === 21 && currentMinute >= 28 && currentMinute <= 32 && !hasTriggered10PM && !showPreDrawCountdown) {
      setHasTriggered10PM(true); // Set BEFORE countdown to prevent race condition
      setPreDrawType('10pm');
      setShowPreDrawCountdown(true);
      toast('💎 Bonus Draw Starting!', { duration: 5000 });
    }
  }, [timeLeft, hasTriggered8PM, hasTriggered10PM, showPreDrawCountdown]);

  // Handle countdown complete -> trigger draw (demo or live)
  const handleCountdownComplete = async () => {
    setShowPreDrawCountdown(false);

    if (isLive) {
      // Live mode: delegate draw execution to server-side API (called by Vercel cron)
      // Countdown is purely cosmetic; we just fetch the result after the cron fires
      const drawApiType = preDrawType === '8pm' ? 'main' : 'bonus';
      try {
        const res = await fetch(`/api/draw/trigger?type=${drawApiType}`, { method: 'GET' });
        const data = await res.json();
        if (data.success && drawApiType === 'main' && data.winner) {
          setEpicDraw({
            participants: [],
            winner: data.winner,
            prize: data.prize ?? 0,
            totalTickets: data.totalTickets ?? 0,
          });
          // Win notification
          const userAddr = (aureusUser?.walletAddress || user?.address || '').toLowerCase();
          if (userAddr && data.winner.toLowerCase() === userAddr) {
            sendBrowserNotification('🏆 You won the jackpot!', `You just won $${data.prize?.toLocaleString('en-US')} USDC on Aureus!`);
            emitInAppNotification({ type: 'winner', message: `🏆 You won the jackpot! $${data.prize?.toLocaleString('en-US')} USDC is on its way to your wallet.` });
          } else {
            emitInAppNotification({ type: 'jackpot', message: `🎰 Main draw complete! Winner: ${data.winner?.slice(0,6)}...${data.winner?.slice(-4)} won $${data.prize?.toLocaleString('en-US')}` });
          }
        } else if (data.success && drawApiType === 'bonus' && data.winners?.length > 0) {
          const prizePerWinner = data.prizePerWinner ?? 0;
          setDrawAnimation({
            winners: (data.winners as string[]).map((addr: string) => ({ address: addr, prize: prizePerWinner })),
            prize: prizePerWinner,
            drawType: '10pm',
          });
          // Win notification for bonus draw
          const userAddr = (aureusUser?.walletAddress || user?.address || '').toLowerCase();
          const didWin = userAddr && (data.winners as string[]).some((addr: string) => addr.toLowerCase() === userAddr);
          if (didWin) {
            sendBrowserNotification('🎁 Bonus draw win!', `You won $${prizePerWinner.toFixed(2)} USDC in the bonus draw!`);
            emitInAppNotification({ type: 'winner', message: `🎁 You won the bonus draw! $${prizePerWinner.toFixed(2)} USDC sent to your wallet.` });
          } else {
            emitInAppNotification({ type: 'jackpot', message: `🎁 Bonus draw complete! ${data.winners.length} winners × $${prizePerWinner.toFixed(2)} each.` });
          }
        }
        // Refresh on-chain state after draw
        syncOnChainData(user?.address);
      } catch (err) {
        console.error('Live draw trigger error:', err);
      }
      setPreDrawType(null);
      return;
    }

    // Demo mode: run draw locally
    if (preDrawType === '8pm') {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const result = await performDraw();

      if (result && tickets.length > 0) {
        const ticketsInDraw = tickets.filter(t => t.drawNumber === currentDrawNumber);
        const participantsMap = new Map<string, number>();
        ticketsInDraw.forEach(ticket => {
          participantsMap.set(ticket.owner, (participantsMap.get(ticket.owner) || 0) + 1);
        });
        const participants = Array.from(participantsMap.entries()).map(([address, count]) => ({
          address,
          ticketCount: count,
          username: typeof window !== 'undefined'
            ? localStorage.getItem(`aureus_username_${address.toLowerCase()}`) || undefined
            : undefined,
        }));
        const totalTix = ticketsInDraw.length;
        const winnerUsername = typeof window !== 'undefined'
          ? localStorage.getItem(`aureus_username_${result.winner.toLowerCase()}`) || undefined
          : undefined;
        setEpicDraw({ participants, winner: result.winner, winnerUsername, prize: result.prize, totalTickets: totalTix });
        // Win notification demo mode
        const userAddr = (aureusUser?.walletAddress || user?.address || '').toLowerCase();
        if (userAddr && result.winner.toLowerCase() === userAddr) {
          sendBrowserNotification('🏆 You won!', `You just won $${result.prize?.toLocaleString('en-US')} USDC!`);
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
        // Shuffle using Fisher-Yates with crypto random (avoid Math.random)
        const shuffled = [...ticketsInDraw];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const rand = new Uint32Array(1);
          crypto.getRandomValues(rand);
          const j = rand[0] % (i + 1);
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        const winners = shuffled.slice(0, numWinners).map(t => ({
          address: t.owner,
          prize: prizePerWinner,
        }));
        setDrawAnimation({ winners, prize: prizePerWinner, drawType: '10pm' });
      }
    }

    setPreDrawType(null);
  };

  // Reset draw triggers at midnight UTC
  useEffect(() => {
    const now = new Date();
    if (now.getUTCHours() === 0 && now.getUTCMinutes() === 0) {
      setHasTriggered8PM(false);
      setHasTriggered10PM(false);
    }
  }, [timeLeft]);

  const userTicketsCount = user ? user.ticketCount ?? user.tickets.length : 0;

  return (
    <>
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(authUser) => {
          setAureusUser(authUser);
          // Inject custodial wallet into store so BuyTicketsModal sees a user
          connectWallet(authUser.walletAddress, true);
          setAuthModalOpen(false);
        }}
      />
      <DisclaimerModal />
      <UsernameModal />
      
      <div className="min-h-screen bg-[#08091a] text-white relative overflow-x-hidden">
      {/* Mobile UI — shown only on small screens */}
      <div className="md:hidden">
        <MobileHome />
      </div>

      {/* Ambient background — desktop */}
      <div className="fixed inset-0 pointer-events-none hidden md:block">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.14) 0%, rgba(139,92,246,0.06) 45%, transparent 68%)' }} />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 65%)' }} />
        <div className="absolute top-1/2 -left-20 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 65%)' }} />
      </div>
      <header className="hidden md:block sticky top-0 z-40 border-b border-white/[0.05]" style={{ background: 'rgba(8,9,26,0.93)', backdropFilter: 'blur(24px)', borderColor: 'rgba(245,158,11,0.08)' }}>
        <div className="container mx-auto px-3 md:px-6 h-14 md:h-20 flex items-center justify-between gap-2 md:gap-8">

          {/* ── Logo ── */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <Trophy className="w-6 h-6 text-amber-400" />
              <span
                className="text-2xl font-black tracking-[0.15em] bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, #fcd34d, #f59e0b, #fbbf24)' }}
              >
                AUREUS
              </span>
            </div>
            {/* Status dot */}
            <div className="flex items-center gap-1.5 ml-1">
              <span
                className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400' : 'bg-slate-600'}`}
                style={isLive ? { boxShadow: '0 0 6px rgba(52,211,153,0.9)', animation: 'pulse 2s infinite' } : {}}
              />
              {!FORCED_MODE && (
                <button
                  onClick={() => {
                    if (isLive) { setMode('demo'); toast.success('Demo mode'); }
                    else { setMode('live'); syncOnChainData(user?.address); toast.success('Live mode'); }
                  }}
                  className="text-[10px] text-slate-500 hover:text-slate-300 uppercase tracking-widest font-medium transition-colors"
                  title={isLive ? 'Switch to demo' : 'Switch to live'}
                >
                  {isLive ? (isSyncing ? 'sync…' : 'live') : 'demo'}
                </button>
              )}
              {FORCED_MODE && (
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">
                  {isSyncing ? 'sync…' : 'live'}
                </span>
              )}
            </div>
          </div>

          {/* ── Nav centre ── */}
          <nav className="hidden md:flex items-center gap-2">
            {[
              { icon: '📖', label: 'How It Works', sub: 'Rules, draws & prize breakdown', action: () => setHowItWorksOpen(true) },
              { icon: '🏅', label: 'Leaderboard', sub: 'Top players this week', action: () => setLeaderboardOpen(true) },
              { icon: '💸', label: 'Invite & Earn', sub: 'Bring friends — earn USDC', action: () => setReferralOpen(true) },
            ].map(item => (
              <button
                key={item.label}
                onClick={item.action}
                className="group flex flex-col items-start px-4 py-2.5 rounded-xl hover:bg-white/[0.05] transition-all"
              >
                <span className="text-white/70 group-hover:text-white text-sm font-bold transition-colors whitespace-nowrap">
                  {item.icon} {item.label}
                </span>
                <span className="text-xs text-slate-600 group-hover:text-slate-400 transition-colors mt-0.5 whitespace-nowrap">
                  {item.sub}
                </span>
              </button>
            ))}
            <a
              href="/guide"
              className="group flex flex-col items-start px-4 py-2.5 rounded-xl border border-amber-500/20 hover:border-amber-500/40 transition-all"
              style={{ background: 'rgba(245,158,11,0.06)' }}
            >
              <span className="text-amber-400/80 group-hover:text-amber-300 text-sm font-bold transition-colors whitespace-nowrap">
                🔰 Beginner Guide
              </span>
              <span className="text-xs text-amber-500/40 group-hover:text-amber-400/60 transition-colors mt-0.5 whitespace-nowrap">
                How to get USDC &amp; deposit
              </span>
            </a>
            {!isLive && !FORCED_MODE && (
              <button
                onClick={() => { initDemo(); toast.success('🎮 Demo initialized'); }}
                className="ml-2 text-slate-600 hover:text-slate-400 text-xs font-medium transition-colors px-3 py-1 rounded-lg hover:bg-white/5"
              >
                ↺ reset demo
              </button>
            )}
          </nav>

          {/* ── Right: user + CTA ── */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Wallet user */}
            {user && (
              <button
                onClick={() => setProfileOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all group"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-xs font-black text-black">
                  {(user.username || user.address || '?')[0].toUpperCase()}
                </div>
                <span className="text-sm text-white/70 group-hover:text-white transition-colors font-medium">
                  {user.username || `${user.address?.slice(0,6)}…${user.address?.slice(-4)}`}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-500 group-hover:text-slate-300 transition-colors" />
              </button>
            )}

            {/* Email/custodial user */}
            {aureusUser && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCustodialProfileOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/5 transition-all group"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-black text-white">
                    {(aureusUser.name || aureusUser.email || '?')[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-white/70 group-hover:text-white transition-colors font-medium">
                    {aureusUser.name || aureusUser.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-500 group-hover:text-slate-300 transition-colors" />
                </button>
                <button
                  onClick={() => setAureusUser(null)}
                  className="p-1.5 text-slate-600 hover:text-slate-300 transition-colors rounded-lg hover:bg-white/5"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Connect button — shown only when no user is logged in */}
            {!user && !aureusUser && (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-4 py-2 rounded-full font-bold text-sm transition-all text-black"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', boxShadow: '0 0 16px rgba(245,158,11,0.25)' }}
              >
                Sign In
              </button>
            )}

            {/* Primary CTA — hidden on mobile, shown on desktop */}
            <button
              onClick={() => {
                setBuyInitialCount(1);
                if (aureusUser || user) setBuyModalOpen(true);
                else setAuthModalOpen(true);
              }}
              className="hidden md:block relative px-6 py-2.5 rounded-full font-bold text-sm text-black overflow-hidden group"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
            >
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(135deg, #fbbf24, #f97316)' }} />
              <span className="relative">🎫 Buy Ticket</span>
            </button>
          </div>

        </div>
      </header>

      {isLive && (
        <div className="hidden md:block container mx-auto px-4 mt-4">
          <AdminControls />
        </div>
      )}

      {/* Test ceremony button — dev only (shown regardless of live/demo mode) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="flex justify-end container mx-auto px-6 mt-2">
          <button
            onClick={() => {
              const demo = [
                { address: user?.address || '0xDEADBEEF1234567890abcdef1234567890abcdef', ticketCount: 5, username: user?.username || 'TonPseudo' },
                { address: '0xABCDEF1234567890abcdef1234567890abcdef12', ticketCount: 3, username: 'GoldRush_Tim' },
                { address: '0x1234567890abcdef1234567890abcdef12345678', ticketCount: 8, username: 'DiamondKing99' },
                { address: '0x9876543210fedcba9876543210fedcba98765432', ticketCount: 2, username: 'LuckyStrike88' },
              ];
              const w = demo[Math.floor(Math.random() * demo.length)];
              setEpicDraw({ participants: demo, winner: w.address, winnerUsername: w.username, prize: jackpot || 2847, totalTickets: 18 });
            }}
            className="text-xs text-slate-600 hover:text-yellow-500 transition-colors font-medium"
          >
            🎬 test draw
          </button>
        </div>
      )}

      {/* Urgency Banner - desktop only */}
      <div className="hidden md:block">
        <UrgencyBanner timeLeft={timeLeft} />
      </div>

      <main className="hidden md:block container mx-auto px-4 py-8 pb-32">
        <div className="max-w-6xl mx-auto">

          {/* ── HERO — everything above the fold ─────────────────────────── */}
          <div className="relative mb-10">
            <div className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.1) 0%, transparent 60%)' }} />
            <div
              className="relative backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden"
              style={{ background: 'linear-gradient(160deg, #131228 0%, #0e0c22 50%, #110f1e 100%)', border: '1px solid rgba(245,158,11,0.28)', boxShadow: '0 0 80px rgba(245,158,11,0.08), 0 8px 60px rgba(0,0,0,0.6)' }}
            >

              {/* Top bar: countdown */}
              <div className="flex items-center justify-center gap-3 px-8 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.2)' }}>
                <Timer className="w-4 h-4 text-amber-400/50 shrink-0" />
                <span className="text-xs font-black uppercase tracking-[0.25em] text-amber-400/40">Next Draw in</span>
                <div className="flex items-center bg-black/40 border border-white/[0.07] px-4 py-1.5 rounded-xl">
                  <span className="tabular-nums font-mono font-bold text-white text-lg">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="text-amber-400/30 mx-1">:</span>
                  <span className="tabular-nums font-mono font-bold text-white text-lg">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="text-amber-400/30 mx-1">:</span>
                  <span className="tabular-nums font-mono font-bold text-white text-lg">{String(timeLeft.seconds).padStart(2, '0')}</span>
                </div>
              </div>

              {/* Prize amounts */}
              <div className="grid grid-cols-1 md:grid-cols-2 px-4 md:px-8 py-8 md:py-12 gap-6 md:gap-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                {/* Main jackpot */}
                <div className="flex flex-col items-center text-center md:pr-8 md:border-r" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-400/50 mb-3">🏆 Main Jackpot</p>
                  <p
                    className="text-5xl md:text-7xl xl:text-8xl font-black text-white leading-none"
                    style={{ textShadow: '0 0 60px rgba(245,158,11,0.2)' }}
                  >
                    ${jackpot.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-sm text-slate-600 mt-3">1 winner · Daily 9 PM UTC</p>
                </div>

                {/* Bonus draw */}
                <div className="flex flex-col items-center text-center md:pl-8 border-t md:border-t-0 pt-6 md:pt-0" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-violet-400/50 mb-3">💎 Bonus Draw</p>
                  <p
                    className="text-5xl md:text-7xl xl:text-8xl font-black text-violet-300 leading-none"
                    style={{ textShadow: '0 0 60px rgba(139,92,246,0.2)' }}
                  >
                    ${secondaryPot.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-sm text-slate-600 mt-3">25 winners · Daily 9:30 PM UTC</p>
                </div>
              </div>

              {/* User tickets badge */}
              {userTicketsCount > 0 && (
                <div className="flex justify-center pt-4 pb-2">
                  <div
                    className="inline-flex items-center gap-2 rounded-full px-6 py-2 border text-sm font-bold text-amber-300"
                    style={{ background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.2)' }}
                  >
                    <Ticket className="w-4 h-4" />
                    {userTicketsCount} ticket{userTicketsCount !== 1 ? 's' : ''} in the next draw
                  </div>
                </div>
              )}

              {/* PLAY CARD */}
              <PlayCard
                onPlay={(n) => {
                  setBuyInitialCount(n);
                  if (aureusUser || user) setBuyModalOpen(true);
                  else setAuthModalOpen(true);
                }}
              />

              {/* Beginner guide link — always visible below buy button */}
              <div className="px-6 pb-5">
                <a
                  href="/guide"
                  className="flex items-center justify-center gap-3 w-full bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-400/50 rounded-xl py-3 px-4 transition-all group"
                >
                  <span className="text-xl">🔰</span>
                  <div className="text-left">
                    <p className="text-sm font-bold text-blue-200 group-hover:text-white transition-colors">No USDC yet? Read the beginner guide</p>
                    <p className="text-xs text-blue-400/70">How to get USDC on Base network · MetaMask &amp; Coinbase Wallet explained</p>
                  </div>
                  <span className="text-blue-400 text-sm ml-auto shrink-0">→</span>
                </a>
              </div>

            </div>
          </div>

          {/* ── BELOW FOLD — social proof & engagement ─────────────────── */}

          {/* New to crypto? Guide banner */}
          <a
            href="/guide"
            className="flex items-center gap-5 rounded-2xl px-6 py-5 mb-8 transition-all group border"
            style={{ background: 'rgba(245,158,11,0.04)', borderColor: 'rgba(245,158,11,0.15)' }}
          >
            <span className="text-4xl shrink-0">🔰</span>
            <div className="flex-1 min-w-0">
              <p className="font-black text-white text-lg">New to crypto? Don&apos;t have USDC yet?</p>
              <p className="text-sm text-slate-500 mt-1">Complete beginner&apos;s guide — how to get USDC on <strong className="text-amber-300/80">Base network</strong> and buy your first ticket in 10 minutes.</p>
            </div>
            <div
              className="shrink-0 px-4 py-2 rounded-xl font-bold text-sm text-black whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
            >
              Read guide →
            </div>
          </a>

          {/* Streak + Winners Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <StreakDisplay />
            <WinnersFeed />
          </div>

          {/* Daily retention loop */}
          <div className="mb-8">
            <DailyEngagementCard
              userTicketsCount={userTicketsCount}
              lifetimeTickets={user?.lifetimeTickets ?? 0}
              jackpot={jackpot}
            />
          </div>

          {/* Group syndication */}
          <div className="mb-8">
            <GroupDashboard />
          </div>

          {/* Recent Winners - Social Proof */}
          <div className="mb-8">
            <EnhancedWinnersHistory />
          </div>

          {/* Jackpot History Chart */}
          <div className="mb-8">
            <JackpotHistoryChart />
          </div>

          {/* Trust Badges */}
          <TrustBadges />

        </div>
      </main>

      <div className="block">
      <BuyTicketsModal
        isOpen={buyModalOpen}
        initialCount={buyInitialCount}
        onClose={() => {
          const prevCount = userTicketsCount;
          setBuyModalOpen(false);
          // Wait for state to update, then check if tickets increased
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
      <Leaderboard isOpen={leaderboardOpen} onClose={() => setLeaderboardOpen(false)} />
      <HowItWorksModal isOpen={howItWorksOpen} onClose={() => setHowItWorksOpen(false)} />
      {referralOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setReferralOpen(false)}>
          <div
            className="rounded-2xl max-w-md w-full p-6 shadow-2xl border"
            style={{ background: 'linear-gradient(160deg, #0e0d28 0%, #0b0a1e 100%)', borderColor: 'rgba(245,158,11,0.15)' }}
            onClick={e => e.stopPropagation()}
          >
            <ReferralDashboard />
            <button onClick={() => setReferralOpen(false)} className="mt-4 w-full py-2 rounded-xl text-sm text-slate-500 hover:text-white hover:bg-white/5 transition-all">Close</button>
          </div>
        </div>
      )}

      {/* ── Custodial user profile modal ── */}
      {custodialProfileOpen && aureusUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setCustodialProfileOpen(false)}
        >
          <div
            className="rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border"
            style={{ background: 'linear-gradient(160deg, #0e0d28 0%, #0b0a1e 100%)', borderColor: 'rgba(245,158,11,0.15)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-black"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', boxShadow: '0 0 16px rgba(245,158,11,0.25)' }}
                >
                  {(aureusUser.name || aureusUser.email || '?')[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-white">{aureusUser.name || aureusUser.email?.split('@')[0]}</p>
                  <p className="text-xs text-slate-400">{aureusUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setCustodialProfileOpen(false)}
                className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-all text-white text-xl"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* USDC balance */}
              <div className="rounded-xl border p-4 flex items-center justify-between" style={{ background: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.2)' }}>
                <div>
                  <p className="text-[11px] text-slate-500 uppercase tracking-widest mb-1">USDC Balance</p>
                  <p className="text-2xl font-black text-emerald-400">${(aureusUser.usdcBalance || 0).toFixed(2)}</p>
                </div>
                <span className="text-3xl">💰</span>
              </div>

              {/* Deposit address */}
              <DepositAddress
                walletAddress={aureusUser.walletAddress}
                usdcBalance={aureusUser.usdcBalance || 0}
              />

              {/* Sign out */}
              <button
                onClick={() => { setAureusUser(null); setCustodialProfileOpen(false); }}
                className="w-full py-2 rounded-xl text-sm text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      <PremiumChat />
      
      {/* Invite & Viral Bar - desktop only to avoid overlap on phones */}
      <div className="hidden md:block">
        <InviteBar />
      </div>

      {/* Live Stats Bar - desktop only */}
      <div className="hidden md:block">
        <LiveStats />
      </div>
      
      {/* Sticky Buy Button removed per request */}
      
      {/* Viral Share Modal - After Purchase */}
      <ViralShareModal
        isOpen={viralShareOpen}
        onClose={() => setViralShareOpen(false)}
        ticketCount={lastPurchaseCount}
        jackpot={jackpot}
      />

      </div>
      </div>

      {/* ── Epic Draw Ceremony — OUTSIDE any hidden wrapper so fixed positioning works ── */}
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
            if (isWinner) {
              router.push(`/winner-guide?amount=${encodeURIComponent(String(prize))}`);
            }
          }}
        />
      )}

      {/* Standard animation for 10PM bonus draw — also outside hidden wrapper */}
      {drawAnimation && drawAnimation.drawType === '10pm' && (
        <WinnerAnimation
          winners={drawAnimation.winners}
          drawType={drawAnimation.drawType}
          userAddress={aureusUser?.walletAddress || user?.address}
          onClose={() => {
            const currentAddress = String(user?.address || '').toLowerCase();
            const myBonusGain =
              currentAddress && drawAnimation.winners
                ? drawAnimation.winners
                    .filter((entry) => entry.address.toLowerCase() === currentAddress)
                    .reduce((sum, entry) => sum + Number(entry.prize || 0), 0)
                : 0;
            setDrawAnimation(null);
            if (myBonusGain > 0) {
              router.push(`/winner-guide?amount=${encodeURIComponent(String(myBonusGain))}`);
            }
          }}
        />
      )}

      {/* Legal banner temporarily disabled to unblock mobile */}

      <NotificationAutomation
        timeLeft={timeLeft}
        jackpot={jackpot}
        connected={Boolean(user || aureusUser)}
        userTicketsCount={userTicketsCount}
      />
      <GroupNotificationAutomation wallet={user?.address || aureusUser?.walletAddress || null} />
      <NotificationCenter />

      {/* Pre-Draw Countdown - Shows 2 minutes before draw */}
      {showPreDrawCountdown && (
        <PreDrawCountdown
          timeLeft={120} // 2 minutes countdown
          jackpot={preDrawType === '8pm' ? jackpot : secondaryPot}
          totalPlayers={tickets.length}
          userTickets={userTicketsCount}
          onComplete={handleCountdownComplete}
        />
      )}
    </>
  );
}

