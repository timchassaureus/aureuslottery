import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';

/** GET : derniers gagnants pour le feed */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit')) || 20));
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('winners')
      .select('wallet_address, amount_usd, draw_type, draw_date')
      .order('draw_date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Winners fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      (data ?? []).map((r) => {
        const addr = r.wallet_address ?? '';
        const displayAddress = addr.length >= 10
          ? `${addr.slice(0, 6)}...${addr.slice(-4)}`
          : addr;
        return {
          wallet_address: displayAddress,
          amount_usd: Number(r.amount_usd),
          draw_type: r.draw_type,
          draw_date: r.draw_date,
        };
      })
    );
  } catch (e) {
    console.error('Winners GET error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Internal error' },
      { status: 500 }
    );
  }
}
