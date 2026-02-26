import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';

const ADMIN_SECRET = process.env.ADMIN_SECRET || process.env.CRON_SECRET || '';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('x-admin-secret');
  if (!ADMIN_SECRET || auth !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sb = createServiceClient();

    const [
      { count: userCount },
      { count: purchaseCount },
      { data: purchases },
      { data: winners },
      { data: referrals },
    ] = await Promise.all([
      sb.from('custodial_users').select('*', { count: 'exact', head: true }),
      sb.from('purchases').select('*', { count: 'exact', head: true }),
      sb.from('purchases').select('wallet_address, amount_usdc, ticket_count, created_at').order('created_at', { ascending: false }).limit(20),
      sb.from('winners').select('wallet_address, prize_usdc, draw_type, created_at').order('created_at', { ascending: false }).limit(20),
      sb.from('referrals').select('referrer_wallet, commission_usdc, created_at').order('created_at', { ascending: false }).limit(20),
    ]);

    const totalRevenue = (purchases || []).reduce((sum, p) => sum + (p.amount_usdc || 0), 0);
    const totalTickets = (purchases || []).reduce((sum, p) => sum + (p.ticket_count || 0), 0);
    const totalPaidOut = (winners || []).reduce((sum, w) => sum + (w.prize_usdc || 0), 0);
    const totalCommissions = (referrals || []).reduce((sum, r) => sum + (r.commission_usdc || 0), 0);

    return NextResponse.json({
      users: userCount ?? 0,
      purchases: purchaseCount ?? 0,
      totalRevenue,
      totalTickets,
      totalPaidOut,
      totalCommissions,
      recentPurchases: purchases || [],
      recentWinners: winners || [],
      recentReferrals: referrals || [],
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
