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

