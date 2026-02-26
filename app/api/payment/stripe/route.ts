import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

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
    // CardPaymentModal sends amount already in cents (amount * 100)
    const amountCents = Number(body?.amount);
    const ticketsCount = Math.max(1, Number(body?.ticketsCount) || 1);
    const currency = typeof body?.currency === 'string' ? body.currency.toLowerCase() : 'usd';

    if (!Number.isFinite(amountCents) || amountCents < 50) {
      return NextResponse.json({ success: false, error: 'Invalid amount (min 50 cents)' }, { status: 400 });
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
              name: `AUREUS Lottery — ${ticketsCount} ticket${ticketsCount > 1 ? 's' : ''}`,
              description: `Participez au tirage AUREUS avec ${ticketsCount} ticket${ticketsCount > 1 ? 's' : ''}`,
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
        amount_cents: String(amountCents),
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


