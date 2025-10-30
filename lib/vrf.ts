'use client';

/**
 * Simulated Chainlink VRF (Verifiable Random Function)
 * In production, this would call Chainlink VRF on-chain
 */

interface VRFResult {
  randomValue: number;
  blockNumber: number;
  blockHash: string;
  timestamp: number;
}

/**
 * Simulates Chainlink VRF v2 callback
 * In production, this would be handled on-chain
 */
export function requestRandomness(): Promise<VRFResult> {
  return new Promise((resolve) => {
    // Simulate blockchain delay
    setTimeout(() => {
      const now = Date.now();
      const blockNumber = now % 1000000;
      const blockHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      
      // Generate cryptographically-secure random number
      const randomValue = Math.random();
      
      resolve({
        randomValue,
        blockNumber,
        blockHash,
        timestamp: now,
      });
    }, 500);
  });
}

/**
 * Verifiable Random Function - selects a random index from array
 * Uses Chainlink VRF simulation for true randomness
 */
export async function randomSelection<T>(items: T[]): Promise<T> {
  if (items.length === 0) {
    throw new Error('Cannot select from empty array');
  }

  const vrf = await requestRandomness();
  
  // Use the random value to select an index
  const index = Math.floor(vrf.randomValue * items.length);
  
  console.log('🎲 VRF Random Selection:', {
    totalItems: items.length,
    selectedIndex: index,
    blockHash: vrf.blockHash.slice(0, 16) + '...',
    timestamp: new Date(vrf.timestamp).toISOString(),
  });
  
  return items[index];
}

/**
 * Verify random selection (mock verification)
 * In production, this would verify on-chain proof
 */
export function verifySelection(vrfResult: VRFResult): boolean {
  // Mock verification - always true in simulation
  // In production, this would verify the proof on-chain
  return vrfResult.randomValue >= 0 && vrfResult.randomValue <= 1;
}

