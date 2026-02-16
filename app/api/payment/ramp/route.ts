import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route pour Ramp Network (crypto on-ramp)
 * Ramp permet d'acheter de la crypto avec carte bancaire
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userAddress, amount, currency = 'USDC' } = body;

    const rampApiKey = process.env.NEXT_PUBLIC_RAMP_API_KEY || '';
    
    if (!rampApiKey) {
      return NextResponse.json(
        { success: false, error: 'Ramp API key not configured' },
        { status: 500 }
      );
    }

    // Créer une URL Ramp avec les paramètres
    const rampUrl = `https://buy.ramp.network/?hostApiKey=${rampApiKey}&userAddress=${userAddress}&swapAsset=${currency}&swapAmount=${amount}&finalUrl=${encodeURIComponent(process.env.NEXT_PUBLIC_URL + '/deposit-success')}`;

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


