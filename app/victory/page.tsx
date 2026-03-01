'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import { getStoredReferralCodeForPurchase } from '@/hooks/useReferral';

const TWITTER_TEXT = (amount: number) =>
  `I just won $${amount} on @AureusLottery 🎰🏆 Join me!`;

const PURCHASE_TEXT = `I just bought AUREUS Lottery tickets 🎰 Join me!`;

function VictoryContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');       // Stripe
  const source = searchParams.get('source');              // 'coinbase'
  const ticketsParam = searchParams.get('tickets');
  const bonusParam = searchParams.get('bonus');
  const walletParam = searchParams.get('wallet');
  const amountParam = searchParams.get('amount');

  const isStripePayment = Boolean(sessionId);
  const isCoinbasePayment = source === 'coinbase';
  const isPurchase = isStripePayment || isCoinbasePayment || Boolean(ticketsParam);

  const tickets = Number(ticketsParam) || 0;
  const bonus = Number(bonusParam) || 0;
  const amount = Math.max(0, Number(amountParam) || 0);

  const [displayAmount, setDisplayAmount] = useState(0);
  const [confettiDone, setConfettiDone] = useState(false);
  const recordedRef = useRef(false);

  // Record Coinbase Pay purchase after redirect (once)
  useEffect(() => {
    if (!isCoinbasePayment || !walletParam || !tickets || recordedRef.current) return;
    recordedRef.current = true;

    const referralCode = getStoredReferralCodeForPurchase();
    fetch('/api/referral/record-purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress: walletParam,
        amountUsd: amount || tickets,
        ticketsCount: tickets,
        bonusTickets: bonus,
        referralCode: referralCode || null,
      }),
    }).catch(() => {/* non-blocking */});
  }, [isCoinbasePayment, walletParam, tickets, bonus, amount]);

  // Counting animation (for win display only)
  useEffect(() => {
    if (isPurchase) return;
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
  }, [amount, isPurchase]);

  // CSS confetti
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
  const shareText = isPurchase ? PURCHASE_TEXT : TWITTER_TEXT(amount);
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(origin)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(origin)}&text=${encodeURIComponent(shareText)}`;

  const totalTickets = tickets + bonus;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />
      <div className="relative z-10 text-center max-w-lg">
        {isCoinbasePayment ? (
          <>
            <div className="text-6xl mb-4">🎟️</div>
            <h1 className="text-4xl md:text-5xl font-bold text-amber-400 mb-4 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]">
              Paiement confirmé !
            </h1>
            <p className="text-xl text-white mb-2">
              {totalTickets > tickets
                ? `${tickets} tickets + ${bonus} bonus enregistrés.`
                : `${tickets} ticket${tickets > 1 ? 's' : ''} enregistré${tickets > 1 ? 's' : ''}.`}
            </p>
            <p className="text-amber-300/80 mt-1">Bonne chance au prochain tirage !</p>
          </>
        ) : isStripePayment ? (
          <>
            <h1 className="text-4xl md:text-5xl font-bold text-amber-400 mb-4 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]">
              Payment confirmed!
            </h1>
            <p className="text-xl text-white mb-2">
              Your tickets are registered. Good luck in the next draw!
            </p>
            <p className="text-sm text-amber-200/60 mt-2">Session: {sessionId?.slice(0, 20)}…</p>
          </>
        ) : tickets > 0 ? (
          <>
            <div className="text-6xl mb-4">🎟️</div>
            <h1 className="text-4xl md:text-5xl font-bold text-amber-400 mb-4 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]">
              Paiement confirmé !
            </h1>
            <p className="text-xl text-white mb-2">
              {totalTickets > tickets
                ? `${tickets} tickets + ${bonus} bonus enregistrés.`
                : `${tickets} ticket${tickets > 1 ? 's' : ''} enregistré${tickets > 1 ? 's' : ''}.`}
            </p>
            <p className="text-amber-300/80 mt-1">Bonne chance au prochain tirage !</p>
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
          {isPurchase ? 'Retour au jeu' : 'Play again'}
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
