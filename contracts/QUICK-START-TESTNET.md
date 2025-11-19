# 🚀 Quick Start - Base Sepolia Testnet

Guide ultra-rapide pour tester AUREUS sur testnet en 5 minutes.

## ⚡ Setup Express (5 minutes)

### 1. Installer les dépendances

```bash
cd contracts
npm install
```

### 2. Configurer `.env`

```bash
cp env.example .env
```

Éditez `.env` et ajoutez:
```env
PRIVATE_KEY=your_private_key_here
TREASURY_ADDRESS=your_treasury_address_here
VRF_SUBSCRIPTION_ID=your_subscription_id_here
```

### 3. Obtenir Testnet Tokens (GRATUIT)

#### Testnet ETH:
1. Allez sur: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
2. Connectez MetaMask (Base Sepolia)
3. Cliquez "Request" → Attendez 1-2 minutes

#### Testnet LINK:
1. Allez sur: https://faucets.chain.link/base-sepolia
2. Connectez MetaMask (Base Sepolia)
3. Cliquez "Request" → Attendez 1-2 minutes

### 4. Créer VRF Subscription

1. Allez sur: https://vrf.chain.link/base-sepolia
2. Connectez MetaMask (Base Sepolia)
3. Cliquez "Create Subscription"
4. Financez avec testnet LINK (minimum 1 LINK)
5. **Copiez le Subscription ID** → Ajoutez-le dans `.env`

### 5. Déployer sur Testnet

```bash
npm run deploy:testnet
```

C'est tout ! 🎉

## ✅ Vérifier le Déploiement

1. Allez sur: https://sepolia.basescan.org
2. Collez l'adresse du contrat
3. Vérifiez que le contrat est déployé

## 🧪 Tester le Contrat

### Option 1: Via le Site (Recommandé)

1. Connectez MetaMask (Base Sepolia)
2. Allez sur votre site
3. Connectez le wallet
4. Achetez des tickets (testnet USDC)
5. Vérifiez les événements sur BaseScan

### Option 2: Via Hardhat Console

```bash
npx hardhat console --network baseSepolia
```

Puis dans la console:
```javascript
const lottery = await ethers.getContractAt("AureusLottery", "CONTRACT_ADDRESS");
await lottery.requestMainDraw();
```

## 📊 Vérifier les Résultats

### Sur BaseScan:
- Allez sur: https://sepolia.basescan.org/address/CONTRACT_ADDRESS
- Cliquez "Events" pour voir tous les événements
- Vérifiez: `TicketsPurchased`, `DrawRequested`, `MainDrawFinalized`, etc.

## 🔧 Troubleshooting

**"Insufficient funds"**
- Vérifiez que vous avez testnet ETH dans votre wallet
- Obtenez-en ici: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

**"VRF subscription not found"**
- Vérifiez que vous avez créé la subscription sur vrf.chain.link/base-sepolia
- Vérifiez que le Subscription ID est correct dans `.env`

**"Contract not found"**
- Vérifiez que vous êtes sur Base Sepolia dans MetaMask
- Vérifiez l'adresse du contrat

## 🎯 Prochaines Étapes

Une fois les tests OK sur testnet:
1. Obtenez du vrai LINK (50-100 LINK)
2. Créez VRF subscription mainnet
3. Déployez sur Base mainnet
4. Configurez Chainlink Automation

## 📚 Ressources

- Base Sepolia Faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- Chainlink VRF Testnet: https://vrf.chain.link/base-sepolia
- BaseScan Testnet: https://sepolia.basescan.org
- Base Docs: https://docs.base.org/



