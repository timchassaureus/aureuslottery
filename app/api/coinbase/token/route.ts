import { NextRequest, NextResponse } from 'next/server';
import { generateJwt } from '@coinbase/cdp-sdk/auth';

const ONRAMP_HOST = 'api.developer.coinbase.com';
const ONRAMP_PATH = '/onramp/v1/token';

export async function POST(req: NextRequest) {
  try {
    const { walletAddress, userAddress, count, bonusTickets, amountEur } = await req.json();

    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
    }

    const apiKeyId = process.env.CDP_API_KEY_NAME;
    const apiKeySecret = process.env.CDP_API_PRIVATE_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.aureuslottery.app';

    if (!apiKeyId || !apiKeySecret) {
      return NextResponse.json(
        { error: 'CDP API key not configured.' },
        { status: 500 }
      );
    }

    const jwt = await generateJwt({
      apiKeyId,
      apiKeySecret,
      requestMethod: 'POST',
      requestHost: ONRAMP_HOST,
      requestPath: ONRAMP_PATH,
      expiresIn: 120,
    });

    // Build redirect URL so user lands on victory page after payment
    const redirectParams = new URLSearchParams({
      source: 'coinbase',
      ...(userAddress && { wallet: userAddress }),
      ...(count && { tickets: String(count) }),
      ...(bonusTickets && { bonus: String(bonusTickets) }),
      ...(amountEur && { amount: String(amountEur) }),
    });
    const redirectUrl = `${appUrl}/victory?${redirectParams.toString()}`;

    const res = await fetch(`https://${ONRAMP_HOST}${ONRAMP_PATH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        addresses: [{ address: walletAddress, blockchains: ['base'] }],
        assets: ['USDC'],
        redirectUrl,
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
      } catch { /* keep errMessage as text */ }
      return NextResponse.json(
        { error: errMessage || 'Coinbase Pay indisponible' },
        { status: res.status }
      );
    }

    const data = await res.json();
    const token = data.token ?? data.sessionToken ?? data.data?.token;
    if (!token) {
      console.error('Coinbase token response:', data);
      return NextResponse.json({ error: 'Réponse Coinbase invalide' }, { status: 502 });
    }
    return NextResponse.json({ token });
  } catch (err) {
    console.error('Coinbase token route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
