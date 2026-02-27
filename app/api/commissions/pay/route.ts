import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { sendUSDC, getPlatformBalance } from '@/lib/payout-server';

export const runtime = 'nodejs';

const MIN_PAYOUT = 0.50; // Seuil minimum de versement : $0.50

async function run(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
  }
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Si PLATFORM_PRIVATE_KEY n'est pas configuré, on skip silencieusement
  if (!process.env.PLATFORM_PRIVATE_KEY) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: 'PLATFORM_PRIVATE_KEY not configured — commissions tracked but not auto-paid',
    });
  }

  const sb = createServiceClient();

  // Vérifier le solde du wallet plateforme
  let platformBalance = 0;
  try {
    platformBalance = await getPlatformBalance();
  } catch (err) {
    return NextResponse.json({ error: `Cannot read platform balance: ${String(err)}` }, { status: 500 });
  }

  // Charger toutes les commissions non encore versées
  const { data: referrals, error } = await sb
    .from('referrals')
    .select('referrer_wallet, referred_wallet, total_earned, total_paid');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Regrouper par wallet referrer et calculer le montant dû
  const payoutMap: Record<string, {
    amount: number;
    rows: Array<{ referred_wallet: string; total_earned: number }>;
  }> = {};

  for (const r of referrals || []) {
    const owed = (Number(r.total_earned) || 0) - (Number(r.total_paid) || 0);
    if (owed < MIN_PAYOUT) continue;
    if (!payoutMap[r.referrer_wallet]) {
      payoutMap[r.referrer_wallet] = { amount: 0, rows: [] };
    }
    payoutMap[r.referrer_wallet].amount += owed;
    payoutMap[r.referrer_wallet].rows.push({
      referred_wallet: r.referred_wallet,
      total_earned: Number(r.total_earned),
    });
  }

  const entries = Object.entries(payoutMap);
  if (entries.length === 0) {
    return NextResponse.json({ ok: true, paid: 0, message: 'Aucune commission en attente' });
  }

  const totalOwed = entries.reduce((s, [, v]) => s + v.amount, 0);
  if (platformBalance < totalOwed) {
    return NextResponse.json({
      ok: false,
      error: `Solde insuffisant : $${platformBalance.toFixed(2)} disponible, $${totalOwed.toFixed(2)} dû`,
      platformBalance,
      totalOwed,
    }, { status: 400 });
  }

  // Payer chaque referrer
  const results: Array<{ wallet: string; amount: number; txHash?: string; error?: string }> = [];

  for (const [wallet, { amount, rows }] of entries) {
    try {
      const txHash = await sendUSDC(wallet, amount);

      // Marquer comme payé dans Supabase
      for (const row of rows) {
        await sb
          .from('referrals')
          .update({
            total_paid: row.total_earned,
            last_paid_at: new Date().toISOString(),
          })
          .eq('referrer_wallet', wallet)
          .eq('referred_wallet', row.referred_wallet);
      }

      results.push({ wallet, amount, txHash });
    } catch (err) {
      results.push({ wallet, amount, error: String(err) });
    }
  }

  const paid   = results.filter(r => !r.error).length;
  const failed = results.filter(r =>  r.error).length;

  return NextResponse.json({ ok: true, paid, failed, totalOwed, results });
}

export async function GET(req: NextRequest)  { return run(req); }
export async function POST(req: NextRequest) { return run(req); }
