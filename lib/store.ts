'use client';

import { create } from 'zustand';

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
  tickets: Ticket[];
  totalSpent: number;
  totalWon: number;
  lifetimeTickets: number;
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
  
  // Actions
  setJackpot: (amount: number) => void;
  buyTicket: (owner: string) => void;
  buyMultipleTickets: (owner: string, count: number) => void;
  connectWallet: (address: string) => void;
  disconnectWallet: () => void;
  performDraw: () => Promise<{ winner: string; prize: number } | undefined>;
  performSecondaryDraw: () => Promise<void>;
  addDraw: (draw: Draw) => void;
  ride: (owner: string, amount: number) => { win: boolean; amount: number };
  giveShareBonus: (owner: string) => void;
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
  jackpot: 850, // 85% of 1000 tickets sold (example: $1 × 1000 × 0.85)
  secondaryPot: 50, // 5% of 1000 tickets sold (example: $1 × 1000 × 0.05)
  ticketPrice: TICKET_PRICE,
  connected: false,
  user: null,
  tickets: [],
  draws: [],
  secondaryDraws: [],
  currentDrawNumber: 1,
  ownerWallet: '0x742d35Cc6634C0532925a3b8D8F3DFE6F3A9a1b9', // Owner's wallet
  totalTicketsSold: 0,

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
    const { draws, tickets } = get();
    // Count total lifetime tickets
    const lifetimeTickets = tickets.filter(t => t.owner === address).length;
    
    const user: User = {
      address,
      tickets: tickets.filter(t => t.owner === address && t.drawNumber === get().currentDrawNumber),
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

  performDraw: async () => {
    const { tickets, jackpot, currentDrawNumber, ownerWallet, totalTicketsSold } = get();
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
    console.log(`🎁 Secondary pot for 11PM draw: Will be distributed to 50 winners`);
    
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
    
    // Select 50 unique winners
    const numberOfWinners = Math.min(50, ticketsInCurrentDraw.length);
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
}));

