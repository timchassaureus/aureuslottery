# 🦊 Diagnostic Problème Connexion MetaMask - Aureus Lottery

## 📋 Résumé du Problème

**Symptôme principal** : L'utilisateur ne peut pas se connecter à MetaMask. Après avoir cliqué sur "Connect Wallet" et validé dans MetaMask, la connexion échoue et il y a un retour à la page d'accueil (comme si une erreur non gérée causait un rechargement).

**Stack Technique** :
- Next.js 16 avec App Router
- TypeScript
- React 19.2.0
- RainbowKit 2.2.9 + Wagmi 2.19.5 (pour la connexion wallet)
- Ethers.js v6.15.0 (BrowserProvider)
- Zustand 5.0.8 (state management)
- Base Sepolia Testnet (Chain ID: 84532)

---

## 🔍 Description Détaillée

### Scénario de Reproduction

1. L'utilisateur ouvre l'application
2. L'utilisateur clique sur le bouton "Connect Wallet" (RainbowKit ConnectButton)
3. MetaMask s'ouvre et demande l'autorisation de connexion
4. L'utilisateur valide dans MetaMask
5. **PROBLÈME** : Après validation, la connexion ne fonctionne pas et il y a un retour à la page d'accueil

### Symptômes Observés

- ✅ MetaMask est détecté correctement
- ✅ MetaMask s'ouvre et demande l'autorisation
- ✅ L'utilisateur peut valider dans MetaMask
- ❌ Après validation, l'application ne maintient pas la connexion
- ❌ Retour à la page d'accueil (comme si une erreur non gérée causait un rechargement)
- ❌ Aucune erreur visible dans la console (ou erreur non capturée)

---

## 📁 Architecture du Code

### Flux de Connexion Actuel

```
app/layout.tsx
  └─ RainbowKitSetup (WagmiProvider + RainbowKitProvider)
      └─ components/WalletButton.tsx
          └─ ConnectButton (RainbowKit)
              └─ useAccount() hook (Wagmi)
                  └─ useEffect qui appelle connectStore() dans lib/store.ts
```

### Fichiers Clés

1. **`lib/rainbowkit.tsx`** - Configuration RainbowKit/Wagmi
2. **`components/WalletButton.tsx`** - Composant qui utilise ConnectButton RainbowKit
3. **`lib/store.ts`** - Store Zustand avec `connectWallet()` action
4. **`lib/config.ts`** - Configuration réseau (Base Sepolia)
5. **`lib/blockchain.ts`** - Fonctions blockchain (utilisées pour sync, pas pour connexion)

---

## 💻 Code Complet des Fichiers Clés

### 1. `lib/rainbowkit.tsx` - Configuration RainbowKit

```typescript
'use client';

import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { DEFAULT_CHAIN_ID, RPC_URL } from './config';

// Configuration des chaînes supportées
const supportedChains = [base, baseSepolia] as const;

// Configuration RainbowKit avec WalletConnect
const config = getDefaultConfig({
  appName: 'Aureus Lottery',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '944da06684d3948b1597121e5affe4c8',
  chains: supportedChains as any,
  ssr: true, // Support SSR pour Next.js
});

const queryClient = new QueryClient();

export function RainbowKitSetup({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

### 2. `components/WalletButton.tsx` - Composant de Connexion

```typescript
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
```

### 3. `lib/store.ts` - Fonction `connectWallet` dans le Store

```typescript
connectWallet: (address) => {
  const { draws, tickets } = get();
  // Count total lifetime tickets
  const lifetimeTickets = tickets.filter(t => t.owner === address).length;
  
  // Try to load username from localStorage
  const savedUsername = typeof window !== 'undefined' 
    ? localStorage.getItem(`aureus_username_${address.toLowerCase()}`) || undefined
    : undefined;
  
  // Try to load Telegram username (future integration)
  const telegramUsername = typeof window !== 'undefined'
    ? localStorage.getItem(`aureus_telegram_${address.toLowerCase()}`) || undefined
    : undefined;
  
  const ticketsInDraw = tickets.filter(t => t.owner === address && t.drawNumber === get().currentDrawNumber);
  const user: User = {
    address,
    username: savedUsername,
    telegramUsername: telegramUsername || undefined,
    tickets: ticketsInDraw,
    ticketCount: ticketsInDraw.length,
    totalSpent: lifetimeTickets * TICKET_PRICE,
    totalWon: 0,
    lifetimeTickets,
  };
  
  // Calculate total won from history
  const userWins = draws.filter(d => d.winner === address);
  user.totalWon = userWins.reduce((sum, d) => sum + d.prize, 0);
  
  set({
    connected: true,
    user,
  });
},
```

### 4. `lib/config.ts` - Configuration Réseau

```typescript
'use client';

// Base Mainnet: Chain ID 8453
// Base Sepolia (Testnet): Chain ID 84532
export const DEFAULT_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 84532); // Base Sepolia par défaut (testnet)
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia.base.org';
export const LOTTERY_ADDRESS =
  process.env.NEXT_PUBLIC_LOTTERY_ADDRESS || '0xe94cFa075B46966e17Ad3Fc6d0676Eb9552ECEc6';
export const USDC_ADDRESS =
  process.env.NEXT_PUBLIC_USDC_ADDRESS || '0x036CbD53842c5426634e7929541eC2318f3dCF7e'; // USDC sur Base Sepolia
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

export const BASESCAN_TX_URL =
  process.env.NEXT_PUBLIC_BASESCAN_TX_URL || 'https://sepolia.basescan.org/tx/'; // Base Sepolia explorer
```

### 5. `app/layout.tsx` - Layout Principal

```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/components/ToastProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import { RainbowKitSetup } from "@/lib/rainbowkit";
import '@rainbow-me/rainbowkit/styles.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aureus | Crypto Lottery",
  description: "Daily crypto lottery on Base. Buy tickets for $1 USDC, win big jackpots every day at 9PM & 9:30PM UTC!",
};

export const viewport = {
  width: 'device-width',
  initialScale: 0.85,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <RainbowKitSetup>
            <ToastProvider />
            {children}
          </RainbowKitSetup>
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

### 6. `package.json` - Dépendances

```json
{
  "name": "aureus",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@rainbow-me/rainbowkit": "^2.2.9",
    "@tanstack/react-query": "^5.90.10",
    "ethers": "^6.15.0",
    "lucide-react": "^0.548.0",
    "next": "16.0.0",
    "react": "19.2.0",
    "react-dom": "19.2.0",
    "react-hot-toast": "^2.6.0",
    "sonner": "^2.0.7",
    "viem": "^2.39.3",
    "wagmi": "^2.19.5",
    "zustand": "^5.0.8"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "autoprefixer": "^10.4.21",
    "eslint": "^9",
    "eslint-config-next": "16.0.0",
    "postcss": "^8.5.6",
    "tailwindcss": "^4.1.16",
    "typescript": "^5"
  }
}
```

---

## 🔎 Points à Vérifier / Questions

### 1. Configuration RainbowKit/Wagmi

- ✅ Les chaînes `base` et `baseSepolia` sont bien configurées
- ⚠️ Le `projectId` WalletConnect est hardcodé (fallback) - est-ce valide ?
- ❓ Est-ce que `ssr: true` cause des problèmes avec Next.js 16 App Router ?
- ❓ Est-ce que le `initialChain` devrait être défini explicitement ?

### 2. Synchronisation Store

- ⚠️ Le `useEffect` dans `WalletButton.tsx` appelle `connectStore(address)` quand `isConnected` devient `true`
- ❓ Est-ce que `connectStore()` peut causer une erreur qui n'est pas capturée ?
- ❓ Est-ce que `syncOnChainData()` dans le `setTimeout` peut causer un crash silencieux ?

### 3. Gestion d'Erreurs

- ⚠️ Il y a un `ErrorBoundary` dans le layout - est-ce qu'il capture les erreurs ?
- ❓ Est-ce qu'une erreur dans `connectStore()` ou `syncOnChainData()` cause un rechargement de page ?
- ❓ Est-ce que React 19 + Next.js 16 + RainbowKit ont des incompatibilités connues ?

### 4. Réseau MetaMask

- ❓ Est-ce que MetaMask est sur le bon réseau (Base Sepolia - Chain ID 84532) ?
- ❓ Est-ce que RainbowKit gère automatiquement le switch de réseau ?
- ❓ Est-ce qu'un mauvais réseau cause un rechargement silencieux ?

### 5. Variables d'Environnement

- ❓ Est-ce que `NEXT_PUBLIC_CHAIN_ID` est défini et correspond à 84532 ?
- ❓ Est-ce que `NEXT_PUBLIC_RPC_URL` est défini et accessible ?
- ❓ Est-ce que `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` est défini (si utilisé) ?

---

## 🐛 Hypothèses de Problèmes Possibles

### Hypothèse 1 : Erreur dans `connectStore()` non capturée
Le `useEffect` dans `WalletButton.tsx` appelle `connectStore(address)` dans un `try/catch`, mais peut-être qu'une erreur se produit avant ou après.

### Hypothèse 2 : Problème de timing avec `syncOnChainData()`
Le `setTimeout` de 2 secondes appelle `syncOnChainData()` qui peut échouer et causer un crash.

### Hypothèse 3 : Incompatibilité React 19 + RainbowKit
React 19 est très récent, peut-être qu'il y a une incompatibilité avec RainbowKit 2.2.9.

### Hypothèse 4 : Problème de réseau MetaMask
Si MetaMask n'est pas sur Base Sepolia, RainbowKit peut essayer de switcher et échouer silencieusement.

### Hypothèse 5 : Erreur SSR/Hydration
Le `ssr: true` dans la config RainbowKit peut causer des problèmes d'hydratation avec Next.js 16.

### Hypothèse 6 : Erreur dans `ErrorBoundary`
L'ErrorBoundary peut capturer une erreur et recharger la page au lieu d'afficher l'erreur.

### Hypothèse 7 : Problème avec les dépendances du `useEffect`
Le `useEffect` a beaucoup de dépendances `[isConnected, address, mode, connectStore, syncOnChainData, disconnectStore, isConnecting]` - peut-être qu'il se déclenche plusieurs fois et cause des conflits.

---

## 📝 Logs Attendus (si tout fonctionne)

Quand la connexion fonctionne, on devrait voir dans la console :

```
🔍 WalletButton state: { isConnected: false, isConnecting: false, address: undefined, ... }
🔗 RainbowKit wallet connected: 0x...
✅ Store updated with address: 0x...
✅ Background sync completed
```

---

## 🎯 Ce que je veux savoir de Grok

1. **Pourquoi la connexion échoue-t-elle après validation MetaMask ?**
2. **Est-ce que le code actuel avec RainbowKit/Wagmi est correct ?**
3. **Y a-t-il des incompatibilités connues entre React 19, Next.js 16, et RainbowKit 2.2.9 ?**
4. **Est-ce que le `useEffect` dans `WalletButton.tsx` est bien structuré ?**
5. **Y a-t-il des erreurs silencieuses qui peuvent causer un rechargement de page ?**
6. **Comment déboguer efficacement ce problème ?**
7. **Faut-il ajouter plus de logs ou de gestion d'erreurs ?**
8. **Est-ce que la configuration RainbowKit est correcte pour Base Sepolia ?**
9. **Est-ce que le `projectId` WalletConnect doit être valide même si on utilise MetaMask directement ?**
10. **Faut-il définir un `initialChain` dans la config Wagmi ?**

---

## 🔧 Actions Déjà Tentées

- ✅ Vérification que MetaMask est installé
- ✅ Vérification que `window.ethereum` existe
- ✅ Utilisation de RainbowKit au lieu d'une connexion manuelle
- ✅ Ajout de logs de debugging
- ✅ Gestion d'erreurs avec try/catch
- ✅ Utilisation d'ErrorBoundary
- ⚠️ Pas encore testé : désactiver `syncOnChainData()` pour voir si c'est la cause
- ⚠️ Pas encore testé : définir explicitement `initialChain` dans la config Wagmi
- ⚠️ Pas encore testé : désactiver `ssr: true` dans RainbowKit

---

## 📚 Ressources

- RainbowKit Docs: https://www.rainbowkit.com/docs/introduction
- Wagmi Docs: https://wagmi.sh/
- Base Sepolia: https://docs.base.org/docs/networks/base-sepolia/
- Next.js 16: https://nextjs.org/docs
- React 19: https://react.dev/blog/2024/12/05/react-19

---

**Date de création** : Décembre 2024
**Version** : Next.js 16, React 19, RainbowKit 2.2.9, Wagmi 2.19.5


