# AUREUS - Complete Documentation Package

**For:** iLottoSolution  
**Date:** November 2024  
**Confidential - NDA Protected**

---

# Table of Contents

1. [Product Overview](#product-overview)
2. [Technical Specification](#technical-specification)
3. [API Integration Wishlist](#api-integration-wishlist)

---

# Product Overview

## 🎯 Executive Summary

**Aureus** is a daily cryptocurrency lottery platform built on Base network (Ethereum L2), using USDC as the primary currency. The platform combines provably fair smart contracts, viral growth mechanics, and automated daily draws to create an engaging, transparent lottery experience.

**Key Differentiators:**
- ✅ Fully decentralized (smart contract-based)
- ✅ Provably fair (Chainlink VRF)
- ✅ Automated daily draws (21:00 & 21:30 UTC)
- ✅ Viral growth mechanics (share-to-earn, referrals)
- ✅ Mobile-first, responsive design
- ✅ Telegram & X (Twitter) bot integration

## 📊 Business Model

### Revenue Split (per ticket purchase):
- **85%** → Main Jackpot (winner takes all)
- **5%** → Bonus Draw (25 winners split equally)
- **10%** → Treasury (platform operations)

### Ticket Pricing:
- **Base price:** 1 USDC per ticket
- **Quick Buy Deals:** Discounts for bulk purchases (5, 10, 20, 50, 100, 1000 tickets)
- **Discount range:** 2% to 20% depending on quantity

## 🎮 Core Features

### 1. Daily Draws
- **Main Draw:** 21:00 UTC daily - Single winner takes entire main jackpot
- **Bonus Draw:** 21:30 UTC daily - 25 winners split the bonus pot equally

### 2. Ticket Purchase
- **Payment methods:** Direct USDC (on-chain), Credit card via MoonPay/Ramp (planned)
- **Quick Buy Deals:** Pre-set quantities with discounts
- **Share Bonus:** Share on X (Twitter) → Get +1 FREE ticket

### 3. User Experience
- **Profile System:** Username/pseudonym, lifetime stats, achievements
- **Leaderboard:** Top ticket buyers, top winners, community rankings
- **Live Stats:** Online players, yesterday's jackpot, tickets sold today

### 4. Social & Viral
- **Share on X:** Pre-filled viral messages, dynamic jackpot amounts
- **Invite System:** Sticky "Invite & Grow the Pot" bar
- **Chat:** Premium chat for ticket holders

### 5. Transparency
- **Winner History:** Last 5 main draws, last 3 bonus draws
- **Smart Contract:** Fully auditable on-chain, Chainlink VRF, automatic payouts

## 🚀 Roadmap

### Phase 1: MVP (Current) ✅
- Smart contract deployment
- Frontend web app
- Basic ticket purchase
- Automated draws
- Winner animations
- Social sharing

### Phase 2: Growth (Q1 2025)
- MoonPay/Ramp integration
- Enhanced analytics dashboard
- Premium features
- Multi-language support
- Mobile app

### Phase 3: Scale (Q2 2025)
- White-label licensing
- API for third-party integrations
- Sponsored draws & partnerships
- Advanced gamification

## 💰 Financial Projections

### Conservative Estimates (Year 1)
- **Target:** 10,000 active users
- **Average tickets/user/day:** 5 tickets
- **Daily revenue:** 50,000 USDC
- **Monthly treasury:** 150,000 USDC
- **Annual treasury:** 1,800,000 USDC

### Growth Scenario (Year 2)
- **Target:** 100,000 active users
- **Daily revenue:** 300,000 USDC
- **Monthly treasury:** 900,000 USDC
- **Annual treasury:** 10,800,000 USDC

---

# Technical Specification

## 📐 System Architecture

```
Frontend (Next.js) → Smart Contract (Base) → External Services (Chainlink, MoonPay, X API)
```

## 🔷 Smart Contract Specification

### Contract: `AureusLottery.sol`

**Network:** Base (Chain ID: 8453)  
**Language:** Solidity 0.8.20

#### Key Parameters
- `TICKET_PRICE = 1 USDC`
- `MAIN_POT_PERCENT = 85%`
- `BONUS_POT_PERCENT = 5%`
- `TREASURY_PERCENT = 10%`
- `BONUS_WINNERS_COUNT = 25`

#### Draw Schedule
- **Main Draw:** 21:00 UTC daily
- **Bonus Draw:** 21:30 UTC daily

#### Core Functions

**1. `buyTickets(uint256 count)`**
- Allows users to purchase tickets
- Accepts USDC payment
- Distributes funds: 85% main pot, 5% bonus pot, 10% treasury
- Emits `TicketsPurchased` event

**2. `requestMainDraw()`**
- Called by Chainlink Automation at 21:00 UTC
- Requests randomness from Chainlink VRF
- Emits `DrawRequested` event

**3. `requestBonusDraw()`**
- Called by Chainlink Automation at 21:30 UTC
- Requests randomness for 25 winners

**4. `fulfillRandomWords(uint256 requestId, uint256[] randomWords)`**
- Chainlink VRF callback
- Selects winner(s) based on random number
- Distributes prizes automatically

**5. `claimPrize(uint256 drawId)`**
- Allows winners to claim prizes
- Transfers USDC to winner address

#### Security Features
- ✅ ReentrancyGuard
- ✅ SafeERC20
- ✅ Ownable (access control)
- ✅ Pausable (emergency stops)
- ✅ Chainlink VRF (provably fair)

## 🎨 Frontend Architecture

### Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Web3:** ethers.js

### Key Components
- Main application page (`app/page.tsx`)
- Ticket purchase modal (`components/BuyTicketsModal.tsx`)
- Winner animations (`components/WinnerAnimation.tsx`, `components/WheelAnimation.tsx`)
- Winner history (`components/EnhancedWinnersHistory.tsx`)
- Live stats (`components/LiveStats.tsx`)
- User profile (`components/UserProfile.tsx`)
- Leaderboard (`components/Leaderboard.tsx`)
- Chat (`components/PremiumChat.tsx`)

## 🔌 Current API Endpoints

**1. `/api/verify-tweet` (POST)**
- Verifies X (Twitter) tweet sharing
- Validates tweet URL
- Grants free ticket bonus

---

# API Integration Wishlist

This section outlines the API endpoints and integration points we expect from your white-label platform.

## 🔐 Authentication & Player Management

### 1. Player Account Sync
**Endpoint:** `POST /api/player/sync`

**Request:**
```json
{
  "walletAddress": "0x47d918C2e303855da1AD3e08A4128211284aD837",
  "username": "PlayerUsername",
  "metadata": {
    "telegramUsername": "@player",
    "referralCode": "ABC123"
  }
}
```

**Response:**
```json
{
  "playerId": "player_123456",
  "status": "active",
  "kycStatus": "verified",
  "geoBlocked": false
}
```

### 2. Player Status Check
**Endpoint:** `GET /api/player/{walletAddress}/status`

**Response:**
```json
{
  "playerId": "player_123456",
  "walletAddress": "0x47d918C2e303855da1AD3e08A4128211284aD837",
  "status": "active",
  "kycStatus": "verified",
  "kybStatus": "not_required",
  "geoBlocked": false,
  "allowedCountries": ["US", "CA", "GB"],
  "restrictedCountries": ["FR", "DE"]
}
```

## 🎫 Ticket Management

### 3. Ticket Purchase
**Endpoint:** `POST /api/tickets/purchase`

**Request:**
```json
{
  "playerId": "player_123456",
  "walletAddress": "0x47d918C2e303855da1AD3e08A4128211284aD837",
  "ticketCount": 10,
  "paymentMethod": "usdc",
  "paymentDetails": {
    "transactionHash": "0x...",
    "amount": "10.00"
  }
}
```

**Response:**
```json
{
  "success": true,
  "ticketIds": ["ticket_001", "ticket_002", ...],
  "totalCost": "10.00",
  "discountApplied": "0.50",
  "finalAmount": "9.50",
  "transactionId": "txn_123456",
  "drawNumber": 42
}
```

### 4. Ticket History
**Endpoint:** `GET /api/tickets/{playerId}/history`

**Response:**
```json
{
  "tickets": [
    {
      "ticketId": "ticket_001",
      "drawNumber": 42,
      "purchaseDate": "2024-11-01T10:00:00Z",
      "status": "active",
      "price": "1.00"
    }
  ],
  "total": 150
}
```

## 🎰 Draw Management

### 5. Draw Webhook (Incoming)
**Endpoint:** `POST /api/draws/webhook`

**Expected Payload:**
```json
{
  "eventType": "draw_scheduled" | "draw_started" | "draw_completed",
  "drawId": "draw_123456",
  "drawType": "main" | "bonus",
  "drawNumber": 42,
  "scheduledTime": "2024-11-01T21:00:00Z",
  "ticketCount": 5000,
  "prizePool": {
    "main": "4250.00",
    "bonus": "250.00",
    "treasury": "500.00"
  },
  "winners": [
    {
      "playerId": "player_123456",
      "walletAddress": "0x...",
      "ticketId": "ticket_001",
      "prize": "4250.00"
    }
  ],
  "randomnessProof": "0x...",
  "timestamp": "2024-11-01T21:00:00Z"
}
```

### 6. Draw Status
**Endpoint:** `GET /api/draws/{drawId}/status`

**Response:**
```json
{
  "drawId": "draw_123456",
  "drawType": "main",
  "drawNumber": 42,
  "status": "scheduled" | "in_progress" | "completed",
  "scheduledTime": "2024-11-01T21:00:00Z",
  "ticketCount": 5000,
  "prizePool": "4250.00",
  "winner": {
    "playerId": "player_123456",
    "walletAddress": "0x...",
    "prize": "4250.00"
  }
}
```

## 💰 Payouts & Treasury

### 7. Payout Request
**Endpoint:** `POST /api/payouts/request`

**Request:**
```json
{
  "playerId": "player_123456",
  "walletAddress": "0x47d918C2e303855da1AD3e08A4128211284aD837",
  "drawId": "draw_123456",
  "prizeAmount": "4250.00",
  "currency": "usdc"
}
```

**Response:**
```json
{
  "payoutId": "payout_123456",
  "status": "pending" | "processing" | "completed",
  "estimatedCompletion": "2024-11-01T21:10:00Z",
  "transactionHash": "0x...",
  "fee": "0.00"
}
```

### 8. Treasury Balance
**Endpoint:** `GET /api/treasury/balance`

**Response:**
```json
{
  "totalBalance": "50000.00",
  "currency": "usdc",
  "breakdown": {
    "collected": "500000.00",
    "distributed": "450000.00",
    "pending": "5000.00"
  }
}
```

## 📊 Reporting & Analytics

### 9. Platform Statistics
**Endpoint:** `GET /api/stats/platform`

**Response:**
```json
{
  "totalPlayers": 10000,
  "activePlayers": 5000,
  "totalTicketsSold": 500000,
  "totalPrizesDistributed": "425000.00",
  "currentJackpot": "4250.00",
  "averageTicketPrice": "1.00",
  "retentionRate": 0.65
}
```

### 10. Compliance Export
**Endpoint:** `GET /api/compliance/export`

**Query Parameters:**
- `startDate` (ISO 8601)
- `endDate` (ISO 8601)
- `format` (json, csv, xlsx)
- `type` (kyc, transactions, payouts, all)

## 🎨 Branding & Customization

### 11. Brand Assets
**Endpoint:** `GET /api/brand/assets`

**Response:**
```json
{
  "logo": {
    "primary": "https://cdn.example.com/logo-primary.png",
    "secondary": "https://cdn.example.com/logo-secondary.png"
  },
  "colors": {
    "primary": "#8B5CF6",
    "secondary": "#3B82F6",
    "accent": "#F59E0B"
  },
  "customDomain": "aureus.example.com"
}
```

---

## 📝 Integration Checklist

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

## 🔒 Security & Rate Limiting

### Expected Security Features
- ✅ API key authentication (for server-to-server)
- ✅ JWT tokens (for user sessions)
- ✅ Rate limiting (per IP, per user)
- ✅ CORS configuration
- ✅ Request signing (HMAC) for webhooks

### Rate Limits (Expected)
- **Player endpoints:** 100 requests/minute
- **Admin endpoints:** 1000 requests/minute
- **Webhooks:** No limit (but signed)

---

## 📞 Next Steps

**For technical integration discussions:**
- Architecture review
- API specification alignment
- Smart contract audit
- Security assessment

**For business partnership:**
- Revenue share models
- Licensing terms
- Market expansion plans
- Co-marketing opportunities

---

**Document Version:** 1.0  
**Date:** November 2024  
**Confidential - NDA Protected**

---

**Contact:**
Tim  
Aureus Lottery  
Email: [Your Email]



