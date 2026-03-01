'use client';

import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider, createStorage, noopStorage } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

const config = getDefaultConfig({
  appName: 'Aureus Lottery',
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
    '944da06684d3948b1597121e5affe4c8',
  chains: [base, baseSepolia] as any,
  ssr: true,
  // Disable auto-reconnect: prevents MetaMask popup on mobile browsers
  // (mobile uses custodial auth, no wallet needed)
  storage: createStorage({ storage: noopStorage }),
});

const queryClient = new QueryClient();

export function RainbowKitSetup({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider initialChain={base}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
