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
  on?: (event: string, handler: (...args: any[]) => void) => void;
  removeListener?: (event: string, handler: (...args: any[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

const USDC_DECIMALS = 6;
const rpcProvider = new JsonRpcProvider(RPC_URL);
const isDev = process.env.NODE_ENV !== 'production';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const devLog = (...args: any[]) => { if (isDev) console.log(...args); };

function getReadLotteryContract() {
  return new Contract(LOTTERY_ADDRESS, AUREUS_LOTTERY_ABI, rpcProvider);
}

/**
 * Obtenir un provider RPC public (lecture seule)
 */
export function getPublicProvider(): JsonRpcProvider {
  return new JsonRpcProvider(RPC_URL);
}

// Types
interface WalletConnection {
  provider: BrowserProvider;
  signer: any;
  address: string;
}

/**
 * Vérifie et change le réseau si nécessaire
 */
async function ensureCorrectNetwork(): Promise<void> {
  if (!window.ethereum) {
    throw new Error('MetaMask not available');
  }
  
  const REQUIRED_CHAIN_ID = `0x${DEFAULT_CHAIN_ID.toString(16)}`;
  const networkName = DEFAULT_CHAIN_ID === 8453 ? 'Base' : 'Base Sepolia';
  const blockExplorerUrl = DEFAULT_CHAIN_ID === 8453 ? 'https://basescan.org' : 'https://sepolia.basescan.org';
  
  try {
    // Vérifier le réseau actuel
    const chainId = await window.ethereum.request({ method: 'eth_chainId' }) as string;
    devLog('📡 Current chain ID:', chainId);
    
    if (chainId !== REQUIRED_CHAIN_ID) {
      devLog(`🔄 Wrong network - switching to ${networkName}...`);
      
      try {
        // Essayer de changer vers le réseau requis
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: REQUIRED_CHAIN_ID }],
        });
        devLog(`✅ Network switched to ${networkName}`);
      } catch (switchError: any) {
        // Si le réseau n'existe pas dans MetaMask, l'ajouter
        if (switchError.code === 4902) {
          devLog(`➕ Adding ${networkName} network...`);
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: REQUIRED_CHAIN_ID,
              chainName: networkName,
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: [RPC_URL],
              blockExplorerUrls: [blockExplorerUrl],
            }],
          });
          devLog(`✅ ${networkName} network added`);
        } else {
          throw switchError;
        }
      }
    } else {
      devLog(`✅ Already on ${networkName}`);
    }
  } catch (error: any) {
    console.error('❌ Network check/switch error:', error);
    throw new Error(`Network error: ${error.message}`);
  }
}

export async function ensureWalletProvider(): Promise<BrowserProvider> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask not available');
  }
  
  const provider = new BrowserProvider(window.ethereum);
  
  // Vérifier le réseau
  await ensureCorrectNetwork();
  
  return provider;
}

/**
 * Connexion au wallet MetaMask
 * Gère la détection, la connexion et la vérification du réseau
 */
export async function connectWallet(): Promise<WalletConnection> {
  try {
    devLog('🔌 blockchain.ts: Starting wallet connection...');
    
    // Vérification environnement navigateur
    if (typeof window === 'undefined') {
      throw new Error('This function must be called in a browser environment.');
    }
    
    // Vérification présence MetaMask
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
    }
    
    devLog('✅ MetaMask detected');
    
    // REQUÊTE PRINCIPALE - eth_requestAccounts
    let accounts: string[];
    try {
      devLog('📋 Requesting account access via window.ethereum.request...');
      
      const ethereum = window.ethereum;
      
      // Double vérification que ethereum.request existe
      if (!ethereum || typeof ethereum.request !== 'function') {
        throw new Error('MetaMask is not properly installed or initialized. Please refresh the page.');
      }
      
      // Demander l'accès aux comptes
      accounts = await ethereum.request({ 
        method: 'eth_requestAccounts' 
      }) as string[];
      
      devLog('✅ Accounts received from MetaMask:', accounts);
      
    } catch (requestError: any) {
      console.error('❌ Request error:', requestError);
      
      // Gestion des erreurs spécifiques MetaMask
      if (requestError.code === 4001) {
        throw new Error('Connection request rejected by user. Please try again and approve the connection.');
      } else if (requestError.code === -32002) {
        throw new Error('Connection request already pending. Please check MetaMask and approve the pending request.');
      } else if (requestError.code === -32603) {
        throw new Error('Internal MetaMask error. Please try refreshing the page.');
      }
      
      // Erreur générique
      throw new Error(`Failed to request accounts: ${requestError.message || 'Unknown error'}`);
    }
    
    // Vérification que des comptes ont été retournés
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please unlock your MetaMask wallet and try again.');
    }
    
    const address = accounts[0];
    
    // Vérification que l'adresse est valide
    if (!address || typeof address !== 'string' || !address.startsWith('0x')) {
      throw new Error('Invalid wallet address received from MetaMask.');
    }
    
    devLog('✅ Valid account address:', address);
    
    // Création du provider et signer
    devLog('🔧 Creating provider and signer...');
    let provider: BrowserProvider;
    let signer: any;
    
    try {
      provider = new BrowserProvider(window.ethereum);
      signer = await provider.getSigner();
      devLog('✅ Provider and signer created successfully');
    } catch (providerError: any) {
      console.error('❌ Provider creation error:', providerError);
      throw new Error(`Failed to create provider: ${providerError.message}`);
    }
    
    // Vérification du réseau (non-bloquant)
    try {
      devLog('🌐 Checking network...');
      await ensureCorrectNetwork();
      const networkName = DEFAULT_CHAIN_ID === 8453 ? 'Base' : 'Base Sepolia';
      devLog(`✅ Network verified - connected to ${networkName}`);
    } catch (networkError: any) {
      console.warn('⚠️ Network issue (but wallet is connected):', networkError);
      // Ne pas throw - le wallet est connecté, l'utilisateur peut changer le réseau plus tard
      // On pourrait afficher un warning à l'utilisateur ici
    }
    
    devLog('✅ Wallet connection complete');
    
    return { provider, signer, address };
    
  } catch (error) {
    console.error('❌ Wallet connection error:', error);
    
    // Re-throw les erreurs avec leurs messages
    if (error instanceof Error) {
      throw error;
    }
    
    // Erreur inconnue
    throw new Error('Failed to connect wallet. Please try again.');
  }
}

export async function fetchLotteryState(limit = 5) {
  try {
    devLog('📡 Fetching lottery state from blockchain...');
    const contract = getReadLotteryContract();
    const [pots, currentDrawIdBn] = await Promise.all([
      contract.getCurrentPots().catch((err: unknown) => {
        throw new Error(`Failed to fetch lottery pots: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }),
      contract.currentDrawId().catch((err: unknown) => {
        throw new Error(`Failed to fetch current draw ID: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }),
    ]);

    const currentDrawId = Number(currentDrawIdBn);
    const mainPotRaw = pots[0];
    const bonusPotRaw = pots[1];
    const mainPot = Number(formatUnits(mainPotRaw, USDC_DECIMALS));
    const bonusPot = Number(formatUnits(bonusPotRaw, USDC_DECIMALS));
    
    devLog('📊 Blockchain state:', {
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
    devLog('⚠️ Contract not reachable — falling back to defaults:', error instanceof Error ? error.message : error);
    return {
      mainPot: 0,
      bonusPot: 0,
      currentDrawId: 1,
      totalTickets: 0,
      draws: [],
      secondaryDraws: [],
    };
  }
}

export async function fetchUserState(address: string, drawId?: number) {
  if (!address) {
    return null;
  }
  try {
    devLog('👤 Fetching user state for:', address);
    const contract = getReadLotteryContract();
    const targetDraw = drawId ?? Number(await contract.currentDrawId().catch((err: unknown) => {
      throw new Error(`Failed to fetch current draw ID: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }));
    
    const [ticketCountBn, lifetimeBn, pendingClaimBn, usdcBalanceBn] =
      await Promise.all([
        contract.getUserTickets(targetDraw, address).catch(() => BigInt(0)),
        contract.lifetimeTickets(address).catch(() => BigInt(0)),
        contract.pendingClaims(targetDraw, address).catch(() => BigInt(0)),
        new Contract(USDC_ADDRESS, ERC20_ABI, rpcProvider).balanceOf(address).catch(() => BigInt(0)),
      ]);

    const usdcBalance = Number(formatUnits(usdcBalanceBn, USDC_DECIMALS));
    devLog('💰 User USDC balance:', {
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
    devLog('⚠️ Failed to fetch user state:', error instanceof Error ? error.message : error);
    return null;
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

