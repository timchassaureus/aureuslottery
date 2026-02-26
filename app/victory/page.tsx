'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';

const TWITTER_TEXT = (amount: number) =>
  `I just won $${amount} on @AureusLottery 🎰🏆 Join me!`;

const STRIPE_TEXT = `I just bought AUREUS Lottery tickets 🎰 Join me!`;

function VictoryContent() {
  const searchParams = useSearchParams();
  // ?session_id= comes from Stripe redirect; ?amount= from on-chain win
  const sessionId = searchParams.get('session_id');
  const isStripePayment = Boolean(sessionId);
  const amountParam = searchParams.get('amount');
  const amount = Math.max(0, Number(amountParam) || 0);
  const [displayAmount, setDisplayAmount] = useState(0);
  const [confettiDone, setConfettiDone] = useState(false);

  // Animation counting up to final amount
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const step = amount / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += step;
      if (current >= amount) {
        setDisplayAmount(amount);
        clearInterval(interval);
      } else {
        setDisplayAmount(Math.round(current * 100) / 100);
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [amount]);

  // CSS confetti (no external dependency)
  useEffect(() => {
    if (confettiDone) return;
    setConfettiDone(true);
    const colors = ['#FFD700', '#F59E0B', '#7C3AED', '#fff'];
    const count = 80;
    const root = typeof document !== 'undefined' ? document.body : null;
    if (!root) return;
    const fragments: HTMLDivElement[] = [];
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background: ${colors[i % colors.length]};
        left: ${Math.random() * 100}vw;
        top: -10px;
        opacity: 0.9;
        border-radius: 2px;
        pointer-events: none;
        animation: victory-fall ${2 + Math.random() * 2}s linear forwards;
        z-index: 9999;
      `;
      el.style.setProperty('--twist', `${(Math.random() - 0.5) * 360}deg`);
      root.appendChild(el);
      fragments.push(el);
    }
    const style = document.createElement('style');
    style.textContent = `
      @keyframes victory-fall {
        to {
          transform: translateY(100vh) rotate(var(--twist, 0deg));
          opacity: 0;
        }
      }
    `;
    root.appendChild(style);
    const t = setTimeout(() => {
      fragments.forEach((el) => el.remove());
      style.remove();
    }, 4000);
    return () => {
      clearTimeout(t);
      fragments.forEach((el) => el.remove());
      style.remove();
    };
  }, [confettiDone]);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://aureuslottery.app';
  const shareText = isStripePayment ? STRIPE_TEXT : TWITTER_TEXT(amount);
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(origin)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(origin)}&text=${encodeURIComponent(shareText)}`;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />
      <div className="relative z-10 text-center max-w-lg">
        {isStripePayment ? (
          <>
            <h1 className="text-4xl md:text-5xl font-bold text-amber-400 mb-4 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]">
              Payment confirmed!
            </h1>
            <p className="text-xl text-white mb-2">
              Your tickets are registered. Good luck in the next draw!
            </p>
            <p className="text-sm text-amber-200/60 mt-2">Session: {sessionId?.slice(0, 20)}…</p>
          </>
        ) : (
          <>
            <h1 className="text-4xl md:text-5xl font-bold text-amber-400 mb-4 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]">
              CONGRATULATIONS!
            </h1>
            <p className="text-2xl md:text-3xl text-white mb-2">
              You won <span className="text-amber-400 font-bold">${displayAmount.toFixed(2)}</span>!
            </p>
          </>
        )}
        <div className="flex flex-wrap gap-3 justify-center mt-8">
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-[#1DA1F2]/90 px-5 py-3 font-medium text-white hover:bg-[#1DA1F2] transition-colors"
          >
            Share on Twitter / X
          </a>
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-[#0088cc]/90 px-5 py-3 font-medium text-white hover:bg-[#0088cc] transition-colors"
          >
            Share on Telegram
          </a>
        </div>
        <Link
          href="/"
          className="inline-block mt-6 rounded-lg bg-amber-500 px-6 py-3 font-semibold text-black hover:bg-amber-400 transition-colors"
        >
          {isStripePayment ? 'Back to game' : 'Play again'}
        </Link>
      </div>
    </div>
  );
}

export default function VictoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-amber-200/80">Loading…</p>
      </div>
    }>
      <VictoryContent />
    </Suspense>
  );
}
