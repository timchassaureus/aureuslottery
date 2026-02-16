'use client';

// Base Mainnet: Chain ID 8453
// Base Sepolia (Testnet): Chain ID 84532
export const DEFAULT_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 8453); // Base Mainnet par défaut (PRODUCTION)
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://mainnet.base.org';
export const LOTTERY_ADDRESS =
  process.env.NEXT_PUBLIC_LOTTERY_ADDRESS || '0xe94cFa075B46966e17Ad3Fc6d0676Eb9552ECEc6';
export const USDC_ADDRESS =
  process.env.NEXT_PUBLIC_USDC_ADDRESS || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // USDC sur Base Mainnet
export const OWNER_ADDRESS = (process.env.NEXT_PUBLIC_OWNER_ADDRESS || '').toLowerCase();

// Treasury address (wallet Ledger pour recevoir les 10%)
export const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_ADDRESS || '0xa166D2570d4bBfACcEBE7A78a426991b1Fa8f6eC';

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

