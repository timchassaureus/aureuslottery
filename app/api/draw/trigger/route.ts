import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';

export const runtime = 'nodejs';

// Cryptographically secure integer in [0, max)
function secureRandomInt(max: number): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  // Use rejection sampling to avoid modulo bias
  const limit = 0x100000000 - (0x100000000 % max);
  // Retry if we're in the biased region (very rare)
  if (array[0] >= limit) return secureRandomInt(max);
  return array[0] % max;
}

async function runDraw(req: NextRequest) {
  // CRON_SECRET is required — never allow unauthenticated draw triggers
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured on server' }, { status: 500 });
  }
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const drawType = new URL(req.url).searchParams.get('type') || 'main';

  try {
    const supabase = createServiceClient();

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setUTCHours(23, 59, 59, 999);

    // Idempotency check — only one draw per type per day
    const { data: existingDraw } = await supabase
      .from('winners')
      .select('id')
      .gte('draw_date', todayStart.toISOString())
      .lte('draw_date', todayEnd.toISOString())
      .eq('draw_type', drawType)
      .maybeSingle();

    if (existingDraw) {
      return NextResponse.json({ error: 'Draw already run today', drawType }, { status: 409 });
    }

    // Load today's ticket purchases
    const { data: purchases, error: purchasesError } = await supabase
      .from('purchases')
      .select('wallet_address, tickets_count')
      .gte('created_at', todayStart.toISOString())
      .lte('created_at', todayEnd.toISOString());

    if (purchasesError) {
      return NextResponse.json({ error: purchasesError.message }, { status: 500 });
    }

    if (!purchases || purchases.length === 0) {
      return NextResponse.json({ winner: null, message: 'No tickets sold today', drawType }, { status: 200 });
    }

    // Build ticket pool weighted by ticket count
    const ticketPool: string[] = [];
    for (const p of purchases) {
      const count = Math.max(1, Number(p.tickets_count) || 1);
      for (let i = 0; i < count; i++) {
        ticketPool.push(p.wallet_address);
      }
    }

    const totalTickets = ticketPool.length;

    if (drawType === 'main') {
      // Main jackpot — 1 winner gets 85% of the pot
      const winnerIndex = secureRandomInt(totalTickets);
      const winnerAddress = ticketPool[winnerIndex];
      const prizeUsd = Math.floor(totalTickets * 0.85 * 100) / 100;

      const { error: insertError } = await supabase.from('winners').insert({
        wallet_address: winnerAddress,
        amount_usd: prizeUsd,
        draw_type: 'main',
        draw_date: now.toISOString(),
      });

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        drawType: 'main',
        winner: winnerAddress,
        prize: prizeUsd,
        totalTickets,
        timestamp: now.toISOString(),
      });
    }

    if (drawType === 'bonus') {
      // Bonus draw — up to 25 unique winners share 5% of total
      const bonusPot = Math.floor(totalTickets * 0.05 * 100) / 100;
      const numWinners = Math.min(25, totalTickets);
      const prizePerWinner = Math.floor((bonusPot / numWinners) * 100) / 100;

      // Shuffle pool with Fisher-Yates using secure random
      const pool = [...ticketPool];
      for (let i = pool.length - 1; i > 0; i--) {
        const j = secureRandomInt(i + 1);
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }

      // Pick unique wallet addresses (first occurrence per address)
      const seenAddresses = new Set<string>();
      const winnerAddresses: string[] = [];
      for (const addr of pool) {
        if (!seenAddresses.has(addr)) {
          seenAddresses.add(addr);
          winnerAddresses.push(addr);
        }
        if (winnerAddresses.length >= numWinners) break;
      }

      const rows = winnerAddresses.map((addr) => ({
        wallet_address: addr,
        amount_usd: prizePerWinner,
        draw_type: 'bonus',
        draw_date: now.toISOString(),
      }));

      const { error: insertError } = await supabase.from('winners').insert(rows);
      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        drawType: 'bonus',
        winners: winnerAddresses,
        prizePerWinner,
        bonusPot,
        totalTickets,
        timestamp: now.toISOString(),
      });
    }

    return NextResponse.json({ error: 'Unknown draw type' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}

// GET: called by Vercel cron scheduler
export async function GET(req: NextRequest) {
  return runDraw(req);
}

// POST: called manually (e.g. admin trigger)
export async function POST(req: NextRequest) {
  return runDraw(req);
}
