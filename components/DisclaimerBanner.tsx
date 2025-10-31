'use client';

import { useEffect, useState } from 'react';

export default function DisclaimerBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const accepted = localStorage.getItem('aureus_disclaimer_accepted');
      if (!accepted) setVisible(true);
    } catch {}
  }, []);

  if (!visible) return null;

  const accept = () => {
    try {
      localStorage.setItem('aureus_disclaimer_accepted', 'true');
      document.cookie = 'aureus_disclaimer_accepted=true; Path=/; Max-Age=31536000; SameSite=Lax';
    } catch {}
    setVisible(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[10000] px-3 pb-[max(env(safe-area-inset-bottom,0px),10px)]">
      <div className="mx-auto max-w-2xl rounded-xl border border-white/15 bg-slate-900/85 backdrop-blur px-4 py-3 text-white shadow-lg">
        <div className="text-xs leading-relaxed">
          <strong>Important:</strong> By using Aureus you confirm you are 18+ and that online lottery is legal in your location.
          <a href="/disclaimer" className="underline ml-1">Learn more</a>.
        </div>
        <div className="mt-2 flex items-center gap-2">
          <button onClick={accept} className="flex-1 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-sm font-bold py-2">I Accept</button>
          <a href="/disclaimer" className="rounded-lg border border-white/20 px-3 py-2 text-sm">Open full notice</a>
        </div>
      </div>
    </div>
  );
}


