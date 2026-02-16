# Problème de Connexion MetaMask - Aureus Lottery

## 🐛 Problème

L'utilisateur ne peut pas se connecter à MetaMask. Voici ce qui se passe :

1. L'utilisateur clique sur le bouton "Connect Wallet"
2. MetaMask s'ouvre et demande l'autorisation de connexion
3. L'utilisateur valide dans MetaMask
4. **PROBLÈME** : Après validation, la connexion ne fonctionne pas et il y a un retour à la page d'accueil

## 📋 Contexte Technique

- **Framework** : Next.js 16 avec App Router
- **TypeScript** : Oui
- **Ethers.js** : Version 6 (BrowserProvider)
- **React** : Version 19
- **MetaMask** : Extension navigateur (EIP-1193 Provider)

## 🔍 Code Actuel

### Fichier 1: `lib/blockchain.ts` - Fonction de connexion principale

```typescript
'use client';

import {
  BrowserProvider,
  Contract,
  JsonRpcProvider,
  formatUnits,
  parseUnits,
} from 'ethers';
import { AUREUS_LOTTERY_ABI } from './abis/AureusLotteryAbi';
import { ERC20_ABI } from './abis/ERC20Abi';
import {
  DEFAULT_CHAIN_ID,
  LOTTERY_ADDRESS,
  RPC_URL,
  USDC_ADDRESS,
} from './config';

type Eip1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  isMetaMask?: boolean;
  on?: (event: string, handler: (...args: any[]) => void) => void;
  removeListener?: (event: string, handler: (...args: any[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

const USDC_DECIMALS = 6;
const rpcProvider = new JsonRpcProvider(RPC_URL);

export async function connectWallet() {
  try {
    console.log('🔌 Starting wallet connection...');
    
    // First, check if MetaMask is available
    if (typeof window === 'undefined') {
      throw new Error('This function must be called in a browser environment.');
    }
    
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
    }
    
    console.log('✅ MetaMask detected');
    
    // Use window.ethereum.request() directly - this is the standard MetaMask API
    let accounts: string[];
    try {
      console.log('📋 Requesting account access via window.ethereum.request...');
      
      // Make sure we're using the right ethereum object
      const ethereum = window.ethereum;
      if (!ethereum || typeof ethereum.request !== 'function') {
        throw new Error('MetaMask is not properly installed. Please refresh the page after installing MetaMask.');
      }
      
      accounts = await ethereum.request({ 
        method: 'eth_requestAccounts' 
      }) as string[];
      console.log('✅ Accounts received:', accounts);
    } catch (requestError: any) {
      console.error('❌ Failed to request accounts:', requestError);
      
      if (requestError.code === 4001) {
        throw new Error('Connection rejected. Please approve the connection request in MetaMask.');
      } else if (requestError.code === -32002) {
        throw new Error('Connection request already pending. Please check your MetaMask window and approve the request.');
      } else if (requestError.message) {
        throw new Error(`Connection failed: ${requestError.message}`);
      }
      throw new Error('Failed to connect. Please check your MetaMask and try again.');
    }
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please unlock your MetaMask wallet and try again.');
    }
    
    const address = accounts[0];
    if (!address || typeof address !== 'string') {
      throw new Error('Failed to get wallet address. Please try again.');
    }
    
    console.log('✅ Account connected:', address);
    
    // Now create provider and signer
    console.log('🔧 Creating provider and signer...');
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    console.log('✅ Provider and signer created');
    
    // Verify network (but don't fail if network is wrong - user can switch manually)
    try {
      await ensureWalletProvider();
      console.log('✅ Network verified');
    } catch (networkError: any) {
      console.warn('⚠️ Network issue (but wallet is connected):', networkError);
      // Don't throw - wallet is connected, network can be switched later
    }
    
    return { provider, signer, address };
  } catch (error) {
    console.error('❌ Wallet connection error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to connect wallet. Please make sure MetaMask is installed and unlocked.');
  }
}

export async function ensureWalletProvider() {
  if (typeof window === 'undefined') {
    throw new Error('This function must be called in a browser environment.');
  }
  
  if (!window.ethereum) {
    throw new Error(
      'MetaMask (or compatible wallet) is required. Please install MetaMask to continue.'
    );
  }
  
  try {
    const provider = new BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    const currentChainId = Number(network.chainId);
    
    if (currentChainId !== DEFAULT_CHAIN_ID) {
      const networkName = DEFAULT_CHAIN_ID === 8453 ? 'Base' : 'Base Sepolia';
      
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${DEFAULT_CHAIN_ID.toString(16)}` }],
        });
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (switchError: any) {
        if (switchError.code === 4902 || switchError.code === -32603) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: `0x${DEFAULT_CHAIN_ID.toString(16)}`,
                  chainName: networkName,
                  nativeCurrency: {
                    name: 'ETH',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                  rpcUrls: [RPC_URL],
                  blockExplorerUrls: [DEFAULT_CHAIN_ID === 8453 ? 'https://basescan.org' : 'https://sepolia.basescan.org'],
                },
              ],
            });
            await new Promise(resolve => setTimeout(resolve, 1500));
          } catch (addError: any) {
            if (addError.code === 4001) {
              throw new Error(`Network addition rejected. Please add ${networkName} network manually in MetaMask.`);
            }
            throw new Error(
              `Please switch to ${networkName} network (Chain ID: ${DEFAULT_CHAIN_ID}) in your wallet.`
            );
          }
        } else if (switchError.code === 4001) {
          throw new Error(`Network switch rejected. Please switch to ${networkName} manually in MetaMask.`);
        } else {
          throw new Error(
            `Failed to switch network. Please switch to ${networkName} (Chain ID: ${DEFAULT_CHAIN_ID}) manually in MetaMask.`
          );
        }
      }
    }
    
    return provider;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to connect to wallet. Please try again.');
  }
}
```

### Fichier 2: `components/WalletButton.tsx` - Composant bouton

```typescript
'use client';

import { useState } from 'react';
import { Wallet, Loader } from 'lucide-react';
import { connectWallet, disconnectWallet } from '@/lib/web3';
import { useAppStore } from '@/lib/store';
import { getDisplayName } from '@/lib/utils';
import NetworkStatus from './NetworkStatus';
import toast from 'react-hot-toast';

export default function WalletButton() {
  const { connected, user, connectWallet: connectStore, disconnectWallet: disconnectStore, mode, syncOnChainData } = useAppStore();
  const [connecting, setConnecting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleConnect = async () => {
    console.log('🔘 Connect button clicked!');
    
    if (typeof window === 'undefined') {
      console.error('❌ Window is undefined');
      toast.error('This function must be called in a browser environment.', { duration: 6000 });
      return;
    }
    
    // Wait a moment for MetaMask to be available
    let ethereum = window.ethereum;
    if (!ethereum) {
      console.log('⏳ MetaMask not immediately available, waiting...');
      for (let i = 0; i < 20; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        if (window.ethereum) {
          ethereum = window.ethereum;
          console.log('✅ MetaMask detected after wait');
          break;
        }
      }
    }
    
    if (!ethereum) {
      console.error('❌ MetaMask not detected after waiting');
      toast.error('MetaMask is not installed. Please install MetaMask and refresh the page.', { duration: 6000 });
      return;
    }
    
    console.log('✅ MetaMask detected, starting connection...');
    setConnecting(true);
    
    try {
      console.log('🔄 Attempting to connect wallet...');
      const address = await connectWallet();
      console.log('✅ Wallet address received:', address);
      
      connectStore(address);
      
      if (mode === 'live') {
        try {
          await syncOnChainData(address);
          setTimeout(() => {
            syncOnChainData(address).catch(err => {
              console.error('⚠️ Background sync failed (non-critical):', err);
            });
          }, 1000);
        } catch (syncError) {
          console.error('⚠️ Initial sync failed (non-critical):', syncError);
        }
      }
      
      toast.success('Wallet connected successfully! 🎉');
    } catch (error: any) {
      console.error('❌ Failed to connect wallet:', error);
      
      let errorMessage = 'Failed to connect wallet';
      
      if (error?.message) {
        const msg = error.message.toLowerCase();
        
        if (msg.includes('metamask') || msg.includes('wallet')) {
          errorMessage = error.message;
        } else if (msg.includes('rejected') || error.code === 4001) {
          errorMessage = 'Connection rejected. Please approve the connection request in MetaMask.';
        } else if (msg.includes('pending') || error.code === -32002) {
          errorMessage = 'Connection request already pending. Please check your MetaMask window.';
        } else if (msg.includes('network') || msg.includes('chain')) {
          errorMessage = error.message;
        } else if (msg.includes('unlock')) {
          errorMessage = 'Please unlock your MetaMask wallet and try again.';
        } else if (msg.includes('install')) {
          errorMessage = 'MetaMask is not installed. Please install MetaMask to continue.';
        } else {
          errorMessage = error.message.length > 100 
            ? 'Connection failed. Please check your MetaMask and try again.' 
            : error.message;
        }
      } else if (error?.code) {
        if (error.code === 4001) {
          errorMessage = 'Connection rejected. Please approve the connection request.';
        } else if (error.code === -32002) {
          errorMessage = 'Connection request already pending. Please check your MetaMask.';
        }
      }
      
      toast.error(errorMessage, { duration: 6000 });
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {typeof window !== 'undefined' && window.ethereum && <NetworkStatus />}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('🔘 Button onClick triggered');
          handleConnect();
        }}
        disabled={connecting}
        className="flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 rounded-xl font-semibold transition-all hover:scale-105 disabled:opacity-50"
      >
        {connecting ? (
          <Loader className="w-5 h-5 animate-spin" />
        ) : (
          <Wallet className="w-5 h-5" />
        )}
        {connecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
    </div>
  );
}
```

### Fichier 3: `lib/web3.ts` - Wrapper

```typescript
'use client';

import { connectWallet as connectOnChainWallet } from './blockchain';

export async function connectWallet(): Promise<string> {
  const { address } = await connectOnChainWallet();
  return address;
}

export async function disconnectWallet(): Promise<void> {
  return Promise.resolve();
}
```

### Fichier 4: `lib/store.ts` - Fonction connectWallet dans le store

```typescript
connectWallet: (address) => {
  const { draws, tickets } = get();
  const lifetimeTickets = tickets.filter(t => t.owner === address).length;
  
  const savedUsername = typeof window !== 'undefined' 
    ? localStorage.getItem(`aureus_username_${address.toLowerCase()}`) || undefined
    : undefined;
  
  const ticketsInDraw = tickets.filter(t => t.owner === address && t.drawNumber === get().currentDrawNumber);
  const user: User = {
    address,
    username: savedUsername,
    telegramUsername: undefined,
    tickets: ticketsInDraw,
    ticketCount: ticketsInDraw.length,
    totalSpent: lifetimeTickets * TICKET_PRICE,
    totalWon: 0,
    lifetimeTickets,
  };
  
  const userWins = draws.filter(d => d.winner === address);
  user.totalWon = userWins.reduce((sum, d) => sum + d.prize, 0);
  
  set({
    connected: true,
    user,
  });
},
```

## 🎯 Ce qui doit être corrigé

1. **Problème principal** : Après validation dans MetaMask, la connexion échoue et retourne à la page d'accueil
2. **Hypothèses** :
   - Erreur non gérée qui cause un rechargement de page
   - Problème avec `window.ethereum.request()` après validation
   - Erreur dans `syncOnChainData()` qui fait planter l'app
   - Problème avec le store Zustand qui ne met pas à jour correctement

## 🔧 Ce que je demande

Trouvez et corrigez le problème qui empêche la connexion MetaMask de fonctionner après validation. Le code doit :
1. Se connecter correctement à MetaMask
2. Ne pas causer de rechargement de page
3. Afficher l'adresse du wallet connecté
4. Gérer les erreurs sans casser l'application

