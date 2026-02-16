import { connectWallet as connectOnChainWallet } from './blockchain';

/**
 * Wrapper simple pour la connexion wallet
 * Retourne uniquement l'adresse pour simplifier l'utilisation
 */
export async function connectWallet(): Promise<string> {
  console.log('🌐 web3.ts: Calling blockchain connection...');
  const { address } = await connectOnChainWallet();
  console.log('🌐 web3.ts: Address received from blockchain:', address);
  return address;
}

export { connectOnChainWallet };

export async function disconnectWallet(): Promise<void> {
  // Browser wallets don't expose a programmatic disconnect.
  return Promise.resolve();
}
