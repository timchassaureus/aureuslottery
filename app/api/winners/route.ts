import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

// Cache in-memory — winners ne changent qu'une fois par jour après le tirage.
// Réduit drastiquement les appels Supabase quand 1 000 utilisateurs sont connectés.
let cachedWinners: unknown[] | null = null;
let cacheExpiresAt = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 secondes

/** GET : derniers gagnants pour le feed */
export async function GET(request: Request) {
  try {
    // Rate limit : max 30 requêtes / minute par IP
    const ip = getClientIp(request);
    const rl = rateLimit({ key: `winners:ip:${ip}`, limit: 30, windowMs: 60_000 });
    if (!rl.ok) {
      return NextResponse.json(
        { error: 'Too many requests — please slow down' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
            'X-RateLimit-Limit': '30',
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit')) || 20));

    // Servir depuis le cache si encore frais (limit=20 par défaut uniquement)
    const now = Date.now();
    if (limit === 20 && cachedWinners && now < cacheExpiresAt) {
      return NextResponse.json(cachedWinners, {
        headers: {
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=30',
          'X-Cache': 'HIT',
        },
      });
    }

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

    const mapped = (data ?? []).map((r) => {
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
    });

    // Stocker en cache (uniquement pour limit=20)
    if (limit === 20) {
      cachedWinners = mapped;
      cacheExpiresAt = now + CACHE_TTL_MS;
    }

    return NextResponse.json(mapped, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=30',
        'X-Cache': 'MISS',
      },
    });
  } catch (e) {
    console.error('Winners GET error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Internal error' },
      { status: 500 }
    );
  }
}
