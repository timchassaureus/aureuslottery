'use client';

import { useState } from 'react';
import { X, CreditCard, Loader } from 'lucide-react';
import { toast } from 'sonner';

interface CardPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number; // Amount in USDC
  userWalletAddress?: string;
  onSuccess: (amount: number) => void;
}

function getWalletAddress(userWalletAddress?: string): string | null {
  if (userWalletAddress) return userWalletAddress;
  try {
    const stored = localStorage.getItem('aureus_current_user');
    if (stored) return JSON.parse(stored).walletAddress || null;
  } catch {}
  return null;
}

export default function CardPaymentModal({ isOpen, onClose, amount, userWalletAddress, onSuccess: _onSuccess }: CardPaymentModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // MoonPay — no API key required to get started
  // Buys USDC on Base and sends it directly to the user's wallet
  const handleMoonPay = () => {
    const address = getWalletAddress(userWalletAddress);
    if (!address) {
      toast.error('Please connect first to get your wallet address');
      return;
    }
    const moonpayKey = process.env.NEXT_PUBLIC_MOONPAY_API_KEY || '';
    const params = new URLSearchParams({
      currencyCode: 'usdc_base',
      walletAddress: address,
      baseCurrencyAmount: String(amount),
      ...(moonpayKey ? { apiKey: moonpayKey } : {}),
    });
    window.open(`https://buy.moonpay.com/?${params.toString()}`, '_blank', 'width=500,height=700');
    toast.success('MoonPay opened — buy your USDC and it will arrive in your wallet!');
    onClose();
  };

  // Ramp Network — alternative to MoonPay
  const handleRamp = async () => {
    setLoading(true);
    try {
      const address = getWalletAddress(userWalletAddress);
      if (!address) {
        toast.error('Please connect first');
        return;
      }
      const rampKey = process.env.NEXT_PUBLIC_RAMP_API_KEY || '';
      const params = new URLSearchParams({
        swapAsset: 'BASE_USDC',
        swapAmount: String(amount * 1e6), // USDC micro-units
        userAddress: address,
        ...(rampKey ? { hostApiKey: rampKey } : {}),
      });
      window.open(`https://buy.ramp.network/?${params.toString()}`, '_blank', 'width=500,height=700');
      toast.success('Ramp opened — buy your USDC!');
      onClose();
    } catch (err) {
      console.error('Ramp error:', err);
      toast.error('Error opening Ramp');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative bg-[#0A0A0F] border-2 border-[#C9A84C]/30 rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#C9A84C]/20 rounded-full mb-4">
            <CreditCard className="w-8 h-8 text-[#C9A84C]" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Buy with card</h2>
          <p className="text-[#F5F0E8]">
            Buy <strong>{amount} USDC</strong> — sent directly to your wallet
          </p>
        </div>

        <div className="space-y-3">
          {/* MoonPay — recommended */}
          <button
            onClick={handleMoonPay}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 rounded-xl font-semibold transition-all hover:scale-105 flex items-center justify-center gap-3"
          >
            <span className="text-xl">🌙</span>
            <div className="text-left">
              <div className="font-bold">MoonPay</div>
              <div className="text-xs text-blue-200">Visa / Mastercard / Apple Pay</div>
            </div>
            <span className="ml-auto text-xs bg-green-500/30 text-green-300 px-2 py-1 rounded-full">Recommended</span>
          </button>

          {/* Ramp Network */}
          <button
            onClick={handleRamp}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-[#C9A84C] to-[#A68A3E] hover:from-[#e8c97a] hover:to-[#C9A84C] rounded-xl font-semibold transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span className="text-xl">⚡</span>
                <div className="text-left">
                  <div className="font-bold">Ramp Network</div>
                  <div className="text-xs text-[#F5F0E8]">Bank card / wire transfer</div>
                </div>
              </>
            )}
          </button>

          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 text-xs text-green-200">
            <p className="font-semibold mb-1">✅ How does it work?</p>
            <p>You buy USDC (stablecoin = fixed $1) directly via MoonPay or Ramp. The USDC arrives in your wallet in ~1 minute, then you use it to buy your tickets.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

