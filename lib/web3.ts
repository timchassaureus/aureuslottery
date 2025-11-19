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
