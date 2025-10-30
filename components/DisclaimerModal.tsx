'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Check } from 'lucide-react';

export default function DisclaimerModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [isOver18, setIsOver18] = useState(false);
  const [understandsRisks, setUnderstandsRisks] = useState(false);

  useEffect(() => {
    // Check if user already accepted
    const accepted = localStorage.getItem('aureus_disclaimer_accepted');
    if (!accepted) {
      setIsOpen(true);
    }
  }, []);

  const handleAccept = () => {
    if (isOver18 && understandsRisks) {
      localStorage.setItem('aureus_disclaimer_accepted', 'true');
      setHasAgreed(true);
      setTimeout(() => setIsOpen(false), 300);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[200] p-4">
      <div className={`bg-gradient-to-br from-indigo-950 via-purple-950 to-blue-950 border-2 border-yellow-400 rounded-2xl p-8 max-w-2xl w-full relative transition-all duration-300 ${hasAgreed ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
        
        {/* Warning Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-yellow-400/20 rounded-full flex items-center justify-center border-4 border-yellow-400">
            <AlertTriangle className="w-10 h-10 text-yellow-400" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-black text-white text-center mb-4">
          ⚠️ Important Notice
        </h2>

        {/* Disclaimer Text */}
        <div className="bg-white/5 rounded-xl p-6 mb-6 border border-white/10">
          <div className="space-y-4 text-slate-300 text-sm">
            <p className="font-bold text-white text-center text-base mb-2">
              🎰 Welcome to the Future of Decentralized Gaming
            </p>
            
            <p className="text-center text-slate-400 text-xs mb-4">
              Before you start playing, please confirm you meet the following requirements:
            </p>
            
            <ul className="space-y-3">
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

            <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 border-2 border-red-500/50 rounded-lg p-4 mt-4">
              <p className="text-red-200 text-xs leading-relaxed">
                <strong className="text-red-300 text-sm">⚠️ Service Restrictions:</strong><br/>
                This platform may be restricted in certain regions including: <strong>United States, China, North Korea, Iran, Syria</strong> and other jurisdictions where online gambling is prohibited. By proceeding, you confirm you are <strong>NOT</strong> accessing from a restricted location and accept full responsibility for compliance with your local laws.
              </p>
            </div>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="space-y-3 mb-6">
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

        {/* Accept Button */}
        <button
          onClick={handleAccept}
          disabled={!isOver18 || !understandsRisks}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
            isOver18 && understandsRisks
              ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black cursor-pointer'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isOver18 && understandsRisks ? '✅ I Accept - Enter Aureus' : '⚠️ Please check both boxes to continue'}
        </button>

        {/* Footer */}
        <p className="text-center text-slate-400 text-xs mt-4">
          By clicking "I Accept", you agree to our Terms of Service, Privacy Policy and confirm you meet all legal requirements above. This agreement is binding and cannot be reversed.
        </p>
        
        <div className="text-center mt-3">
          <p className="text-yellow-300 text-xs font-bold">
            🔒 Your participation is 100% anonymous and secured on the blockchain
          </p>
        </div>
      </div>
    </div>
  );
}

