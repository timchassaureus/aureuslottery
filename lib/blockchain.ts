'use client';

import {
  BrowserProvider,
  Contract,
  JsonRpcProvider,
  formatUnits,
  parseUnits,
} from 'ethers';
import { AUREUS_LOTTERY_ABI } from './abis/AureusLotteryAbi';
import { ERC20_ABI } from './abis/ERC20Abi';
import {
  DEFAULT_CHAIN_ID,
  LOTTERY_ADDRESS,
  RPC_URL,
  USDC_ADDRESS,
} from './config';

type Eip1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  isMetaMask?: boolean;
};

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

const USDC_DECIMALS = 6;
const rpcProvider = new JsonRpcProvider(RPC_URL);

function getReadLotteryContract() {
  return new Contract(LOTTERY_ADDRESS, AUREUS_LOTTERY_ABI, rpcProvider);
}

export async function ensureWalletProvider() {
  if (typeof window === 'undefined') {
    throw new Error('This function must be called in a browser environment.');
  }
  
  if (!window.ethereum) {
    throw new Error(
      'MetaMask (or compatible wallet) is required. Please install MetaMask to continue.'
    );
  }
  
  try {
    console.log('🔍 Checking wallet provider...');
    const provider = new BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    const currentChainId = Number(network.chainId);
    console.log('🌐 Current network:', { chainId: currentChainId, expected: DEFAULT_CHAIN_ID });
    
    if (currentChainId !== DEFAULT_CHAIN_ID) {
      try {
        // Try to switch network
        await provider.send('wallet_switchEthereumChain', [
          { chainId: `0x${DEFAULT_CHAIN_ID.toString(16)}` },
        ]);
        // Wait a bit for the switch to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (switchError: any) {
        // If switch fails, try to add the network
        if (switchError.code === 4902 || switchError.code === -32603) {
          // Network not added, try to add it
          try {
            await provider.send('wallet_addEthereumChain', [
              {
                chainId: `0x${DEFAULT_CHAIN_ID.toString(16)}`,
                chainName: DEFAULT_CHAIN_ID === 8453 ? 'Base' : 'Base Sepolia',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: [RPC_URL],
                blockExplorerUrls: [DEFAULT_CHAIN_ID === 8453 ? 'https://basescan.org' : 'https://sepolia.basescan.org'],
              },
            ]);
            // Wait for network to be added
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (addError) {
            const networkName = DEFAULT_CHAIN_ID === 8453 ? 'Base' : 'Base Sepolia';
            throw new Error(
              `Please switch to ${networkName} network (Chain ID: ${DEFAULT_CHAIN_ID}) in your wallet.`
            );
          }
        } else {
          const networkName = DEFAULT_CHAIN_ID === 8453 ? 'Base' : 'Base Sepolia';
          throw new Error(
            `Failed to switch network. Please switch to ${networkName} (Chain ID: ${DEFAULT_CHAIN_ID}) manually.`
          );
        }
      }
    }
    
    return provider;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to connect to wallet. Please try again.');
  }
}

export async function connectWallet() {
  try {
    console.log('🔌 Starting wallet connection...');
    const provider = await ensureWalletProvider();
    console.log('✅ Wallet provider ensured');
    
    // Request account access
    let accounts;
    try {
      accounts = await provider.send('eth_requestAccounts', []);
      console.log('📋 Accounts requested:', accounts);
    } catch (requestError: any) {
      console.error('❌ Failed to request accounts:', requestError);
      if (requestError.code === 4001) {
        throw new Error('Connection rejected. Please approve the connection request in MetaMask.');
      } else if (requestError.code === -32002) {
        throw new Error('Connection request already pending. Please check your MetaMask window.');
      }
      throw new Error(`Failed to connect: ${requestError.message || 'Unknown error'}`);
    }
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please unlock your MetaMask wallet.');
    }
    
    const signer = await provider.getSigner();
    const address = accounts[0] || (await signer.getAddress());
    
    if (!address) {
      throw new Error('Failed to get wallet address. Please try again.');
    }
    
    console.log('✅ Wallet connected:', address);
    return { provider, signer, address };
  } catch (error) {
    console.error('❌ Wallet connection error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to connect wallet. Please make sure MetaMask is installed and unlocked.');
  }
}

export async function fetchLotteryState(limit = 5) {
  try {
    const contract = getReadLotteryContract();
    const [pots, currentDrawIdBn] = await Promise.all([
      contract.getCurrentPots(),
      contract.currentDrawId(),
    ]);

    const currentDrawId = Number(currentDrawIdBn);
    const mainPotRaw = pots[0];
    const bonusPotRaw = pots[1];
    const mainPot = Number(formatUnits(mainPotRaw, USDC_DECIMALS));
    const bonusPot = Number(formatUnits(bonusPotRaw, USDC_DECIMALS));
    
    console.log('📊 Blockchain state:', {
      mainPotRaw: mainPotRaw.toString(),
      mainPot,
      bonusPotRaw: bonusPotRaw.toString(),
      bonusPot,
      currentDrawId,
      contractAddress: LOTTERY_ADDRESS,
    });

    const drawSnapshots = [];
    const bonusSnapshots = [];
    for (let drawId = currentDrawId; drawId >= 1 && drawSnapshots.length < limit; drawId--) {
      try {
        const info = await contract.getDrawInfo(drawId);
        const finalized = info.mainDrawFinalized || info.bonusDrawFinalized;
        if (!finalized) continue;
        drawSnapshots.push({
          id: Number(info.drawId),
          timestamp: Number(info.mainDrawTime) * 1000,
          winner: info.mainWinner,
          winningTicket: `#${Number(info.drawId)}`,
          prize: Number(formatUnits(info.mainPrize, USDC_DECIMALS)),
          totalTickets: Number(info.totalTickets),
        });
        const cleanWinners = info.bonusWinners
          .filter((addr: string) => addr && addr !== '0x0000000000000000000000000000000000000000')
          .map((addr: string) => ({
            address: addr,
            ticketId: `bonus-${drawId}`,
            prize: Number(formatUnits(info.bonusPrizeEach, USDC_DECIMALS)),
          }));

        bonusSnapshots.push({
          id: Number(info.drawId),
          timestamp: Number(info.bonusDrawTime) * 1000,
          winners: cleanWinners,
          totalPot: Number(formatUnits(info.bonusPrizeEach * BigInt(cleanWinners.length), USDC_DECIMALS)),
          totalTickets: Number(info.totalTickets),
        });
      } catch (err) {
        // Skip invalid draw IDs
        console.warn(`Failed to fetch draw ${drawId}:`, err);
        continue;
      }
    }

    return {
      mainPot,
      bonusPot,
      currentDrawId,
      totalTickets: drawSnapshots[0]?.totalTickets || 0,
      draws: drawSnapshots,
      secondaryDraws: bonusSnapshots,
    };
  } catch (error) {
    console.error('Failed to fetch lottery state:', error);
    throw new Error(`Failed to fetch lottery state: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function fetchUserState(address: string, drawId?: number) {
  if (!address) {
    return null;
  }
  try {
    const contract = getReadLotteryContract();
    const targetDraw = drawId ?? Number(await contract.currentDrawId());
    const [ticketCountBn, lifetimeBn, pendingClaimBn, usdcBalanceBn] =
      await Promise.all([
        contract.getUserTickets(targetDraw, address),
        contract.lifetimeTickets(address),
        contract.pendingClaims(targetDraw, address),
        new Contract(USDC_ADDRESS, ERC20_ABI, rpcProvider).balanceOf(address),
      ]);

    const usdcBalance = Number(formatUnits(usdcBalanceBn, USDC_DECIMALS));
    console.log('💰 User USDC balance:', {
      address,
      raw: usdcBalanceBn.toString(),
      formatted: usdcBalance,
    });
    
    return {
      drawId: targetDraw,
      ticketCount: Number(ticketCountBn),
      lifetimeTickets: Number(lifetimeBn),
      pendingClaim: Number(formatUnits(pendingClaimBn, USDC_DECIMALS)),
      usdcBalance,
    };
  } catch (error) {
    console.error('Failed to fetch user state:', error);
    throw new Error(`Failed to fetch user state: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function calculateTicketCost(count: number) {
  const contract = getReadLotteryContract();
  const baseCost = BigInt(count) * parseUnits('1', USDC_DECIMALS);
  const quickDealsEnabled = await contract.quickDealsEnabled();
  if (!quickDealsEnabled) return baseCost;
  const discountBps: bigint = await contract.quickDealDiscounts(count);
  if (discountBps === BigInt(0)) return baseCost;
  const discount = (baseCost * discountBps) / BigInt(10000);
  return baseCost - discount;
}

export async function buyTicketsOnChain(count: number) {
  if (count <= 0) {
    throw new Error('Ticket count must be greater than zero.');
  }
  
  try {
    const { signer, address } = await connectWallet();
    
    // Check USDC balance first
    const usdcContract = new Contract(USDC_ADDRESS, ERC20_ABI, signer);
    const balance = await usdcContract.balanceOf(address);
    const [costWei, latestAllowance] = await Promise.all([
      calculateTicketCost(count),
      usdcContract.allowance(address, LOTTERY_ADDRESS),
    ]);

    // Check if user has enough balance
    if (balance < costWei) {
      const needed = Number(formatUnits(costWei - balance, USDC_DECIMALS));
      throw new Error(`Insufficient USDC balance. You need ${needed.toFixed(2)} more USDC.`);
    }

    // Approve if needed
    if (latestAllowance < costWei) {
      try {
        const approveTx = await usdcContract.approve(LOTTERY_ADDRESS, costWei);
        await approveTx.wait();
      } catch (approveError: any) {
        if (approveError.code === 4001) {
          throw new Error('Approval cancelled. Please approve USDC spending to continue.');
        }
        throw new Error(`Failed to approve USDC: ${approveError.message || 'Unknown error'}`);
      }
    }

    // Buy tickets
    const lottery = new Contract(LOTTERY_ADDRESS, AUREUS_LOTTERY_ABI, signer);
    let tx;
    try {
      tx = await lottery.buyTickets(count);
    } catch (txError: any) {
      if (txError.code === 4001) {
        throw new Error('Transaction cancelled.');
      }
      throw new Error(`Transaction failed: ${txError.message || 'Unknown error'}`);
    }
    
    const receipt = await tx.wait();
    
    if (!receipt) {
      throw new Error('Transaction receipt not found. Please check your wallet.');
    }
    
    return {
      hash: receipt.hash || tx.hash,
      address,
      cost: Number(formatUnits(costWei, USDC_DECIMALS)),
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to buy tickets. Please try again.');
  }
}

export function formatUsdc(value: number | bigint) {
  if (typeof value === 'bigint') {
    return Number(formatUnits(value, USDC_DECIMALS));
  }
  return value;
}

export async function requestMainDrawOnChain() {
  const { signer } = await connectWallet();
  const lottery = new Contract(LOTTERY_ADDRESS, AUREUS_LOTTERY_ABI, signer);
  const tx = await lottery.requestMainDraw();
  return tx.wait();
}

export async function requestBonusDrawOnChain() {
  const { signer } = await connectWallet();
  const lottery = new Contract(LOTTERY_ADDRESS, AUREUS_LOTTERY_ABI, signer);
  const tx = await lottery.requestBonusDraw();
  return tx.wait();
}

