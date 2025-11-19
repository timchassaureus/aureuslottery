'use client';

import { useState } from 'react';
import { Shield, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { requestBonusDrawOnChain, requestMainDrawOnChain } from '@/lib/blockchain';
import { useAppStore } from '@/lib/store';
import { OWNER_ADDRESS } from '@/lib/config';

export default function AdminControls() {
  const { user, syncOnChainData, mode } = useAppStore();
  const [loading, setLoading] = useState<'main' | 'bonus' | null>(null);

  if (!user || mode !== 'live') return null;
  if (!OWNER_ADDRESS || user.address.toLowerCase() !== OWNER_ADDRESS) return null;

  const handleMainDraw = async () => {
    setLoading('main');
    try {
      await requestMainDrawOnChain();
      toast.success('Main draw requested');
      await syncOnChainData(user.address);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : (error as { shortMessage?: string })?.shortMessage || 'Failed to request main draw';
      toast.error(message);
    } finally {
      setLoading(null);
    }
  };

  const handleBonusDraw = async () => {
    setLoading('bonus');
    try {
      await requestBonusDrawOnChain();
      toast.success('Bonus draw requested');
      await syncOnChainData(user.address);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : (error as { shortMessage?: string })?.shortMessage || 'Failed to request bonus draw';
      toast.error(message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-4 flex flex-wrap gap-3 items-center">
      <div className="flex items-center gap-2 text-red-200 text-sm font-semibold">
        <Shield className="w-4 h-4" />
        Admin Controls
      </div>
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={handleMainDraw}
          disabled={loading !== null}
          className="px-4 py-2 bg-red-600/60 hover:bg-red-600/80 rounded-xl text-sm font-bold transition disabled:opacity-50 flex items-center gap-2"
        >
          {loading === 'main' ? <Loader2 className="w-4 h-4 animate-spin" /> : '🎯'}
          Request Main Draw
        </button>
        <button
          onClick={handleBonusDraw}
          disabled={loading !== null}
          className="px-4 py-2 bg-orange-500/60 hover:bg-orange-500/80 rounded-xl text-sm font-bold transition disabled:opacity-50 flex items-center gap-2"
        >
          {loading === 'bonus' ? <Loader2 className="w-4 h-4 animate-spin" /> : '💎'}
          Request Bonus Draw
        </button>
      </div>
    </div>
  );
}

