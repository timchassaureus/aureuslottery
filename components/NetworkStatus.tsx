'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Loader } from 'lucide-react';
import { DEFAULT_CHAIN_ID } from '@/lib/config';

const getNetworkName = (chainId: number) => {
  if (chainId === 8453) return 'Base';
  if (chainId === 84532) return 'Base Sepolia';
  return `Chain ${chainId}`;
};

export default function NetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState<{
    isCorrect: boolean;
    chainId: number | null;
    loading: boolean;
  }>({ isCorrect: false, chainId: null, loading: true });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setNetworkStatus({ isCorrect: false, chainId: null, loading: false });
      return;
    }

    const checkNetwork = async () => {
      if (!window.ethereum) {
        setNetworkStatus({ isCorrect: false, chainId: null, loading: false });
        return;
      }
      
      try {
        const provider = window.ethereum;
        const chainId = await provider.request({ method: 'eth_chainId' });
        const chainIdNumber = parseInt(chainId as string, 16);
        
        setNetworkStatus({
          isCorrect: chainIdNumber === DEFAULT_CHAIN_ID,
          chainId: chainIdNumber,
          loading: false,
        });
      } catch (error) {
        setNetworkStatus({ isCorrect: false, chainId: null, loading: false });
      }
    };

    checkNetwork();

    // Listen for network changes
    const handleChainChanged = () => {
      checkNetwork();
    };

    // Type assertion for event listeners (MetaMask supports this)
    const ethereum = window.ethereum as any;
    if (ethereum && typeof ethereum.on === 'function') {
      ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (ethereum && typeof ethereum.removeListener === 'function') {
        ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  if (networkStatus.loading) {
    return null;
  }

  if (!window.ethereum) {
    return null;
  }

  if (networkStatus.isCorrect) {
    const networkName = networkStatus.chainId ? getNetworkName(networkStatus.chainId) : 'Base';
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/40 rounded-lg text-xs">
        <CheckCircle className="w-3 h-3 text-green-400" />
        <span className="text-green-300">{networkName}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 border border-red-500/40 rounded-lg text-xs animate-pulse">
      <AlertTriangle className="w-3 h-3 text-red-400" />
      <span className="text-red-300">Wrong Network</span>
    </div>
  );
}

