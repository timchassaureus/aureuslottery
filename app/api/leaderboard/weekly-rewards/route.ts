import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';

export const runtime = 'nodejs';

// % of weekly tickets awarded as bonus, with min and max caps
const RANK_CONFIG: Record<number, { pct: number; min: number; max: number }> = {
  1: { pct: 0.10, min: 5,  max: 200 },
  2: { pct: 0.07, min: 3,  max: 150 },
  3: { pct: 0.05, min: 2,  max: 100 },
};

async function run(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
  }
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sb = createServiceClient();

  // Idempotency: check if ANY weekly reward was already given this week
  // (checking rank1 alone was insufficient — rank2/3 could still be inserted on retry)
  const now = new Date();
  const weekStart = new Date(now.getTime() - 7 * 86400000).toISOString();
  const { data: alreadyRan } = await sb
    .from('bonus_tickets')
    .select('id')
    .like('reason', 'weekly_rank%')
    .gte('created_at', weekStart)
    .limit(1)
    .maybeSingle();

  if (alreadyRan) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'Already ran this week' });
  }

  // Get all purchases over the past 7 days
  const { data: purchases } = await sb
    .from('purchases')
    .select('wallet_address, tickets_count')
    .gte('created_at', weekStart);

  if (!purchases || purchases.length === 0) {
    return NextResponse.json({ ok: true, awarded: 0, message: 'No purchases this week' });
  }

  // Sum tickets per wallet
  const totals = new Map<string, number>();
  for (const p of purchases) {
    const w = p.wallet_address;
    totals.set(w, (totals.get(w) ?? 0) + (Number(p.tickets_count) || 1));
  }

  // Sort descending, take top 3
  const top3 = [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const results: Array<{ rank: number; wallet: string; weeklyTickets: number; bonus: number }> = [];

  for (let i = 0; i < top3.length; i++) {
    const rank = i + 1;
    const [wallet, weeklyTickets] = top3[i];
    const cfg = RANK_CONFIG[rank];
    if (!cfg) continue;

    // Proportional: % of their weekly tickets, capped between min and max
    const bonus = Math.min(cfg.max, Math.max(cfg.min, Math.round(weeklyTickets * cfg.pct)));

    await sb.from('bonus_tickets').insert({
      wallet_address: wallet,
      amount: bonus,
      reason: `weekly_rank${rank}`,
      used: false,
    });

    results.push({ rank, wallet, weeklyTickets, bonus });
  }

  return NextResponse.json({ ok: true, awarded: results.length, results });
}

export async function GET(req: NextRequest)  { return run(req); }
export async function POST(req: NextRequest) { return run(req); }
