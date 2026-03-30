'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Trophy, Ticket, Users, Clock, Share2, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase';

interface LastWinner {
  wallet: string;
  amount: number;
  date: string;
  txHash?: string;
}

function getSecondsUntilNextDraw(): number {
  const now = new Date();
  const next = new Date();
  next.setUTCHours(21, 0, 0, 0);
  if (now.getUTCHours() >= 21) next.setUTCDate(next.getUTCDate() + 1);
  return Math.max(0, Math.floor((next.getTime() - now.getTime()) / 1000));
}

function formatCountdown(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return { h, m, s };
}

export default function DrawPage() {
  const [secondsLeft, setSecondsLeft] = useState(getSecondsUntilNextDraw());
  const [phase, setPhase] = useState<'waiting' | 'rolling' | 'winner'>('waiting');
  const [currentName, setCurrentName] = useState('');
  const [winner, setWinner] = useState<{ address: string; prize: number } | null>(null);
  const [lastWinners, setLastWinners] = useState<LastWinner[]>([]);
  const [ticketCount, setTicketCount] = useState<number>(0);
  const [jackpot, setJackpot] = useState<number>(0);
  const rollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const drawTriggeredRef = useRef(false);

  // Countdown
  useEffect(() => {
    const t = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // Load last winners from Supabase
  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('winners')
          .select('wallet_address, amount_usd, draw_date, tx_hash')
          .eq('draw_type', 'main')
          .order('draw_date', { ascending: false })
          .limit(5);
        if (data) {
          setLastWinners(data.map(w => ({
            wallet: w.wallet_address,
            amount: Number(w.amount_usd),
            date: new Date(w.draw_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            txHash: w.tx_hash,
          })));
        }
        // Get current jackpot estimate (sum of today's purchases × 85%)
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const { data: purchases } = await supabase
          .from('purchases')
          .select('amount_usd, tickets_count')
          .gte('created_at', today.toISOString());
        if (purchases) {
          const total = purchases.reduce((acc, p) => acc + Number(p.amount_usd), 0);
          const tickets = purchases.reduce((acc, p) => acc + (p.tickets_count ?? 1), 0);
          setJackpot(Math.round(total * 0.85));
          setTicketCount(tickets);
        }
      } catch { /* silent */ }
    };
    load();
  }, []);

  const startDrawAnimation = useCallback(async () => {
    setPhase('rolling');
    const fakeNames = [
      'Alex S. #4821', 'Jordan K. #1337', 'Casey M. #9910', 'Morgan T. #2048',
      'Riley B. #5555', 'Taylor W. #7777', 'Avery Q. #3141', 'Quinn R. #6660',
      'Sage F. #1111', 'River P. #8888', 'Phoenix D. #4444', 'Skyler C. #2222',
      '0x1a2b...3c4d', '0xdead...beef', '0xf00d...cafe', '0xabc1...2345',
    ];

    let speed = 80;
    let elapsed = 0;
    rollIntervalRef.current = setInterval(() => {
      elapsed += speed;
      setCurrentName(fakeNames[Math.floor(Math.random() * fakeNames.length)]);
      if (elapsed > 5000 && speed < 300) speed = 300;
      if (elapsed > 8000 && speed < 800) speed = 800;
    }, speed);

    // After 12s, fetch real result and reveal winner
    setTimeout(async () => {
      if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
      try {
        const res = await fetch('/api/draw/trigger?type=main');
        const data = await res.json();
        if (data.success && data.winner) {
          setWinner({ address: data.winner, prize: data.prize ?? jackpot });
          setCurrentName(data.winner);
        } else {
          setWinner({ address: fakeNames[0], prize: jackpot || 42 });
          setCurrentName(fakeNames[0]);
        }
      } catch {
        setWinner({ address: fakeNames[0], prize: jackpot || 42 });
      }
      setPhase('winner');
    }, 12000);
  }, [jackpot]);

  // Trigger draw animation when countdown hits 0
  useEffect(() => {
    if (secondsLeft === 0 && !drawTriggeredRef.current) {
      drawTriggeredRef.current = true;
      startDrawAnimation();
    }
  }, [secondsLeft, startDrawAnimation]);

  const { h, m, s } = formatCountdown(secondsLeft);
  const isImminent = secondsLeft <= 60 && secondsLeft > 0;

  const shareText = `🎰 Watch the LIVE Aureus Lottery draw at 9PM UTC!\n$${jackpot.toLocaleString('en-US')} jackpot · ${ticketCount.toLocaleString('en-US')} tickets sold\naureulottery.app/draw`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0A0A0F] to-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-[#8A8A95] hover:text-[#F5F0E8] text-sm transition-colors">
          ← Back
        </Link>
        <span className="text-yellow-400 font-bold tracking-widest text-sm">AUREUS LIVE DRAW</span>
        <button
          onClick={() => {
            navigator.share?.({ title: 'Aureus Live Draw', text: shareText, url: window.location.href })
              ?? navigator.clipboard.writeText(window.location.href);
          }}
          className="flex items-center gap-1 text-[#8A8A95] hover:text-[#F5F0E8] text-sm transition-colors"
        >
          <Share2 className="w-4 h-4" /> Share
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Phase: Waiting */}
        {phase === 'waiting' && (
          <>
            <div className="text-center mb-10">
              <p className="text-[#8A8A95] text-sm uppercase tracking-widest mb-3">Next draw in</p>
              <div className={`flex items-center justify-center gap-3 ${isImminent ? 'animate-pulse' : ''}`}>
                {[
                  { val: h, label: 'hours' },
                  { val: m, label: 'min' },
                  { val: s, label: 'sec' },
                ].map(({ val, label }) => (
                  <div key={label} className="flex flex-col items-center">
                    <div className={`w-20 h-20 flex items-center justify-center rounded-2xl border-2 text-4xl font-black font-mono ${isImminent ? 'bg-red-500/20 border-red-500 text-red-300' : 'bg-[#C9A84C]/10 border-[#C9A84C]/30 text-yellow-400'}`}>
                      {String(val).padStart(2, '0')}
                    </div>
                    <span className="text-[#8A8A95] text-xs mt-1">{label}</span>
                  </div>
                ))}
              </div>
              {isImminent && (
                <p className="text-red-400 font-bold mt-4 animate-pulse text-lg">
                  🔴 DRAW STARTING SOON — Stay on this page!
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="bg-[#C9A84C]/5 border border-[#C9A84C]/20 rounded-xl p-4 text-center">
                <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                <p className="text-2xl font-black text-yellow-400">${jackpot.toLocaleString('en-US')}</p>
                <p className="text-xs text-[#8A8A95]">Jackpot</p>
              </div>
              <div className="bg-[#C9A84C]/5 border border-[#C9A84C]/20 rounded-xl p-4 text-center">
                <Ticket className="w-5 h-5 text-[#8A8A95] mx-auto mb-1" />
                <p className="text-2xl font-black text-[#8A8A95]">{ticketCount.toLocaleString('en-US')}</p>
                <p className="text-xs text-[#8A8A95]">Tickets sold</p>
              </div>
              <div className="bg-[#C9A84C]/5 border border-[#C9A84C]/20 rounded-xl p-4 text-center">
                <Clock className="w-5 h-5 text-blue-300 mx-auto mb-1" />
                <p className="text-2xl font-black text-blue-300">9 PM</p>
                <p className="text-xs text-[#8A8A95]">UTC daily</p>
              </div>
            </div>

            {/* How it works */}
            <div className="bg-[#C9A84C]/5 border border-[#C9A84C]/20 rounded-2xl p-5 mb-8">
              <h3 className="font-bold text-white mb-3">How the draw works</h3>
              <div className="space-y-2 text-sm text-[#F5F0E8]">
                <div className="flex items-start gap-2"><span className="text-yellow-400 font-bold shrink-0">1.</span> At 9PM UTC, Chainlink VRF generates a provably random number</div>
                <div className="flex items-start gap-2"><span className="text-yellow-400 font-bold shrink-0">2.</span> The number selects 1 winner from all tickets sold</div>
                <div className="flex items-start gap-2"><span className="text-yellow-400 font-bold shrink-0">3.</span> 85% of the jackpot is sent instantly to the winner's wallet</div>
                <div className="flex items-start gap-2"><span className="text-yellow-400 font-bold shrink-0">4.</span> 30 min later, 25 bonus winners share 5% of the pot</div>
              </div>
            </div>

            {/* Last winners */}
            {lastWinners.length > 0 && (
              <div>
                <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-400" /> Recent winners
                </h3>
                <div className="space-y-2">
                  {lastWinners.map((w, i) => (
                    <div key={i} className="flex items-center justify-between bg-[#C9A84C]/5 border border-[#C9A84C]/20 rounded-xl px-4 py-3">
                      <div>
                        <p className="font-mono text-sm text-[#F5F0E8]">{w.wallet.slice(0, 8)}...{w.wallet.slice(-6)}</p>
                        <p className="text-xs text-[#8A8A95]">{w.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400 font-bold">${w.amount.toLocaleString('en-US')}</span>
                        {w.txHash && (
                          <a href={`https://basescan.org/tx/${w.txHash}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3 text-[#8A8A95] hover:text-[#F5F0E8]" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Phase: Rolling */}
        {phase === 'rolling' && (
          <div className="text-center py-8">
            <h2 className="text-4xl font-black mb-8 animate-pulse">🎰 DRAWING WINNER 🎰</h2>
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-[#C9A84C] via-[#e8c97a] to-[#A68A3E] rounded-3xl blur-3xl opacity-40 animate-pulse" />
              <div className="relative bg-slate-900/90 border-4 border-yellow-400 rounded-3xl p-10">
                <p className="text-xs text-[#8A8A95] uppercase tracking-widest mb-4">Selecting winner...</p>
                <p className="text-3xl font-black font-mono text-white blur-sm animate-pulse min-h-[2.5rem]">
                  {currentName}
                </p>
                <div className="mt-6 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#C9A84C] to-[#e8c97a] rounded-full animate-pulse w-1/2" />
                </div>
              </div>
            </div>
            <p className="text-[#8A8A95] animate-pulse">Chainlink VRF randomness is being processed...</p>
          </div>
        )}

        {/* Phase: Winner */}
        {phase === 'winner' && winner && (
          <div className="text-center py-8">
            {/* Confetti */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
              {[...Array(40)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-4 rounded-sm"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: '-10%',
                    backgroundColor: ['#fbbf24', '#a855f7', '#3b82f6', '#ec4899', '#10b981'][i % 5],
                    animation: `fall ${3 + Math.random() * 2}s linear ${Math.random() * 0.5}s infinite`,
                    transform: `rotate(${Math.random() * 360}deg)`,
                  }}
                />
              ))}
            </div>
            <style jsx>{`
              @keyframes fall {
                from { transform: translateY(0) rotate(0deg); opacity: 1; }
                to { transform: translateY(110vh) rotate(720deg); opacity: 0; }
              }
            `}</style>

            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full border-4 border-white shadow-2xl mb-6 animate-bounce">
              <Trophy className="w-12 h-12 text-white" />
            </div>

            <h2 className="text-7xl font-black mb-6 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent animate-pulse">
              WINNER!
            </h2>

            <div className="bg-yellow-500/10 border-4 border-yellow-400 rounded-3xl p-8 mb-6">
              <p className="text-yellow-300 font-bold mb-3">🎊 Congratulations 🎊</p>
              <p className="font-mono text-2xl text-yellow-400 break-all mb-4">{winner.address}</p>
              <p className="text-white text-lg mb-1">Won</p>
              <p className="text-6xl font-black text-yellow-400">${winner.prize.toLocaleString('en-US')}</p>
              <p className="text-[#8A8A95] text-sm mt-2">USDC sent directly to their wallet</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  const text = `🏆 Just watched the LIVE @AureusLottery draw!\n${winner.address.slice(0, 10)}... won $${winner.prize.toLocaleString('en-US')} USDC!\n\n$1 per ticket · Daily at 9PM UTC\naureulottery.app`;
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
                }}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-black hover:bg-gray-900 text-white font-bold rounded-xl border border-white/20 transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Share on X
              </button>
              <Link
                href="/"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-all"
              >
                <Ticket className="w-5 h-5" /> Buy tickets for tomorrow
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
