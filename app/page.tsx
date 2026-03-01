'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Timer, Trophy, CreditCard, ChevronDown, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthModal from '@/components/AuthModal';
import DepositAddress from '@/components/DepositAddress';
import CardPaymentModal from '@/components/CardPaymentModal';
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
import { getCurrentUser, updateUserBalance } from '@/lib/userStorage';
import { sendBrowserNotification } from '@/lib/webNotifications';
import { emitInAppNotification } from '@/lib/notificationBus';

const QUICK_AMOUNTS = [1, 5, 10, 25, 50];

function PlayCard({ onPlay }: { onPlay: (n: number) => void }) {
  const [selected, setSelected] = useState(5);
  return (
    <div className="mx-6 mb-8 rounded-2xl bg-[#0D0D1A] border border-gold-500/20 p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#8A8070] mb-4 text-center">
        Nombre de tickets
      </p>
      {/* Amount chips */}
      <div className="flex justify-center gap-2 mb-5 flex-wrap">
        {QUICK_AMOUNTS.map(n => (
          <button
            key={n}
            onClick={() => setSelected(n)}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all border ${
              selected === n
                ? 'bg-gold-500 border-gold-400 text-black scale-105'
                : 'bg-white/[0.04] border-white/10 text-[#8A8070] hover:bg-gold-500/10 hover:border-gold-500/30 hover:text-gold-400'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      {/* Play button */}
      <button
        onClick={() => onPlay(selected)}
        className="group relative w-full overflow-hidden rounded-xl bg-gold-500 hover:bg-gold-400 transition-colors"
      >
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
        <div className="relative py-3.5 flex items-center justify-center gap-3">
          <span className="font-black text-black text-sm tracking-wide">
            Jouer {selected} ticket{selected > 1 ? 's' : ''} — {selected}$
          </span>
        </div>
      </button>
      <p className="text-center text-[10px] text-[#8A8070]/60 mt-3 tracking-wider">
        Chaque ticket participe aux deux tirages · 1$ USDC · Sécurisé sur Base
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
  const [cardPaymentOpen, setCardPaymentOpen] = useState(false);
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
      <CardPaymentModal
        isOpen={cardPaymentOpen}
        onClose={() => setCardPaymentOpen(false)}
        amount={10} // Example: 10 USDC
        userWalletAddress={aureusUser?.walletAddress}
        onSuccess={(amount) => {
          // Update the user's balance
          if (aureusUser) {
            const newBalance = (aureusUser.usdcBalance || 0) + amount;
            updateUserBalance(aureusUser.id, newBalance);
            setAureusUser({
              ...aureusUser,
              usdcBalance: newBalance,
            });
          }
          setCardPaymentOpen(false);
        }}
      />
      <DisclaimerModal />
      <UsernameModal />
      
      <div className="min-h-screen bg-[#06060F] text-[#F5F0E8] relative overflow-x-hidden">
      {/* Mobile UI — shown only on small screens */}
      <div className="md:hidden">
        <MobileHome />
      </div>

      {/* Subtle gold ambient */}
      <div className="fixed inset-0 bg-gradient-to-b from-gold-500/[0.03] via-transparent to-transparent pointer-events-none" />

      <header className="hidden md:block sticky top-0 z-40 border-b border-gold-500/15" style={{ background: 'rgba(6,6,15,0.92)', backdropFilter: 'blur(24px)' }}>
        <div className="container mx-auto px-6 h-20 flex items-center justify-between gap-8">

          {/* ── Logo ── */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <Trophy className="w-6 h-6 text-gold-500" />
              <span className="text-xl font-black tracking-[0.28em] text-gold-400">AUREUS</span>
            </div>
            <div className="flex items-center gap-1.5 ml-1">
              <span
                className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-gold-500' : 'bg-white/20'}`}
                style={isLive ? { boxShadow: '0 0 5px rgba(201,168,76,0.8)' } : {}}
              />
              {!FORCED_MODE && (
                <button
                  onClick={() => {
                    if (isLive) { setMode('demo'); toast.success('Demo mode'); }
                    else { setMode('live'); syncOnChainData(user?.address); toast.success('Live mode'); }
                  }}
                  className="text-[10px] text-[#8A8070] hover:text-gold-400 uppercase tracking-widest font-medium transition-colors"
                  title={isLive ? 'Switch to demo' : 'Switch to live'}
                >
                  {isLive ? (isSyncing ? 'sync…' : 'live') : 'demo'}
                </button>
              )}
              {FORCED_MODE && (
                <span className="text-[10px] text-[#8A8070] uppercase tracking-widest font-medium">
                  {isSyncing ? 'sync…' : 'live'}
                </span>
              )}
            </div>
          </div>

          {/* ── Nav centre ── */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: 'Comment ça marche', sub: 'Règles, tirages & prix', action: () => setHowItWorksOpen(true) },
              { label: 'Classement', sub: 'Top joueurs', action: () => setLeaderboardOpen(true) },
              { label: 'Inviter & Gagner', sub: 'Gagnez de l\'USDC', action: () => setReferralOpen(true) },
            ].map(item => (
              <button
                key={item.label}
                onClick={item.action}
                className="group flex flex-col items-start px-4 py-2.5 rounded-xl hover:bg-gold-500/[0.06] transition-all"
              >
                <span className="text-[#8A8070] group-hover:text-gold-400 text-sm font-semibold transition-colors whitespace-nowrap">
                  {item.label}
                </span>
                <span className="text-[10px] text-white/20 group-hover:text-[#8A8070] transition-colors mt-0.5 whitespace-nowrap">
                  {item.sub}
                </span>
              </button>
            ))}
            {!isLive && !FORCED_MODE && (
              <button
                onClick={() => { initDemo(); toast.success('Demo initialized'); }}
                className="ml-2 text-[#8A8070] hover:text-[#F5F0E8] text-xs font-medium transition-colors px-3 py-1 rounded-lg hover:bg-white/5"
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
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold-500/25 hover:border-gold-500/50 hover:bg-gold-500/[0.06] transition-all group"
              >
                <div className="w-7 h-7 rounded-full bg-gold-500 flex items-center justify-center text-xs font-black text-black">
                  {(user.username || user.address || '?')[0].toUpperCase()}
                </div>
                <span className="text-sm text-[#8A8070] group-hover:text-gold-400 transition-colors font-medium">
                  {user.username || `${user.address?.slice(0,6)}…${user.address?.slice(-4)}`}
                </span>
                <ChevronDown className="w-3 h-3 text-[#8A8070]" />
              </button>
            )}

            {/* Email/custodial user */}
            {aureusUser && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCustodialProfileOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold-500/25 bg-gold-500/[0.06] hover:border-gold-500/50 transition-all group"
                >
                  <div className="w-7 h-7 rounded-full bg-gold-500 flex items-center justify-center text-xs font-black text-black">
                    {(aureusUser.name || aureusUser.email || '?')[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-[#8A8070] group-hover:text-gold-400 transition-colors font-medium">
                    {aureusUser.name || aureusUser.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-[#8A8070]" />
                </button>
                <button
                  onClick={() => setAureusUser(null)}
                  className="p-1.5 text-[#8A8070] hover:text-[#F5F0E8] transition-colors rounded-lg hover:bg-white/5"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Connect button */}
            {!user && !aureusUser && (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-4 py-2 border border-gold-500/40 text-gold-400 hover:bg-gold-500/10 rounded-full font-semibold text-sm transition-all tracking-wide"
              >
                Se connecter
              </button>
            )}

            {/* Primary CTA */}
            <button
              onClick={() => {
                setBuyInitialCount(1);
                if (aureusUser || user) setBuyModalOpen(true);
                else setAuthModalOpen(true);
              }}
              className="hidden md:block relative px-6 py-2.5 rounded-full font-bold text-sm text-black overflow-hidden group bg-gold-500 hover:bg-gold-400 transition-colors tracking-wide"
            >
              Acheter des tickets
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
            <div className="absolute inset-0 bg-primary-500/30 blur-3xl rounded-full animate-pulse pointer-events-none" />
            <div className="relative bg-gradient-to-br from-indigo-950/90 via-purple-950/90 to-slate-950/90 backdrop-blur-2xl border-2 border-white/15 rounded-3xl shadow-2xl shadow-black/40 overflow-hidden">

              {/* Top bar: countdown */}
              <div className="flex items-center justify-center gap-3 px-8 py-4 border-b border-white/[0.06] bg-black/20">
                <Timer className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Next Draw in</span>
                <div className="flex items-center gap-0.5 font-mono text-white font-bold text-lg">
                  <span className="tabular-nums">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="text-slate-500 mx-0.5">:</span>
                  <span className="tabular-nums">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="text-slate-500 mx-0.5">:</span>
                  <span className="tabular-nums">{String(timeLeft.seconds).padStart(2, '0')}</span>
                </div>
              </div>

              {/* Prize amounts */}
              <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x divide-white/[0.08] px-4 md:px-6 py-6 md:py-10 gap-6 md:gap-0">
                {/* Main jackpot */}
                <div className="flex flex-col items-center text-center md:pr-8">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400/60 mb-3">🏆 Main Jackpot</p>
                  <p className="text-5xl md:text-7xl xl:text-8xl font-black text-white leading-none drop-shadow-[0_0_30px_rgba(251,191,36,0.25)]">
                    ${jackpot.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-sm text-slate-500 mt-3">1 winner · Daily 9 PM UTC</p>
                </div>

                {/* Bonus draw */}
                <div className="flex flex-col items-center text-center md:pl-8 border-t md:border-t-0 border-white/[0.08] pt-6 md:pt-0">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-400/60 mb-3">💎 Bonus Draw</p>
                  <p className="text-5xl md:text-7xl xl:text-8xl font-black text-violet-300 leading-none drop-shadow-[0_0_30px_rgba(167,139,250,0.25)]">
                    ${secondaryPot.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-sm text-slate-500 mt-3">25 winners · Daily 9:30 PM UTC</p>
                </div>
              </div>

              {/* User tickets badge */}
              {userTicketsCount > 0 && (
                <div className="flex justify-center pb-2">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500/15 to-blue-500/15 border border-white/15 rounded-full px-6 py-2">
                    <span className="text-sm text-slate-300">Your tickets this draw:</span>
                    <span className="text-yellow-300 font-black text-lg">{userTicketsCount}</span>
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

            </div>
          </div>

          {/* ── BELOW FOLD — social proof & engagement ─────────────────── */}

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setReferralOpen(false)}>
          <div className="bg-slate-900 border border-purple-500/30 rounded-2xl max-w-md w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <ReferralDashboard />
            <button onClick={() => setReferralOpen(false)} className="mt-4 w-full py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium">Close</button>
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
            className="bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 border border-white/10 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-sm font-black text-white">
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
              <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">USDC Balance</p>
                  <p className="text-2xl font-black text-green-400">${(aureusUser.usdcBalance || 0).toFixed(2)}</p>
                </div>
                <span className="text-3xl">💰</span>
              </div>

              {/* Deposit address */}
              <DepositAddress
                walletAddress={aureusUser.walletAddress}
                usdcBalance={aureusUser.usdcBalance || 0}
              />

              {/* Buy with card */}
              <button
                onClick={() => { setCustodialProfileOpen(false); setCardPaymentOpen(true); }}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl font-semibold transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                Buy with bank card
              </button>

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

