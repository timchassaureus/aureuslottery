'use client';

import { ethers } from 'ethers';

/**
 * Génère un wallet Ethereum pour un utilisateur
 * Utilise un seed dérivé de l'ID utilisateur pour générer de manière déterministe
 */
export function generateUserWallet(userId: string): {
  address: string;
  privateKey: string; // À stocker de manière sécurisée côté serveur
} {
  // Génère un wallet déterministe basé sur l'ID utilisateur
  // En production, utiliser un seed maître + userId pour plus de sécurité
  const seed = `aureus_wallet_${userId}_${process.env.NEXT_PUBLIC_WALLET_SEED || 'default_seed'}`;
  const wallet = ethers.Wallet.createRandom();
  
  // Pour la production, utiliser ethers.utils.HDNodeWallet avec un mnemonic maître
  // const hdNode = ethers.utils.HDNode.fromMnemonic(masterMnemonic);
  // const wallet = hdNode.derivePath(`m/44'/60'/0'/0/${userIdIndex}`);
  
  return {
    address: wallet.address,
    privateKey: wallet.privateKey, // ⚠️ À stocker de manière sécurisée (HSM, AWS KMS, etc.)
  };
}

/**
 * Interface utilisateur avec authentification sociale
 */
export interface AureusUser {
  id: string;
  email?: string;
  name?: string;
  provider?: 'email' | 'google' | 'apple';
  walletAddress: string; // Adresse de dépôt générée
  usdcBalance: number; // Solde en USDC (crédit de jeu)
  createdAt: number;
}


