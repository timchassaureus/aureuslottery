import { NextRequest, NextResponse } from 'next/server';
import { createPrivateKey, randomBytes, sign } from 'crypto';

function generateCDPJWT(keyId: string, privateKeyBase64: string): string {
  const now = Math.floor(Date.now() / 1000);
  const nonce = randomBytes(16).toString('hex');

  const header = Buffer.from(
    JSON.stringify({ alg: 'EdDSA', kid: keyId, nonce })
  ).toString('base64url');

  const payload = Buffer.from(
    JSON.stringify({
      iss: 'cdp',
      sub: keyId,
      nbf: now,
      exp: now + 120,
      uri: 'POST api.developer.coinbase.com/onramp/v1/token',
    })
  ).toString('base64url');

  const message = `${header}.${payload}`;

  // Ed25519: 64-byte keypair → take first 32 bytes (private scalar)
  const rawKey = Buffer.from(privateKeyBase64, 'base64').slice(0, 32);

  // Wrap in PKCS8 DER for Ed25519 (OID 1.3.101.112)
  const pkcs8Prefix = Buffer.from('302e020100300506032b657004220420', 'hex');
  const der = Buffer.concat([pkcs8Prefix, rawKey]);

  const keyObject = createPrivateKey({ key: der, format: 'der', type: 'pkcs8' });
  const signature = sign(null, Buffer.from(message), keyObject).toString('base64url');

  return `${message}.${signature}`;
}

export async function POST(req: NextRequest) {
  try {
    const { walletAddress, amountUsd } = await req.json();

    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
    }

    const keyId = process.env.CDP_API_KEY_NAME;
    const privateKey = process.env.CDP_API_PRIVATE_KEY;

    if (!keyId || !privateKey) {
      return NextResponse.json(
        { error: 'CDP API key not configured on server' },
        { status: 500 }
      );
    }

    const jwt = generateCDPJWT(keyId, privateKey);

    const res = await fetch('https://api.developer.coinbase.com/onramp/v1/token', {
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
