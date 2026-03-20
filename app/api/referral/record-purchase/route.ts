import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { rateLimit } from '@/lib/rate-limit';
import { startOfDay } from 'date-fns';

const COMMISSION_RATE = 0.03; // 3%
const ETH_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;
const MILESTONES: Record<number, number> = { 3: 1, 5: 2, 7: 5, 14: 10, 30: 20 };

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const walletAddress = body?.walletAddress as string | undefined;

    // Rate limit : max 10 achats par wallet par minute (anti-spam)
    if (walletAddress && typeof walletAddress === 'string') {
      const rl = rateLimit({
        key: `record-purchase:wallet:${walletAddress.toLowerCase()}`,
        limit: 10,
        windowMs: 60_000,
      });
      if (!rl.ok) {
        return NextResponse.json(
          { error: 'Too many purchase requests — please wait a moment' },
          { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
        );
      }
    }
    const amountUsd = body?.amountUsd as number | undefined;
    const ticketsCount = body?.ticketsCount as number | undefined;
    const referralCode = body?.referralCode as string | null | undefined;
    const bonusTickets = Math.max(0, Math.min(50, Number(body?.bonusTickets) || 0));

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

    // Deduplication: reject identical wallet+amount within 5 minutes (covers payment retries)
    const oneMinuteAgo = new Date(Date.now() - 300_000).toISOString();
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

    // 1b) Bonus tickets from pack purchase
    if (bonusTickets > 0) {
      await supabase.from('bonus_tickets').insert({
        wallet_address: normalizedBuyer,
        amount: bonusTickets,
        reason: 'pack_bonus',
        used: false,
      });
    }

    // 2) Mise à jour du streak — logique inline pour éviter l'auto-fetch HTTP fragile
    // (l'appel HTTP interne échouait souvent en production car NEXT_PUBLIC_APP_URL n'est pas défini côté serveur)
    try {
      const today = startOfDay(new Date());
      const yesterday = startOfDay(new Date(today.getTime() - 86400000));

      const { data: streakRow, error: streakFetchErr } = await supabase
        .from('streaks')
        .select('*')
        .eq('wallet_address', normalizedBuyer)
        .single();

      if (!streakFetchErr || streakFetchErr.code === 'PGRST116') {
        const lastPlayDate = streakRow?.last_play_date
          ? startOfDay(new Date(streakRow.last_play_date))
          : null;
        const prevStreak = streakRow?.current_streak ?? 0;
        const longestSoFar = streakRow?.longest_streak ?? 0;
        const totalBonusSoFar = streakRow?.total_bonus_tickets ?? 0;

        let newStreak: number;
        if (!lastPlayDate) {
          newStreak = 1;
        } else if (lastPlayDate.getTime() === today.getTime()) {
          newStreak = prevStreak; // déjà joué aujourd'hui — pas de mise à jour
        } else if (lastPlayDate.getTime() === yesterday.getTime()) {
          newStreak = prevStreak + 1;
        } else {
          newStreak = 1; // streak cassé
        }

        const newLongest = Math.max(longestSoFar, newStreak);
        const isNewDay = !lastPlayDate || lastPlayDate.getTime() !== today.getTime();
        const bonusGranted = isNewDay ? ((MILESTONES[newStreak] ?? 0) + 1) : 0;

        if (!streakRow?.id) {
          await supabase.from('streaks').insert({
            wallet_address: normalizedBuyer,
            current_streak: newStreak,
            longest_streak: newLongest,
            last_play_date: today.toISOString().slice(0, 10),
            total_bonus_tickets: totalBonusSoFar + bonusGranted,
          });
        } else {
          await supabase.from('streaks').update({
            current_streak: newStreak,
            longest_streak: newLongest,
            last_play_date: today.toISOString().slice(0, 10),
            total_bonus_tickets: totalBonusSoFar + bonusGranted,
          }).eq('wallet_address', normalizedBuyer);
        }

        if (bonusGranted > 0 && isNewDay) {
          await supabase.from('bonus_tickets').insert({
            wallet_address: normalizedBuyer,
            amount: bonusGranted,
            reason: `streak_${newStreak}`,
            used: false,
          });
        }
      }
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
