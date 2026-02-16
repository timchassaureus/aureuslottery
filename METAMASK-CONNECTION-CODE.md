# Code de Connexion MetaMask - Aureus Lottery

## Problème
L'utilisateur ne peut pas se connecter à MetaMask. Quand il clique sur "Connect Wallet", MetaMask s'ouvre mais après avoir validé, la connexion ne fonctionne pas et il y a un retour à la page d'accueil.

## Fichiers de Connexion MetaMask

### 1. `lib/blockchain.ts` - Fonction principale de connexion

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

function getReadLotteryContract() {
  return new Contract(LOTTERY_ADDRESS, AUREUS_LOTTERY_ABI, rpcProvider);
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
    console.log('🔍 Checking wallet provider...');
    const provider = new BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    const currentChainId = Number(network.chainId);
    console.log('🌐 Current network:', { chainId: currentChainId, expected: DEFAULT_CHAIN_ID });
    
    if (currentChainId !== DEFAULT_CHAIN_ID) {
      console.log('🔄 Switching to correct network...');
      const networkName = DEFAULT_CHAIN_ID === 8453 ? 'Base' : 'Base Sepolia';
      
      try {
        // Try to switch network
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${DEFAULT_CHAIN_ID.toString(16)}` }],
        });
        console.log('✅ Network switched successfully');
        // Wait a bit for the switch to complete
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (switchError: any) {
        console.log('⚠️ Switch failed, trying to add network...', switchError);
        // If switch fails, try to add the network
        if (switchError.code === 4902 || switchError.code === -32603) {
          // Network not added, try to add it
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
            console.log('✅ Network added successfully');
            // Wait for network to be added
            await new Promise(resolve => setTimeout(resolve, 1500));
          } catch (addError: any) {
            console.error('❌ Failed to add network:', addError);
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

export async function connectWallet() {
  try {
    console.log('🔌 Starting wallet connection...');
    console.log('🔍 Checking environment...', { 
      hasWindow: typeof window !== 'undefined',
      hasEthereum: typeof window !== 'undefined' && !!window.ethereum 
    });
    
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
      console.log('🔍 window.ethereum:', {
        exists: !!window.ethereum,
        isMetaMask: (window.ethereum as any)?.isMetaMask,
        request: typeof window.ethereum?.request,
      });
      
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
      console.error('Error details:', {
        code: requestError.code,
        message: requestError.message,
        stack: requestError.stack
      });
      
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
```

### 2. `components/WalletButton.tsx` - Composant bouton de connexion

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
    
    // Check if MetaMask is installed first
    if (typeof window === 'undefined') {
      console.error('❌ Window is undefined');
      toast.error('This function must be called in a browser environment.', { duration: 6000 });
      return;
    }
    
    // Wait a moment for MetaMask to be available (sometimes it loads after page load)
    let ethereum = window.ethereum;
    if (!ethereum) {
      console.log('⏳ MetaMask not immediately available, waiting...');
      // Wait up to 2 seconds for MetaMask to load
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
        // Force sync to get fresh data from blockchain
        try {
          await syncOnChainData(address);
          // Sync again after a short delay to ensure data is fresh
          setTimeout(() => {
            syncOnChainData(address).catch(err => {
              console.error('⚠️ Background sync failed (non-critical):', err);
            });
          }, 1000);
        } catch (syncError) {
          console.error('⚠️ Initial sync failed (non-critical):', syncError);
          // Don't fail the connection if sync fails
        }
      }
      
      toast.success('Wallet connected successfully! 🎉');
    } catch (error: any) {
      console.error('❌ Failed to connect wallet:', error);
      
      // Provide specific error messages
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

  const handleDisconnect = async () => {
    await disconnectWallet();
    disconnectStore();
    setShowDropdown(false);
    toast.success('Wallet disconnected');
  };

  if (connected && user) {
    // Use real balance from blockchain, default to 0 if not available
    const balance = typeof user.usdcBalance === 'number' ? user.usdcBalance : 0;
    const userTicketsCount = user.ticketCount ?? user.tickets.length;

    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-3 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-xl font-semibold transition-all hover:scale-105"
        >
          <Wallet className="w-5 h-5" />
          <div className="hidden md:flex flex-col items-start text-left">
            <span className="text-xs text-green-200">
              {balance.toFixed(2)} USDC
            </span>
            <span className="text-xs text-green-200">
              {userTicketsCount} ticket{userTicketsCount !== 1 ? 's' : ''}
            </span>
          </div>
          <span className="hidden lg:inline text-sm">
            {getDisplayName(user.address, user.username, user.telegramUsername)}
          </span>
        </button>

        {showDropdown && (
          <>
            <div 
              className="fixed inset-0 z-[80]" 
              onClick={() => setShowDropdown(false)}
            />
            <div className="absolute md:absolute right-0 top-full mt-2 w-64 md:w-64 max-w-[calc(100vw-2rem)] bg-purple-900 border border-purple-600/50 rounded-xl shadow-2xl z-[90] overflow-hidden">
              <div className="p-4 border-b border-purple-600/30">
                <p className="text-xs text-purple-300 mb-1">Wallet Address</p>
                <p className="font-mono text-sm">{user.address}</p>
              </div>
              <div className="p-4 border-b border-purple-600/30">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-purple-300">Balance:</span>
                  <span className="font-bold">{balance.toFixed(2)} USDC</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-300">Tickets:</span>
                  <span className="font-bold">{userTicketsCount}</span>
                </div>
              </div>
              <button
                onClick={handleDisconnect}
                className="w-full p-3 text-left hover:bg-purple-800 transition-colors text-red-400 font-semibold"
              >
                Disconnect Wallet
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

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

### 3. `lib/web3.ts` - Wrapper de connexion

```typescript
'use client';

import { connectWallet as connectOnChainWallet } from './blockchain';

/**
 * Backwards compatible helper that returns the connected wallet address.
 * Components that need the BrowserProvider should call connectOnChainWallet directly.
 */
export async function connectWallet(): Promise<string> {
  const { address } = await connectOnChainWallet();
  return address;
}

export async function disconnectWallet(): Promise<void> {
  // Browser wallets don't expose a programmatic disconnect.
  return Promise.resolve();
}
```

### 4. `lib/config.ts` - Configuration

```typescript
'use client';

// Base Mainnet: Chain ID 8453
// Base Sepolia (Testnet): Chain ID 84532
export const DEFAULT_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 8453); // Base Mainnet par défaut
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://mainnet.base.org';
export const LOTTERY_ADDRESS =
  process.env.NEXT_PUBLIC_LOTTERY_ADDRESS || '0xe94cFa075B46966e17Ad3Fc6d0676Eb9552ECEc6';
export const USDC_ADDRESS =
  process.env.NEXT_PUBLIC_USDC_ADDRESS || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // USDC sur Base Mainnet
export const OWNER_ADDRESS = (process.env.NEXT_PUBLIC_OWNER_ADDRESS || '').toLowerCase();

function normalizeMode(value?: string | null) {
  const lowered = value?.toLowerCase();
  if (lowered === 'live' || lowered === 'demo') {
    return lowered;
  }
  return undefined;
}

// Force live mode by default for production
export const DEFAULT_MODE: 'demo' | 'live' = normalizeMode(process.env.NEXT_PUBLIC_DEFAULT_MODE) || 'live';
export const FORCED_MODE: 'demo' | 'live' = normalizeMode(process.env.NEXT_PUBLIC_FORCE_MODE) || 'live'; // Force live by default

// Debug: Log mode configuration (only in development)
if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('🔧 AUREUS Mode Configuration:', {
    DEFAULT_MODE,
    FORCED_MODE,
    NEXT_PUBLIC_DEFAULT_MODE: process.env.NEXT_PUBLIC_DEFAULT_MODE,
    NEXT_PUBLIC_FORCE_MODE: process.env.NEXT_PUBLIC_FORCE_MODE,
  });
}

export const BASESCAN_TX_URL =
  process.env.NEXT_PUBLIC_BASESCAN_TX_URL || 'https://basescan.org/tx/'; // Base Mainnet explorer
```

## Description du Problème

1. L'utilisateur clique sur "Connect Wallet"
2. MetaMask s'ouvre et demande l'autorisation
3. L'utilisateur valide dans MetaMask
4. **Problème** : La connexion ne fonctionne pas et il y a un retour à la page d'accueil

## Technologies Utilisées

- Next.js 16 avec App Router
- TypeScript
- Ethers.js v6 (BrowserProvider)
- MetaMask EIP-1193 Provider
- React 19

### 5. `lib/store.ts` - Fonction connectWallet dans le store

```typescript
connectWallet: (address) => {
  const { draws, tickets } = get();
  // Count total lifetime tickets
  const lifetimeTickets = tickets.filter(t => t.owner === address).length;
  
  // Try to load username from localStorage
  const savedUsername = typeof window !== 'undefined'
    ? localStorage.getItem(`aureus_username_${address}`)
    : null;
  
  set({
    connected: true,
    user: {
      address,
      username: savedUsername || undefined,
      telegramUsername: undefined,
      tickets: tickets.filter(t => t.owner === address),
      totalSpent: lifetimeTickets * TICKET_PRICE,
      totalWon: draws
        .filter(d => d.winner === address)
        .reduce((sum, d) => sum + (d.prize || 0), 0),
      lifetimeTickets,
    },
  });
},
```

### 6. `components/ErrorBoundary.tsx` - Gestion des erreurs React

```typescript
'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('❌ ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900 p-4">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-md w-full text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-white mb-4">Something went wrong</h1>
            <p className="text-purple-200 mb-6">
              An error occurred, but don't worry - your wallet connection is safe.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-6 py-3 bg-primary-500 hover:bg-primary-600 rounded-xl font-semibold text-white transition-all"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Points à Vérifier

1. Est-ce que `window.ethereum.request()` fonctionne correctement ?
2. Y a-t-il une erreur qui cause un rechargement de page ?
3. Le problème vient-il de la synchronisation des données blockchain après la connexion ?
4. Y a-t-il un conflit avec d'autres extensions de navigateur ?
5. Est-ce que `connectStore(address)` dans le store fonctionne correctement ?
6. Y a-t-il une erreur React non capturée qui cause le rechargement ?

