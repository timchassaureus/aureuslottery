# 🏆 AUREUS - Decentralized Lottery Platform

A modern, decentralized lottery application built with Next.js featuring Web3 wallet integration, daily draws, innovative RIDE feature, chat system, user levels, and volume discounts.

## ✨ Features

### 🎫 Ticket Purchase System
- Buy lottery tickets for upcoming draws
- Flexible pricing (1 USDC per ticket, discount when buying in bulk)
- Real-time jackpot updates
- Personal ticket tracking
- Volume discounts: 5% (5+ tickets), 10% (10+), 15% (20+), 20% (50+)

### 🎰 Daily Draws at 8pm UTC
- Automated daily draws at 8pm UTC
- **75% payout** to winner
- **10% to owner wallet** (platform fee)
- **15% burned** (deflationary mechanism)
- Uses Chainlink VRF simulation for true randomness

### 🔥 RIDE Feature
- High-risk, high-reward gameplay
- Risk 50% for a 10× multiplier chance
- 50/50 win or lose probability
- Instant results

### 📊 History & Transparency
- Last 5 winners displayed
- Complete draw history
- Prize distribution details
- Personal statistics
- Total lifetime earnings tracking

### 👛 Wallet Integration
- Secure Web3 wallet connection (MetaMask simulation)
- Account management
- Transaction history
- Lifetime ticket tracking

### 💬 Community Chat
- Chat with other lottery participants
- Only for ticket holders
- Real-time messaging
- Web3 identity display

### 🏅 User Levels System
- Bronze: 0 tickets
- Amateur: 10+ tickets (Silver)
- Expert: 50+ tickets (Gold)
- Maître: 100+ tickets (Platinum)
- Légende: 500+ tickets (Crown)
- Visual progress tracking

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## 🔧 Environment Variables

Create a `.env.local` (or export variables in your shell) before running the app:

- `NEXT_PUBLIC_CHAIN_ID` – Base network chain id (default: `84532` for Base Sepolia)
- `NEXT_PUBLIC_RPC_URL` – JSON-RPC endpoint that serves the smart contract data
- `NEXT_PUBLIC_LOTTERY_ADDRESS` – Address of the deployed `AureusLottery` contract
- `NEXT_PUBLIC_USDC_ADDRESS` – Address of the USDC contract you want to spend
- `NEXT_PUBLIC_OWNER_ADDRESS` – Address that can trigger on-chain draws from the UI
- `NEXT_PUBLIC_DEFAULT_MODE` – Starting mode (`live` or `demo`)
- `NEXT_PUBLIC_FORCE_MODE` – Set to `live` to lock the interface in on-chain mode
- `NEXT_PUBLIC_BASESCAN_TX_URL` – Explorer base URL (ex: `https://sepolia.basescan.org/tx/`)

Setting `NEXT_PUBLIC_FORCE_MODE=live` makes the UI load directly in operational mode and prevents users from switching back to demo, which is recommended for production deployments.

## 🏗️ Architecture

### Technologies
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Lucide React** - Icons

### Project Structure

```
aureus/
├── app/
│   ├── page.tsx           # Main application page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── WalletButton.tsx   # Wallet connection UI
│   ├── BuyTicketsModal.tsx # Ticket purchase modal with discounts
│   ├── DrawButton.tsx     # Draw execution button
│   ├── RideModal.tsx      # RIDE feature modal
│   ├── HistoryModal.tsx   # Last 5 winners
│   ├── Chat.tsx           # Community chat
│   └── UserLevel.tsx      # User level display
├── lib/
│   ├── store.ts           # Zustand state management
│   ├── web3.ts            # Web3 wallet simulation
│   └── vrf.ts             # Chainlink VRF simulation
└── package.json           # Dependencies
```

## 🎮 How to Use

### 1. Connect Wallet
- Click "Connect Wallet" button
- A mock wallet address will be generated
- Your connection status will be displayed

### 2. Buy Tickets
- Click "Buy Tickets Now"
- Choose number of tickets (1-100)
- See automatic discounts applied based on quantity
- Confirm purchase
- Tickets are added to current draw
- Your user level updates automatically

### 3. Community Chat
- Click the chat icon (bottom right)
- Only available if you have tickets
- Chat with other participants
- Share your excitement!

### 4. Perform Draw
- Owner clicks "Perform Draw" button
- Chainlink VRF randomly selects winner
- 75% goes to winner
- 10% goes to owner wallet (0x742d35Cc6634C0532925a3b8D8F3DFE6F3A9a1b9)
- 15% is burned
- Next draw starts fresh

### 5. RIDE Feature
- Click "RIDE Feature" button
- Enter amount to risk
- 50% is taken upfront
- 50% chance to win 10×, 50% chance to lose

### 6. View History
- Click "History" button in header
- View last 5 winners
- See if you won any prizes
- Track prize amounts

## 💰 Economics

### Jackpot Distribution
- **75%** - Winner prize
- **10%** - Owner wallet (platform fee)
- **15%** - Burned (deflationary)

### Volume Discounts
- 5+ tickets: 5% discount
- 10+ tickets: 10% discount
- 20+ tickets: 15% discount
- 50+ tickets: 20% discount

### RIDE Mechanics
- You risk: 50% of bet amount
- You can win: 10× your original bet
- Probability: 50/50

### User Level Benefits
- Higher levels (unlock perks soon!)
- Visual recognition
- Community status

## 🎲 Randomness (Chainlink VRF)

The application uses Chainlink VRF simulation for provably fair random selection:
- Verifiable Random Function
- On-chain randomness
- Transparent selection process
- Cannot be manipulated

## 🔐 Security

This is a prototype version with simulated Web3 functionality. For production use:
- Implement real smart contracts on Ethereum/Polygon
- Add comprehensive testing
- Implement proper randomness (Chainlink VRF)
- Add multi-sig for draws
- Audit by security firms
- Add rate limiting and anti-bot measures

## 🚧 Roadmap

- [ ] Real blockchain integration
- [ ] Smart contract deployment
- [ ] Chainlink VRF integration
- [ ] Multiple token support
- [ ] NFTs for special tickets
- [ ] Governance token
- [ ] Mobile app
- [ ] Analytics dashboard
- [ ] Leaderboard
- [ ] Referral system

## 📝 License

MIT License - feel free to use this for your own projects!

## 🙏 Acknowledgments

Built with ❤️ using Next.js and modern Web3 technologies.

---

**Note**: This is a demo application. Production deployment requires proper smart contracts, security audits, and regulatory compliance.

## 🔥 New in This Version

- ✅ Community chat system
- ✅ User level system (Bronze → Legend)
- ✅ Volume discounts on tickets
- ✅ 75/10/15 distribution (winner/owner/burn)
- ✅ Last 5 winners history
- ✅ Chainlink VRF randomness simulation
- ✅ Daily draws at 8pm UTC
- ✅ Owner wallet receives 10% of every draw
