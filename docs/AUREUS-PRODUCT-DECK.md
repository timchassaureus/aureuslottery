# AUREUS - Product Overview

**Version:** 1.0  
**Date:** November 2024  
**Confidential - NDA Protected**

---

## 🎯 Executive Summary

**Aureus** is a daily cryptocurrency lottery platform built on Base network (Ethereum L2), using USDC as the primary currency. The platform combines provably fair smart contracts, viral growth mechanics, and automated daily draws to create an engaging, transparent lottery experience.

**Key Differentiators:**
- ✅ Fully decentralized (smart contract-based)
- ✅ Provably fair (Chainlink VRF)
- ✅ Automated daily draws (21:00 & 21:30 UTC)
- ✅ Viral growth mechanics (share-to-earn, referrals)
- ✅ Mobile-first, responsive design
- ✅ Telegram & X (Twitter) bot integration

---

## 📊 Business Model

### Revenue Split (per ticket purchase):
- **85%** → Main Jackpot (winner takes all)
- **5%** → Bonus Draw (25 winners split equally)
- **10%** → Treasury (platform operations)

### Ticket Pricing:
- **Base price:** 1 USDC per ticket
- **Quick Buy Deals:** Discounts for bulk purchases (5, 10, 20, 50, 100, 1000 tickets)
- **Discount range:** 2% to 20% depending on quantity

### Monetization:
- Treasury revenue (10% of all ticket sales)
- Premium features (future: analytics, priority support)
- Partnership deals (sponsored draws, branded jackpots)

---

## 🎮 Core Features

### 1. Daily Draws
- **Main Draw:** 21:00 UTC daily
  - Single winner takes entire main jackpot
  - Wheel animation with suspense
  - Automatic winner announcement
  
- **Bonus Draw:** 21:30 UTC daily
  - 25 winners split the bonus pot equally
  - All ticket holders automatically eligible

### 2. Ticket Purchase
- **Payment methods:**
  - Direct USDC (on-chain)
  - Credit card via MoonPay/Ramp (planned)
  
- **Quick Buy Deals:**
  - Pre-set quantities with discounts
  - Visual highlights for best value
  
- **Share Bonus:**
  - Share on X (Twitter) → Get +1 FREE ticket
  - Tweet verification system

### 3. User Experience
- **Profile System:**
  - Username/pseudonym (mandatory)
  - Lifetime stats (tickets bought, total spent, total won)
  - Achievement system (future)
  
- **Leaderboard:**
  - Top ticket buyers
  - Top winners
  - Community rankings

- **Live Stats:**
  - Online players count
  - Yesterday's main jackpot win
  - Tickets sold today

### 4. Social & Viral
- **Share on X:**
  - Pre-filled viral messages
  - Dynamic jackpot amounts
  - One-click sharing
  
- **Invite System:**
  - Sticky "Invite & Grow the Pot" bar
  - Share via X, Telegram, WhatsApp
  - Referral tracking (future)

- **Chat:**
  - Premium chat for ticket holders
  - Community engagement
  - Real-time messaging

### 5. Transparency
- **Winner History:**
  - Last 5 main draws
  - Last 3 bonus draws
  - Prize amounts, dates, addresses
  
- **Smart Contract:**
  - Fully auditable on-chain
  - Chainlink VRF for randomness
  - Automatic payouts

---

## 🏗️ Technical Architecture

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Icons:** Lucide React
- **Notifications:** react-hot-toast
- **Deployment:** Vercel

### Smart Contract
- **Network:** Base (Ethereum L2)
- **Language:** Solidity 0.8.20
- **Standards:** ERC20 (USDC), Chainlink VRF v2
- **Security:** OpenZeppelin (Ownable, Pausable, ReentrancyGuard)
- **Randomness:** Chainlink VRF (provably fair)
- **Automation:** Chainlink Automation (scheduled draws)

### Backend/API
- **Platform:** Next.js API Routes
- **Functions:**
  - Tweet verification (X API integration)
  - User state management
  - Future: KYB/KYC hooks

### Infrastructure
- **Hosting:** Vercel
- **Database:** Local state (Zustand) + localStorage
  - Future: Supabase/PostgreSQL for persistent data
- **CDN:** Vercel Edge Network
- **Monitoring:** (To be implemented)

### Bots
- **Telegram Bot:**
  - Commands: /start, /jackpot, /tickets, /stats, /nextdraw, /winners
  - Channel integration for announcements
  
- **X (Twitter) Bot:**
  - Auto-posting (winner announcements, daily reminders)
  - Engagement (mentions, replies)
  - Scheduled content

---

## 📱 User Flows

### New User Journey
1. **Landing** → Disclaimer modal (legal compliance)
2. **Username Setup** → Mandatory pseudonym selection
3. **Wallet Connection** → MetaMask or embedded wallet
4. **Buy Tickets** → Select quantity, choose payment method
5. **Share on X** → Get +1 FREE ticket bonus
6. **Wait for Draw** → Countdown, pre-draw screen
7. **Watch Draw** → Animation, winner reveal
8. **Claim Prize** → Automatic (if winner)

### Daily Draw Flow
1. **21:00 UTC** → Pre-draw countdown (2 minutes before)
2. **21:00 UTC** → Main draw triggered (Chainlink Automation)
3. **VRF Request** → Randomness generated
4. **Winner Selected** → Wheel animation
5. **Prize Distributed** → Automatic USDC transfer
6. **21:30 UTC** → Bonus draw (25 winners)
7. **Next Day** → Reset, new draw cycle

---

## 🔒 Security & Compliance

### Smart Contract Security
- ✅ ReentrancyGuard (prevents reentrancy attacks)
- ✅ SafeERC20 (safe token transfers)
- ✅ Ownable (access control)
- ✅ Pausable (emergency stops)
- ✅ Overflow/underflow protection (Solidity 0.8+)
- ✅ Chainlink VRF (provably fair randomness)

### User Security
- ✅ Wallet-based authentication (non-custodial)
- ✅ GhostID-ready (identity verification framework)
- ✅ Geo-blocking (soft block with VPN suggestion)
- ✅ Disclaimer & legal compliance

### Compliance
- ✅ Transparent prize distribution
- ✅ On-chain audit trail
- ✅ Winner verification
- ✅ Treasury transparency

---

## 🚀 Roadmap

### Phase 1: MVP (Current)
- ✅ Smart contract deployment
- ✅ Frontend web app
- ✅ Basic ticket purchase
- ✅ Automated draws
- ✅ Winner animations
- ✅ Social sharing

### Phase 2: Growth (Q1 2025)
- 🔄 MoonPay/Ramp integration (credit card payments)
- 🔄 Enhanced analytics dashboard
- 🔄 Premium features (advanced stats, priority support)
- 🔄 Multi-language support
- 🔄 Mobile app (React Native)

### Phase 3: Scale (Q2 2025)
- 📋 White-label licensing
- 📋 API for third-party integrations
- 📋 Sponsored draws & partnerships
- 📋 Advanced gamification (levels, achievements, streaks)
- 📋 NFT collectibles (winner badges)

### Phase 4: Expansion (Q3-Q4 2025)
- 📋 Multi-chain support (Polygon, Arbitrum)
- 📋 Institutional partnerships
- 📋 Global marketing campaigns
- 📋 Regulatory compliance (licensing where required)

---

## 📈 Growth Strategy

### Viral Mechanics
- **Share-to-Earn:** Free tickets for sharing
- **Referral System:** Rewards for bringing new players
- **Leaderboard:** Social proof & competition
- **Challenges:** Sponsored events, community goals

### Marketing Channels
- **Social Media:** X (Twitter), Telegram, TikTok
- **Influencers:** Crypto, gaming, lifestyle creators
- **Community:** Discord, Telegram groups
- **PR:** Press releases, crypto media

### Retention
- **Daily Draws:** Habit-forming routine
- **Bonus Draws:** Extra chances to win
- **Achievements:** Gamification elements
- **Community:** Chat, leaderboards, social features

---

## 💰 Financial Projections

### Conservative Estimates (Year 1)
- **Target:** 10,000 active users
- **Average tickets/user/day:** 5 tickets
- **Daily revenue:** 50,000 USDC
- **Monthly revenue:** 1,500,000 USDC
- **Treasury (10%):** 150,000 USDC/month
- **Annual treasury:** 1,800,000 USDC

### Growth Scenario (Year 2)
- **Target:** 100,000 active users
- **Average tickets/user/day:** 3 tickets
- **Daily revenue:** 300,000 USDC
- **Monthly revenue:** 9,000,000 USDC
- **Treasury (10%):** 900,000 USDC/month
- **Annual treasury:** 10,800,000 USDC

---

## 🤝 White-Label Partnership Opportunities

### Integration Points
1. **Player Management:** Sync wallet addresses with white-label accounts
2. **KYC/KYB:** Compliance verification via white-label system
3. **Ticket Sales:** API endpoints for ticket purchases
4. **Draw Management:** Webhook notifications for draw events
5. **Payouts:** Integration with white-label payment systems
6. **Reporting:** Analytics & compliance reporting

### Benefits for White-Label Partners
- ✅ Proven smart contract (audited, secure)
- ✅ Viral growth mechanics (built-in)
- ✅ Modern UI/UX (mobile-first)
- ✅ Automated operations (draws, payouts)
- ✅ Social media integration (bots, sharing)
- ✅ Brand customization (white-label ready)

---

## 📞 Contact & Next Steps

**For technical integration discussions:**
- Architecture review
- API specification
- Smart contract audit
- Security assessment

**For business partnership:**
- Revenue share models
- Licensing terms
- Market expansion plans
- Co-marketing opportunities

---

**Document Version:** 1.0  
**Last Updated:** November 2024  
**Confidential - NDA Protected**



