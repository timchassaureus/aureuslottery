'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { Users, DollarSign, Ticket, Trophy, TrendingUp, RefreshCw, LogIn, Gift } from 'lucide-react';

interface ChartPoint {
  date: string; label: string;
  revenue: number; tickets: number; newUsers: number; jackpot: number;
}

interface Stats {
  users: number; purchases: number;
  totalRevenue: number; totalTickets: number; totalPaidOut: number; totalCommissions: number;
  revenueToday: number; revenueWeek: number; revenueMonth: number;
  ticketsToday: number; ticketsWeek: number; ticketsMonth: number;
  usersToday: number; usersWeek: number; usersMonth: number;
  chartData: ChartPoint[];
  recentPurchases: Array<{ wallet_address: string; amount_usdc: number; ticket_count: number; created_at: string }>;
  recentWinners:   Array<{ wallet_address: string; prize_usdc: number; draw_type: string; created_at: string }>;
  recentReferrals: Array<{ referrer_wallet: string; commission_usdc: number; created_at: string }>;
}

function fmt(addr: string) { return `${addr.slice(0, 6)}…${addr.slice(-4)}`; }
function fmtDate(d: string) {
  return new Date(d).toLocaleString('fr-FR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function usd(n: number) { return `$${n.toFixed(2)}`; }

// ── Period row ───────────────────────────────────────────────────────────────
function PeriodRow({
  label, today, week, month, format, color,
}: {
  label: string; today: number; week: number; month: number;
  format?: (n: number) => string; color: string;
}) {
  const f = format ?? String;
  return (
    <div className="grid grid-cols-4 items-center px-5 py-4 border-b border-white/[0.04] last:border-0">
      <p className="text-sm text-slate-300 font-semibold">{label}</p>
      <div className="text-center">
        <p className={`text-lg font-black ${color}`}>{f(today)}</p>
      </div>
      <div className="text-center">
        <p className={`text-lg font-black ${color}`}>{f(week)}</p>
      </div>
      <div className="text-center">
        <p className={`text-lg font-black ${color}`}>{f(month)}</p>
      </div>
    </div>
  );
}

// ── Mini chart ───────────────────────────────────────────────────────────────
const tooltipStyle = {
  contentStyle: { background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#94a3b8' },
  cursor: { fill: 'rgba(255,255,255,0.03)' },
};

function AreaMini({
  title, color, gradId, data, dataKey, formatter,
}: {
  title: string; color: string; gradId: string; data: ChartPoint[];
  dataKey: keyof ChartPoint; formatter?: (v: number) => string;
}) {
  return (
    <div className="bg-slate-900 border border-white/[0.06] rounded-2xl p-5">
      <p className="text-sm font-bold text-white mb-4">{title}</p>
      <ResponsiveContainer width="100%" height={150}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={color} stopOpacity={0.35} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#475569' }} interval={6} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 9, fill: '#475569' }} axisLine={false} tickLine={false} />
          <Tooltip
            {...tooltipStyle}
            formatter={(v: number | undefined) => [formatter && v != null ? formatter(v) : (v ?? 0), '']}
          />
          <Area
            type="monotone"
            dataKey={dataKey as string}
            stroke={color}
            fill={`url(#${gradId})`}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function BarMini({
  title, color, data, dataKey, formatter,
}: {
  title: string; color: string; data: ChartPoint[];
  dataKey: keyof ChartPoint; formatter?: (v: number) => string;
}) {
  return (
    <div className="bg-slate-900 border border-white/[0.06] rounded-2xl p-5">
      <p className="text-sm font-bold text-white mb-4">{title}</p>
      <ResponsiveContainer width="100%" height={150}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#475569' }} interval={6} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 9, fill: '#475569' }} axisLine={false} tickLine={false} />
          <Tooltip
            {...tooltipStyle}
            formatter={(v: number | undefined) => [formatter && v != null ? formatter(v) : (v ?? 0), '']}
          />
          <Bar dataKey={dataKey as string} fill={color} radius={[3, 3, 0, 0]} maxBarSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [secret, setSecret] = useState('');
  const [input,  setInput]  = useState('');
  const [stats,  setStats]  = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const fetchStats = useCallback(async (s: string) => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/admin/stats', { headers: { 'x-admin-secret': s } });
      if (!res.ok) { setError('Mot de passe incorrect'); return; }
      setStats(await res.json());
    } catch { setError('Erreur réseau'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem('aureus_admin_secret');
    if (saved) { setSecret(saved); fetchStats(saved); }
  }, [fetchStats]);

  const handleLogin = () => {
    sessionStorage.setItem('aureus_admin_secret', input);
    setSecret(input); fetchStats(input);
  };

  // ── Login ─────────────────────────────────────────────────────────────────
  if (!secret || error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center mb-4">
            <span className="text-xl">🏆</span>
          </div>
          <h1 className="text-2xl font-black text-white mb-1">Aureus Admin</h1>
          <p className="text-slate-400 text-sm mb-6">Entrez votre mot de passe pour continuer</p>
          {error && <p className="text-red-400 text-sm mb-4 bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}
          <input
            type="password" value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Mot de passe"
            className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm mb-4 focus:outline-none focus:border-violet-500"
          />
          <button onClick={handleLogin}
            className="w-full py-3 bg-violet-600 hover:bg-violet-500 rounded-xl font-bold text-white transition flex items-center justify-center gap-2">
            <LogIn className="w-4 h-4" /> Se connecter
          </button>
        </div>
      </div>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400 animate-pulse text-sm">Chargement des données…</div>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────
  const s  = stats!;
  const cd = s?.chartData ?? [];

  const globalCards = [
    { label: 'Utilisateurs',    value: s?.users           ?? 0,  icon: Users,      color: 'text-blue-400'   },
    { label: 'Revenu total',    value: usd(s?.totalRevenue    ?? 0), icon: DollarSign, color: 'text-green-400'  },
    { label: 'Tickets vendus',  value: s?.totalTickets    ?? 0,  icon: Ticket,     color: 'text-yellow-400' },
    { label: 'Gains distribués',value: usd(s?.totalPaidOut    ?? 0), icon: Trophy,     color: 'text-amber-400'  },
    { label: 'Nb achats',       value: s?.purchases       ?? 0,  icon: TrendingUp, color: 'text-violet-400' },
    { label: 'Commissions',     value: usd(s?.totalCommissions ?? 0), icon: Gift,    color: 'text-pink-400'   },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto p-6 space-y-8">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white">Aureus Admin</h1>
            <p className="text-slate-400 text-sm mt-1">Vue d&apos;ensemble en temps réel</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => fetchStats(secret)} disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium transition disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Actualiser
            </button>
            <button
              onClick={() => { sessionStorage.removeItem('aureus_admin_secret'); setSecret(''); setStats(null); setInput(''); }}
              className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-300 hover:bg-white/5 transition">
              Déconnexion
            </button>
          </div>
        </div>

        {/* ── Stat cards globaux ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {globalCards.map(card => (
            <div key={card.label} className="bg-slate-900 border border-white/[0.06] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <card.icon className={`w-5 h-5 ${card.color}`} />
                <p className="text-xs text-slate-400 uppercase tracking-wider">{card.label}</p>
              </div>
              <p className={`text-3xl font-black ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* ── Performances par période ── */}
        <div className="bg-slate-900 border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <h2 className="font-bold text-white">Performance par période</h2>
          </div>
          {/* En-têtes colonnes */}
          <div className="grid grid-cols-4 px-5 py-3 border-b border-white/[0.04] bg-white/[0.015]">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold"></p>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold text-center">Aujourd&apos;hui</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold text-center">7 derniers jours</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold text-center">Ce mois</p>
          </div>
          <PeriodRow
            label="💰 Revenus"
            today={s?.revenueToday ?? 0} week={s?.revenueWeek ?? 0} month={s?.revenueMonth ?? 0}
            format={usd} color="text-green-400"
          />
          <PeriodRow
            label="🎟 Tickets vendus"
            today={s?.ticketsToday ?? 0} week={s?.ticketsWeek ?? 0} month={s?.ticketsMonth ?? 0}
            color="text-yellow-400"
          />
          <PeriodRow
            label="👥 Nouveaux joueurs"
            today={s?.usersToday ?? 0} week={s?.usersWeek ?? 0} month={s?.usersMonth ?? 0}
            color="text-blue-400"
          />
        </div>

        {/* ── Graphiques 30 jours ── */}
        <div>
          <h2 className="font-bold text-white mb-4">Évolution sur 30 jours</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AreaMini
              title="💰 Revenus journaliers"
              color="#22c55e" gradId="grad-revenue"
              data={cd} dataKey="revenue" formatter={usd}
            />
            <AreaMini
              title="🏆 Croissance du jackpot (cumulé)"
              color="#f59e0b" gradId="grad-jackpot"
              data={cd} dataKey="jackpot" formatter={usd}
            />
            <BarMini
              title="🎟 Tickets vendus / jour"
              color="#8b5cf6"
              data={cd} dataKey="tickets"
            />
            <BarMini
              title="👥 Nouveaux joueurs / jour"
              color="#06b6d4"
              data={cd} dataKey="newUsers"
            />
          </div>
        </div>

        {/* ── Actions rapides ── */}
        <div className="bg-slate-900 border border-white/[0.06] rounded-2xl p-5">
          <h2 className="font-bold text-white mb-4">Actions rapides</h2>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={async () => {
                const res = await fetch('/api/draw/trigger?type=main', { headers: { Authorization: `Bearer ${secret}` } });
                const d = await res.json();
                alert(d.success
                  ? `✅ Tirage principal : gagnant ${d.winner}, gain $${d.prize}`
                  : `❌ ${d.error || d.message}`);
              }}
              className="px-5 py-3 bg-amber-600/20 hover:bg-amber-600/40 border border-amber-500/30 rounded-xl text-sm font-bold text-amber-300 transition"
            >
              🎯 Déclencher tirage principal
            </button>
            <button
              onClick={async () => {
                const res = await fetch('/api/draw/trigger?type=bonus', { headers: { Authorization: `Bearer ${secret}` } });
                const d = await res.json();
                alert(d.success
                  ? `✅ Tirage bonus : ${d.winners?.length} gagnants, $${d.prizePerWinner?.toFixed(2)} chacun`
                  : `❌ ${d.error || d.message}`);
              }}
              className="px-5 py-3 bg-violet-600/20 hover:bg-violet-600/40 border border-violet-500/30 rounded-xl text-sm font-bold text-violet-300 transition"
            >
              💎 Déclencher tirage bonus
            </button>
          </div>
        </div>

        {/* ── Tableaux récents ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">

          {/* Derniers achats */}
          <div className="bg-slate-900 border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06]">
              <h2 className="font-bold text-white">Derniers achats</h2>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {(s?.recentPurchases ?? []).length === 0 && (
                <p className="px-5 py-4 text-slate-500 text-sm">Aucun achat</p>
              )}
              {(s?.recentPurchases ?? []).map((p, i) => (
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

          {/* Derniers gagnants */}
          <div className="bg-slate-900 border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06]">
              <h2 className="font-bold text-white">Derniers gagnants</h2>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {(s?.recentWinners ?? []).length === 0 && (
                <p className="px-5 py-4 text-slate-500 text-sm">Aucun tirage</p>
              )}
              {(s?.recentWinners ?? []).map((w, i) => (
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

          {/* Commissions de parrainage */}
          <div className="bg-slate-900 border border-white/[0.06] rounded-2xl overflow-hidden lg:col-span-2">
            <div className="px-5 py-4 border-b border-white/[0.06]">
              <h2 className="font-bold text-white">Commissions de parrainage</h2>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {(s?.recentReferrals ?? []).length === 0 && (
                <p className="px-5 py-4 text-slate-500 text-sm">Aucun parrainage</p>
              )}
              {(s?.recentReferrals ?? []).map((r, i) => (
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

        </div>
      </div>
    </div>
  );
}
