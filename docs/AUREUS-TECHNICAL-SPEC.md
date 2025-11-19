# AUREUS - Technical Specification

**Version:** 1.0  
**Date:** November 2024  
**Confidential - NDA Protected**

---

## 📐 System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │   Web    │  │  Mobile  │  │   API    │             │
│  │   App    │  │  (PWA)   │  │  Routes  │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Smart Contract (Base Network)               │
│  ┌──────────────────────────────────────────────┐      │
│  │         AureusLottery.sol                     │      │
│  │  - Ticket Management                         │      │
│  │  - Draw Execution (Chainlink VRF)             │      │
│  │  - Prize Distribution                        │      │
│  │  - Treasury Management                       │      │
│  └──────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              External Services                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │Chainlink │  │  MoonPay │  │   X API  │             │
│  │  VRF     │  │  / Ramp  │  │          │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
```

---

## 🔷 Smart Contract Specification

### Contract: `AureusLottery.sol`

**Network:** Base (Chain ID: 8453)  
**Language:** Solidity 0.8.20  
**Standards:** ERC20, Chainlink VRF v2

#### Key Parameters

```solidity
TICKET_PRICE = 1 USDC
MAIN_POT_PERCENT = 85%
BONUS_POT_PERCENT = 5%
TREASURY_PERCENT = 10%
BONUS_WINNERS_COUNT = 25
```

#### Draw Schedule
- **Main Draw:** 21:00 UTC daily
- **Bonus Draw:** 21:30 UTC daily (30 minutes after main)

#### Core Functions

**1. `buyTickets(uint256 count)`**
- Allows users to purchase tickets
- Accepts USDC payment
- Distributes funds: 85% main pot, 5% bonus pot, 10% treasury
- Emits `TicketsPurchased` event
- Returns ticket IDs

**2. `requestMainDraw()`**
- Called by Chainlink Automation at 21:00 UTC
- Requests randomness from Chainlink VRF
- Emits `DrawRequested` event
- Only callable by owner or automation

**3. `requestBonusDraw()`**
- Called by Chainlink Automation at 21:30 UTC
- Requests randomness for 25 winners
- Emits `BonusDrawRequested` event

**4. `fulfillRandomWords(uint256 requestId, uint256[] randomWords)`**
- Chainlink VRF callback
- Selects winner(s) based on random number
- Distributes prizes automatically
- Emits `MainDrawFinalized` or `BonusDrawFinalized` event

**5. `claimPrize(uint256 drawId)`**
- Allows winners to claim prizes (if not auto-distributed)
- Transfers USDC to winner address
- Emits `PrizeClaimed` event

**6. `withdrawStuckTokens(address token, uint256 amount)`**
- Emergency function for owner
- Recovers stuck tokens (if any)
- Requires owner role

#### Events

```solidity
event TicketsPurchased(address indexed buyer, uint256 count, uint256 totalCost);
event DrawRequested(uint256 indexed drawId, uint256 timestamp);
event MainDrawFinalized(uint256 indexed drawId, address winner, uint256 prize);
event BonusDrawFinalized(uint256 indexed drawId, address[] winners, uint256 prizePerWinner);
event PrizeClaimed(address indexed winner, uint256 amount);
```

#### Security Features

- **ReentrancyGuard:** Prevents reentrancy attacks
- **SafeERC20:** Safe token transfers (handles non-standard ERC20)
- **Ownable:** Access control (only owner can trigger draws)
- **Pausable:** Emergency stop mechanism
- **Chainlink VRF:** Provably fair randomness

---

## 🎨 Frontend Architecture

### Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Icons:** Lucide React
- **Notifications:** react-hot-toast
- **Web3:** ethers.js (wallet connection)

### Key Components

**1. `app/page.tsx`**
- Main application page
- Orchestrates all components
- Manages draw countdown & auto-triggering
- Handles modals (buy tickets, profile, leaderboard)

**2. `components/BuyTicketsModal.tsx`**
- Ticket purchase interface
- Payment method selection (crypto vs card)
- Quick buy deals display
- Transaction handling

**3. `components/WinnerAnimation.tsx`**
- Winner reveal animation
- Confetti effects
- Social sharing buttons
- Prize claim guidance

**4. `components/WheelAnimation.tsx`**
- Spinning wheel animation
- Participant display
- Winner selection reveal

**5. `components/EnhancedWinnersHistory.tsx`**
- Recent winners display
- Main draw & bonus draw history
- Prize amounts & dates

**6. `components/LiveStats.tsx`**
- Real-time statistics
- Online players count
- Yesterday's jackpot win
- Tickets sold today

**7. `components/UserProfile.tsx`**
- User statistics
- Lifetime tickets
- Total spent/won
- Achievement display

**8. `components/Leaderboard.tsx`**
- Top ticket buyers
- Top winners
- Community rankings

**9. `components/PremiumChat.tsx`**
- Community chat
- Real-time messaging
- Ticket holder access only

**10. `components/HowItWorksModal.tsx`**
- Platform explanation
- Draw mechanics
- Prize distribution
- Special deals

### State Management (Zustand)

**Store:** `lib/store.ts`

```typescript
interface AppState {
  jackpot: number;
  secondaryPot: number;
  ticketPrice: number;
  connected: boolean;
  user: User | null;
  tickets: Ticket[];
  draws: Draw[];
  secondaryDraws: SecondaryDraw[];
  currentDrawNumber: number;
  totalTicketsSold: number;
  
  // Actions
  buyTicket(owner: string): void;
  buyMultipleTickets(owner: string, count: number): void;
  connectWallet(address: string): void;
  performDraw(): Promise<{ winner: string; prize: number } | undefined>;
  performSecondaryDraw(): Promise<void>;
  // ... more actions
}
```

---

## 🔌 API Endpoints

### Current Implementation

**1. `/api/verify-tweet` (POST)**
- Verifies X (Twitter) tweet sharing
- Validates tweet URL
- Grants free ticket bonus
- Returns verification status

**Request:**
```json
{
  "tweetUrl": "https://twitter.com/user/status/123456",
  "walletAddress": "0x..."
}
```

**Response:**
```json
{
  "verified": true,
  "bonusGranted": true
}
```

### Future Endpoints (for white-label integration)

**2. `/api/player/status` (GET)**
- Get player account status
- KYC/KYB verification status
- Geo-blocking status
- Wallet address mapping

**3. `/api/tickets/purchase` (POST)**
- Purchase tickets via white-label system
- Handle payment processing
- Return ticket IDs

**4. `/api/draws/webhook` (POST)**
- Receive draw notifications from smart contract
- Update frontend state
- Trigger winner announcements

**5. `/api/payouts/status` (GET)**
- Check payout status
- Treasury balance
- Prize distribution history

---

## 🤖 Bot Integration

### Telegram Bot

**Commands:**
- `/start` - Welcome message
- `/jackpot` - Current jackpot amount
- `/tickets` - User's ticket count
- `/stats` - Platform statistics
- `/nextdraw` - Time until next draw
- `/winners` - Recent winners
- `/link` - Website link

**Features:**
- Channel integration (announcements)
- Daily reminders
- Winner notifications

### X (Twitter) Bot

**Features:**
- Auto-posting (winner announcements, daily reminders)
- Engagement (mentions, replies)
- Scheduled content
- Viral message templates

---

## 🔐 Security Considerations

### Smart Contract
- ✅ Audited by OpenZeppelin standards
- ✅ Chainlink VRF for randomness (provably fair)
- ✅ Reentrancy protection
- ✅ Access control (Ownable)
- ✅ Emergency pause mechanism

### Frontend
- ✅ Wallet-based authentication (non-custodial)
- ✅ Input validation
- ✅ XSS protection (React sanitization)
- ✅ CSRF protection (Next.js built-in)

### Infrastructure
- ✅ HTTPS only (Vercel)
- ✅ Environment variables (secrets)
- ✅ Rate limiting (future)
- ✅ DDoS protection (Vercel)

---

## 📊 Database Schema (Future)

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  wallet_address VARCHAR(42) UNIQUE,
  username VARCHAR(50),
  telegram_username VARCHAR(50),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Tickets Table
```sql
CREATE TABLE tickets (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  draw_number INTEGER,
  purchase_timestamp TIMESTAMP,
  ticket_hash VARCHAR(66)
);
```

### Draws Table
```sql
CREATE TABLE draws (
  id UUID PRIMARY KEY,
  draw_type VARCHAR(20), -- 'main' or 'bonus'
  draw_number INTEGER,
  timestamp TIMESTAMP,
  winner_address VARCHAR(42),
  prize_amount DECIMAL(18, 6),
  total_tickets INTEGER,
  vrf_request_id VARCHAR(66)
);
```

---

## 🚀 Deployment

### Smart Contract
- **Network:** Base Mainnet (8453)
- **Deployment:** Hardhat scripts
- **Verification:** BaseScan
- **Monitoring:** Chainlink Automation

### Frontend
- **Platform:** Vercel
- **Domain:** (To be configured)
- **CDN:** Vercel Edge Network
- **SSL:** Automatic (Vercel)

### Environment Variables
```env
NEXT_PUBLIC_SITE_URL=https://aureus.app
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=8453
TWITTER_API_KEY=...
TELEGRAM_BOT_TOKEN=...
```

---

## 📝 Integration Checklist (for white-label)

- [ ] Player account sync (wallet ↔ white-label account)
- [ ] KYC/KYB verification hooks
- [ ] Ticket purchase API integration
- [ ] Draw webhook notifications
- [ ] Payout system integration
- [ ] Reporting & analytics
- [ ] Compliance data export
- [ ] Multi-currency support (if needed)
- [ ] Brand customization (colors, logos)
- [ ] Custom domain setup

---

**Document Version:** 1.0  
**Last Updated:** November 2024  
**Confidential - NDA Protected**



