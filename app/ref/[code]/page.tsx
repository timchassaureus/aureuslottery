'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const REFERRAL_STORAGE_KEY = 'aureus_referral_code';
const CODE_PREFIX = 'AUR-';

function setStoredReferralCode(code: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REFERRAL_STORAGE_KEY, code.trim().toUpperCase());
}

export default function RefCodePage() {
  const params = useParams();
  const router = useRouter();
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const code = params?.code as string | undefined;
    if (!code || !code.startsWith(CODE_PREFIX)) {
      router.replace('/');
      return;
    }
    setStoredReferralCode(code);
    setMessage('You were invited by a friend! You will receive 1 bonus ticket on your first purchase!');
    const t = setTimeout(() => router.replace('/'), 2000);
    return () => clearTimeout(t);
  }, [params?.code, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0A0A0F] to-[#12120A] text-white p-6">
      <div className="text-center animate-in fade-in duration-500">
        <p className="text-2xl font-bold text-primary-400 mb-2">🎁 {message}</p>
        <p className="text-[#e8c97a]">Redirecting to the lottery…</p>
      </div>
    </div>
  );
}
