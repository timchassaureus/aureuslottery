import { ethers } from 'ethers';

// Server-side only — never import in client components
const USDC_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
];

const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const RPC_URL      = process.env.NEXT_PUBLIC_RPC_URL      || 'https://mainnet.base.org';
const USDC_DECIMALS = 6;

function getWallet() {
  const privateKey = process.env.PLATFORM_PRIVATE_KEY;
  if (!privateKey) throw new Error('PLATFORM_PRIVATE_KEY not configured');
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  return new ethers.Wallet(privateKey, provider);
}

/**
 * Send USDC from the platform wallet to a recipient address.
 * Returns the transaction hash.
 */
export async function sendUSDC(toAddress: string, amountUsd: number): Promise<string> {
  const wallet = getWallet();
  const usdc   = new ethers.Contract(USDC_ADDRESS, USDC_ABI, wallet);
  const amount = ethers.parseUnits(amountUsd.toFixed(USDC_DECIMALS), USDC_DECIMALS);
  const tx     = await usdc.transfer(toAddress, amount) as ethers.ContractTransactionResponse;
  const receipt = await tx.wait();
  if (!receipt) throw new Error('Transaction receipt not received');
  return receipt.hash;
}

/**
 * Get the USDC balance of the platform wallet.
 */
export async function getPlatformBalance(): Promise<number> {
  const privateKey = process.env.PLATFORM_PRIVATE_KEY;
  if (!privateKey) return 0;
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet   = new ethers.Wallet(privateKey, provider);
  const usdc     = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);
  const raw      = await usdc.balanceOf(wallet.address) as bigint;
  return Number(ethers.formatUnits(raw, USDC_DECIMALS));
}

/**
 * Get the platform wallet address (for display in admin).
 */
export function getPlatformAddress(): string {
  const privateKey = process.env.PLATFORM_PRIVATE_KEY;
  if (!privateKey) return '';
  return new ethers.Wallet(privateKey).address;
}
