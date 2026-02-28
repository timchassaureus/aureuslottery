import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServiceClient } from '@/lib/supabase-server';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  if (!stripeSecretKey || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  const stripe = new Stripe(stripeSecretKey);
  const rawBody = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const ticketsCount = Number(session.metadata?.tickets_count) || 1;
    const amountCents = Number(session.metadata?.amount_cents) || 0;
    const amountUsd = amountCents / 100;
    const customerEmail = session.customer_details?.email ?? null;
    const walletAddress = session.metadata?.wallet_address || null;

    try {
      const supabase = createServiceClient();

      // Record Stripe payment
      await supabase.from('stripe_payments').insert({
        stripe_session_id: session.id,
        customer_email: customerEmail,
        amount_usd: amountUsd,
        tickets_count: ticketsCount,
        status: 'completed',
      });

      // Also record tickets in purchases table so they enter the draw
      if (walletAddress && /^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
        const today = new Date().toISOString().slice(0, 10);
        const purchaseRows = Array.from({ length: ticketsCount }, () => ({
          wallet_address: walletAddress.toLowerCase(),
          amount_usd: 1,
          draw_date: today,
          payment_method: 'stripe',
        }));
        const { error: purchaseError } = await supabase.from('purchases').insert(purchaseRows);
        if (purchaseError) {
          console.error('Failed to record purchases from Stripe:', purchaseError);
        }
      }
    } catch (err) {
      console.error('Failed to record Stripe payment in DB:', err);
    }
  }

  return NextResponse.json({ received: true });
}
