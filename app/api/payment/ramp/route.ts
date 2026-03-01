import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route pour Ramp Network (crypto on-ramp)
 * Ramp permet d'acheter de la crypto avec carte bancaire — accepte le gaming / loterie
 * Doc: https://docs.ramp.network/web/quick-start-hosted
 */

const RAMP_BASE = 'https://app.rampnetwork.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userAddress, amount, currency = 'USD' } = body;

    const rampApiKey = process.env.NEXT_PUBLIC_RAMP_API_KEY || '';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_URL || '';

    if (!rampApiKey) {
      return NextResponse.json(
        { success: false, error: 'Ramp API key not configured' },
        { status: 500 }
      );
    }

    // Ramp exige hostAppName et hostLogoUrl
    const logoUrl = appUrl ? `${appUrl.replace(/\/$/, '')}/icon.png` : 'https://aureuslottery.app/icon.png';

    // Montant fiat en unités (ex: 10.00 USD → 1000)
    const amountUsd = Number(amount);
    const inAssetValue = Math.round(amountUsd * 100).toString();

    const params = new URLSearchParams({
      hostApiKey: rampApiKey,
      hostAppName: 'Aureus Lottery',
      hostLogoUrl: logoUrl,
      userAddress: userAddress || '',
      defaultFlow: 'ONRAMP',
      inAsset: currency === 'EUR' ? 'EUR' : 'USD',
      inAssetValue,
      outAsset: 'BASE_USDC',
      ...(appUrl ? { finalUrl: `${appUrl.replace(/\/$/, '')}/deposit-success` } : {}),
    });

    const rampUrl = `${RAMP_BASE}?${params.toString()}`;

    return NextResponse.json({
      success: true,
      rampUrl,
      message: 'Redirect to Ramp for payment',
    });
  } catch (error) {
    console.error('Ramp error:', error);
    return NextResponse.json(
      { success: false, error: 'Ramp payment failed' },
      { status: 500 }
    );
  }
}


