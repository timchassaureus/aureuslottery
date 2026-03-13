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
    const bonusTickets = Number(session.metadata?.bonus_tickets) || 0;
    const totalTickets = ticketsCount + bonusTickets;
    const amountCents = Number(session.metadata?.amount_cents) || 0;
    const amountUsd = amountCents / 100;
    const customerEmail = session.customer_details?.email ?? null;
    const walletAddress = session.metadata?.wallet_address || null;

    try {
      const supabase = createServiceClient();

      // Idempotency: if this session was already processed, skip silently
      const { data: existing } = await supabase
        .from('stripe_payments')
        .select('id')
        .eq('stripe_session_id', session.id)
        .maybeSingle();

      if (existing) {
        // Already processed — Stripe is retrying, acknowledge and stop
        return NextResponse.json({ received: true });
      }

      // Record Stripe payment
      await supabase.from('stripe_payments').insert({
        stripe_session_id: session.id,
        customer_email: customerEmail,
        amount_usd: amountUsd,
        tickets_count: totalTickets,
        status: 'completed',
      });

      // Record tickets in purchases table so they enter the draw
      if (walletAddress && /^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
        const normalizedWallet = walletAddress.toLowerCase();

        const { error: purchaseError } = await supabase.from('purchases').insert({
          wallet_address: normalizedWallet,
          amount_usd: amountUsd,
          tickets_count: ticketsCount, // purchased tickets only (not bonuses)
        });
        if (purchaseError) {
          console.error('Failed to record purchases from Stripe:', purchaseError);
        }

        // Add pack bonus tickets to bonus_tickets (tracked separately for draw pool + display)
        if (bonusTickets > 0) {
          await supabase.from('bonus_tickets').insert({
            wallet_address: normalizedWallet,
            amount: bonusTickets,
            reason: 'pack_bonus',
            used: false,
          });
        }

        // Update streak — fire-and-forget so webhook responds fast to Stripe
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
        fetch(`${baseUrl}/api/streak/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress: normalizedWallet }),
        }).catch((e) => console.warn('Stripe webhook: streak update failed (non-blocking):', e));
      }
    } catch (err) {
      console.error('Failed to record Stripe payment in DB:', err);
    }
  }

  return NextResponse.json({ received: true });
}
