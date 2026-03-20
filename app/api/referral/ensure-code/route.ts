import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { rateLimit } from '@/lib/rate-limit';

const CODE_PREFIX = 'AUR-';
const CODE_LENGTH = 5;
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ETH_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

function generateCode(): string {
  const bytes = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(bytes);
  let s = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    s += CHARS[bytes[i] % CHARS.length];
  }
  return CODE_PREFIX + s;
}

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

    // Rate limit : max 5 requêtes / minute par wallet (cette route est appelée à la connexion seulement)
    const rl = rateLimit({ key: `ensure-code:${normalized}`, limit: 5, windowMs: 60_000 });
    if (!rl.ok) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const supabase = createServiceClient();

    const { data: existing } = await supabase
      .from('referral_codes')
      .select('code')
      .eq('wallet_address', normalized)
      .single();

    if (existing?.code) {
      return NextResponse.json({ code: existing.code });
    }

    let code = generateCode();
    let attempts = 0;
    const maxAttempts = 10;
    while (attempts < maxAttempts) {
      const { error: insertError } = await supabase
        .from('referral_codes')
        .insert({ wallet_address: normalized, code });
      if (!insertError) {
        return NextResponse.json({ code });
      }
      if (insertError.code === '23505') {
        code = generateCode();
        attempts++;
        continue;
      }
      return NextResponse.json(
        { error: insertError.message || 'Failed to create referral code' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Could not generate unique code' },
      { status: 500 }
    );
  } catch (e) {
    console.error('Referral ensure-code error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Internal error' },
      { status: 500 }
    );
  }
}
