'use client';

import { useEffect, useRef, useState } from 'react';
import { Trophy, Timer, Home, Ticket, Shield, User, LogOut, Settings, ExternalLink, ChevronDown, ChevronUp, Share2, Twitter, Send } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { FORCED_MODE } from '@/lib/config';
import AuthModal from '@/components/AuthModal';
import BuyTicketsModal from '@/components/BuyTicketsModal';
import EnhancedWinnersHistory from '@/components/EnhancedWinnersHistory';
import UrgencyBanner from '@/components/UrgencyBanner';
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
import PremiumChat from '@/components/PremiumChat';
import { AureusUser } from '@/lib/auth';
import { getCurrentUser, saveUser, logout as logoutStorage } from '@/lib/userStorage';

type Tab = 'home' | 'tickets' | 'rank' | 'info' | 'profile';

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

const TREASURY = '0x47d918C2e303855da1AD3e08A4128211284aD837';
const BASESCAN_URL = `https://basescan.org/address/${TREASURY}`;

const FAQ_ITEMS = [
  {
    q: 'Will I actually get paid if I win?',
    a: `Yes. The USDC payout is sent automatically to your wallet within 45 minutes of the 9 PM draw. You receive it directly to your blockchain address, with no middleman.`,
  },
  {
    q: 'Who runs Aureus?',
    a: `Aureus is run by a blockchain development team. The treasury address (${TREASURY.slice(0, 10)}…) is public and viewable on BaseScan. All fund movements are visible to everyone.`,
  },
  {
    q: 'Is this legal?',
    a: `Online lotteries are legal in many countries but regulated differently across jurisdictions. It is your responsibility to verify the laws in your country. Aureus does not target countries where this is prohibited.`,
  },
  {
    q: 'Is my money safe?',
    a: `Funds are held in a dedicated wallet on the Base blockchain (by Coinbase). All incoming and outgoing transactions are publicly visible on BaseScan. USDC is a 1:1 stablecoin with the US dollar — it is not volatile.`,
  },
  {
    q: "I don't have USDC — how do I get some?",
    a: `See the "How to get USDC" guide below. In short: download Coinbase Wallet → buy USDC → switch to Base network → send to the Aureus treasury address.`,
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/[0.07] rounded-2xl overflow-hidden bg-black/20">
      <button
        className="w-full flex items-center justify-between px-4 py-4 text-left gap-3"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold text-white text-sm leading-snug">{q}</span>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${open ? 'bg-amber-500/20 border border-amber-500/40' : 'bg-white/5 border border-white/10'}`}>
          {open
            ? <ChevronUp className="w-3 h-3 text-amber-400" />
            : <ChevronDown className="w-3 h-3 text-slate-400" />}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-slate-300 leading-relaxed border-t border-white/[0.05] pt-3">
          {a}
        </div>
      )}
    </div>
  );
}

export default function MobileHome() {
  const { jackpot, secondaryPot, user, initDemo, mode, setMode, connectWallet, disconnectWallet } = useAppStore();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (FORCED_MODE === 'live') {
      localStorage.removeItem('aureus_mode');
      localStorage.removeItem('aureus_demo_initialized');
      if (mode !== 'live') setMode('live');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [buyOpen, setBuyOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [viralShareOpen, setViralShareOpen] = useState(false);
  const [lastPurchaseCount, setLastPurchaseCount] = useState(0);
  const [linkCopied, setLinkCopied] = useState(false);

  const [aureusUser, setAureusUser] = useState<AureusUser | null>(null);
  const connectedRef = useRef<string | null>(null);

  useEffect(() => {
    const u = getOrCreateGuestUser();
    setAureusUser(u);
  }, []);

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

  useEffect(() => {
    if (mode !== 'demo') return;
    const hasData = jackpot > 100;
    const demoInitialized = typeof window !== 'undefined' && localStorage.getItem('aureus_demo_initialized');
    if (!hasData && !demoInitialized) {
      initDemo();
      if (typeof window !== 'undefined') localStorage.setItem('aureus_demo_initialized', 'true');
      toast.success('Demo loaded!', { duration: 2000 });
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

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://aureuslottery.app';
  const shareText = `Join me on Aureus! $1 tickets · Draw every night at 9PM UTC. Let's push the jackpot to millions! 🏆`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(siteUrl);
      setLinkCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setLinkCopied(false), 2000);
    } catch { toast.error('Could not copy link'); }
  };

  const tabs: { id: Tab; label: string; Icon: React.ElementType }[] = [
    { id: 'home',    label: 'Home',     Icon: Home   },
    { id: 'tickets', label: 'Tickets',  Icon: Ticket },
    { id: 'rank',    label: 'Rankings', Icon: Trophy },
    { id: 'info',    label: 'Info',     Icon: Shield },
    { id: 'profile', label: 'Profile',  Icon: User   },
  ];

  return (
    <div className="md:hidden min-h-screen bg-[#08091a] text-white relative overflow-x-hidden">

      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.18) 0%, rgba(139,92,246,0.08) 50%, transparent 70%)' }} />
        <div className="absolute bottom-0 -right-10 w-[350px] h-[350px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 65%)' }} />
        <div className="absolute top-1/2 -left-20 w-[250px] h-[250px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 65%)' }} />
      </div>

      {/* ── Header ── */}
      <header className="sticky top-0 z-30 backdrop-blur-xl border-b border-amber-500/[0.08]" style={{ background: 'rgba(8,9,26,0.88)' }}>
        <div className="px-4 py-3 flex items-center justify-between">

          {/* Live badge */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${
            isLive
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-white/5 border-white/10 text-slate-500'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            {isLive ? 'Live' : 'Demo'}
          </div>

          {/* Logo */}
          <h1
            className="text-2xl font-black tracking-[0.25em] bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(135deg, #fcd34d, #f59e0b, #fbbf24)' }}
          >
            AUREUS
          </h1>

          {/* Account button */}
          <button
            onClick={() => isGuest ? setAuthModalOpen(true) : setActiveTab('profile')}
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-black shrink-0"
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              boxShadow: '0 0 16px rgba(245,158,11,0.35)',
            }}
          >
            {displayName ? displayName[0].toUpperCase() : <Settings className="w-4 h-4 text-black" />}
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-600 pb-2 tracking-[0.2em] uppercase">
          Daily Crypto Lottery · Base Network
        </p>
      </header>

      {/* Urgency Banner */}
      {activeTab === 'home' && <UrgencyBanner timeLeft={timeLeft} />}

      {/* ── Main scrollable content ── */}
      <main className="px-4 py-5 pb-28">

        {/* ─────────────── HOME TAB ─────────────── */}
        {activeTab === 'home' && (
          <div className="space-y-4">

            {/* Jackpot hero card */}
            <div
              className="relative rounded-3xl overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, #131228 0%, #0e0c22 50%, #110f1e 100%)',
                border: '1px solid rgba(245,158,11,0.3)',
                boxShadow: '0 0 60px rgba(245,158,11,0.08), 0 4px 40px rgba(0,0,0,0.5)',
              }}
            >
              {/* Glow behind number */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at 50% 55%, rgba(245,158,11,0.18) 0%, rgba(139,92,246,0.06) 50%, transparent 75%)' }}
              />
              <div className="relative p-6 text-center">
                {/* Countdown */}
                <div className="flex items-center justify-center gap-2 mb-5">
                  <Timer className="w-3.5 h-3.5 text-amber-400/60" />
                  <span className="text-xs text-amber-400/60 uppercase tracking-widest font-semibold">Next Draw</span>
                  <div className="flex items-center gap-0.5 bg-black/50 border border-white/[0.07] px-3 py-1 rounded-lg">
                    <span className="text-base font-mono font-bold text-white tabular-nums">{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className="text-amber-400/40 mx-0.5">:</span>
                    <span className="text-base font-mono font-bold text-white tabular-nums">{String(timeLeft.minutes).padStart(2, '0')}</span>
                    <span className="text-amber-400/40 mx-0.5">:</span>
                    <span className="text-base font-mono font-bold text-white tabular-nums">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  </div>
                </div>

                {/* Label */}
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-400/50 mb-2">
                  Tonight&apos;s Jackpot
                </p>

                {/* Big number */}
                <div className="mb-4">
                  <JackpotCounter />
                </div>

                {/* Ticket badge */}
                {userTicketsCount > 0 ? (
                  <div
                    className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 border text-sm font-bold text-amber-300"
                    style={{ background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.25)' }}
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    {userTicketsCount} ticket{userTicketsCount !== 1 ? 's' : ''} in the draw
                  </div>
                ) : (
                  <p className="text-xs text-slate-600 italic">No tickets yet — buy below to enter</p>
                )}
              </div>
            </div>

            {/* Dual draw pills */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.25)' }}>
                <p className="text-xl mb-1.5">🏆</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-400/80 mb-1">Main Jackpot</p>
                <p className="text-xl font-black text-white">${jackpot.toLocaleString('en-US')}</p>
                <p className="text-[10px] text-slate-500 mt-1">1 winner · 9 PM UTC</p>
              </div>
              <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.25)' }}>
                <p className="text-xl mb-1.5">💎</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-violet-400/80 mb-1">Bonus Draw</p>
                <p className="text-xl font-black text-white">${secondaryPot.toLocaleString('en-US')}</p>
                <p className="text-[10px] text-slate-500 mt-1">25 winners · 9:30 PM</p>
              </div>
            </div>

            {/* Every ticket enters both */}
            <p className="text-center text-xs text-slate-600 -mt-1">Every ticket enters both draws simultaneously</p>

            {/* Buy CTA */}
            <button
              onClick={() => isGuest ? setAuthModalOpen(true) : setBuyOpen(true)}
              className="group relative w-full overflow-hidden rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                boxShadow: '0 0 40px rgba(245,158,11,0.25), 0 4px 20px rgba(0,0,0,0.4)',
              }}
            >
              <div className="relative py-5 px-6 text-center">
                <p className="font-black text-xl text-black tracking-wide">Buy Tickets</p>
                <p className="text-black/50 font-semibold text-xs mt-0.5">1 USDC = 1 ticket · Base network only</p>
              </div>
              <div className="absolute inset-0 -translate-x-full group-active:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
            </button>

            {/* Beginner guide */}
            <a
              href="/guide"
              className="flex items-center gap-3 rounded-2xl px-4 py-3.5 border border-blue-500/25 transition-colors"
              style={{ background: 'rgba(59,130,246,0.07)' }}
            >
              <span className="text-2xl shrink-0">🔰</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm">No USDC yet? Start here</p>
                <p className="text-xs text-blue-300/60 mt-0.5">
                  How to get USDC on <strong className="text-blue-300">Base network</strong> in 10 min →
                </p>
              </div>
            </a>

            {/* Recent winners */}
            <EnhancedWinnersHistory />

            {/* Share strip */}
            <div className="flex items-center gap-3 bg-black/30 border border-white/[0.05] rounded-2xl px-4 py-3">
              <span className="text-amber-400 text-base">🚀</span>
              <p className="text-xs text-slate-500 flex-1">Invite friends — grow the jackpot</p>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-400 border border-amber-500/25 transition-colors"
                style={{ background: 'rgba(245,158,11,0.08)' }}
              >
                <Share2 className="w-3 h-3" />
                {linkCopied ? 'Copied!' : 'Share'}
              </button>
            </div>
          </div>
        )}

        {/* ─────────────── TICKETS TAB ─────────────── */}
        {activeTab === 'tickets' && (
          <div className="space-y-4">
            {isGuest ? (
              <div className="bg-black/40 border border-amber-500/15 rounded-2xl p-6 text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-amber-500/20"
                  style={{ background: 'rgba(245,158,11,0.08)' }}
                >
                  🎟️
                </div>
                <p className="font-bold text-white mb-2">Sign in to view your tickets</p>
                <p className="text-slate-500 text-sm mb-4">Create an account to keep your tickets and winnings safe.</p>
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="w-full py-3 rounded-xl font-bold text-black"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
                >
                  Sign In / Register
                </button>
              </div>
            ) : (
              <div
                className="bg-black/40 border border-white/[0.07] rounded-2xl p-5 text-center"
                style={{ boxShadow: '0 0 40px rgba(245,158,11,0.04)' }}
              >
                <p className="text-[11px] font-black uppercase tracking-[0.25em] text-amber-400/50 mb-2">Your Active Tickets</p>
                <p
                  className="text-7xl font-black mb-1"
                  style={{ color: '#fcd34d', textShadow: '0 0 40px rgba(252,211,77,0.3)' }}
                >
                  {userTicketsCount}
                </p>
                <p className="text-slate-500 text-sm">entered in the next draw</p>
                <button
                  onClick={() => setBuyOpen(true)}
                  className="mt-4 px-6 py-2.5 rounded-xl font-bold text-xs text-amber-400 border border-amber-500/25"
                  style={{ background: 'rgba(245,158,11,0.08)' }}
                >
                  + Get more tickets
                </button>
              </div>
            )}
            <StreakDisplay />
            <DailyEngagementCard
              userTicketsCount={userTicketsCount}
              lifetimeTickets={user?.lifetimeTickets ?? 0}
              jackpot={jackpot}
            />
            <EnhancedWinnersHistory />
          </div>
        )}

        {/* ─────────────── RANKINGS TAB ─────────────── */}
        {activeTab === 'rank' && (
          <div className="space-y-4">
            <div className="text-center pt-2">
              <p className="text-[11px] font-black uppercase tracking-[0.25em] text-amber-400/50 mb-1">Hall of Fame</p>
              <p className="text-2xl font-black text-white">Leaderboard</p>
              <p className="text-slate-500 text-sm mt-1">Recent winners &amp; jackpot history</p>
            </div>
            <WinnersFeed />
            <JackpotHistoryChart />
          </div>
        )}

        {/* ─────────────── INFO TAB ─────────────── */}
        {activeTab === 'info' && (
          <div className="space-y-4">
            <div className="text-center pt-2">
              <p className="text-[11px] font-black uppercase tracking-[0.25em] text-amber-400/50 mb-1">100% Transparent</p>
              <p className="text-2xl font-black text-white">How It Works</p>
              <p className="text-slate-500 text-sm mt-1">Fully verifiable on the blockchain</p>
            </div>

            {/* Steps */}
            <div className="bg-black/40 border border-white/[0.06] rounded-2xl p-4 space-y-4">
              {[
                { n: '1', icon: '💎', title: 'Buy tickets', desc: '1 USDC = 1 ticket. Send USDC to the treasury wallet on Base network. Tickets registered automatically.' },
                { n: '2', icon: '⏰', title: 'Draw at 9 PM UTC', desc: 'Automatic draw every evening. Your ticket enters both the main and bonus draws.' },
                { n: '3', icon: '🎲', title: 'Random selection', desc: '1 main winner + 25 bonus winners drawn from all active tickets.' },
                { n: '4', icon: '💸', title: 'Automatic payout', desc: 'USDC sent automatically to your wallet within 45 minutes of the draw.' },
              ].map(s => (
                <div key={s.n} className="flex gap-3 items-start">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-amber-400 shrink-0 border border-amber-500/25"
                    style={{ background: 'rgba(245,158,11,0.1)' }}
                  >
                    {s.n}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{s.icon} {s.title}</p>
                    <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Prize distribution */}
            <div className="bg-black/40 border border-white/[0.06] rounded-2xl p-4">
              <p className="font-bold text-white text-sm mb-3">Prize Distribution</p>
              <div className="space-y-2.5">
                {[
                  { pct: '85%', label: 'Main winner',     color: '#f59e0b', w: '85%' },
                  { pct: '5%',  label: '25 bonus winners', color: '#8b5cf6', w: '5%'  },
                  { pct: '3%',  label: 'Referral program', color: '#10b981', w: '3%'  },
                  { pct: '7%',  label: 'Operating fees',   color: '#475569', w: '7%'  },
                ].map(r => (
                  <div key={r.label} className="flex items-center gap-3">
                    <span className="w-8 text-right font-black text-white text-sm shrink-0">{r.pct}</span>
                    <div className="flex-1 bg-white/[0.05] rounded-full h-1.5">
                      <div className="h-1.5 rounded-full" style={{ width: r.w, backgroundColor: r.color }} />
                    </div>
                    <span className="text-slate-500 text-xs w-32 shrink-0">{r.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Public treasury */}
            <div className="bg-black/40 border border-emerald-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                  <span className="text-emerald-400 text-[10px] font-black">✓</span>
                </div>
                <p className="font-bold text-white text-sm">Public Treasury — 100% Verifiable</p>
              </div>
              <p className="text-xs text-slate-500 mb-2">All payments flow through this public wallet on Base blockchain:</p>
              <div className="bg-black/40 border border-white/[0.05] rounded-xl p-2.5 mb-3">
                <p className="font-mono text-xs text-emerald-300/80 break-all">{TREASURY}</p>
              </div>
              <a
                href={BASESCAN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-emerald-400 text-sm font-semibold border border-emerald-500/25"
                style={{ background: 'rgba(16,185,129,0.08)' }}
              >
                <ExternalLink className="w-4 h-4" />
                View all transactions on BaseScan
              </a>
              <p className="text-xs text-slate-600 mt-2">USDC = stablecoin pegged 1:1 to USD. No crypto volatility.</p>
            </div>

            {/* Trust badges */}
            <TrustBadges />

            {/* How to get USDC */}
            <div className="bg-black/40 border border-blue-500/15 rounded-2xl p-4">
              <p className="font-bold text-white text-sm mb-1">💡 New to crypto? How to get USDC</p>
              <p className="text-xs text-slate-500 mb-4">
                USDC = digital dollar (1 USDC = $1 exactly). Here&apos;s how to get started:
              </p>
              <div className="space-y-3">
                {[
                  { n: '1', title: 'Download a wallet', desc: 'Install Coinbase Wallet or MetaMask (free apps). Coinbase Wallet is easier for beginners.' },
                  { n: '2', title: 'Buy USDC', desc: 'In Coinbase Wallet, tap "Buy" → select USDC → pay by card. Takes 2 minutes.' },
                  { n: '3', title: 'Switch to Base network', desc: 'Switch to "Base" in your wallet — fees are ~$0.01 vs $5+ on Ethereum. 🦊 MetaMask: tap network name at top → select Base.' },
                  { n: '4', title: 'Send to Aureus', desc: 'Send USDC to the treasury address below. 1 USDC = 1 ticket. Registered within minutes.' },
                ].map(s => (
                  <div key={s.n} className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-[11px] font-black text-blue-400 shrink-0">
                      {s.n}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-xs">{s.title}</p>
                      <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-2.5 bg-black/40 border border-red-500/15 rounded-xl">
                <p className="text-xs text-red-300/70 font-semibold">⚠️ Base network only</p>
                <p className="font-mono text-xs text-white/50 break-all mt-1">{TREASURY}</p>
              </div>
              <a
                href="/guide"
                className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-blue-300 text-sm font-semibold border border-blue-500/20"
                style={{ background: 'rgba(59,130,246,0.07)' }}
              >
                📖 Full step-by-step guide →
              </a>
            </div>

            {/* FAQ */}
            <div>
              <p className="font-bold text-white text-sm mb-3">Frequently Asked Questions</p>
              <div className="space-y-2">
                {FAQ_ITEMS.map(item => (
                  <FaqItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="bg-black/30 border border-white/[0.05] rounded-2xl p-4 text-center">
              <p className="text-sm text-slate-500">Questions?</p>
              <p className="text-violet-400 font-semibold text-sm mt-1">support@aureuslottery.app</p>
            </div>
          </div>
        )}

        {/* ─────────────── PROFILE TAB ─────────────── */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            {isGuest ? (
              <div className="bg-black/40 border border-white/[0.07] rounded-2xl p-6 text-center">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black text-black mx-auto mb-5"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                    boxShadow: '0 0 30px rgba(245,158,11,0.25)',
                  }}
                >
                  ?
                </div>
                <p className="font-black text-white text-lg mb-1">Not signed in yet</p>
                <p className="text-slate-500 text-sm mb-5">Create an account to save your tickets and claim winnings.</p>
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="w-full py-3.5 rounded-2xl font-bold text-black text-base"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                    boxShadow: '0 0 20px rgba(245,158,11,0.2)',
                  }}
                >
                  Sign In / Register
                </button>
              </div>
            ) : (
              <div className="bg-black/40 border border-white/[0.07] rounded-2xl p-5">
                {/* Profile header */}
                <div className="flex items-center gap-4 mb-5">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-black text-black shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                      boxShadow: '0 0 20px rgba(245,158,11,0.25)',
                    }}
                  >
                    {displayName ? displayName[0].toUpperCase() : '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-white text-lg truncate">{displayName}</p>
                    {aureusUser?.email && <p className="text-sm text-slate-500 truncate">{aureusUser.email}</p>}
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div
                    className="rounded-xl p-3 text-center border border-amber-500/15"
                    style={{ background: 'rgba(245,158,11,0.06)' }}
                  >
                    <p className="text-2xl font-black text-amber-300">{userTicketsCount}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 uppercase tracking-wider">Active Tickets</p>
                  </div>
                  <div
                    className="rounded-xl p-3 text-center border border-emerald-500/15"
                    style={{ background: 'rgba(16,185,129,0.06)' }}
                  >
                    <p className="text-2xl font-black text-emerald-300">${(aureusUser?.usdcBalance ?? 0).toFixed(2)}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 uppercase tracking-wider">USDC Balance</p>
                  </div>
                </div>

                {/* Wallet address */}
                <div className="bg-black/40 rounded-xl p-3 mb-4 border border-white/[0.05]">
                  <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-1">Wallet Address</p>
                  <p className="text-xs font-mono text-white/50 break-all">
                    {aureusUser?.walletAddress?.slice(0, 10)}…{aureusUser?.walletAddress?.slice(-8)}
                  </p>
                </div>

                {/* Actions */}
                <button
                  onClick={() => setBuyOpen(true)}
                  className="w-full py-3 mb-2.5 rounded-2xl font-bold text-black"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
                >
                  Buy Tickets
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full py-2.5 rounded-2xl text-sm text-slate-600 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}

            {/* Invite / share */}
            <div className="bg-black/40 border border-amber-500/10 rounded-2xl p-4">
              <p className="font-bold text-white text-sm mb-1">🚀 Invite friends</p>
              <p className="text-xs text-slate-500 mb-3">The more people play, the bigger the jackpot!</p>
              <div className="flex gap-2">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(siteUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-black/50 border border-white/[0.08] rounded-xl text-white text-xs font-semibold"
                >
                  <Twitter className="w-3.5 h-3.5" /> Twitter
                </a>
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(siteUrl)}&text=${encodeURIComponent(shareText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-600/20 border border-blue-500/20 rounded-xl text-blue-300 text-xs font-semibold"
                >
                  <Send className="w-3.5 h-3.5" /> Telegram
                </a>
                <button
                  onClick={handleCopyLink}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-amber-500/20 rounded-xl text-amber-400 text-xs font-semibold"
                  style={{ background: 'rgba(245,158,11,0.08)' }}
                >
                  <Share2 className="w-3.5 h-3.5" /> {linkCopied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <ReferralDashboard />
            <GroupDashboard />
          </div>
        )}

      </main>

      {/* ── Bottom Navigation ── */}
      <nav
        className="fixed bottom-0 inset-x-0 z-40 backdrop-blur-2xl border-t"
        style={{ background: 'rgba(8,9,26,0.97)', borderColor: 'rgba(245,158,11,0.1)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex">
          {tabs.map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="flex-1 flex flex-col items-center pt-2 pb-1.5 gap-0.5 relative transition-all duration-200"
              >
                {active && (
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                    style={{ background: 'linear-gradient(90deg, #f59e0b, #ef4444)' }}
                  />
                )}
                <div className={`w-9 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${active ? 'bg-amber-500/10' : ''}`}>
                  <Icon
                    className={`w-5 h-5 transition-colors duration-200 ${active ? 'text-amber-400' : 'text-slate-600'}`}
                  />
                </div>
                <span
                  className={`text-[9px] font-bold tracking-wider transition-colors duration-200 ${active ? 'text-amber-400' : 'text-slate-600'}`}
                >
                  {label.toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Modals ── */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} onSuccess={handleAuthSuccess} />
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
      <ViralShareModal
        isOpen={viralShareOpen}
        onClose={() => setViralShareOpen(false)}
        ticketCount={lastPurchaseCount}
        jackpot={jackpot}
      />

      <PremiumChat />
    </div>
  );
}
