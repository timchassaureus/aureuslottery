'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AcceptPage() {
  const router = useRouter();

  useEffect(() => {
    try {
      localStorage.setItem('aureus_disclaimer_accepted', 'true');
      document.cookie = 'aureus_disclaimer_accepted=true; Path=/; Max-Age=31536000; SameSite=Lax';
    } catch {}
    const t = setTimeout(() => router.replace('/'), 100);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="text-center space-y-2">
        <div className="text-lg font-bold">Unlocking Aureus…</div>
        <div className="text-sm text-white/70">If nothing happens, tap Continue.</div>
        <button
          onClick={() => router.replace('/')}
          className="mt-3 px-4 py-2 rounded-lg bg-yellow-400 text-black font-semibold"
        >
          Continue
        </button>
      </div>
    </div>
  );
}


