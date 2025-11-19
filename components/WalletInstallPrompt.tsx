'use client';

import { useState, useEffect } from 'react';
import { Wallet, X, ExternalLink } from 'lucide-react';

export default function WalletInstallPrompt() {
  const [show, setShow] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Check if wallet is installed
    const hasWallet = typeof window.ethereum !== 'undefined';
    
    // Check if mobile
    const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobile(mobile);
    
    // Show prompt if no wallet and not already dismissed
    if (!hasWallet && !localStorage.getItem('wallet_prompt_dismissed')) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('wallet_prompt_dismissed', 'true');
  };

  const metaMaskUrl = isMobile
    ? 'https://metamask.app.link/dapp/aureus-lottery.com'
    : 'https://metamask.io/download/';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-purple-900 to-indigo-900 border-2 border-purple-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-full mb-4">
            <Wallet className="w-8 h-8 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Wallet Required</h2>
          <p className="text-purple-200">
            To play AUREUS Lottery, you need a Web3 wallet like MetaMask.
          </p>
        </div>

        <div className="space-y-4">
          <a
            href={metaMaskUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-3 bg-orange-500 hover:bg-orange-600 rounded-xl font-bold transition-all hover:scale-105"
          >
            <span>🦊</span>
            <span>Install MetaMask</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <div className="text-sm text-purple-300 space-y-2">
            <p className="font-semibold">Why do I need a wallet?</p>
            <ul className="list-disc list-inside space-y-1 text-purple-200">
              <li>Secure your tickets and winnings</li>
              <li>Make transactions on the blockchain</li>
              <li>Connect to Base Sepolia network</li>
            </ul>
          </div>

          {isMobile && (
            <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3 text-sm text-blue-200">
              <p className="font-semibold mb-1">📱 On Mobile?</p>
              <p>Install MetaMask app, then open this site in the MetaMask browser.</p>
            </div>
          )}
        </div>

        <button
          onClick={handleDismiss}
          className="mt-4 w-full py-2 text-purple-300 hover:text-white transition-colors text-sm"
        >
          I'll install it later
        </button>
      </div>
    </div>
  );
}

