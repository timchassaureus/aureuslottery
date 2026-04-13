import Link from 'next/link';
import { Ticket, Clock, Wallet, Shield, Zap, Lock, ExternalLink, Users, Gift } from 'lucide-react';

const LOTTERY_CONTRACT = process.env.NEXT_PUBLIC_LOTTERY_ADDRESS;
const TREASURY = process.env.NEXT_PUBLIC_TREASURY_ADDRESS || '0x47d918C2e303855da1AD3e08A4128211284aD837';
const BASESCAN = 'https://basescan.org/address/';

export default function LandingPage() {
  const contractHref = LOTTERY_CONTRACT
    ? `${BASESCAN}${LOTTERY_CONTRACT}`
    : `${BASESCAN}${TREASURY}`;

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F5F0E8]">

      {/* ── Header ── */}
      <header
        className="fixed top-0 inset-x-0 z-50 border-b border-[#C9A84C]/10"
        style={{ background: 'rgba(10,10,15,0.96)', backdropFilter: 'blur(20px)' }}
      >
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span
            className="text-xl font-black tracking-[0.2em]"
            style={{ color: '#C9A84C' }}
          >
            AUREUS
          </span>
          <div className="flex items-center gap-4">
            <a href="https://x.com/LotteryAureus" target="_blank" rel="noopener noreferrer"
              className="text-xs text-[#8A8A95] hover:text-[#F5F0E8] transition-colors hidden sm:block">
              𝕏
            </a>
            <a href="https://instagram.com/aureuslottery" target="_blank" rel="noopener noreferrer"
              className="text-xs text-[#8A8A95] hover:text-[#F5F0E8] transition-colors hidden sm:block">
              IG
            </a>
            <Link href="/app" className="text-sm text-[#8A8A95] hover:text-[#F5F0E8] transition-colors">
              Sign in
            </Link>
            <Link
              href="/app"
              className="px-5 py-2 rounded-full font-bold text-sm text-[#0A0A0F] transition-all hover:opacity-90"
              style={{ background: '#C9A84C' }}
            >
              Play now →
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="pt-36 pb-28 px-6 text-center relative overflow-hidden">
        {/* Subtle gold glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 50% 20%, rgba(201,168,76,0.11) 0%, transparent 70%)',
          }}
        />
        <div className="relative max-w-3xl mx-auto">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#C9A84C]/20 bg-[#C9A84C]/5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8A8A95]">
              Daily draw · 9 PM UTC
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-[#F5F0E8] leading-[1.1] mb-6">
            The fairest daily lottery<br />on the blockchain.
          </h1>

          <p className="text-lg text-[#8A8A95] mb-10 max-w-xl mx-auto leading-relaxed">
            1 ticket. $1. Every night at 9 PM UTC, one winner takes 85% of the pot.
            100% verifiable on-chain.
          </p>

          <Link
            href="/app"
            className="inline-flex items-center gap-2 px-9 py-4 rounded-full font-black text-lg text-[#0A0A0F] transition-all hover:scale-105 hover:opacity-95"
            style={{
              background: '#C9A84C',
              boxShadow: '0 0 50px rgba(201,168,76,0.28), 0 4px 20px rgba(0,0,0,0.4)',
            }}
          >
            Play now →
          </Link>
          <p className="mt-4 text-xs text-[#8A8A95]/70">
            No wallet needed · Pay by card · $1 per ticket
          </p>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-24 px-6 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#C9A84C]/60 text-center mb-3">
            Simple &amp; transparent
          </p>
          <h2 className="text-3xl font-black text-[#F5F0E8] text-center mb-14">
            How it works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                Icon: Ticket,
                title: 'Buy tickets',
                desc: '1 USDC = 1 ticket. Pay by card or crypto on Base network. No wallet required — email sign-in works.',
              },
              {
                Icon: Clock,
                title: 'Daily draw',
                desc: 'Every night at 9 PM UTC. Winner selected by Chainlink VRF — cryptographically verifiable randomness nobody can influence.',
              },
              {
                Icon: Wallet,
                title: 'Win automatically',
                desc: '85% of the day\'s pot goes to the main winner. USDC sent to your wallet within 45 minutes. No claim needed.',
              },
            ].map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="p-6 rounded-2xl border border-white/[0.06] transition-all hover:border-[#C9A84C]/15"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                  style={{
                    background: 'rgba(201,168,76,0.10)',
                    border: '1px solid rgba(201,168,76,0.18)',
                  }}
                >
                  <Icon className="w-5 h-5" style={{ color: '#C9A84C' }} />
                </div>
                <h3 className="font-bold text-[#F5F0E8] text-base mb-2">{title}</h3>
                <p className="text-sm text-[#8A8A95] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Pot breakdown */}
          <div
            className="mt-10 rounded-2xl border border-white/[0.05] p-6"
            style={{ background: 'rgba(255,255,255,0.015)' }}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-[#8A8A95] mb-4">
              Pot distribution — for every $100 in tickets
            </p>
            <div className="flex flex-wrap gap-6">
              {[
                { pct: '85%', label: 'Main winner ($85)', color: '#C9A84C' },
                { pct: '5%', label: 'Bonus draw — 25 winners ($5)', color: '#e8c97a' },
                { pct: '3%', label: 'Referral commissions ($3)', color: '#4CAF7D' },
                { pct: '7%', label: 'Platform operations ($7)', color: '#8A8A95' },
              ].map(({ pct, label, color }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <span className="font-black text-sm" style={{ color }}>{pct}</span>
                  <span className="text-sm text-[#8A8A95]">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Volume discounts */}
          <div
            className="mt-4 rounded-2xl border border-white/[0.05] p-6"
            style={{ background: 'rgba(255,255,255,0.015)' }}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-[#8A8A95] mb-4">
              Volume discounts — the more you buy, the less you pay
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[#8A8A95] text-xs">
                    <th className="text-left pb-3 font-semibold">Tickets</th>
                    <th className="text-left pb-3 font-semibold">Price</th>
                    <th className="text-left pb-3 font-semibold">Per ticket</th>
                    <th className="text-left pb-3 font-semibold">Saving</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {[
                    { qty: '1', price: '$1.00', per: '$1.00', save: '—' },
                    { qty: '5', price: '$4.90', per: '$0.98', save: '2%' },
                    { qty: '10', price: '$9.50', per: '$0.95', save: '5%' },
                    { qty: '25', price: '$22.25', per: '$0.89', save: '11%' },
                    { qty: '50', price: '$44.00', per: '$0.88', save: '12%' },
                  ].map(({ qty, price, per, save }, i) => (
                    <tr key={qty} className={i === 4 ? 'text-[#C9A84C]' : 'text-[#F5F0E8]/80'}>
                      <td className="py-2.5 font-bold">{qty} tickets</td>
                      <td className="py-2.5">{price}</td>
                      <td className="py-2.5">{per}</td>
                      <td className="py-2.5 text-[#4CAF7D]">{save}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── Transparency ── */}
      <section className="py-24 px-6 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#C9A84C]/60 text-center mb-3">
            Fully on-chain
          </p>
          <h2 className="text-3xl font-black text-[#F5F0E8] text-center mb-4">
            100% verifiable. 0% trust required.
          </h2>
          <p className="text-[#8A8A95] text-center mb-14 max-w-lg mx-auto leading-relaxed">
            Every draw, every payment, every ticket — all publicly visible on the blockchain.
            No one can cheat, not even us.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                Icon: Zap,
                label: 'Chainlink VRF',
                sub: 'Verifiable randomness',
                href: 'https://docs.chain.link/vrf',
              },
              {
                Icon: Shield,
                label: 'How draws work',
                sub: 'Verifiable · Public · Fair',
                href: '/faq',
              },
              {
                Icon: Lock,
                label: 'Base Network',
                sub: 'By Coinbase',
                href: 'https://base.org',
              },
              {
                Icon: ExternalLink,
                label: 'Treasury',
                sub: 'View on BaseScan',
                href: `${BASESCAN}${TREASURY}`,
              },
            ].map(({ Icon, label, sub, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-white/[0.06] text-center transition-all hover:border-[#C9A84C]/30"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                <Icon
                  className="w-5 h-5 transition-colors group-hover:opacity-80"
                  style={{ color: '#C9A84C' }}
                />
                <div>
                  <p className="text-sm font-bold text-[#F5F0E8]">{label}</p>
                  <p className="text-xs text-[#8A8A95] mt-0.5">{sub}</p>
                </div>
                <ExternalLink className="w-3 h-3 text-[#8A8A95]/40 group-hover:text-[#C9A84C]/60 transition-colors" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Referral ── */}
      <section className="py-24 px-6 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <div
            className="rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8"
            style={{ background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.15)' }}
          >
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#C9A84C]/60 mb-3">
                Referral program
              </p>
              <h2 className="text-2xl md:text-3xl font-black text-[#F5F0E8] mb-4">
                Invite friends. Earn 3% forever.
              </h2>
              <p className="text-[#8A8A95] leading-relaxed mb-6 max-w-lg">
                Share your referral link. Every time someone you invited buys tickets, you automatically
                receive 3% of their purchase in USDC — for as long as they play. No limits, no expiry.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/app"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-[#0A0A0F] hover:opacity-90 transition-all"
                  style={{ background: '#C9A84C' }}
                >
                  <Gift className="w-4 h-4" />
                  Get my referral link
                </Link>
                <Link
                  href="/faq"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-[#8A8A95] hover:text-[#F5F0E8] transition-all border border-white/10 hover:border-white/20"
                >
                  How it works →
                </Link>
              </div>
            </div>
            <div className="shrink-0 flex flex-col gap-4 w-full md:w-48">
              {[
                { label: 'Commission rate', value: '3%', note: 'per ticket sold' },
                { label: 'Paid in', value: 'USDC', note: 'stable dollar coin' },
                { label: 'Payout delay', value: '~24h', note: 'daily automatic' },
              ].map(({ label, value, note }) => (
                <div key={label} className="rounded-xl p-4 border border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <p className="text-[10px] text-[#8A8A95] uppercase tracking-widest mb-1">{label}</p>
                  <p className="text-xl font-black text-[#C9A84C]">{value}</p>
                  <p className="text-[11px] text-[#8A8A95]/60 mt-0.5">{note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section className="py-20 px-6 border-t border-white/[0.04]">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#C9A84C]/60 mb-3">
            Our mission
          </p>
          <h2 className="text-2xl md:text-3xl font-black text-[#F5F0E8] mb-6">
            Built to be fair.
          </h2>
          <p className="text-[#8A8A95] leading-relaxed text-lg mb-6">
            Traditional lotteries keep 50% or more of every ticket. Aureus keeps 15%.
            The rest goes back to players — automatically, on-chain, every night.
            No trust required. The math is public.
          </p>
          <p className="text-[#8A8A95]/70 leading-relaxed">
            Built on Base network by Coinbase. Randomness guaranteed by Chainlink VRF.
            All transactions visible on BaseScan. You don&apos;t have to take our word for it.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm text-[#8A8A95]">
            <a href="https://x.com/LotteryAureus" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:border-[#C9A84C]/30 hover:text-[#F5F0E8] transition-all">
              𝕏 @LotteryAureus
            </a>
            <a href="https://instagram.com/aureuslottery" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:border-[#C9A84C]/30 hover:text-[#F5F0E8] transition-all">
              IG @aureuslottery
            </a>
            <a href="mailto:support@aureuslottery.app"
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:border-[#C9A84C]/30 hover:text-[#F5F0E8] transition-all">
              support@aureuslottery.app
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-14 px-6 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <span
              className="text-lg font-black tracking-[0.2em]"
              style={{ color: '#C9A84C' }}
            >
              AUREUS
            </span>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[#8A8A95]">
              <Link href="/faq" className="hover:text-[#F5F0E8] transition-colors">FAQ</Link>
              <Link href="/guide" className="hover:text-[#F5F0E8] transition-colors">Beginner Guide</Link>
              <Link href="/terms" className="hover:text-[#F5F0E8] transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-[#F5F0E8] transition-colors">Privacy</Link>
              <a href="mailto:support@aureuslottery.app" className="hover:text-[#F5F0E8] transition-colors">Support</a>
              <a href="https://x.com/LotteryAureus" target="_blank" rel="noopener noreferrer" className="hover:text-[#F5F0E8] transition-colors">𝕏 Twitter</a>
              <a href="https://instagram.com/aureuslottery" target="_blank" rel="noopener noreferrer" className="hover:text-[#F5F0E8] transition-colors">Instagram</a>
            </div>
          </div>

          {TREASURY && (
            <div
              className="mb-6 p-3 rounded-xl border border-white/[0.05]"
              style={{ background: 'rgba(255,255,255,0.015)' }}
            >
              <p className="text-[10px] uppercase tracking-widest text-[#8A8A95]/60 mb-1">
                Treasury address (Base network)
              </p>
              <a
                href={`${BASESCAN}${TREASURY}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-[#C9A84C]/60 hover:text-[#C9A84C] transition-colors break-all"
              >
                {TREASURY}
              </a>
            </div>
          )}

          <p className="text-xs text-[#8A8A95]/50 leading-relaxed mb-4">
            Aureus is a blockchain-based lottery. Participation may be restricted in certain
            jurisdictions. It is your responsibility to verify that online lotteries are legal
            in your country before participating. This platform does not target countries where
            such services are prohibited. USDC prizes may be subject to applicable taxes in
            your jurisdiction.
          </p>
          <p className="text-xs text-[#8A8A95]/30">
            © 2026 Aureus Lottery · Daily Crypto Draws on Base Network
          </p>
        </div>
      </footer>
    </div>
  );
}
