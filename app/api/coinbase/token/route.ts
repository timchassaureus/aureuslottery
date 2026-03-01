import { NextRequest, NextResponse } from 'next/server';
import { generateJwt } from '@coinbase/cdp-sdk/auth';

// Onramp token API: JWT must be generated with this exact method + host + path (CDP requirement)
const ONRAMP_HOST = 'api.developer.coinbase.com';
const ONRAMP_PATH = '/onramp/v1/token';

export async function POST(req: NextRequest) {
  try {
    const { walletAddress } = await req.json();

    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
    }

    const apiKeyId = process.env.CDP_API_KEY_NAME;
    const apiKeySecret = process.env.CDP_API_PRIVATE_KEY;

    if (!apiKeyId || !apiKeySecret) {
      return NextResponse.json(
        { error: 'CDP API key not configured. Set CDP_API_KEY_NAME (Key ID) and CDP_API_PRIVATE_KEY (Key Secret).' },
        { status: 500 }
      );
    }

    // Use official CDP SDK so JWT format and key handling match exactly (fixes 401)
    const jwt = await generateJwt({
      apiKeyId,
      apiKeySecret,
      requestMethod: 'POST',
      requestHost: ONRAMP_HOST,
      requestPath: ONRAMP_PATH,
      expiresIn: 120,
    });

    const res = await fetch(`https://${ONRAMP_HOST}${ONRAMP_PATH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        addresses: [
          { address: walletAddress, blockchains: ['base'] },
        ],
        assets: ['USDC'],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Coinbase token error:', res.status, text);
      let errMessage = text;
      try {
        const parsed = JSON.parse(text);
        if (parsed?.error?.message) errMessage = parsed.error.message;
        else if (parsed?.message) errMessage = parsed.message;
      } catch {
        // keep errMessage as text
      }
      return NextResponse.json(
        { error: errMessage || 'Coinbase Pay indisponible' },
        { status: res.status }
      );
    }

    const data = await res.json();
    const token = data.token ?? data.sessionToken ?? data.data?.token;
    if (!token) {
      console.error('Coinbase token response:', data);
      return NextResponse.json(
        { error: 'Réponse Coinbase invalide (pas de token)' },
        { status: 502 }
      );
    }
    return NextResponse.json({ token });
  } catch (err) {
    console.error('Coinbase token route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
