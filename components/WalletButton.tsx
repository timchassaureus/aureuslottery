'use client';

import { useEffect, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId } from 'wagmi';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

export function WalletButton() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected, isConnecting } = useAccount();
  const chainId = useChainId();
  const { mode, connectWallet: connectStore, syncOnChainData, disconnectWallet: disconnectStore } = useAppStore();

  // Anti-hydratation Next.js
  useEffect(() => setMounted(true), []);

  // Connexion
  useEffect(() => {
    if (!mounted) return;
    if (isConnected && address) {
      console.log('Connected → syncing store:', address);
      connectStore(address);
      toast.success('Wallet connected!');

      // Sync sécurisé
      if (mode === 'live') {
        setTimeout(async () => {
          try {
            await syncOnChainData(address);
            console.log('Sync OK');
          } catch (e) {
            console.error('Sync failed (non-blocking):', e);
            // Pas de toast → on veut pas casser l'UX
          }
        }, 3000);
      }
    }
  }, [isConnected, address, mounted, mode]);

  // Déconnexion
  useEffect(() => {
    if (!isConnected && !isConnecting && mounted) {
      console.log('Disconnected');
      disconnectStore();
    }
  }, [isConnected, isConnecting, mounted]);

  if (!mounted) return <div className="h-10 w-40 animate-pulse bg-gray-800 rounded" />;

  return (
    <ConnectButton
      showBalance={false}
      chainStatus="icon"
      accountStatus={{
        smallScreen: 'avatar',
        largeScreen: 'full',
      }}
    />
  );
}

