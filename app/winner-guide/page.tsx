'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

function WinnerGuideContent() {
  const searchParams = useSearchParams();
  const amount = Math.max(0, Number(searchParams.get('amount') || 0));
  const [displayAmount, setDisplayAmount] = useState(0);
  const [coinbaseAddress, setCoinbaseAddress] = useState('');
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const duration = 1600;
    const steps = 60;
    const step = amount / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += step;
      if (current >= amount) {
        setDisplayAmount(amount);
        clearInterval(interval);
      } else {
        setDisplayAmount(Number(current.toFixed(2)));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [amount]);

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(t);
  }, []);

  const shareText = useMemo(
    () => `I just won $${amount.toFixed(2)} on @AureusLottery 🎰🏆 Join me!`,
    [amount]
  );

  const handleTransfer = () => {
    if (!coinbaseAddress.trim()) {
      toast.error('Please paste your Coinbase address first.');
      return;
    }
    toast.success('Address received. The transfer will be initiated from your Aureus dashboard.');
  };

  // Page only makes sense for real winners — redirect anyone arriving without a valid prize amount
  if (amount <= 0) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <p className="text-slate-400 text-lg mb-2">This page is for winners only.</p>
          <p className="text-slate-600 text-sm mb-6">If you won a prize, you should have received a direct link.</p>
          <Link href="/app" className="text-[#C9A84C] hover:text-[#e8c97a] text-sm transition-colors">Back to Aureus →</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {showConfetti && (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
          {Array.from({ length: 120 }).map((_, idx) => (
            <span
              key={idx}
              className="absolute animate-[winnerConfetti_3s_linear_forwards]"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10%',
                fontSize: `${12 + Math.random() * 18}px`,
              }}
            >
              {['🎉', '✨', '💸', '🏆', '🔥'][idx % 5]}
            </span>
          ))}
        </div>
      )}

      <section className="mx-auto max-w-3xl px-4 py-8 md:py-10">
        <div className="rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-500/10 to-violet-500/10 p-6 md:p-8 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-amber-300 leading-tight">
            🏆 CONGRATULATIONS! You won ${displayAmount.toFixed(2)}
          </h1>
          <p className="mt-3 text-base md:text-lg text-slate-200">
            Follow these 5 simple steps to get your money into your bank account.
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-950 p-5 md:p-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">
            How to get your money into your bank account?
          </h2>

          <div className="mt-5 space-y-4 text-base md:text-lg">
            <div className="rounded-xl border border-white/10 bg-zinc-900 p-4">
              <p className="text-emerald-300 font-bold">📱 Step 1 - Download Coinbase</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href="https://apps.apple.com/app/coinbase-buy-bitcoin-ether/id886427730"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-white text-black px-4 py-2 font-semibold text-sm"
                >
                  App Store
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=com.coinbase.android"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-white text-black px-4 py-2 font-semibold text-sm"
                >
                  Google Play
                </a>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-zinc-900 p-4">
              <p className="text-emerald-300 font-bold">✅ Step 2 - Create your account</p>
              <p className="mt-1 text-slate-100">
                Take a photo of your ID, it takes 5 minutes.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-zinc-900 p-4">
              <p className="text-emerald-300 font-bold">📋 Step 3 - Copy your Coinbase address</p>
              <p className="mt-1 text-slate-100">
                In Coinbase click on Receive and copy the address.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-zinc-900 p-4">
              <p className="text-emerald-300 font-bold">💸 Step 4 - Transfer from Aureus</p>
              <div className="mt-3 space-y-2">
                <input
                  type="text"
                  value={coinbaseAddress}
                  onChange={(e) => setCoinbaseAddress(e.target.value)}
                  placeholder="Paste your Coinbase address here"
                  className="w-full rounded-lg border border-violet-400/30 bg-black px-3 py-2 text-sm"
                />
                <button
                  onClick={handleTransfer}
                  className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 font-bold"
                >
                  Transfer my winnings now
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-zinc-900 p-4">
              <p className="text-emerald-300 font-bold">🏦 Step 5 - Transfer to your bank account</p>
              <p className="mt-1 text-slate-100">In Coinbase click Sell then Transfer to my bank account.</p>
              <p className="mt-1 text-slate-100">You receive the money in 1 to 3 business days.</p>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-yellow-400/40 bg-yellow-500/15 p-4">
          <p className="font-semibold text-yellow-100">
            Winnings may be taxable in your country. Keep a record of your winnings for your tax return.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <a
            href="https://t.me/"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-violet-600 hover:bg-violet-500 px-4 py-3 text-center font-semibold"
          >
            Join the community chat
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-black border border-white/20 hover:border-white/40 px-4 py-3 text-center font-semibold"
          >
            Share my win on X
          </a>
        </div>

        <div className="mt-5 text-center">
          <Link
            href="/app"
            className="inline-block rounded-lg border border-white/20 px-5 py-2 text-sm text-slate-200 hover:bg-white/5"
          >
            Back to Aureus
          </Link>
        </div>
      </section>

      <style jsx global>{`
        @keyframes winnerConfetti {
          to {
            transform: translateY(110vh) rotate(540deg);
            opacity: 0;
          }
        }
      `}</style>
    </main>
  );
}

export default function WinnerGuidePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <WinnerGuideContent />
    </Suspense>
  );
}
