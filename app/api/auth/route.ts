import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import bcrypt from 'bcryptjs';
import { createServiceClient } from '@/lib/supabase-server';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mode, email, password, name } = body;

    // mode: 'login' | 'register'
    if (mode !== 'login' && mode !== 'register') {
      return NextResponse.json(
        { success: false, error: 'Invalid mode' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedName =
      typeof name === 'string' ? name.trim().slice(0, 50) : sanitizedEmail.split('@')[0];

    const supabase = createServiceClient();

    const { data: existing, error: fetchError } = await supabase
      .from('custodial_users')
      .select('id, email, name, provider, wallet_address, usdc_balance, created_at, password_hash')
      .eq('email', sanitizedEmail)
      .maybeSingle();

    if (fetchError) {
      console.error('Auth fetch error:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Server error' },
        { status: 500 }
      );
    }

    // ── LOGIN ──────────────────────────────────────────────────────────────
    if (mode === 'login') {
      if (!existing) {
        return NextResponse.json(
          { success: false, error: 'No account found with this email' },
          { status: 401 }
        );
      }

      if (!existing.password_hash) {
        return NextResponse.json(
          { success: false, error: 'This account uses a different sign-in method' },
          { status: 401 }
        );
      }

      const valid = await bcrypt.compare(password, existing.password_hash);
      if (!valid) {
        return NextResponse.json(
          { success: false, error: 'Incorrect password' },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        user: {
          id: existing.id,
          email: existing.email,
          name: existing.name,
          provider: existing.provider,
          walletAddress: existing.wallet_address,
          usdcBalance: Number(existing.usdc_balance),
          createdAt: new Date(existing.created_at).getTime(),
        },
      });
    }

    // ── REGISTER ───────────────────────────────────────────────────────────
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'An account already exists with this email' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const wallet = ethers.Wallet.createRandom();
    const userId = crypto.randomUUID();

    const { error: insertError } = await supabase.from('custodial_users').insert({
      id: userId,
      email: sanitizedEmail,
      name: sanitizedName,
      provider: 'email',
      wallet_address: wallet.address,
      usdc_balance: 0,
      password_hash: passwordHash,
    });

    if (insertError) {
      console.error('Auth insert error:', insertError);
      return NextResponse.json(
        { success: false, error: 'Unable to create account' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: sanitizedEmail,
        name: sanitizedName,
        provider: 'email',
        walletAddress: wallet.address,
        usdcBalance: 0,
        createdAt: Date.now(),
      },
    });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
