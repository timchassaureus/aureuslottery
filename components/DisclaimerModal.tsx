'use client';

import { useState, useEffect } from 'react';

export default function DisclaimerModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const accepted = typeof window !== 'undefined' && localStorage.getItem('aureus_disclaimer_accepted');
    setIsOpen(!accepted);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const accept = () => {
    try {
      localStorage.setItem('aureus_disclaimer_accepted', 'true');
      document.cookie = 'aureus_disclaimer_accepted=true; Path=/; Max-Age=31536000; SameSite=Lax';
    } catch {}
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-4 inset-x-4 z-[10000] pointer-events-none">
      <div className="pointer-events-auto mx-auto max-w-md rounded-xl border border-white/15 bg-slate-950/90 backdrop-blur p-3 text-white shadow-xl">
        <div className="text-xs leading-relaxed">
          <span className="font-bold">Notice:</span> By using Aureus you confirm you are 18+, that online lottery is legal in your location, and that you understand this is a Web3 app.
        </div>
        <div className="mt-2 flex gap-2">
          <button onClick={accept} className="flex-1 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-black">I Accept</button>
          <a href="/disclaimer" className="px-3 py-2 rounded-lg text-xs border border-white/20">Learn more</a>
        </div>
      </div>
    </div>
  );
}

