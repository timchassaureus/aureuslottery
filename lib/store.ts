'use client';

import { create } from 'zustand';
import { DEFAULT_MODE, FORCED_MODE } from './config';
import { fetchLotteryState, fetchUserState } from './blockchain';

export interface Ticket {
  id: string;
  owner: string;
  timestamp: number;
  drawNumber: number;
}

export interface Draw {
  id: number;
  timestamp: number;
  winner: string;
  winningTicket: string;
  prize: number;
  totalTickets?: number; // Total tickets in that draw
}

export interface SecondaryDraw {
  id: number;
  timestamp: number;
  winners: Array<{
    address: string;
    ticketId: string;
    prize: number;
  }>;
  totalPot: number;
  totalTickets: number;
}

export interface User {
  address: string;
  username?: string; // Optional username/pseudonyme
  telegramUsername?: string; // Future: Telegram integration
  tickets: Ticket[];
  totalSpent: number;
  totalWon: number;
  lifetimeTickets: number;
  ticketCount?: number;
  usdcBalance?: number;
  pendingClaim?: number;
}

interface AppState {
  jackpot: number;
  secondaryPot: number; // 5% pot for 10PM draw
  ticketPrice: number;
  connected: boolean;
  user: User | null;
  tickets: Ticket[];
  draws: Draw[];
  secondaryDraws: SecondaryDraw[];
  currentDrawNumber: number;
  ownerWallet: string;
  totalTicketsSold: number; // Track total for probability display
  mode: 'demo' | 'live';
  isSyncing: boolean;
  lastSynced?: number;
  
  // Actions
  setJackpot: (amount: number) => void;
  buyTicket: (owner: string) => void;
  buyMultipleTickets: (owner: string, count: number) => void;
  connectWallet: (address: string) => void;
  disconnectWallet: () => void;
  setUsername: (address: string, username: string) => void;
  performDraw: () => Promise<{ winner: string; prize: number } | undefined>;
  performSecondaryDraw: () => Promise<void>;
  addDraw: (draw: Draw) => void;
  ride: (owner: string, amount: number) => { win: boolean; amount: number };
  giveShareBonus: (owner: string) => void;
  initDemo: () => void;
  setMode: (mode: 'demo' | 'live') => void;
  syncOnChainData: (address?: string) => Promise<void>;
}

const TICKET_PRICE = 1; // 1 USDC

// Quick buy deals with special discounts (must match exact quantity)
const QUICK_BUY_DEALS = [
  { tickets: 5, discount: 0.02 },
  { tickets: 10, discount: 0.05 },
  { tickets: 20, discount: 0.08 },
  { tickets: 50, discount: 0.12 },
  { tickets: 100, discount: 0.15 },
  { tickets: 1000, discount: 0.20 },
];

// Calculate discount based on exact quick buy match only
function calculateDiscount(count: number): number {
  const deal = QUICK_BUY_DEALS.find(d => d.tickets === count);
  return deal ? deal.discount : 0; // No discount for custom amounts
}

export const useAppStore = create<AppState>((set, get) => ({
  jackpot: 0, // Start at 0 - will be synced from blockchain in live mode
  secondaryPot: 0, // Start at 0 - will be synced from blockchain in live mode
  ticketPrice: TICKET_PRICE,
  connected: false,
  user: null,
  tickets: [],
  draws: [],
  secondaryDraws: [],
  currentDrawNumber: 1,
  ownerWallet: '0x742d35Cc6634C0532925a3b8D8F3DFE6F3A9a1b9', // Owner's wallet
  totalTicketsSold: 0,
  mode: FORCED_MODE ?? DEFAULT_MODE,
  isSyncing: false,

  setJackpot: (amount) => set({ jackpot: amount }),

  buyTicket: (owner) => {
    const { tickets, currentDrawNumber, jackpot, secondaryPot, totalTicketsSold } = get();
    const ticket: Ticket = {
      id: `ticket-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      owner,
      timestamp: Date.now(),
      drawNumber: currentDrawNumber,
    };
    
    // New distribution: 85% jackpot, 10% owner, 5% secondary pot
    set({
      tickets: [...tickets, ticket],
      jackpot: jackpot + (TICKET_PRICE * 0.85),
      secondaryPot: secondaryPot + (TICKET_PRICE * 0.05),
      totalTicketsSold: totalTicketsSold + 1,
    });
  },

  buyMultipleTickets: (owner, count) => {
    const { tickets, currentDrawNumber, jackpot, secondaryPot, user, totalTicketsSold } = get();
    const discount = calculateDiscount(count);
    const pricePerTicket = TICKET_PRICE * (1 - discount);
    const totalCost = pricePerTicket * count;
    
    // New distribution: 85% jackpot, 10% owner, 5% secondary pot
    const jackpotContribution = totalCost * 0.85;
    const secondaryContribution = totalCost * 0.05;
    
    const newTickets: Ticket[] = Array.from({ length: count }, (_, i) => ({
      id: `ticket-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
      owner,
      timestamp: Date.now(),
      drawNumber: currentDrawNumber,
    }));
    
    // Update user's lifetime tickets
    const updatedUser = user ? {
      ...user,
      lifetimeTickets: user.lifetimeTickets + count,
      tickets: [...user.tickets, ...newTickets],
      totalSpent: user.totalSpent + totalCost,
    } : user;
    
    set({
      tickets: [...tickets, ...newTickets],
      jackpot: jackpot + jackpotContribution,
      secondaryPot: secondaryPot + secondaryContribution,
      user: updatedUser,
      totalTicketsSold: totalTicketsSold + count,
    });
  },

  connectWallet: (address) => {
    // PROTECTION SSR + LOGS
    if (typeof window === 'undefined') return;
    console.log('connectStore called for', address);

    const { draws, tickets } = get();
    // Count total lifetime tickets
    const lifetimeTickets = tickets.filter(t => t.owner === address).length;
    
    // Try to load username from localStorage
    const savedUsername = typeof window !== 'undefined' 
      ? localStorage.getItem(`aureus_username_${address.toLowerCase()}`) || undefined
      : undefined;
    
    // Try to load Telegram username (future integration)
    const telegramUsername = typeof window !== 'undefined'
      ? localStorage.getItem(`aureus_telegram_${address.toLowerCase()}`) || undefined
      : undefined;
    
    const ticketsInDraw = tickets.filter(t => t.owner === address && t.drawNumber === get().currentDrawNumber);
    const user: User = {
      address,
      username: savedUsername,
      telegramUsername: telegramUsername || undefined,
      tickets: ticketsInDraw,
      ticketCount: ticketsInDraw.length,
      totalSpent: lifetimeTickets * TICKET_PRICE,
      totalWon: 0,
      lifetimeTickets,
    };
    
    // Calculate total won from history
    const userWins = draws.filter(d => d.winner === address);
    user.totalWon = userWins.reduce((sum, d) => sum + d.prize, 0);
    
    set({
      connected: true,
      user,
    });
  },

  disconnectWallet: () => {
    set({
      connected: false,
      user: null,
    });
  },

  setUsername: (address, username) => {
    const { user } = get();
    if (!user || user.address.toLowerCase() !== address.toLowerCase()) return;
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(`aureus_username_${address.toLowerCase()}`, username);
    }
    
    const updatedUser = {
      ...user,
      username,
    };
    
    set({ user: updatedUser });
  },

  performDraw: async () => {
    const { tickets, jackpot, currentDrawNumber, ownerWallet } = get();
    const ticketsInCurrentDraw = tickets.filter(t => t.drawNumber === currentDrawNumber);
    
    if (ticketsInCurrentDraw.length === 0) {
      return;
    }
    
    // Import VRF dynamically to avoid SSR issues
    const { randomSelection } = await import('./vrf');
    
    // Random selection using Chainlink VRF simulation
    const winningTicket = await randomSelection(ticketsInCurrentDraw);
    
    // The jackpot is already 85%, so winner gets all of it
    const prize = Math.floor(jackpot);
    
    // Calculate owner's fee (10% of total collected)
    const totalCollected = Math.floor((jackpot / 0.85) * 1.05); // Total including secondary pot
    const ownerFee = Math.floor(totalCollected * 0.10);
    
    console.log(`🎰 9PM Draw #${currentDrawNumber} performed! Winner: ${winningTicket.owner.slice(0, 8)}...`);
    console.log(`💰 Prize: $${prize.toLocaleString()} USDC (85% of total)`);
    console.log(`👨‍💼 Owner fee (${ownerWallet.slice(0, 8)}...): $${ownerFee.toLocaleString()} USDC (10%)`);
    console.log(`🎁 Secondary pot for 11PM draw: Will be distributed to 25 winners`);
    
    const draw: Draw = {
      id: currentDrawNumber,
      timestamp: Date.now(),
      winner: winningTicket.owner,
      winningTicket: winningTicket.id,
      prize,
      totalTickets: ticketsInCurrentDraw.length,
    };
    
    // Update user stats if winner is connected
    const state = get();
    if (state.user && winningTicket.owner === state.user.address) {
      state.user.totalWon += prize;
    }
    
    // Keep secondary pot and tickets for 10PM draw
    // Don't reset jackpot to 0, start fresh for next day
    set({
      draws: [...state.draws, draw],
      jackpot: 0, // Reset main jackpot for next day
    });
    
    // Return winner info for animation
    return {
      winner: winningTicket.owner,
      prize
    };
  },

  performSecondaryDraw: async () => {
    const { tickets, secondaryPot, currentDrawNumber } = get();
    const ticketsInCurrentDraw = tickets.filter(t => t.drawNumber === currentDrawNumber);
    
    if (ticketsInCurrentDraw.length === 0 || secondaryPot === 0) {
      return;
    }
    
    // Import VRF dynamically
    const { randomSelection } = await import('./vrf');
    
    // Select 25 unique winners
    const numberOfWinners = Math.min(25, ticketsInCurrentDraw.length);
    const prizePerWinner = Math.floor(secondaryPot / numberOfWinners);
    const winners = [];
    const selectedTickets = new Set();
    
    for (let i = 0; i < numberOfWinners; i++) {
      const availableTickets = ticketsInCurrentDraw.filter(t => !selectedTickets.has(t.id));
      if (availableTickets.length === 0) break;
      
      const winningTicket = await randomSelection(availableTickets);
      selectedTickets.add(winningTicket.id);
      
      winners.push({
        address: winningTicket.owner,
        ticketId: winningTicket.id,
        prize: prizePerWinner,
      });
    }
    
    const secondaryDraw: SecondaryDraw = {
      id: currentDrawNumber,
      timestamp: Date.now(),
      winners,
      totalPot: secondaryPot,
      totalTickets: ticketsInCurrentDraw.length,
    };
    
    console.log(`🎁 10PM Draw #${currentDrawNumber} performed!`);
    console.log(`🏆 ${winners.length} winners, $${prizePerWinner} each!`);
    
    // Update user stats if they won
    const state = get();
    if (state.user) {
      const userWins = winners.filter(w => w.address === state.user!.address);
      if (userWins.length > 0) {
        state.user.totalWon += userWins.length * prizePerWinner;
      }
    }
    
    // Now reset everything for next day
    set({
      secondaryDraws: [...state.secondaryDraws, secondaryDraw],
      currentDrawNumber: currentDrawNumber + 1,
      secondaryPot: 0,
      tickets: [],
      totalTicketsSold: 0,
    });
  },

  addDraw: (draw) => {
    set({ draws: [...get().draws, draw] });
  },

  ride: (owner, amount) => {
    const { jackpot } = get();
    const rideAmount = amount * 0.5; // Take 50% of bet
    
    // 50% chance to multiply by 10, 50% chance to lose
    const win = Math.random() > 0.5;
    
    if (win) {
      const winnings = amount * 10;
      set({ jackpot: jackpot - winnings });
    } else {
      set({ jackpot: jackpot + rideAmount });
    }
    
    return { win, amount: win ? amount * 10 : 0 };
  },

  giveShareBonus: (owner) => {
    const { tickets, currentDrawNumber, user } = get();
    
    // Give 1 free ticket for sharing
    const bonusTicket: Ticket = {
      id: `bonus-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      owner,
      timestamp: Date.now(),
      drawNumber: currentDrawNumber,
    };
    
    // Update user's tickets and lifetime count
    if (user && user.address === owner) {
      const updatedUser = {
        ...user,
        tickets: [...user.tickets, bonusTicket],
        lifetimeTickets: user.lifetimeTickets + 1,
      };
      
      set({
        tickets: [...tickets, bonusTicket],
        user: updatedUser,
      });
      
      console.log(`🎁 Share bonus: ${owner.slice(0, 8)}... received +1 FREE ticket!`);
    }
  },

  initDemo: () => {
    const now = Date.now();
    const demoTickets: Ticket[] = Array.from({ length: 500 }, (_, index) => ({
      id: `demo-${index}`,
      owner: `0xdemo${(Math.random() * 1e16).toString(16).padStart(16, '0')}`,
      timestamp: now - Math.floor(Math.random() * 86400000),
      drawNumber: 1,
    }));

    const demoDraws: Draw[] = [
      {
        id: 1,
        timestamp: now - 3600 * 1000 * 24,
        winner: demoTickets[0]?.owner || '0x0000',
        winningTicket: demoTickets[0]?.id || 'demo-0',
        prize: 42000,
        totalTickets: demoTickets.length,
      },
    ];

    const demoSecondary: SecondaryDraw[] = [
      {
        id: 1,
        timestamp: now - 3600 * 1000 * 23,
        totalPot: 2500,
        totalTickets: demoTickets.length,
        winners: demoTickets.slice(0, 25).map((ticket) => ({
          address: ticket.owner,
          ticketId: ticket.id,
          prize: 100,
        })),
      },
    ];

    set({
      mode: 'demo',
      jackpot: 42500,
      secondaryPot: 2500,
      tickets: demoTickets,
      draws: demoDraws,
      secondaryDraws: demoSecondary,
      totalTicketsSold: demoTickets.length,
      currentDrawNumber: 2,
      connected: false,
    });
  },

  setMode: (mode) => {
    // Always enforce FORCED_MODE if set (defaults to 'live')
    if (FORCED_MODE) {
      const forcedMode = FORCED_MODE;
      set({ mode: forcedMode });
      if (typeof window !== 'undefined') {
        // Aggressively clear any demo mode traces
        localStorage.removeItem('aureus_mode');
        localStorage.removeItem('aureus_demo_initialized');
        // Set live mode explicitly
        if (forcedMode === 'live') {
          localStorage.setItem('aureus_mode', 'live');
        }
      }
      if (forcedMode === 'live') {
        get().syncOnChainData();
      }
      return;
    }
    set({ mode });
    if (typeof window !== 'undefined') {
      localStorage.setItem('aureus_mode', mode);
    }
    if (mode === 'live') {
      get().syncOnChainData();
    }
  },

  syncOnChainData: async (address) => {
    // Ne sync que en mode live
    if (get().mode !== 'live') {
      console.log('⏭️ Skipping sync - not in live mode');
      return;
    }
    
    console.log('🔄 Starting on-chain data sync...');
    set({ isSyncing: true });
    
    try {
      console.log('📡 Fetching lottery state from blockchain...');
      const chain = await fetchLotteryState();
      console.log('✅ Lottery state fetched successfully');
      
      // Mise à jour des données de la loterie
      set({
        jackpot: chain.mainPot ?? 0,
        secondaryPot: chain.bonusPot ?? 0,
        currentDrawNumber: chain.currentDrawId,
        draws: chain.draws,
        secondaryDraws: chain.secondaryDraws,
        totalTicketsSold: chain.totalTickets,
        lastSynced: Date.now(),
      });
      
      console.log('✅ Lottery data updated in store');

      // Récupérer les données utilisateur
      const targetAddress = address || get().user?.address;
      if (targetAddress) {
        console.log('📡 Fetching user state for address:', targetAddress);
        
        try {
          const userData = await fetchUserState(targetAddress, chain.currentDrawId);
          
          if (userData) {
            console.log('✅ User state fetched successfully');
            
            // Créer des tickets placeholder (les vrais numéros viendront plus tard)
            const placeholderTickets: Ticket[] = Array.from(
              { length: userData.ticketCount }, 
              (_, i) => ({
                id: `${chain.currentDrawId}-${targetAddress}-${i}`,
                owner: targetAddress,
                drawNumber: chain.currentDrawId,
                timestamp: Date.now(),
              })
            );
            
            // Mise à jour des données utilisateur
            set((state) => ({
              connected: true,
              user: {
                address: targetAddress,
                username: state.user?.username,
                telegramUsername: state.user?.telegramUsername,
                tickets: placeholderTickets,
                ticketCount: userData.ticketCount,
                totalSpent: userData.lifetimeTickets * TICKET_PRICE,
                totalWon: state.user?.totalWon || 0,
                lifetimeTickets: userData.lifetimeTickets,
                usdcBalance: userData.usdcBalance ?? 0,
                pendingClaim: userData.pendingClaim,
              },
            }));
            
            console.log('✅ User data updated in store');
          } else {
            console.log('ℹ️ No user data found on blockchain (new user)');
          }
        } catch (userError: any) {
          console.error('⚠️ Failed to fetch user state:', userError);
          // Ne pas throw - les données de loterie ont été mises à jour
        }
      }
      
      console.log('✅ On-chain sync completed successfully');
      
    } catch (error: any) {
      console.error('❌ Failed to sync on-chain data:', error);
      
      // Log détaillé de l'erreur pour le debugging
      if (error.code) {
        console.error('Error code:', error.code);
      }
      if (error.reason) {
        console.error('Error reason:', error.reason);
      }
      
      // Ne pas throw - garder l'app stable
      // L'utilisateur peut toujours utiliser l'app avec les données locales
      // ou réessayer plus tard
      
    } finally {
      set({ isSyncing: false });
      console.log('🏁 Sync process finished');
    }
  },
}));

