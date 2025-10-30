'use client';

export interface Web3Provider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  isMetaMask?: boolean;
}

export class MockWeb3Provider {
  private address: string | null = null;

  async request(args: { method: string; params?: any[] }): Promise<any> {
    switch (args.method) {
      case 'eth_requestAccounts':
        if (!this.address) {
          this.address = `0x${Math.random().toString(16).substr(2, 40)}`;
        }
        return [this.address];
      
      case 'eth_accounts':
        return this.address ? [this.address] : [];
      
      case 'eth_chainId':
        return '0x1';
      
      default:
        return null;
    }
  }

  get isMetaMask() {
    return true;
  }

  getAddress() {
    return this.address;
  }

  reset() {
    this.address = null;
  }
}

// Simulated wallet connection
const mockProvider = new MockWeb3Provider();

export async function connectWallet(): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const accounts = mockProvider.request({ method: 'eth_requestAccounts' });
      accounts.then((addresses: string[]) => {
        resolve(addresses[0]);
      });
    }, 500);
  });
}

export async function disconnectWallet(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      mockProvider.reset();
      resolve();
    }, 200);
  });
}

export function getProvider(): MockWeb3Provider {
  return mockProvider;
}

