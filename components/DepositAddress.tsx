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
    toast.success('Address copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#C9A84C]/5 border border-[#C9A84C]/30 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-[#C9A84C]/20 rounded-xl">
          <Wallet className="w-6 h-6 text-[#C9A84C]" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Your deposit address</h3>
          <p className="text-sm text-[#8A8A95]">Send any crypto</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* USDC Balance */}
        <div className="bg-[#C9A84C]/10 rounded-xl p-4">
          <p className="text-sm text-[#8A8A95] mb-1">Available balance</p>
          <p className="text-3xl font-bold text-white">{usdcBalance.toFixed(2)} USDC</p>
        </div>

        {/* Deposit address */}
        <div>
          <label className="block text-sm font-medium text-[#F5F0E8] mb-2">
            Deposit address (ETH, USDT, USDC, DAI, etc.)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={walletAddress}
              readOnly
              className="flex-1 px-4 py-3 bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-xl text-white font-mono text-sm"
            />
            <button
              onClick={copyAddress}
              className="p-3 bg-[#C9A84C] hover:bg-[#e8c97a] rounded-xl transition-colors"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-400" />
              ) : (
                <Copy className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* QR Code (optional) */}
        <div className="flex items-center gap-2 text-sm text-[#8A8A95]">
          <QrCode className="w-4 h-4" />
          <span>Scan with your wallet to send</span>
        </div>

        {/* Info */}
        <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3 text-sm text-blue-200">
          <p className="font-semibold mb-1">💡 How does it work?</p>
          <ul className="list-disc list-inside space-y-1 text-blue-100">
            <li>Send ETH, USDT, USDC, DAI, LINK or WBTC</li>
            <li>Automatic conversion to USDC</li>
            <li>Instant credit to buy tickets</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

