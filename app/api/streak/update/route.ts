import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { startOfDay } from 'date-fns';

const MILESTONES: Record<number, number> = {
  3: 1,
  5: 2,
  7: 5,
  14: 10,
  30: 20,
};
const ETH_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

/** POST : met à jour le streak après un achat. Retourne le nouveau streak et les bonus tickets accordés. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const walletAddress = body?.walletAddress as string | undefined;
    if (!walletAddress || typeof walletAddress !== 'string') {
      return NextResponse.json(
        { error: 'walletAddress is required' },
        { status: 400 }
      );
    }
    const normalized = walletAddress.toLowerCase().trim();
    if (!ETH_ADDRESS_RE.test(normalized)) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
    }
    const supabase = createServiceClient();
    const today = startOfDay(new Date());
    const yesterday = startOfDay(new Date(today.getTime() - 86400000));

    const { data: row, error: fetchErr } = await supabase
      .from('streaks')
      .select('*')
      .eq('wallet_address', normalized)
      .single();

    if (fetchErr && fetchErr.code !== 'PGRST116') {
      console.error('Streak fetch error:', fetchErr);
      return NextResponse.json(
        { error: fetchErr.message },
        { status: 500 }
      );
    }

    const lastPlayDate = row?.last_play_date
      ? startOfDay(new Date(row.last_play_date))
      : null;
    const prevStreak = row?.current_streak ?? 0;
    const longestSoFar = row?.longest_streak ?? 0;
    const totalBonusSoFar = row?.total_bonus_tickets ?? 0;

    let newStreak: number;
    if (!lastPlayDate) {
      newStreak = 1;
    } else if (lastPlayDate.getTime() === today.getTime()) {
      newStreak = prevStreak;
    } else if (lastPlayDate.getTime() === yesterday.getTime()) {
      newStreak = prevStreak + 1;
    } else {
      newStreak = 1;
    }

    const newLongest = Math.max(longestSoFar, newStreak);
    const bonusGranted = MILESTONES[newStreak] ?? 0;

    if (!row?.id) {
      await supabase.from('streaks').insert({
        wallet_address: normalized,
        current_streak: newStreak,
        longest_streak: newLongest,
        last_play_date: today.toISOString().slice(0, 10),
        total_bonus_tickets: totalBonusSoFar + bonusGranted,
      });
      if (bonusGranted) {
        await supabase.from('bonus_tickets').insert({
          wallet_address: normalized,
          amount: bonusGranted,
          reason: `streak_${newStreak}`,
          used: false,
        });
      }
    } else {
      if (bonusGranted) {
        await supabase.from('bonus_tickets').insert({
          wallet_address: normalized,
          amount: bonusGranted,
          reason: `streak_${newStreak}`,
          used: false,
        });
      }
      await supabase
        .from('streaks')
        .update({
          current_streak: newStreak,
          longest_streak: newLongest,
          last_play_date: today.toISOString().slice(0, 10),
          total_bonus_tickets: totalBonusSoFar + bonusGranted,
        })
        .eq('wallet_address', normalized);
    }

    return NextResponse.json({
      currentStreak: newStreak,
      longestStreak: newLongest,
      bonusTicketsGranted: bonusGranted,
      streakRewardJustUnlocked: bonusGranted > 0,
    });
  } catch (e) {
    console.error('Streak update error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Internal error' },
      { status: 500 }
    );
  }
}
