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
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-md rounded-xl border border-white/15 bg-slate-950 p-4 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="text-sm leading-relaxed mb-4">
          <span className="font-bold text-yellow-400">⚠️ Notice:</span>
          <p className="mt-2">
            By using Aureus you confirm that:
          </p>
          <ul className="mt-2 space-y-1 text-xs text-gray-300">
            <li>• You are 18 years or older</li>
            <li>• Online lottery is legal in your jurisdiction</li>
            <li>• You understand this is a Web3 application</li>
            <li>• You are responsible for your own funds</li>
          </ul>
        </div>
        
        <div className="flex flex-col gap-2">
          <button 
            onClick={accept} 
            className="w-full py-3 rounded-lg text-sm font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:scale-105 transition-transform active:scale-95"
          >
            I Accept & Continue
          </button>
          <a 
            href="/disclaimer" 
            className="w-full py-3 text-center rounded-lg text-sm border border-white/20 hover:bg-white/5 transition-colors"
          >
            Read Full Disclaimer
          </a>
        </div>
      </div>
    </div>
  );
}

