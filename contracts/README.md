# 🎰 AUREUS Lottery Smart Contract

Smart contract décentralisé pour la loterie AUREUS avec Chainlink VRF pour des tirages provably fair.

## ✨ Features

- ✅ **Provably Fair**: Chainlink VRF pour randomness vérifiable
- ✅ **Auto-Payout**: Paiements USDC automatiques aux gagnants
- ✅ **Sécurisé**: OpenZeppelin (Ownable, Pausable, ReentrancyGuard)
- ✅ **Transparent**: Tous les événements on-chain
- ✅ **Split Automatique**: 85% main pot, 5% bonus pot, 10% treasury
- ✅ **Tirages Automatiques**: Main 21:00 UTC, Bonus 21:30 UTC (30 min interval)

## 📋 Prérequis

- Node.js 18+
- Hardhat
- Wallet avec ETH pour gas fees
- LINK token pour Chainlink VRF subscription

## 🚀 Installation

```bash
cd contracts
npm install
```

## ⚙️ Configuration

1. Copiez `.env.example` vers `.env`:
```bash
cp .env.example .env
```

2. Remplissez `.env` avec vos valeurs:
```env
PRIVATE_KEY=your_private_key_here
USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
TREASURY_ADDRESS=your_treasury_address_here
VRF_COORDINATOR=0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625
VRF_KEY_HASH=0x99675afd988000c7b611e1eb4026b5c01f3f66d6d2b6f0ff04ac45e8b79256f0
VRF_SUBSCRIPTION_ID=your_subscription_id_here
VRF_CALLBACK_GAS_LIMIT=500000
```

## 🔗 Setup Chainlink VRF

1. Allez sur https://vrf.chain.link/
2. Connectez votre wallet
3. Créez une nouvelle subscription
4. Financez-la avec LINK (minimum 50-100 LINK recommandé)
5. Notez le Subscription ID dans `.env`

## 📝 Déploiement

### Testnet (Base Sepolia)
```bash
npm run deploy:base-sepolia
```

### Mainnet (Base)
```bash
npm run deploy:base
```

## 🧪 Tests

```bash
npm test
```

## 📊 Coûts

- **Déploiement:** ~$1-5 (gas fees)
- **VRF par tirage:** ~0.25 LINK (~$3-5)
- **2 tirages/jour (21:00 + 21:30 UTC):** ~$6-10/jour = ~$200-300/mois
- **Chainlink Automation:** Gratuit (vous payez juste le gas ETH ~$0.01-0.05/tirage)

Voir `VRF-COST-OPTIMIZATION.md` pour réduire les coûts.
Voir `CHAINLINK-AUTOMATION-SETUP.md` pour configurer les tirages automatiques.
Voir `TESTNET-SETUP.md` pour tester sur Base Sepolia testnet.

## 🔒 Sécurité

- OpenZeppelin Contracts (audités)
- ReentrancyGuard
- SafeERC20 pour USDC
- Pausable pour emergency
- Checks-Effects-Interactions pattern

## 📚 Documentation

- `VRF-COST-OPTIMIZATION.md`: Guide pour réduire les coûts VRF
- `scripts/setup-vrf.js`: Script pour setup VRF subscription

## 🆘 Support

Pour toute question, voir la documentation Chainlink VRF:
- https://docs.chain.link/vrf/v2/introduction

