'use client';

import { useState, useEffect } from 'react';
import { Timer, Wallet, Trophy, User, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import WalletButton from '@/components/WalletButton';
import BuyTicketsModal from '@/components/BuyTicketsModal';
import PremiumChat from '@/components/PremiumChat';
import PreDrawCountdown from '@/components/PreDrawCountdown';
import UserProfile from '@/components/UserProfile';
import WinnerAnimation from '@/components/WinnerAnimation';
import WheelAnimation from '@/components/WheelAnimation';
import Leaderboard from '@/components/Leaderboard';
import EnhancedWinnersHistory from '@/components/EnhancedWinnersHistory';
import DisclaimerModal from '@/components/DisclaimerModal';
import HowItWorksModal from '@/components/HowItWorksModal';
import LiveStats from '@/components/LiveStats';
import UrgencyBanner from '@/components/UrgencyBanner';
// import StickyBuyButton from '@/components/StickyBuyButton';
import ViralShareModal from '@/components/ViralShareModal';
import InviteBar from '@/components/InviteBar';
import { useAppStore } from '@/lib/store';

export default function Home() {
  const { jackpot, secondaryPot, user, tickets, currentDrawNumber, performDraw, performSecondaryDraw } = useAppStore();
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [viralShareOpen, setViralShareOpen] = useState(false);
  const [lastPurchaseCount, setLastPurchaseCount] = useState(0);
  const [drawAnimation, setDrawAnimation] = useState<{ 
    winner?: string; 
    winners?: Array<{ address: string; prize: number }>; 
    prize?: number; 
    drawType: '8pm' | '10pm' 
  } | null>(null);
  const [showWheel, setShowWheel] = useState(false);
  const [wheelData, setWheelData] = useState<{
    participants: Array<{ address: string; ticketCount: number }>;
    winner: string;
    prize: number;
  } | null>(null);
  const [showPreDrawCountdown, setShowPreDrawCountdown] = useState(false);
  const [preDrawType, setPreDrawType] = useState<'8pm' | '10pm' | null>(null);
  const [hasTriggered8PM, setHasTriggered8PM] = useState(false);
  const [hasTriggered10PM, setHasTriggered10PM] = useState(false);

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

    // Auto-trigger draws (DEMO - simule le comportement avec smart contract)
    useEffect(() => {
      const totalSeconds = timeLeft.hours * 3600 + timeLeft.minutes * 60 + timeLeft.seconds;
      
      // Trigger 9PM draw countdown (2 minutes before)
      if (totalSeconds <= 120 && totalSeconds > 0 && !hasTriggered8PM && !showPreDrawCountdown) {
        setPreDrawType('8pm');
        setShowPreDrawCountdown(true);
        toast('🎰 Main Draw Starting!', { duration: 5000 });
      }
      
      // Check for 11PM draw (2 hours after 9PM)
    const now = new Date();
    const currentHour = now.getUTCHours();
    const currentMinute = now.getUTCMinutes();
    
    // 11PM draw logic (23h UTC)
    if (currentHour === 23 && currentMinute >= 58 && !hasTriggered10PM && !showPreDrawCountdown) {
      setPreDrawType('10pm');
      setShowPreDrawCountdown(true);
      toast('💎 Secondary Draw Starting!', { duration: 5000 });
    }
  }, [timeLeft, hasTriggered8PM, hasTriggered10PM, showPreDrawCountdown]);

  // Handle countdown complete -> trigger draw
  const handleCountdownComplete = async () => {
    setShowPreDrawCountdown(false);
    
    if (preDrawType === '8pm') {
      setHasTriggered8PM(true);
      
      // Simulate draw delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Perform the draw
      const result = await performDraw();
      
      if (result && tickets.length > 0) {
        // Show wheel animation
        const ticketsInDraw = tickets.filter(t => t.drawNumber === currentDrawNumber);
        
        const participantsMap = new Map<string, number>();
        ticketsInDraw.forEach(ticket => {
          participantsMap.set(ticket.owner, (participantsMap.get(ticket.owner) || 0) + 1);
        });
        
        const participants = Array.from(participantsMap.entries()).map(([address, count]) => ({
          address,
          ticketCount: count
        }));
        
        setWheelData({
          participants,
          winner: result.winner,
          prize: result.prize
        });
        setShowWheel(true);
      }
    } else if (preDrawType === '10pm') {
      setHasTriggered10PM(true);
      
      // Simulate draw delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Perform secondary draw
      await performSecondaryDraw();
      
      // Show animation with mock data (will be real with smart contract)
      const ticketsInDraw = tickets.filter(t => t.drawNumber === currentDrawNumber);
      const prizePerWinner = secondaryPot / Math.min(50, ticketsInDraw.length);
      
      // Select 50 random winners (or less if not enough tickets)
      const numWinners = Math.min(50, ticketsInDraw.length);
      const winners = ticketsInDraw
        .sort(() => Math.random() - 0.5)
        .slice(0, numWinners)
        .map(t => ({
          address: t.owner,
          prize: prizePerWinner
        }));
      
      if (winners.length > 0) {
        setDrawAnimation({
          winners,
          prize: prizePerWinner,
          drawType: '10pm'
        });
      }
    }
    
    setPreDrawType(null);
  };

  // Reset triggers at midnight UTC
  useEffect(() => {
    const now = new Date();
    if (now.getUTCHours() === 0 && now.getUTCMinutes() === 0) {
      setHasTriggered8PM(false);
      setHasTriggered10PM(false);
    }
  }, [timeLeft]);

  const userTicketsCount = user ? user.tickets.length : 0;

  return (
    <>
      {/* Disclaimer Modal - appears first time only */}
      <DisclaimerModal />
      
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 via-blue-950 to-slate-900 text-white relative overflow-hidden">
        {/* Animated gradient background */}
      <div className="fixed inset-0 bg-gradient-to-r from-violet-500/10 via-blue-500/10 to-indigo-500/10 animate-pulse opacity-50" style={{
        backgroundSize: '400% 400%',
        animation: 'gradient 20s ease infinite'
      }} />
      <header className="border-b border-indigo-700/30 backdrop-blur-sm bg-slate-900/50">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-10 h-10 text-primary-400" />
            <h1 className="text-4xl font-black bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              AUREUS
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setHowItWorksOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-violet-700/50 hover:bg-violet-700/70 rounded-xl font-semibold transition-all hover:scale-105 border border-violet-600/30"
            >
              <Award className="w-5 h-5 text-violet-300" />
              <span className="hidden md:inline">How It Works</span>
            </button>
            {user && (
              <button
                onClick={() => setLeaderboardOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-900/50 hover:bg-yellow-800/70 rounded-xl font-semibold transition-all hover:scale-105 border border-yellow-700/30"
              >
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="hidden md:inline">Leaderboard</span>
              </button>
            )}
            {user && (
              <button
                onClick={() => setProfileOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-700/50 hover:bg-blue-700/70 rounded-xl font-semibold transition-all hover:scale-105"
              >
                <User className="w-5 h-5" />
                <span className="hidden md:inline">Profile</span>
              </button>
            )}
            <WalletButton />
          </div>
        </div>
      </header>

      {/* Urgency Banner - Shows in last 30 minutes */}
      <UrgencyBanner timeLeft={timeLeft} />

      <main className="container mx-auto px-4 py-8 pb-32">
        <div className="max-w-6xl mx-auto">
          {/* JACKPOT ÉNORME ET VISIBLE */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-primary-500/40 blur-3xl rounded-full animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-indigo-950/90 via-purple-950/90 via-blue-950/90 to-slate-950/90 backdrop-blur-2xl border-4 border-white/20 rounded-3xl p-16 shadow-2xl shadow-white/10">
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

                <p className="text-2xl md:text-3xl text-primary-400 mb-6 font-bold uppercase tracking-wider">
                  🎰 Current Jackpot 🎰
                </p>
                
                {/* Montant ENORME */}
                <div className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black bg-gradient-to-r from-amber-400 from-5% via-yellow-300 via-30% via-yellow-300 via-70% to-amber-400 to-95% bg-clip-text text-transparent mb-4 leading-none drop-shadow-2xl break-all">
                  ${jackpot.toLocaleString('en-US')}
                </div>

                <p className="text-xl md:text-2xl text-primary-400 font-bold mt-6">
                  🎯 Daily Draw at 9PM UTC
                </p>

                {userTicketsCount > 0 && (
                  <div className="inline-block bg-gradient-to-r from-violet-500/20 to-blue-500/20 rounded-full px-8 py-3 border-2 border-white/30 mb-4">
                    <p className="text-xl font-bold text-white">
                      Your tickets: <span className="text-yellow-300 font-black">{userTicketsCount}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Secondary Pot Display */}
          <div className="flex justify-center mb-8 px-4">
            <div className="bg-gradient-to-r from-purple-900/60 via-violet-900/60 to-blue-900/60 backdrop-blur-xl border-2 border-violet-500/40 rounded-2xl p-6 max-w-2xl w-full shadow-2xl">
              <div className="flex items-center justify-between flex-wrap gap-4">
                {/* Main Jackpot Info */}
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-3xl">🏆</span>
                    <h3 className="text-lg font-bold text-yellow-400">Main Jackpot</h3>
                  </div>
                  <p className="text-3xl font-black text-white mb-1">
                    ${jackpot.toLocaleString('en-US')}
                  </p>
                  <p className="text-sm text-slate-300">🕘 9PM UTC • 1 Winner</p>
                </div>

                {/* Divider */}
                <div className="hidden md:block w-px h-20 bg-white/20"></div>

                {/* Secondary Pot Info */}
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-3xl">💎</span>
                    <h3 className="text-lg font-bold text-violet-400">Bonus Draw</h3>
                  </div>
                  <p className="text-3xl font-black text-white mb-1">
                    ${secondaryPot.toLocaleString('en-US')}
                  </p>
                  <p className="text-sm text-slate-300">🕚 11PM UTC • 50 Winners</p>
                </div>
              </div>

              {/* Info Banner */}
              <div className="mt-4 bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-500/30 rounded-lg p-3">
                <div className="text-center space-y-1">
                  <p className="text-xs text-violet-200">
                    💡 <strong>Every ticket enters BOTH draws!</strong> Win big at 9PM or share the bonus pot at 11PM 🎉
                  </p>
                  <p className="text-xs text-yellow-300 font-bold">
                    📣 Invite your friends — more players = a BIGGER pot. Let’s push the jackpot to <span className="text-white">MILLIONS daily</span>! 🚀
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions - Buy Tickets */}
          <div className="flex justify-center mb-8">
            <button
              onClick={() => {
                if (user) {
                  setBuyModalOpen(true);
                } else {
                  toast.error('Please connect your wallet first! 👛');
                }
              }}
              className="group relative w-full max-w-2xl overflow-hidden cursor-pointer"
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 via-indigo-600 to-blue-600 animate-gradient-x pointer-events-none"></div>
              
              {/* Glow effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 blur-xl"></div>
              </div>
              
              {/* Button content */}
              <div className="relative py-6 md:py-8 px-6 md:px-12 rounded-3xl border-4 border-white/40 backdrop-blur-sm">
                <div className="flex items-center justify-center gap-2 md:gap-4">
                  <span className="text-3xl md:text-5xl group-hover:scale-125 transition-transform">🎫</span>
                  <span className="font-black text-2xl md:text-3xl text-white drop-shadow-lg">
                    Buy Tickets Now
                  </span>
                  <span className="text-3xl md:text-5xl group-hover:scale-125 transition-transform">💰</span>
                </div>
                <div className="mt-2 text-yellow-300 font-bold text-xs md:text-sm">
                  ⚡ Instant Purchase • No Limits
                </div>
              </div>
              
              {/* Shine effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"></div>
            </button>
          </div>

          {/* Recent Winners - Social Proof! */}
          <div className="mb-8">
            <EnhancedWinnersHistory />
          </div>

        </div>
      </main>

      <BuyTicketsModal 
        isOpen={buyModalOpen} 
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
      <PremiumChat />
      
      {/* Invite & Viral Bar */}
      <InviteBar />

      {/* Live Stats Bar - Bottom */}
      <LiveStats />
      
      {/* Sticky Buy Button removed per request */}
      
      {/* Viral Share Modal - After Purchase */}
      <ViralShareModal 
        isOpen={viralShareOpen}
        onClose={() => setViralShareOpen(false)}
        ticketCount={lastPurchaseCount}
        jackpot={jackpot}
      />
      
      {/* Wheel Animation for 9PM draw */}
      {showWheel && wheelData && (
        <WheelAnimation
          participants={wheelData.participants}
          winner={wheelData.winner}
          prize={wheelData.prize}
          onAnimationComplete={() => {
            setShowWheel(false);
            setWheelData(null);
          }}
        />
      )}

      {/* Standard animation for 10PM draw (50 winners) */}
      {drawAnimation && drawAnimation.drawType === '10pm' && (
        <WinnerAnimation
          winner={drawAnimation.winner}
          winners={drawAnimation.winners}
          prize={drawAnimation.prize}
          drawType={drawAnimation.drawType}
          onClose={() => setDrawAnimation(null)}
        />
      )}

      </div>

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

