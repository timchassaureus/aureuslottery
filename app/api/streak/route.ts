import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';

/** GET : récupère le streak pour un wallet */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');
    if (!wallet) {
      return NextResponse.json({ error: 'wallet required' }, { status: 400 });
    }
    const normalized = wallet.toLowerCase().trim();
    const supabase = createServiceClient();

    const { data: row, error } = await supabase
      .from('streaks')
      .select('*')
      .eq('wallet_address', normalized)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Streak fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const currentStreak = row?.current_streak ?? 0;
    const longestStreak = row?.longest_streak ?? 0;

    // Prochaine récompense (palier suivant)
    const milestones = [3, 5, 7, 14, 30];
    const nextMilestone = milestones.find((m) => m > currentStreak) ?? 30;
    const nextRewardAt = nextMilestone;

    // Check for recent weekly rank reward (last 8 days) — used to show notification to user
    const eightDaysAgo = new Date(Date.now() - 8 * 86400000).toISOString();
    const { data: weeklyReward } = await supabase
      .from('bonus_tickets')
      .select('amount, reason, created_at')
      .eq('wallet_address', normalized)
      .like('reason', 'weekly_rank%')
      .gte('created_at', eightDaysAgo)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return NextResponse.json({
      currentStreak,
      longestStreak,
      lastPlayDate: row?.last_play_date ?? null,
      totalBonusTickets: row?.total_bonus_tickets ?? 0,
      nextRewardAt,
      weeklyRankReward: weeklyReward
        ? { rank: Number(weeklyReward.reason.replace('weekly_rank', '')), amount: weeklyReward.amount, awardedAt: weeklyReward.created_at }
        : null,
    });
  } catch (e) {
    console.error('Streak GET error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Internal error' },
      { status: 500 }
    );
  }
}
