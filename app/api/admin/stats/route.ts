import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { getPlatformBalance, getPlatformAddress } from '@/lib/payout-server';

const ADMIN_SECRET = process.env.ADMIN_SECRET || process.env.CRON_SECRET || '';

function dayKey(iso: string) { return iso.slice(0, 10); }

export async function GET(req: NextRequest) {
  const auth = req.headers.get('x-admin-secret');
  if (!ADMIN_SECRET || auth !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sb = createServiceClient();

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart  = new Date(now.getTime() - 7  * 86400000).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const thirtyAgo  = new Date(now.getTime() - 30 * 86400000).toISOString();

    const [
      { count: userCount },
      { count: purchaseCount },
      { data: allPurchases },
      { data: recentUsers },
      { data: winners },
      { data: referrals },
    ] = await Promise.all([
      sb.from('custodial_users').select('*', { count: 'exact', head: true }),
      sb.from('purchases').select('*', { count: 'exact', head: true }),
      sb.from('purchases')
        .select('wallet_address, amount_usd, tickets_count, created_at')
        .order('created_at', { ascending: true })
        .limit(50000), // prevent OOM on large datasets
      sb.from('custodial_users')
        .select('created_at')
        .gte('created_at', thirtyAgo)
        .order('created_at', { ascending: true }),
      sb.from('winners')
        .select('wallet_address, prize_usdc, amount_usd, draw_type, created_at')
        .order('created_at', { ascending: false })
        .limit(20),
      sb.from('referrals')
        .select('referrer_wallet, total_earned, total_paid, created_at')
        .order('created_at', { ascending: false })
        .limit(20),
    ]);

    const purchases = allPurchases || [];
    const users30   = recentUsers  || [];

    // ── Totaux globaux ──────────────────────────────────────────────────────
    const totalRevenue     = purchases.reduce((s, p) => s + (p.amount_usd  || 0), 0);
    const totalTickets     = purchases.reduce((s, p) => s + (p.tickets_count || 0), 0);
    const totalPaidOut     = (winners   || []).reduce((s, w) => s + (w.prize_usdc || w.amount_usd || 0), 0);
    const totalCommissions = (referrals || []).reduce((s, r) => s + (r.total_earned || 0), 0);
    const pendingCommissions = (referrals || []).reduce((s, r) =>
      s + Math.max(0, (r.total_earned || 0) - (r.total_paid || 0)), 0);

    // ── Revenus par période ─────────────────────────────────────────────────
    const revenueToday = purchases.filter(p => p.created_at >= todayStart).reduce((s, p) => s + (p.amount_usd || 0), 0);
    const revenueWeek  = purchases.filter(p => p.created_at >= weekStart ).reduce((s, p) => s + (p.amount_usd || 0), 0);
    const revenueMonth = purchases.filter(p => p.created_at >= monthStart).reduce((s, p) => s + (p.amount_usd || 0), 0);

    // ── Tickets par période ─────────────────────────────────────────────────
    const ticketsToday = purchases.filter(p => p.created_at >= todayStart).reduce((s, p) => s + (p.tickets_count || 0), 0);
    const ticketsWeek  = purchases.filter(p => p.created_at >= weekStart ).reduce((s, p) => s + (p.tickets_count || 0), 0);
    const ticketsMonth = purchases.filter(p => p.created_at >= monthStart).reduce((s, p) => s + (p.tickets_count || 0), 0);

    // ── Joueurs par période ─────────────────────────────────────────────────
    const usersToday = users30.filter(u => u.created_at >= todayStart).length;
    const usersWeek  = users30.filter(u => u.created_at >= weekStart ).length;
    const usersMonth = users30.filter(u => u.created_at >= monthStart).length;

    // ── Données graphiques (30 derniers jours) ──────────────────────────────
    type DayBucket = { revenue: number; tickets: number; newUsers: number };
    const dailyMap: Record<string, DayBucket> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      dailyMap[dayKey(d.toISOString())] = { revenue: 0, tickets: 0, newUsers: 0 };
    }

    for (const p of purchases) {
      const k = dayKey(p.created_at);
      if (dailyMap[k]) {
        dailyMap[k].revenue  += p.amount_usd    || 0;
        dailyMap[k].tickets  += p.tickets_count || 0;
      }
    }
    for (const u of users30) {
      const k = dayKey(u.created_at);
      if (dailyMap[k]) dailyMap[k].newUsers += 1;
    }

    // Jackpot cumulatif
    let cumulative = purchases
      .filter(p => p.created_at < thirtyAgo)
      .reduce((s, p) => s + (p.amount_usd || 0), 0);

    const chartData = Object.entries(dailyMap).map(([date, d]) => {
      cumulative += d.revenue;
      const dt = new Date(date);
      return {
        date,
        label:   dt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', timeZone: 'UTC' }),
        revenue: Math.round(d.revenue  * 100) / 100,
        tickets: d.tickets,
        newUsers: d.newUsers,
        jackpot: Math.round(cumulative * 100) / 100,
      };
    });

    // Solde wallet plateforme (pour paiement commissions)
    let platformBalance = 0;
    let platformAddress = '';
    try {
      platformBalance = await getPlatformBalance();
      platformAddress = getPlatformAddress();
    } catch { /* PLATFORM_PRIVATE_KEY not set */ }

    const recentPurchases = [...purchases].reverse().slice(0, 20);

    // Normalise les referrals pour l'affichage (utilise total_earned comme commission)
    const recentReferrals = (referrals || []).map(r => ({
      referrer_wallet:  r.referrer_wallet,
      commission_usdc:  r.total_earned || 0,
      total_paid:       r.total_paid   || 0,
      pending:          Math.max(0, (r.total_earned || 0) - (r.total_paid || 0)),
      created_at:       r.created_at,
    }));

    return NextResponse.json({
      users: userCount ?? 0,
      purchases: purchaseCount ?? 0,
      totalRevenue,
      totalTickets,
      totalPaidOut,
      totalCommissions,
      pendingCommissions,
      platformBalance,
      platformAddress,
      revenueToday,  revenueWeek,  revenueMonth,
      ticketsToday,  ticketsWeek,  ticketsMonth,
      usersToday,    usersWeek,    usersMonth,
      chartData,
      recentPurchases,
      recentWinners:   winners        || [],
      recentReferrals,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
