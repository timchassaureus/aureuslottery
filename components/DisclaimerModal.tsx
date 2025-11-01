'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Check } from 'lucide-react';

export default function DisclaimerModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isOver18, setIsOver18] = useState(false);
  const [understandsRisks, setUnderstandsRisks] = useState(false);

  useEffect(() => {
    const accepted = typeof window !== 'undefined' && localStorage.getItem('aureus_disclaimer_accepted');
    setIsOpen(!accepted);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const handleAccept = () => {
    if (!isOver18 || !understandsRisks) return;
    try {
      localStorage.setItem('aureus_disclaimer_accepted', 'true');
      document.cookie = 'aureus_disclaimer_accepted=true; Path=/; Max-Age=31536000; SameSite=Lax';
    } catch {}
    setIsOpen(false);
  };

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-md rounded-xl border border-white/15 bg-gradient-to-br from-indigo-950 via-purple-950 to-blue-950 p-4 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="text-sm leading-relaxed mb-4">
          {/* Warning Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-yellow-400/20 rounded-full flex items-center justify-center border-4 border-yellow-400">
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <h2 className="text-center text-2xl font-black mb-2">
            ⚠️ Important Notice
          </h2>

          <p className="font-bold text-white text-center mb-2">
            🎰 Welcome to the Future of Decentralized Gaming
          </p>
          
          <p className="text-center text-slate-400 text-xs mb-4">
            Before you start playing, please confirm you meet the following requirements:
          </p>
          
          <ul className="space-y-3 mb-4">
            <li className="flex gap-3">
              <span className="text-yellow-400 mt-0.5 text-lg">✓</span>
              <span>I am <strong className="text-white">18 years of age or older</strong> and legally allowed to participate</span>
            </li>
            <li className="flex gap-3">
              <span className="text-yellow-400 mt-0.5 text-lg">✓</span>
              <span>Online lottery and crypto transactions are <strong className="text-white">100% legal in my country</strong></span>
            </li>
            <li className="flex gap-3">
              <span className="text-yellow-400 mt-0.5 text-lg">✓</span>
              <span>I acknowledge this is a <strong className="text-white">decentralized Web3 application</strong> - I am solely responsible for verifying local regulations</span>
            </li>
            <li className="flex gap-3">
              <span className="text-yellow-400 mt-0.5 text-lg">✓</span>
              <span>I'm playing for <strong className="text-white">entertainment</strong> and only with funds I can afford to lose</span>
            </li>
            <li className="flex gap-3">
              <span className="text-yellow-400 mt-0.5 text-lg">✓</span>
              <span>I understand that <strong className="text-white">Aureus is not liable</strong> for any legal consequences in my jurisdiction</span>
            </li>
          </ul>

          <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 border-2 border-red-500/50 rounded-lg p-3 mt-4">
            <p className="text-red-200 text-xs leading-relaxed">
              <strong className="text-red-300 text-sm">⚠️ Service Restrictions:</strong><br/>
              This platform may be restricted in certain regions including: <strong>United States, China, North Korea, Iran, Syria</strong> and other jurisdictions where online gambling is prohibited. By proceeding, you confirm you are <strong>NOT</strong> accessing from a restricted location and accept full responsibility for compliance with your local laws.
            </p>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="space-y-3 mb-4">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                checked={isOver18}
                onChange={(e) => setIsOver18(e.target.checked)}
                className="w-5 h-5 rounded border-2 border-white/30 bg-white/5 checked:bg-yellow-400 checked:border-yellow-400 cursor-pointer"
              />
              {isOver18 && (
                <Check className="w-4 h-4 text-black absolute pointer-events-none" />
              )}
            </div>
            <span className="text-white text-sm group-hover:text-yellow-400 transition-colors">
              I confirm that I am <strong>18 years of age or older</strong>
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                checked={understandsRisks}
                onChange={(e) => setUnderstandsRisks(e.target.checked)}
                className="w-5 h-5 rounded border-2 border-white/30 bg-white/5 checked:bg-yellow-400 checked:border-yellow-400 cursor-pointer"
              />
              {understandsRisks && (
                <Check className="w-4 h-4 text-black absolute pointer-events-none" />
              )}
            </div>
            <span className="text-white text-sm group-hover:text-yellow-400 transition-colors">
              I understand the risks and confirm that online lottery is <strong>legal in my jurisdiction</strong>
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-2">
          <button 
            onClick={handleAccept} 
            disabled={!isOver18 || !understandsRisks}
            className={`w-full py-3 rounded-lg text-sm font-bold transition-all hover:scale-105 active:scale-95 ${
              isOver18 && understandsRisks
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black cursor-pointer'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isOver18 && understandsRisks ? '✅ I Accept - Enter Aureus' : '⚠️ Please check both boxes to continue'}
          </button>
          <p className="text-center text-slate-400 text-[11px] mt-1">
            By clicking "I Accept", you agree to our Terms of Service, Privacy Policy and confirm you meet all legal requirements above. This agreement is binding and cannot be reversed.
          </p>
          <p className="text-center text-yellow-300 text-[11px] font-bold mt-1">
            🔒 Your participation is 100% anonymous and secured on the blockchain
          </p>
        </div>
      </div>
    </div>
  );
}
