import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

// Server-side price table — must stay in sync with BuyTicketsModal packs
const TICKET_PRICE_USD = 1.00;
const PACK_DISCOUNTS: Record<number, number> = {
  5: 0.02, 10: 0.05, 20: 0.08, 50: 0.12, 100: 0.15, 1000: 0.20,
};

/** Calculate expected price in cents from ticket count. Never trust client-sent amount. */
function calculateExpectedCents(ticketsCount: number): number {
  const discount = PACK_DISCOUNTS[ticketsCount] ?? 0;
  return Math.round(ticketsCount * TICKET_PRICE_USD * (1 - discount) * 100);
}

export async function POST(request: NextRequest) {
  if (!stripeSecretKey) {
    return NextResponse.json(
      { success: false, error: 'Stripe not configured — set STRIPE_SECRET_KEY in environment variables' },
      { status: 503 }
    );
  }

  const stripe = new Stripe(stripeSecretKey);

  try {
    const body = await request.json();
    const ticketsCount = Math.max(1, Math.min(1000, Number(body?.ticketsCount) || 1));
    const bonusTickets = Math.max(0, Math.min(500, Number(body?.bonusTickets) || 0));
    const currency = typeof body?.currency === 'string' ? body.currency.toLowerCase() : 'usd';
    const walletAddress = typeof body?.walletAddress === 'string' ? body.walletAddress : null;

    // Price is always calculated server-side — ignore client-sent amount entirely
    const amountCents = calculateExpectedCents(ticketsCount);
    if (amountCents < 50) {
      return NextResponse.json({ success: false, error: 'Invalid ticket count' }, { status: 400 });
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (request.headers.get('origin') ?? 'http://localhost:3000');

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: `AUREUS Lottery — ${ticketsCount} ticket${ticketsCount > 1 ? 's' : ''}${bonusTickets > 0 ? ` + ${bonusTickets} bonus` : ''}`,
              description: `Enter the AUREUS daily draw with ${ticketsCount + bonusTickets} ticket${ticketsCount + bonusTickets > 1 ? 's' : ''}`,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}/victory?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/?payment=cancelled`,
      metadata: {
        tickets_count: String(ticketsCount),
        bonus_tickets: String(bonusTickets),
        amount_cents: String(amountCents),
        wallet_address: walletAddress ?? '',
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Stripe Checkout error:', error);
    return NextResponse.json(
      { success: false, error: 'Payment session creation failed' },
      { status: 500 }
    );
  }
}
