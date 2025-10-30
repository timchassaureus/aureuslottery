'use client';

import { useState } from 'react';
import { X, TrendingUp, TrendingDown, Flame } from 'lucide-react';
import { useAppStore } from '@/lib/store';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function RideModal({ isOpen, onClose }: Props) {
  const [amount, setAmount] = useState(100);
  const [processing, setProcessing] = useState(false);
  const { user, ride } = useAppStore();

  if (!isOpen) return null;

  const handleRide = async () => {
    if (!user) return;
    
    setProcessing(true);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const result = ride(user.address, amount);
    setProcessing(false);
    
    if (result.win) {
      alert(`🔥 You won ${result.amount} USDC!`);
    } else {
      alert('Better luck next time!');
    }
    
    onClose();
    setAmount(100);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-red-900 to-red-800 border border-red-500/30 rounded-3xl p-8 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4">
            <Flame className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-3xl font-bold mb-2">RIDE Feature</h2>
          <p className="text-red-300">Risk it all for 10× multiplier!</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2 text-red-200">
              Amount to Risk (50% will be taken)
            </label>
            <input
              type="number"
              min="10"
              max="10000"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value) || 10)}
              className="w-full px-4 py-3 bg-red-800/50 border border-red-600/50 rounded-xl text-white text-center text-2xl font-bold focus:outline-none focus:border-red-400"
            />
            <div className="flex justify-between items-center mt-2 text-sm">
              <span className="text-red-300">Cost: ${(amount * 0.5).toLocaleString()}</span>
              <span className="text-red-300">Potential: ${(amount * 10).toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-red-800/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-yellow-400">
              <TrendingUp className="w-5 h-5" />
              <span className="font-semibold">50% chance to win 10×</span>
            </div>
            <div className="flex items-center gap-2 text-red-300">
              <TrendingDown className="w-5 h-5" />
              <span className="font-semibold">50% chance to lose 50%</span>
            </div>
            <div className="pt-3 border-t border-red-700/50">
              <div className="flex justify-between items-center">
                <span className="text-red-200">You pay:</span>
                <span className="text-white font-bold">${(amount * 0.5).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-red-200">You could win:</span>
                <span className="text-green-400 font-bold">${(amount * 10).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleRide}
            disabled={processing || !user}
            className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl font-bold text-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <Flame className="w-5 h-5 animate-pulse" />
                Riding...
              </>
            ) : (
              <>
                <Flame className="w-5 h-5" />
                Take the RIDE
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

