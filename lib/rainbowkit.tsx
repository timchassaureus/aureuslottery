'use client';

import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

const config = getDefaultConfig({
  appName: 'Aureus Lottery',
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
    '944da06684d3948b1597121e5affe4c8',
  chains: [baseSepolia, base] as any,
  ssr: true,
  // ← PAS DE initialChain ICI
});

const queryClient = new QueryClient();

export function RainbowKitSetup({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {/* ← initialChain va ICI */}
        <RainbowKitProvider initialChain={baseSepolia}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
