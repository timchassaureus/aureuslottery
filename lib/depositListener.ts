'use client';

import { ethers } from 'ethers';
import { DEFAULT_CHAIN_ID, RPC_URL } from './config';

/**
 * Écoute les dépôts sur la blockchain et met à jour les soldes
 */
export async function listenForDeposits(
  userWalletAddress: string,
  onDeposit: (amount: number) => void
): Promise<void> {
  if (typeof window === 'undefined') return;
  
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    
    // TODO: Récupérer l'adresse du contrat AureusDeposit depuis la config
    const depositContractAddress = process.env.NEXT_PUBLIC_DEPOSIT_CONTRACT_ADDRESS || '';
    
    if (!depositContractAddress) {
      console.warn('Deposit contract address not configured');
      return;
    }
    
    // ABI simplifié pour l'événement Deposit
    const depositAbi = [
      "event Deposit(address indexed user, address indexed token, uint256 tokenAmount, uint256 usdcAmount)"
    ];
    
    const contract = new ethers.Contract(depositContractAddress, depositAbi, provider);
    
    // Écouter les événements Deposit pour cet utilisateur
    contract.on('Deposit', (user, token, tokenAmount, usdcAmount) => {
      if (user.toLowerCase() === userWalletAddress.toLowerCase()) {
        // Convertir wei en USDC (6 décimales)
        const amount = Number(ethers.formatUnits(usdcAmount, 6));
        onDeposit(amount);
      }
    });
    
    console.log('Listening for deposits...');
  } catch (error) {
    console.error('Error setting up deposit listener:', error);
  }
}

/**
 * Vérifie le solde d'un utilisateur sur la blockchain
 */
export async function checkUserBalance(userWalletAddress: string): Promise<number> {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const depositContractAddress = process.env.NEXT_PUBLIC_DEPOSIT_CONTRACT_ADDRESS || '';
    
    if (!depositContractAddress) {
      return 0;
    }
    
    // ABI simplifié pour getBalance
    const abi = [
      "function getBalance(address user) external view returns (uint256)"
    ];
    
    const contract = new ethers.Contract(depositContractAddress, abi, provider);
    const balance = await contract.getBalance(userWalletAddress);
    
    // Convertir en USDC (6 décimales)
    return Number(ethers.formatUnits(balance, 6));
  } catch (error) {
    console.error('Error checking balance:', error);
    return 0;
  }
}


