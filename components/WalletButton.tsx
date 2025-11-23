'use client';

import { useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId } from 'wagmi';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

export function WalletButton() {
  const { address, isConnected, isConnecting } = useAccount();
  const chainId = useChainId();
  const { user, mode, connectWallet: connectStore, syncOnChainData, disconnectWallet: disconnectStore } = useAppStore();

  // Log pour debugging
  useEffect(() => {
    console.log('🔍 WalletButton state:', {
      isConnected,
      isConnecting,
      address,
      chainId,
      hasUser: !!user,
    });
  }, [isConnected, isConnecting, address, chainId, user]);

  // Synchroniser l'adresse RainbowKit avec notre store
  useEffect(() => {
    if (isConnected && address) {
      console.log('🔗 RainbowKit wallet connected:', address);
      
      try {
        connectStore(address);
        console.log('✅ Store updated with address:', address);
        
        toast.success('Wallet connected! 🎉', {
          description: `Connected: ${address.slice(0, 6)}...${address.slice(-4)}`,
        });
        
        // Sync en arrière-plan (non-bloquant)
        if (mode === 'live') {
          setTimeout(() => {
            syncOnChainData(address)
              .then(() => {
                console.log('✅ Background sync completed');
                toast.success('Data synced from blockchain', {
                  description: 'Your tickets and stats are up to date',
                });
              })
              .catch((syncError) => {
                console.error('⚠️ Background sync failed (non-critical):', syncError);
                // Ne pas afficher d'erreur - la connexion a réussi
              });
          }, 2000); // Augmenter le délai pour laisser le temps à la connexion de se stabiliser
        }
      } catch (error) {
        console.error('❌ Error connecting to store:', error);
        toast.error('Failed to connect wallet', {
          description: 'Please try again',
        });
      }
    } else if (!isConnected && !isConnecting) {
      // Déconnexion seulement si on n'est pas en train de se connecter
      console.log('🔌 Wallet disconnected');
      disconnectStore();
    }
  }, [isConnected, address, mode, connectStore, syncOnChainData, disconnectStore, isConnecting]);

  // Utiliser le ConnectButton standard de RainbowKit (plus fiable)
  return (
    <ConnectButton
      showBalance={false}
      accountStatus={{
        smallScreen: 'avatar',
        largeScreen: 'full',
      }}
    />
  );
}

