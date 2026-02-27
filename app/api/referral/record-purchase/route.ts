import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';

const COMMISSION_RATE = 0.03; // 3%
const ETH_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const walletAddress = body?.walletAddress as string | undefined;
    const amountUsd = body?.amountUsd as number | undefined;
    const ticketsCount = body?.ticketsCount as number | undefined;
    const referralCode = body?.referralCode as string | null | undefined;

    if (!walletAddress || typeof walletAddress !== 'string') {
      return NextResponse.json(
        { error: 'walletAddress is required' },
        { status: 400 }
      );
    }
    const normalizedBuyer = walletAddress.toLowerCase().trim();
    if (!ETH_ADDRESS_RE.test(normalizedBuyer)) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
    }
    const amount = Number(amountUsd);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'amountUsd must be a positive number' },
        { status: 400 }
      );
    }
    // Hard cap: max $500 per single purchase
    if (amount > 500) {
      return NextResponse.json(
        { error: 'Amount exceeds maximum per transaction ($500)' },
        { status: 400 }
      );
    }
    const count = Math.max(1, Math.min(500, Number(ticketsCount) || 1));

    const supabase = createServiceClient();

    // Deduplication: reject identical wallet+amount within 60 seconds
    const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
    const { data: recentDup } = await supabase
      .from('purchases')
      .select('id')
      .eq('wallet_address', normalizedBuyer)
      .eq('amount_usd', amount)
      .gte('created_at', oneMinuteAgo)
      .limit(1)
      .maybeSingle();
    if (recentDup) {
      return NextResponse.json({ error: 'Duplicate purchase detected' }, { status: 409 });
    }

    const codeToSave =
      referralCode && typeof referralCode === 'string'
        ? referralCode.trim().toUpperCase()
        : null;

    // 1) Insert purchase (colonnes amount_usd + tickets_count ; fallback amount si ancienne table)
    const purchaseRow: Record<string, unknown> = {
      wallet_address: normalizedBuyer,
      amount_usd: amount,
      tickets_count: count,
      referral_code: codeToSave,
    };
    const { error: insertPurchaseError } = await supabase
      .from('purchases')
      .insert(purchaseRow as never);
    if (insertPurchaseError) {
      const tryAmount = insertPurchaseError.message?.includes('amount_usd')
        ? { ...purchaseRow, amount: amount, amount_usd: undefined }
        : purchaseRow;
      delete (tryAmount as Record<string, unknown>).tickets_count;
      const { error: retry } = await supabase.from('purchases').insert(tryAmount as never);
      if (retry) {
        console.error('Insert purchase error:', insertPurchaseError, retry);
        return NextResponse.json(
          { error: insertPurchaseError.message },
          { status: 500 }
        );
      }
    }

    // 2) Mise à jour du streak (appel interne, non-bloquant)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.url?.split('/api')[0] || 'http://localhost:3000';
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      await fetch(`${baseUrl}/api/streak/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: normalizedBuyer }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (e) {
      console.warn('Streak update failed (non-blocking):', e);
    }

    // 3) Premier achat avec referral → 1 ticket bonus welcome
    if (codeToSave && codeToSave.startsWith('AUR-')) {
      const { count: purchaseCount } = await supabase
        .from('purchases')
        .select('*', { count: 'exact', head: true })
        .eq('wallet_address', normalizedBuyer);
      if (purchaseCount === 1) {
        await supabase.from('bonus_tickets').insert({
          wallet_address: normalizedBuyer,
          amount: 1,
          reason: 'referral_welcome',
          used: false,
        });
      }
    }

    // 4) Commission 3% au referrer
    if (!codeToSave || !codeToSave.startsWith('AUR-')) {
      return NextResponse.json({ ok: true, commission: 0 });
    }

    const { data: referrerRow } = await supabase
      .from('referral_codes')
      .select('wallet_address')
      .eq('code', codeToSave)
      .single();

    if (!referrerRow?.wallet_address) {
      return NextResponse.json({ ok: true, commission: 0 });
    }

    const referrerWallet = referrerRow.wallet_address.toLowerCase();
    if (referrerWallet === normalizedBuyer) {
      return NextResponse.json({ ok: true, commission: 0 });
    }

    const commission = amount * COMMISSION_RATE;

    const { data: existingReferral } = await supabase
      .from('referrals')
      .select('id, total_earned')
      .eq('referrer_wallet', referrerWallet)
      .eq('referred_wallet', normalizedBuyer)
      .single();

    if (existingReferral) {
      const newTotal =
        (Number(existingReferral.total_earned) || 0) + commission;
      await supabase
        .from('referrals')
        .update({ total_earned: newTotal })
        .eq('id', existingReferral.id);
    } else {
      await supabase.from('referrals').insert({
        referrer_wallet: referrerWallet,
        referred_wallet: normalizedBuyer,
        total_earned: commission,
      });
    }

    return NextResponse.json({ ok: true, commission });
  } catch (e) {
    console.error('Record purchase error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Internal error' },
      { status: 500 }
    );
  }
}
