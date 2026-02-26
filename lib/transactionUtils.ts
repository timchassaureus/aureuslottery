/**
 * Transaction utilities for better UX and performance
 */

import { BrowserProvider, Contract } from 'ethers';
import { USDC_ADDRESS, LOTTERY_ADDRESS } from './config';
import { ERC20_ABI } from './abis/ERC20Abi';
import { AUREUS_LOTTERY_ABI } from './abis/AureusLotteryAbi';

export interface TransactionState {
  status: 'idle' | 'approving' | 'approving-confirming' | 'buying' | 'buying-confirming' | 'success' | 'error';
  txHash?: string;
  error?: string;
}

/**
 * Check USDC allowance and approve if needed
 */
export async function ensureUSDCAllowance(
  provider: BrowserProvider,
  userAddress: string,
  amount: bigint
): Promise<{ approved: boolean; txHash?: string }> {
  const signer = await provider.getSigner();
  const usdcContract = new Contract(USDC_ADDRESS, ERC20_ABI, signer);
  
  const currentAllowance = await usdcContract.allowance(userAddress, LOTTERY_ADDRESS);
  
  if (currentAllowance >= amount) {
    return { approved: true };
  }
  
  // Approve
  const approveTx = await usdcContract.approve(LOTTERY_ADDRESS, amount);
  return { approved: false, txHash: approveTx.hash };
}

/**
 * Wait for transaction confirmation with progress updates
 */
export async function waitForConfirmation(
  provider: BrowserProvider,
  txHash: string,
  onProgress?: (confirmations: number) => void
): Promise<void> {
  const receipt = await provider.waitForTransaction(txHash, 1);
  
  if (!receipt) {
    throw new Error('Transaction receipt not found');
  }
  
  if (receipt.status === 0) {
    throw new Error('Transaction failed');
  }
  
  // Attendre plus de confirmations si nécessaire
  let confirmations = await receipt.confirmations();
  while (confirmations < 2) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const latestReceipt = await provider.getTransactionReceipt(txHash);
    if (latestReceipt) {
      confirmations = await latestReceipt.confirmations();
      onProgress?.(confirmations);
    }
  }
}

/**
 * Estimate gas with retry logic
 */
export async function estimateGasWithRetry(
  contract: Contract,
  method: string,
  args: any[],
  retries = 3
): Promise<bigint> {
  for (let i = 0; i < retries; i++) {
    try {
      return await contract[method].estimateGas(...args);
    } catch (error: any) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('Gas estimation failed after retries');
}
