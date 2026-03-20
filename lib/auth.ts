// ⚠️ SERVER-SIDE ONLY — ne jamais importer dans un composant client ('use client')
// Ce fichier contient des types et helpers liés à l'authentification.
// La génération de wallets se fait exclusivement dans /app/api/auth/route.ts (serveur).

/**
 * Interface utilisateur avec authentification sociale
 */
export interface AureusUser {
  id: string;
  email?: string;
  name?: string;
  provider?: 'email' | 'google' | 'apple';
  walletAddress: string; // Adresse de dépôt générée côté serveur
  usdcBalance: number;   // Solde en USDC (crédit de jeu)
  createdAt: number;
}


