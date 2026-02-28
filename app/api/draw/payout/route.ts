import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { sendUSDC, getPlatformBalance } from '@/lib/payout-server';

export const runtime = 'nodejs';

const MIN_PAYOUT_USD = 0.01; // Skip dust amounts
const OWNER_WALLET = '0xa166D2570d4bBfACcEBE7A78a426991b1Fa8f6eC'; // Ledger — receives 10% owner share

async function run(req: NextRequest) {
  // Require CRON_SECRET — same pattern as draw/trigger and commissions/pay
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
  }
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sb = createServiceClient();

  // Fetch all unpaid winners (tx_hash IS NULL)
  const { data: unpaidWinners, error } = await sb
    .from('winners')
    .select('id, wallet_address, amount_usd, draw_type, draw_date')
    .is('tx_hash', null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!unpaidWinners || unpaidWinners.length === 0) {
    return NextResponse.json({ ok: true, paid: 0, message: 'No unpaid winners' });
  }

  // Check platform balance before starting
  let balance = 0;
  try {
    balance = await getPlatformBalance();
  } catch (e) {
    return NextResponse.json(
      { error: `Cannot read platform balance: ${e instanceof Error ? e.message : 'unknown'}` },
      { status: 500 }
    );
  }

  const totalOwed = unpaidWinners.reduce((s, w) => s + Number(w.amount_usd), 0);
  if (balance < totalOwed) {
    return NextResponse.json(
      {
        error: 'Insufficient platform balance',
        balance,
        totalOwed,
        shortfall: totalOwed - balance,
      },
      { status: 402 }
    );
  }

  const paid: Array<{ id: string; wallet: string; amount: number; txHash: string }> = [];
  const failed: Array<{ id: string; wallet: string; amount: number; reason: string }> = [];

  for (const winner of unpaidWinners) {
    const amount = Number(winner.amount_usd);
    if (amount < MIN_PAYOUT_USD) {
      // Mark as paid with sentinel value to skip it permanently
      await sb.from('winners').update({ tx_hash: 'SKIPPED_DUST' }).eq('id', winner.id);
      continue;
    }

    try {
      const txHash = await sendUSDC(winner.wallet_address, amount);

      // Record tx hash — marks the winner as paid
      await sb.from('winners').update({ tx_hash: txHash }).eq('id', winner.id);

      paid.push({ id: winner.id, wallet: winner.wallet_address, amount, txHash });
    } catch (e) {
      const reason = e instanceof Error ? e.message : 'unknown';
      console.error(`Payout failed for ${winner.wallet_address}: ${reason}`);
      failed.push({ id: winner.id, wallet: winner.wallet_address, amount, reason });
      // Continue to next winner — don't abort the whole batch on one failure
    }
  }

  // Send 10% owner share to Ledger
  // Get today's total pool from purchases
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const { data: todayPurchases } = await sb
    .from('purchases')
    .select('tickets_count')
    .gte('created_at', todayStart.toISOString());

  let ownerTxHash: string | null = null;
  let ownerShare = 0;
  if (todayPurchases && todayPurchases.length > 0) {
    const totalTickets = todayPurchases.reduce((s, p) => s + (Number(p.tickets_count) || 1), 0);
    ownerShare = Math.floor(totalTickets * 0.10 * 100) / 100;
    if (ownerShare >= MIN_PAYOUT_USD) {
      try {
        ownerTxHash = await sendUSDC(OWNER_WALLET, ownerShare);
      } catch (e) {
        console.error('Owner payout failed:', e instanceof Error ? e.message : e);
      }
    }
  }

  return NextResponse.json({
    ok: true,
    paid: paid.length,
    failed: failed.length,
    totalPaidUsd: paid.reduce((s, p) => s + p.amount, 0),
    ownerShare,
    ownerTxHash,
    results: { paid, failed },
  });
}

export async function GET(req: NextRequest)  { return run(req); }
export async function POST(req: NextRequest) { return run(req); }
