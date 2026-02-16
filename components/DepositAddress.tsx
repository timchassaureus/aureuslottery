'use client';

import { useState } from 'react';
import { Copy, Check, Wallet, QrCode } from 'lucide-react';
import { toast } from 'sonner';

interface DepositAddressProps {
  walletAddress: string;
  usdcBalance: number;
}

export default function DepositAddress({ walletAddress, usdcBalance }: DepositAddressProps) {
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    toast.success('Adresse copiée !');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border border-purple-500/30 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-purple-500/20 rounded-xl">
          <Wallet className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Votre adresse de dépôt</h3>
          <p className="text-sm text-purple-300">Envoyez n'importe quelle crypto</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Solde USDC */}
        <div className="bg-purple-800/30 rounded-xl p-4">
          <p className="text-sm text-purple-300 mb-1">Solde disponible</p>
          <p className="text-3xl font-bold text-white">{usdcBalance.toFixed(2)} USDC</p>
        </div>

        {/* Adresse de dépôt */}
        <div>
          <label className="block text-sm font-medium text-purple-200 mb-2">
            Adresse de dépôt (ETH, USDT, USDC, DAI, etc.)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={walletAddress}
              readOnly
              className="flex-1 px-4 py-3 bg-purple-800/50 border border-purple-600/50 rounded-xl text-white font-mono text-sm"
            />
            <button
              onClick={copyAddress}
              className="p-3 bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-400" />
              ) : (
                <Copy className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* QR Code (optionnel) */}
        <div className="flex items-center gap-2 text-sm text-purple-300">
          <QrCode className="w-4 h-4" />
          <span>Scannez avec votre wallet pour envoyer</span>
        </div>

        {/* Info */}
        <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3 text-sm text-blue-200">
          <p className="font-semibold mb-1">💡 Comment ça marche ?</p>
          <ul className="list-disc list-inside space-y-1 text-blue-100">
            <li>Envoyez ETH, USDT, USDC, DAI, LINK ou WBTC</li>
            <li>Conversion automatique en USDC</li>
            <li>Crédit instantané pour acheter des tickets</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

