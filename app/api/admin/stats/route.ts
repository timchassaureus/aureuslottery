import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';

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
    const todayStart  = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart   = new Date(now.getTime() - 7  * 86400000).toISOString();
    const monthStart  = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const thirtyAgo   = new Date(now.getTime() - 30 * 86400000).toISOString();

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
        .select('wallet_address, amount_usdc, ticket_count, created_at')
        .order('created_at', { ascending: true }),
      sb.from('custodial_users')
        .select('created_at')
        .gte('created_at', thirtyAgo)
        .order('created_at', { ascending: true }),
      sb.from('winners')
        .select('wallet_address, prize_usdc, draw_type, created_at')
        .order('created_at', { ascending: false })
        .limit(20),
      sb.from('referrals')
        .select('referrer_wallet, commission_usdc, created_at')
        .order('created_at', { ascending: false })
        .limit(20),
    ]);

    const purchases = allPurchases || [];
    const users30   = recentUsers   || [];

    // ── Totaux globaux ──────────────────────────────────────────────────────
    const totalRevenue     = purchases.reduce((s, p) => s + (p.amount_usdc  || 0), 0);
    const totalTickets     = purchases.reduce((s, p) => s + (p.ticket_count || 0), 0);
    const totalPaidOut     = (winners   || []).reduce((s, w) => s + (w.prize_usdc      || 0), 0);
    const totalCommissions = (referrals || []).reduce((s, r) => s + (r.commission_usdc || 0), 0);

    // ── Revenus par période ─────────────────────────────────────────────────
    const revenueToday = purchases.filter(p => p.created_at >= todayStart).reduce((s, p) => s + (p.amount_usdc || 0), 0);
    const revenueWeek  = purchases.filter(p => p.created_at >= weekStart ).reduce((s, p) => s + (p.amount_usdc || 0), 0);
    const revenueMonth = purchases.filter(p => p.created_at >= monthStart).reduce((s, p) => s + (p.amount_usdc || 0), 0);

    // ── Tickets par période ─────────────────────────────────────────────────
    const ticketsToday = purchases.filter(p => p.created_at >= todayStart).reduce((s, p) => s + (p.ticket_count || 0), 0);
    const ticketsWeek  = purchases.filter(p => p.created_at >= weekStart ).reduce((s, p) => s + (p.ticket_count || 0), 0);
    const ticketsMonth = purchases.filter(p => p.created_at >= monthStart).reduce((s, p) => s + (p.ticket_count || 0), 0);

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
        dailyMap[k].revenue  += p.amount_usdc  || 0;
        dailyMap[k].tickets  += p.ticket_count || 0;
      }
    }
    for (const u of users30) {
      const k = dayKey(u.created_at);
      if (dailyMap[k]) dailyMap[k].newUsers += 1;
    }

    // Jackpot cumulatif (somme de tous les revenus jusqu'à chaque jour)
    let cumulative = purchases
      .filter(p => p.created_at < thirtyAgo)
      .reduce((s, p) => s + (p.amount_usdc || 0), 0);

    const chartData = Object.entries(dailyMap).map(([date, d]) => {
      cumulative += d.revenue;
      const dt = new Date(date);
      return {
        date,
        label: dt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
        revenue:  Math.round(d.revenue  * 100) / 100,
        tickets:  d.tickets,
        newUsers: d.newUsers,
        jackpot:  Math.round(cumulative * 100) / 100,
      };
    });

    // Top 20 récents pour les tableaux
    const recentPurchases = [...purchases].reverse().slice(0, 20);

    return NextResponse.json({
      users: userCount ?? 0,
      purchases: purchaseCount ?? 0,
      totalRevenue,
      totalTickets,
      totalPaidOut,
      totalCommissions,
      revenueToday,
      revenueWeek,
      revenueMonth,
      ticketsToday,
      ticketsWeek,
      ticketsMonth,
      usersToday,
      usersWeek,
      usersMonth,
      chartData,
      recentPurchases,
      recentWinners:   winners   || [],
      recentReferrals: referrals || [],
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
