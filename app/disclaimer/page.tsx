'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Check } from 'lucide-react';

export default function DisclaimerPage() {
  const router = useRouter();
  const [isOver18, setIsOver18] = useState(false);
  const [understandsRisks, setUnderstandsRisks] = useState(false);

  useEffect(() => {
    const accepted = typeof window !== 'undefined' && localStorage.getItem('aureus_disclaimer_accepted');
    if (accepted) router.replace('/');
    // Lock background scroll to ensure only this page scrolls
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = originalOverflow; };
  }, [router]);

  const handleAccept = () => {
    if (!isOver18 || !understandsRisks) return;
    localStorage.setItem('aureus_disclaimer_accepted', 'true');
    // Persist acceptance for server-side middleware
    document.cookie = 'aureus_disclaimer_accepted=true; Path=/; Max-Age=31536000; SameSite=Lax';
    router.replace('/');
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-blue-950 text-white flex flex-col" style={{ WebkitOverflowScrolling: 'touch' }}>
      <header className="px-4 py-3 md:py-4 border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-yellow-400" />
          <h1 className="text-xl font-black">Important Notice</h1>
        </div>
        <button onClick={() => router.replace('/')} className="text-sm text-white/70 underline">Skip</button>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 pb-28" style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}>
        <div className="max-w-xl mx-auto space-y-4">
          {/* Quick accept bar when conditions met (mobile friendly) */}
          {isOver18 && understandsRisks && (
            <div className="sticky top-0 z-40 -mx-4 px-4 py-2 mb-2 bg-indigo-900/70 backdrop-blur border-b border-white/10">
              <button onClick={handleAccept} className="w-full py-2 rounded-lg font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-black">✅ I Accept - Enter Aureus</button>
            </div>
          )}
          <p className="font-bold text-center">🎰 Welcome to the Future of Decentralized Gaming</p>
          <p className="text-sm text-slate-300 text-center">
            Before you start playing, please confirm you meet the following requirements:
          </p>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3"><span className="text-yellow-400">✓</span><span>I am <strong className="text-white">18 years of age or older</strong> and legally allowed to participate</span></li>
            <li className="flex gap-3"><span className="text-yellow-400">✓</span><span>Online lottery and crypto transactions are <strong className="text-white">legal in my country</strong></span></li>
            <li className="flex gap-3"><span className="text-yellow-400">✓</span><span>I acknowledge this is a <strong className="text-white">decentralized Web3 application</strong> and I verify local regulations</span></li>
            <li className="flex gap-3"><span className="text-yellow-400">✓</span><span>I'm playing for <strong className="text-white">entertainment</strong> with funds I can afford to lose</span></li>
            <li className="flex gap-3"><span className="text-yellow-400">✓</span><span><strong className="text-white">Aureus is not liable</strong> for any legal consequences in my jurisdiction</span></li>
          </ul>

          <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 border border-red-500/40 rounded-lg p-3">
            <p className="text-red-200 text-xs">
              ⚠️ Service Restrictions: Some regions (e.g., United States, China, North Korea, Iran, Syria) prohibit online gambling. By proceeding, you confirm you are not accessing from a restricted location and accept full responsibility for compliance with local laws.
            </p>
          </div>

          <div className="space-y-3">
            <label className="flex items-start gap-3">
              <input type="checkbox" className="w-5 h-5 rounded border-2 border-white/30 bg-white/5 checked:bg-yellow-400 checked:border-yellow-400" checked={isOver18} onChange={(e) => setIsOver18(e.target.checked)} />
              <span className="text-sm">I confirm that I am <strong>18 years of age or older</strong></span>
            </label>
            <label className="flex items-start gap-3">
              <input type="checkbox" className="w-5 h-5 rounded border-2 border-white/30 bg-white/5 checked:bg-yellow-400 checked:border-yellow-400" checked={understandsRisks} onChange={(e) => setUnderstandsRisks(e.target.checked)} />
              <span className="text-sm">I understand the risks and confirm that online lottery is <strong>legal in my jurisdiction</strong></span>
            </label>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-[max(env(safe-area-inset-bottom,0px),12px)] pt-2 border-t border-white/10 bg-indigo-950/80 backdrop-blur">
        <div className="max-w-xl mx-auto">
          <button
            onClick={handleAccept}
            disabled={!isOver18 || !understandsRisks}
            className={`w-full py-3 rounded-xl font-bold text-base ${
              isOver18 && understandsRisks
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black'
                : 'bg-gray-700 text-gray-500'
            }`}
          >
            {isOver18 && understandsRisks ? '✅ I Accept - Enter Aureus' : '⚠️ Check both boxes to continue'}
          </button>
          <p className="text-center text-slate-400 text-[11px] mt-2">
            By clicking, you agree to our Terms and confirm you meet legal requirements.
          </p>
        </div>
      </footer>
    </div>
  );
}


