'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, DollarSign, Ticket, Trophy, TrendingUp, RefreshCw, LogIn, Gift } from 'lucide-react';

interface Stats {
  users: number;
  purchases: number;
  totalRevenue: number;
  totalTickets: number;
  totalPaidOut: number;
  totalCommissions: number;
  recentPurchases: Array<{ wallet_address: string; amount_usdc: number; ticket_count: number; created_at: string }>;
  recentWinners: Array<{ wallet_address: string; prize_usdc: number; draw_type: string; created_at: string }>;
  recentReferrals: Array<{ referrer_wallet: string; commission_usdc: number; created_at: string }>;
}

function fmt(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
function fmtDate(d: string) {
  return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminPage() {
  const [secret, setSecret] = useState('');
  const [input, setInput] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchStats = useCallback(async (s: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/stats', { headers: { 'x-admin-secret': s } });
      if (!res.ok) { setError('Wrong password or server error'); return; }
      setStats(await res.json());
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem('aureus_admin_secret');
    if (saved) { setSecret(saved); fetchStats(saved); }
  }, [fetchStats]);

  const handleLogin = () => {
    sessionStorage.setItem('aureus_admin_secret', input);
    setSecret(input);
    fetchStats(input);
  };

  // ── Login screen ──────────────────────────────────────────────────────────
  if (!secret || error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-2xl font-black text-white mb-1">Admin Dashboard</h1>
          <p className="text-slate-400 text-sm mb-6">Enter your admin secret to continue</p>
          {error && <p className="text-red-400 text-sm mb-4 bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}
          <input
            type="password"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Admin secret (CRON_SECRET)"
            className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm mb-4 focus:outline-none focus:border-violet-500"
          />
          <button
            onClick={handleLogin}
            className="w-full py-3 bg-violet-600 hover:bg-violet-500 rounded-xl font-bold text-white transition flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" /> Sign in
          </button>
        </div>
      </div>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400 animate-pulse">Loading stats…</div>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────
  const statCards = [
    { label: 'Registered Users', value: stats?.users ?? 0, icon: Users, color: 'text-blue-400' },
    { label: 'Total Revenue', value: `$${(stats?.totalRevenue ?? 0).toFixed(2)}`, icon: DollarSign, color: 'text-green-400' },
    { label: 'Tickets Sold', value: stats?.totalTickets ?? 0, icon: Ticket, color: 'text-yellow-400' },
    { label: 'Total Paid Out', value: `$${(stats?.totalPaidOut ?? 0).toFixed(2)}`, icon: Trophy, color: 'text-amber-400' },
    { label: 'Total Purchases', value: stats?.purchases ?? 0, icon: TrendingUp, color: 'text-violet-400' },
    { label: 'Commissions Paid', value: `$${(stats?.totalCommissions ?? 0).toFixed(2)}`, icon: Gift, color: 'text-pink-400' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white">Aureus Admin</h1>
            <p className="text-slate-400 text-sm mt-1">Real-time overview</p>
          </div>
          <button
            onClick={() => fetchStats(secret)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {statCards.map(card => (
            <div key={card.label} className="bg-slate-900 border border-white/[0.06] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <card.icon className={`w-5 h-5 ${card.color}`} />
                <p className="text-xs text-slate-400 uppercase tracking-wider">{card.label}</p>
              </div>
              <p className={`text-3xl font-black ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* Tables grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent purchases */}
          <div className="bg-slate-900 border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06]">
              <h2 className="font-bold text-white">Recent Purchases</h2>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {(stats?.recentPurchases ?? []).length === 0 && (
                <p className="px-5 py-4 text-slate-500 text-sm">No purchases yet</p>
              )}
              {(stats?.recentPurchases ?? []).map((p, i) => (
                <div key={i} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-mono text-sm text-white">{fmt(p.wallet_address)}</p>
                    <p className="text-xs text-slate-500">{fmtDate(p.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-bold text-sm">${p.amount_usdc?.toFixed(2)}</p>
                    <p className="text-xs text-slate-500">{p.ticket_count} ticket{p.ticket_count !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent winners */}
          <div className="bg-slate-900 border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06]">
              <h2 className="font-bold text-white">Recent Winners</h2>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {(stats?.recentWinners ?? []).length === 0 && (
                <p className="px-5 py-4 text-slate-500 text-sm">No draws yet</p>
              )}
              {(stats?.recentWinners ?? []).map((w, i) => (
                <div key={i} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-mono text-sm text-white">{fmt(w.wallet_address)}</p>
                    <p className="text-xs text-slate-500">{fmtDate(w.created_at)} · {w.draw_type}</p>
                  </div>
                  <p className="text-amber-400 font-bold text-sm">${w.prize_usdc?.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent referrals */}
          <div className="bg-slate-900 border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06]">
              <h2 className="font-bold text-white">Recent Referral Commissions</h2>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {(stats?.recentReferrals ?? []).length === 0 && (
                <p className="px-5 py-4 text-slate-500 text-sm">No referrals yet</p>
              )}
              {(stats?.recentReferrals ?? []).map((r, i) => (
                <div key={i} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-mono text-sm text-white">{fmt(r.referrer_wallet)}</p>
                    <p className="text-xs text-slate-500">{fmtDate(r.created_at)}</p>
                  </div>
                  <p className="text-pink-400 font-bold text-sm">${r.commission_usdc?.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-slate-900 border border-white/[0.06] rounded-2xl p-5">
            <h2 className="font-bold text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={async () => {
                  const res = await fetch('/api/draw/trigger?type=main', { headers: { Authorization: `Bearer ${secret}` } });
                  const d = await res.json();
                  alert(d.success ? `✅ Main draw: winner ${d.winner}, prize $${d.prize}` : `❌ ${d.error || d.message}`);
                }}
                className="w-full py-3 bg-amber-600/20 hover:bg-amber-600/40 border border-amber-500/30 rounded-xl text-sm font-bold text-amber-300 transition"
              >
                🎯 Trigger Main Draw
              </button>
              <button
                onClick={async () => {
                  const res = await fetch('/api/draw/trigger?type=bonus', { headers: { Authorization: `Bearer ${secret}` } });
                  const d = await res.json();
                  alert(d.success ? `✅ Bonus draw: ${d.winners?.length} winners, $${d.prizePerWinner?.toFixed(2)} each` : `❌ ${d.error || d.message}`);
                }}
                className="w-full py-3 bg-violet-600/20 hover:bg-violet-600/40 border border-violet-500/30 rounded-xl text-sm font-bold text-violet-300 transition"
              >
                💎 Trigger Bonus Draw
              </button>
              <button
                onClick={() => { sessionStorage.removeItem('aureus_admin_secret'); setSecret(''); setStats(null); setInput(''); }}
                className="w-full py-2 rounded-xl text-xs text-slate-500 hover:text-slate-300 hover:bg-white/5 transition"
              >
                Sign out
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
