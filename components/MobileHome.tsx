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
    q: 'Is this a scam?',
    a: `No. All payments are made in USDC on the Base blockchain, a public blockchain by Coinbase. Every transaction is verifiable on BaseScan — there is nothing to hide.`,
  },
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
    a: `Funds are held in a dedicated wallet on the Base blockchain (by Coinbase). Incoming payments (Coinbase Pay → USDC) and outgoing payments (to winners) are all publicly visible. USDC is a 1:1 stablecoin with the US dollar — it is not volatile.`,
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-4 text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold text-white text-sm pr-4">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-violet-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-3">
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
    { id: 'home', label: 'Home', Icon: Home },
    { id: 'tickets', label: 'Tickets', Icon: Ticket },
    { id: 'rank', label: 'Rankings', Icon: Trophy },
    { id: 'info', label: 'Info', Icon: Shield },
    { id: 'profile', label: 'Profile', Icon: User },
  ];

  return (
    <div className="md:hidden min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 via-purple-950 to-slate-900 text-white relative">
      <div className="fixed inset-0 bg-gradient-to-r from-violet-500/15 via-purple-500/20 via-violet-500/15 opacity-55 pointer-events-none" style={{ backgroundSize: '400% 400%', animation: 'gradient 20s ease infinite' }} />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-indigo-700/40 backdrop-blur-sm bg-slate-900/80">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-7 h-7 text-primary-400" />
            <h1 className="text-xl font-black bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              AUREUS
            </h1>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${isLive ? 'bg-green-600/30 border-green-400/40 text-green-200' : 'bg-slate-800/60 border-white/20 text-white/80'}`}>
              {isLive ? 'Live' : 'Demo'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => isGuest ? setAuthModalOpen(true) : setActiveTab('profile')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${isGuest ? 'bg-slate-800/60 border-white/20 text-white/70' : 'bg-violet-700/50 border-violet-600/30 text-violet-200'}`}
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-[9px] font-black text-black">
                {displayName ? displayName[0].toUpperCase() : '?'}
              </div>
              <span className="max-w-[60px] truncate">{displayName ?? 'Sign In'}</span>
              <Settings className="w-3 h-3 opacity-60" />
            </button>
          </div>
        </div>
      </header>

      {/* Urgency Banner — only on home */}
      {activeTab === 'home' && <UrgencyBanner timeLeft={timeLeft} />}

      {/* Main scrollable content */}
      <main className="px-4 py-5 pb-24">

        {/* ─── HOME TAB ─── */}
        {activeTab === 'home' && (
          <div className="space-y-5">
            {/* Jackpot card */}
            <div className="relative">
              <div className="absolute inset-0 bg-primary-500/40 blur-3xl rounded-full animate-pulse" />
              <div className="relative bg-gradient-to-br from-indigo-950/95 via-purple-950/95 to-slate-950/95 backdrop-blur-2xl border-4 border-white/30 rounded-3xl p-6 shadow-2xl shadow-white/20 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Timer className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-400">Next draw:</span>
                  <div className="flex items-center gap-1 bg-black/30 px-3 py-1 rounded-lg">
                    <span className="text-lg font-bold text-white">{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className="text-slate-400">:</span>
                    <span className="text-lg font-bold text-white">{String(timeLeft.minutes).padStart(2, '0')}</span>
                    <span className="text-slate-400">:</span>
                    <span className="text-lg font-bold text-white">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  </div>
                </div>
                <p className="text-base text-primary-400 font-bold uppercase tracking-wider mb-3">Tonight&apos;s Jackpot</p>
                <div className="flex justify-center">
                  <JackpotCounter />
                </div>
                {userTicketsCount > 0 && (
                  <div className="inline-block bg-gradient-to-r from-violet-500/20 to-blue-500/20 rounded-full px-5 py-1.5 border-2 border-white/30 mt-3">
                    <p className="text-sm font-bold text-white">Your tickets: <span className="text-yellow-300 font-black">{userTicketsCount}</span></p>
                  </div>
                )}
              </div>
            </div>

            {/* Dual draw */}
            <div className="bg-gradient-to-r from-purple-900/70 via-violet-900/70 to-purple-900/70 border-2 border-violet-500/50 rounded-2xl p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 text-center">
                  <p className="text-xl mb-1">🏆</p>
                  <p className="text-sm font-bold text-yellow-400">Main Jackpot</p>
                  <p className="text-2xl font-black text-white">${jackpot.toLocaleString('en-US')}</p>
                  <p className="text-xs text-slate-400">1 winner</p>
                </div>
                <div className="w-px h-14 bg-white/20" />
                <div className="flex-1 text-center">
                  <p className="text-xl mb-1">💎</p>
                  <p className="text-sm font-bold text-violet-400">Bonus Draw</p>
                  <p className="text-2xl font-black text-white">${secondaryPot.toLocaleString('en-US')}</p>
                  <p className="text-xs text-slate-400">25 winners</p>
                </div>
              </div>
              <p className="text-xs text-violet-200 text-center mt-3 border-t border-white/10 pt-2">
                Every ticket enters both draws
              </p>
            </div>

            {/* Buy CTA */}
            <button
              onClick={() => isGuest ? setAuthModalOpen(true) : setBuyOpen(true)}
              className="group relative w-full overflow-hidden rounded-3xl border-4 border-white/40"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-blue-600" />
              <div className="relative py-5 px-6 text-center">
                <p className="font-black text-2xl text-white drop-shadow-lg">Buy Tickets</p>
                <p className="text-yellow-300 font-bold text-xs mt-1">Instant · Card or Crypto</p>
              </div>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
            </button>

            {/* Recent winners */}
            <EnhancedWinnersHistory />

            {/* Compact share strip */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
              <span className="text-yellow-300 text-sm">🚀</span>
              <p className="text-xs text-slate-300 flex-1">Invite friends to grow the jackpot</p>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-300 text-xs font-semibold shrink-0"
              >
                <Share2 className="w-3 h-3" /> {linkCopied ? 'Copied!' : 'Share'}
              </button>
            </div>
          </div>
        )}

        {/* ─── TICKETS TAB ─── */}
        {activeTab === 'tickets' && (
          <div className="space-y-4">
            {isGuest ? (
              <div className="bg-yellow-900/30 border border-yellow-600/30 rounded-2xl px-4 py-4 text-center">
                <p className="text-yellow-300 font-bold mb-1">Sign in to view your tickets</p>
                <p className="text-yellow-200/70 text-sm mb-3">Create an account to keep your tickets and winnings safe.</p>
                <button onClick={() => setAuthModalOpen(true)} className="px-5 py-2 bg-yellow-500 text-black rounded-xl font-bold text-sm">
                  Sign In / Register
                </button>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-indigo-950/80 to-purple-950/80 border border-white/10 rounded-2xl p-5 text-center">
                <p className="text-4xl font-black text-yellow-300">{userTicketsCount}</p>
                <p className="text-slate-400 text-sm mt-1">active tickets in the next draw</p>
                <button
                  onClick={() => setBuyOpen(true)}
                  className="mt-4 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl font-bold text-sm text-white"
                >
                  + Buy more tickets
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

        {/* ─── RANKINGS TAB ─── */}
        {activeTab === 'rank' && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-2xl font-black text-white">Leaderboard</p>
              <p className="text-slate-400 text-sm mt-1">Recent winners &amp; jackpot history</p>
            </div>
            <WinnersFeed />
            <JackpotHistoryChart />
          </div>
        )}

        {/* ─── INFO / TRANSPARENCE TAB ─── */}
        {activeTab === 'info' && (
          <div className="space-y-5">
            {/* Title */}
            <div className="text-center">
              <p className="text-2xl font-black text-white">How It Works</p>
              <p className="text-slate-400 text-sm mt-1">Everything is transparent and verifiable</p>
            </div>

            {/* Steps */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
              {[
                { n: '1', icon: '💳', title: 'Buy tickets', desc: '1€ = 1 ticket. Pay by card via Coinbase Pay. No external wallet required.' },
                { n: '2', icon: '⏰', title: 'Draw at 9 PM UTC', desc: 'An automatic draw takes place every evening. Your ticket enters both draws simultaneously.' },
                { n: '3', icon: '🎲', title: 'Random selection', desc: '1 main winner is drawn. 25 bonus winners are drawn from all remaining tickets.' },
                { n: '4', icon: '💸', title: 'Automatic payout', desc: 'USDC payment is sent automatically to your wallet within 45 minutes of the draw.' },
              ].map(s => (
                <div key={s.n} className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-violet-600/40 border border-violet-500/50 flex items-center justify-center text-xs font-black text-violet-300 shrink-0">
                    {s.n}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{s.icon} {s.title}</p>
                    <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Distribution */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="font-bold text-white text-sm mb-3">Prize Distribution</p>
              <div className="space-y-2">
                {[
                  { pct: '85%', label: 'Main winner', color: 'bg-yellow-500' },
                  { pct: '5%', label: '25 bonus winners', color: 'bg-violet-500' },
                  { pct: '3%', label: 'Referral program', color: 'bg-green-500' },
                  { pct: '7%', label: 'Operating fees', color: 'bg-slate-500' },
                ].map(r => (
                  <div key={r.label} className="flex items-center gap-3">
                    <span className="w-10 text-right font-black text-white text-sm shrink-0">{r.pct}</span>
                    <div className="flex-1 bg-white/10 rounded-full h-2">
                      <div className={`${r.color} h-2 rounded-full`} style={{ width: r.pct }} />
                    </div>
                    <span className="text-slate-400 text-xs w-36 shrink-0">{r.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Treasury */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="font-bold text-white text-sm mb-2">Public Treasury</p>
              <p className="text-xs text-slate-400 mb-1">Wallet address that receives payments and pays out winners:</p>
              <p className="font-mono text-xs text-violet-300 break-all mb-3">{TREASURY}</p>
              <a
                href={BASESCAN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-900/40 border border-blue-500/30 rounded-xl text-blue-300 text-sm font-semibold hover:bg-blue-900/60 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View all transactions on BaseScan
              </a>
              <p className="text-xs text-slate-500 mt-2">USDC = stablecoin 1:1 with USD. No crypto volatility.</p>
            </div>

            {/* TrustBadges */}
            <TrustBadges />

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
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <p className="text-sm text-slate-400">Questions? Contact us at</p>
              <p className="text-violet-300 font-semibold text-sm mt-1">support@aureuslottery.app</p>
            </div>
          </div>
        )}

        {/* ─── PROFIL TAB ─── */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            {isGuest ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl font-black text-black mx-auto mb-4">?</div>
                <p className="font-bold text-white mb-1">Not signed in yet</p>
                <p className="text-slate-400 text-sm mb-4">Sign in to save your tickets and manage your account.</p>
                <button onClick={() => setAuthModalOpen(true)} className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl font-bold text-white">
                  Sign In / Register
                </button>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-xl font-black text-black shrink-0">
                    {displayName ? displayName[0].toUpperCase() : '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-white text-lg truncate">{displayName}</p>
                    {aureusUser?.email && <p className="text-sm text-slate-400 truncate">{aureusUser.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/10">
                    <p className="text-2xl font-black text-yellow-300">{userTicketsCount}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Active Tickets</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/10">
                    <p className="text-2xl font-black text-green-300">${(aureusUser?.usdcBalance ?? 0).toFixed(2)}</p>
                    <p className="text-xs text-slate-400 mt-0.5">USDC Balance</p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-3 mb-4 border border-white/10">
                  <p className="text-xs text-slate-400 mb-1">Wallet Address</p>
                  <p className="text-xs font-mono text-white/80 break-all">
                    {aureusUser?.walletAddress?.slice(0, 10)}…{aureusUser?.walletAddress?.slice(-8)}
                  </p>
                </div>

                <button
                  onClick={() => setBuyOpen(true)}
                  className="w-full py-3 mb-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl font-bold text-white"
                >
                  Buy Tickets
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full py-2.5 rounded-2xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}

            {/* Share card */}
            <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-600/20 rounded-2xl p-4">
              <p className="font-bold text-white text-sm mb-1">Invite friends 🚀</p>
              <p className="text-xs text-slate-400 mb-3">The more people play, the bigger the jackpot!</p>
              <div className="flex gap-2">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(siteUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-black/60 border border-white/15 rounded-xl text-white text-xs font-semibold"
                >
                  <Twitter className="w-3.5 h-3.5" /> Twitter
                </a>
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(siteUrl)}&text=${encodeURIComponent(shareText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-600/50 border border-blue-500/30 rounded-xl text-white text-xs font-semibold"
                >
                  <Send className="w-3.5 h-3.5" /> Telegram
                </a>
                <button
                  onClick={handleCopyLink}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-yellow-500/20 border border-yellow-500/30 rounded-xl text-yellow-300 text-xs font-semibold"
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

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 inset-x-0 z-40 bg-slate-950/98 border-t border-white/8 backdrop-blur-2xl"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex">
          {tabs.map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="flex-1 flex flex-col items-center pt-1 pb-2 gap-1 relative transition-all duration-200"
              >
                {active && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-full bg-violet-400" />
                )}
                <div className={`w-10 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${active ? 'bg-violet-500/20' : ''}`}>
                  <Icon className={`w-5 h-5 transition-colors duration-200 ${active ? 'text-violet-400' : 'text-slate-500'}`} />
                </div>
                <span className={`text-[9px] font-semibold tracking-wide transition-colors duration-200 ${active ? 'text-violet-300' : 'text-slate-600'}`}>
                  {label.toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Modals */}
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
