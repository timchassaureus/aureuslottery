import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createServiceClient } from '@/lib/supabase-server';
import { ethers } from 'ethers';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${origin}/`);
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !session?.user) {
    return NextResponse.redirect(`${origin}/`);
  }

  const email = session.user.email!;
  const name =
    session.user.user_metadata?.full_name ||
    session.user.user_metadata?.name ||
    email.split('@')[0];
  const provider = session.user.app_metadata?.provider || 'oauth';

  try {
    const serviceClient = createServiceClient();

    // Check if user already exists
    const { data: existing } = await serviceClient
      .from('custodial_users')
      .select('id, email, name, wallet_address, usdc_balance')
      .eq('email', email)
      .maybeSingle();

    let user;

    if (existing) {
      user = {
        id: existing.id,
        email: existing.email,
        name: existing.name,
        provider,
        walletAddress: existing.wallet_address,
        usdcBalance: existing.usdc_balance || 0,
      };
    } else {
      // Create custodial wallet server-side (private key never leaves server)
      const wallet = ethers.Wallet.createRandom();

      const { data: newUser } = await serviceClient
        .from('custodial_users')
        .insert({ email, name, provider, wallet_address: wallet.address })
        .select('id, email, name, wallet_address, usdc_balance')
        .single();

      if (newUser) {
        user = {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          provider,
          walletAddress: newUser.wallet_address,
          usdcBalance: 0,
        };
      }
    }

    if (user) {
      // Pass user to client via a short-lived readable cookie (60s)
      const response = NextResponse.redirect(`${origin}/`);
      response.cookies.set('aureus_oauth_user', JSON.stringify(user), {
        httpOnly: false,
        maxAge: 60,
        path: '/',
        sameSite: 'lax',
      });
      return response;
    }
  } catch (err) {
    console.error('OAuth callback error:', err);
  }

  return NextResponse.redirect(`${origin}/`);
}
