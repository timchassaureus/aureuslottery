import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';

const TREASURY = process.env.NEXT_PUBLIC_TREASURY_ADDRESS || '0x47d918C2e303855da1AD3e08A4128211284aD837';

export const metadata = {
  title: 'How to buy USDC and play Aureus',
  description: 'Step-by-step guide to getting USDC on Base network and entering the Aureus daily lottery.',
};

const steps = [
  {
    n: '1',
    emoji: '📱',
    title: 'Download Coinbase Wallet',
    color: 'from-blue-600 to-blue-800',
    border: 'border-blue-500/40',
    content: (
      <div className="space-y-3 text-sm text-slate-300">
        <p>Coinbase Wallet is a free app that lets you hold and send crypto. It's the easiest option for beginners.</p>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <a
            href="https://apps.apple.com/app/coinbase-wallet/id1278383455"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-white/10 border border-white/20 rounded-xl py-2.5 px-3 text-white font-semibold text-xs hover:bg-white/20 transition-colors"
          >
            🍎 App Store
          </a>
          <a
            href="https://play.google.com/store/apps/details?id=org.toshi"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-white/10 border border-white/20 rounded-xl py-2.5 px-3 text-white font-semibold text-xs hover:bg-white/20 transition-colors"
          >
            🤖 Google Play
          </a>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 mt-2">
          <p className="text-yellow-300 text-xs font-semibold mb-1">⚠️ Important</p>
          <p className="text-yellow-200/80 text-xs">Write down your 12-word recovery phrase and keep it safe offline. Never share it with anyone.</p>
        </div>
      </div>
    ),
  },
  {
    n: '2',
    emoji: '💳',
    title: 'Buy USDC inside the app',
    color: 'from-violet-600 to-violet-800',
    border: 'border-violet-500/40',
    content: (
      <div className="space-y-3 text-sm text-slate-300">
        <p>Once the app is installed and your wallet is created:</p>
        <ol className="space-y-2 list-none">
          {[
            'Open Coinbase Wallet',
            'Tap "Buy" at the bottom of the screen',
            'Search for "USDC"',
            'Enter the amount you want (e.g. $10)',
            'Pay by card — Visa, Mastercard accepted',
            'The USDC will appear in your wallet within a few minutes',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-violet-600/60 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5">{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3">
          <p className="text-green-300 text-xs">💡 <strong>USDC = 1 USD exactly.</strong> It doesn't go up or down in value — it's always worth $1. Perfect for tickets.</p>
        </div>
      </div>
    ),
  },
  {
    n: '3',
    emoji: '🌐',
    title: 'Switch to Base network',
    color: 'from-cyan-600 to-cyan-800',
    border: 'border-cyan-500/40',
    content: (
      <div className="space-y-3 text-sm text-slate-300">
        <p>Aureus runs on <strong className="text-white">Base</strong> — a fast, cheap blockchain by Coinbase. You need to be on Base to send tickets.</p>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2">
          <p className="text-white font-semibold text-xs">How to switch to Base:</p>
          <ol className="space-y-1.5 list-none">
            {[
              'In Coinbase Wallet, tap the network icon (top left)',
              'Select "Base"',
              'Your USDC balance will now show on Base',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-xs">
                <span className="w-4 h-4 rounded-full bg-cyan-600/60 flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
          <p className="text-red-300 text-xs">⚠️ <strong>Do not send on Ethereum or other networks.</strong> Only Base is supported. Sending on the wrong network = lost funds.</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3">
          <p className="text-green-300 text-xs">✅ Transaction fees on Base are typically less than <strong>$0.01</strong>.</p>
        </div>
      </div>
    ),
  },
  {
    n: '4',
    emoji: '🎟️',
    title: 'Send USDC to Aureus',
    color: 'from-yellow-600 to-orange-700',
    border: 'border-yellow-500/40',
    content: (
      <div className="space-y-3 text-sm text-slate-300">
        <p>Send the exact amount of USDC you want in tickets to the Aureus treasury address:</p>
        <div className="bg-black/40 border border-yellow-500/30 rounded-xl p-3">
          <p className="text-xs text-yellow-300 font-semibold mb-1">Treasury address (Base network):</p>
          <p className="font-mono text-xs text-white break-all">{TREASURY}</p>
        </div>
        <ol className="space-y-2 list-none">
          {[
            'In Coinbase Wallet, tap "Send"',
            'Select USDC',
            `Paste the address above`,
            'Enter the amount (e.g. 10 = 10 tickets)',
            'Confirm the transaction',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-yellow-600/60 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5">{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-3">
          <p className="text-violet-300 text-xs">🎯 <strong>1 USDC = 1 ticket.</strong> Your tickets are registered automatically within a few minutes. The draw happens every evening at 9 PM UTC.</p>
        </div>
      </div>
    ),
  },
  {
    n: '5',
    emoji: '🏆',
    title: 'Win and get paid',
    color: 'from-green-600 to-emerald-800',
    border: 'border-green-500/40',
    content: (
      <div className="space-y-3 text-sm text-slate-300">
        <p>If you win, the USDC prize is sent automatically to your wallet within 45 minutes of the draw.</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: '🥇', label: 'Main winner', desc: '85% of the pot' },
            { icon: '🎁', label: '25 bonus winners', desc: '5% shared' },
            { icon: '📊', label: 'Verifiable', desc: 'On BaseScan' },
          ].map(item => (
            <div key={item.label} className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center">
              <p className="text-2xl mb-1">{item.icon}</p>
              <p className="text-white text-xs font-semibold">{item.label}</p>
              <p className="text-slate-400 text-[10px] mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400">You can verify every transaction on <a href={`https://basescan.org/address/${TREASURY}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">BaseScan ↗</a> — the treasury wallet is 100% public.</p>
      </div>
    ),
  },
];

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Aureus
          </Link>
          <h1 className="text-3xl font-black text-white mb-2">How to play Aureus</h1>
          <p className="text-slate-400">Complete beginner's guide — from zero to your first ticket in 10 minutes.</p>
        </div>

        {/* What you need */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
          <p className="text-sm font-bold text-white mb-3">What you need</p>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            {[
              { icon: '📱', label: 'A smartphone' },
              { icon: '💳', label: 'A debit/credit card' },
              { icon: '⏱️', label: '10 minutes' },
            ].map(item => (
              <div key={item.label} className="bg-white/5 rounded-xl p-3">
                <p className="text-2xl mb-1">{item.icon}</p>
                <p className="text-slate-300">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map(step => (
            <div key={step.n} className={`bg-slate-900 border ${step.border} rounded-2xl overflow-hidden`}>
              <div className={`bg-gradient-to-r ${step.color} px-4 py-3 flex items-center gap-3`}>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-black text-white text-sm shrink-0">
                  {step.n}
                </div>
                <span className="text-xl">{step.emoji}</span>
                <h2 className="font-bold text-white">{step.title}</h2>
              </div>
              <div className="p-4">
                {step.content}
              </div>
            </div>
          ))}
        </div>

        {/* MetaMask block */}
        <div className="mt-8 bg-orange-950/60 border-2 border-orange-500/40 rounded-2xl p-5">
          <p className="font-black text-white text-base mb-1">🦊 Using MetaMask?</p>
          <p className="text-orange-200/80 text-sm mb-4">MetaMask works, but you <strong className="text-white">must switch to Base network</strong> before sending. By default MetaMask is on Ethereum — if you send USDC on Ethereum it goes to the wrong place and can't be recovered.</p>
          <ol className="space-y-2 list-none">
            {[
              'Open MetaMask and tap the network name at the top (e.g. "Ethereum Mainnet")',
              'Select "Base" in the list — if it\'s not there, tap "Add network"',
              'If Base is not in the list, go to chainlist.org, search "Base" and click "Add to MetaMask"',
              'Once on Base, your USDC balance on Base will appear',
              'Now tap Send → select USDC → paste the Aureus address → confirm',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-orange-100/80">
                <span className="w-5 h-5 rounded-full bg-orange-600/60 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-4 bg-orange-500/10 border border-orange-500/20 rounded-xl p-3">
            <p className="text-orange-300 text-xs">💡 <strong>Important:</strong> USDC on Ethereum ≠ USDC on Base. If you bought USDC on Ethereum, you need to bridge it to Base first via <a href="https://bridge.base.org" target="_blank" rel="noopener noreferrer" className="underline text-orange-200">bridge.base.org</a>. The easiest option to avoid this: use <strong className="text-white">Coinbase Wallet</strong> which lets you buy USDC directly on Base.</p>
          </div>
        </div>

        {/* FAQ quick */}
        <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="font-bold text-white mb-3">Quick questions</p>
          <div className="space-y-3 text-sm">
            {[
              { q: 'Can I use MetaMask instead?', a: 'Yes — but you must switch MetaMask to Base network first (see the MetaMask section above). If you send on Ethereum, the funds cannot be recovered.' },
              { q: 'What if I send on the wrong network?', a: 'Unfortunately funds sent on Ethereum or other networks cannot be recovered. Always double-check that you are on Base before sending.' },
              { q: 'How do I know my tickets are registered?', a: 'Your purchase appears on BaseScan (the blockchain explorer) within a few minutes. You can search by the treasury address to see all transactions.' },
              { q: 'What if I win and do not have a wallet?', a: 'Your winnings are sent to the wallet address from which you sent the USDC. Make sure you keep access to that wallet.' },
            ].map(item => (
              <div key={item.q} className="border-b border-white/10 pb-3 last:border-0 last:pb-0">
                <p className="font-semibold text-white mb-1">{item.q}</p>
                <p className="text-slate-400 text-xs leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl font-bold text-white hover:from-violet-500 hover:to-fuchsia-500 transition-colors"
          >
            I'm ready — go to Aureus →
          </Link>
          <p className="text-slate-500 text-xs mt-3">Questions? support@aureuslottery.app</p>
        </div>
      </div>
    </div>
  );
}
