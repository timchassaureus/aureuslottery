import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { rateLimit } from '@/lib/rate-limit';

const ETH_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

/** GET : tickets bonus disponibles pour un wallet */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');
    if (!wallet) {
      return NextResponse.json({ error: 'wallet required' }, { status: 400 });
    }
    const normalized = wallet.toLowerCase().trim();
    if (!ETH_ADDRESS_RE.test(normalized)) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
    }

    // Rate limit : max 20 requêtes / minute par wallet
    const rl = rateLimit({ key: `bonus-tickets:${normalized}`, limit: 20, windowMs: 60_000 });
    if (!rl.ok) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('bonus_tickets')
      .select('*')
      .eq('wallet_address', normalized)
      .eq('used', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Bonus tickets fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const total = (data ?? []).reduce((sum, r) => sum + Number(r.amount || 0), 0);

    return NextResponse.json({
      tickets: data ?? [],
      totalUnused: total,
    });
  } catch (e) {
    console.error('Bonus tickets GET error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Internal error' },
      { status: 500 }
    );
  }
}
