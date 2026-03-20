'use client';

import {
  Contract,
  JsonRpcProvider,
  FallbackProvider,
  formatUnits,
} from 'ethers';
import { AUREUS_LOTTERY_ABI } from './abis/AureusLotteryAbi';
import { ERC20_ABI } from './abis/ERC20Abi';
import {
  LOTTERY_ADDRESS,
  RPC_URL,
  USDC_ADDRESS,
} from './config';

const USDC_DECIMALS = 6;
const isDev = process.env.NODE_ENV !== 'production';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const devLog = (...args: any[]) => { if (isDev) console.log(...args); };

/**
 * RPCs de fallback pour Base Mainnet — tous gratuits et sans clé API.
 * Si le RPC principal est throttlé, ethers bascule automatiquement sur le suivant.
 */
const BASE_MAINNET_FALLBACK_RPCS = [
  'https://mainnet.base.org',           // RPC officiel Base
  'https://base.llamarpc.com',          // LlamaRPC — très fiable
  'https://base-rpc.publicnode.com',    // PublicNode
  'https://1rpc.io/base',              // 1RPC
];

function createRobustProvider(): JsonRpcProvider | FallbackProvider {
  // Si l'utilisateur a configuré un RPC personnalisé (Alchemy, Infura…), on l'utilise seul
  if (RPC_URL && !BASE_MAINNET_FALLBACK_RPCS.includes(RPC_URL)) {
    return new JsonRpcProvider(RPC_URL);
  }

  // Sinon on construit un FallbackProvider avec tous les RPCs publics
  try {
    const providers = BASE_MAINNET_FALLBACK_RPCS.map((url, index) =>
      ({
        provider: new JsonRpcProvider(url),
        priority: index + 1,
        stallTimeout: 2000,
        weight: 1,
      })
    );
    return new FallbackProvider(providers, 8453); // chainId Base Mainnet
  } catch {
    // En cas d'erreur (ex: mobile), retourner un provider simple
    return new JsonRpcProvider(RPC_URL || BASE_MAINNET_FALLBACK_RPCS[0]);
  }
}

// Provider partagé — créé une seule fois par module (optimise les connexions)
const rpcProvider = createRobustProvider();

function getReadLotteryContract() {
  return new Contract(LOTTERY_ADDRESS, AUREUS_LOTTERY_ABI, rpcProvider);
}

export function getPublicProvider(): JsonRpcProvider | FallbackProvider {
  return rpcProvider;
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

    devLog('📊 Blockchain state:', { mainPot, bonusPot, currentDrawId });

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
  if (!address) return null;
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
        new Contract(USDC_ADDRESS, ERC20_ABI, rpcProvider as JsonRpcProvider).balanceOf(address).catch(() => BigInt(0)),
      ]);

    const usdcBalance = Number(formatUnits(usdcBalanceBn, USDC_DECIMALS));
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

export function formatUsdc(value: number | bigint) {
  if (typeof value === 'bigint') {
    return Number(formatUnits(value, USDC_DECIMALS));
  }
  return value;
}
