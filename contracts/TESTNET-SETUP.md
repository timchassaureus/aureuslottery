# 🧪 Guide Testnet - Base Sepolia

Guide complet pour tester le smart contract AUREUS sur Base Sepolia testnet.

## 🎯 Pourquoi Base Sepolia Testnet ?

- ✅ **Gratuit** : Pas de coûts réels
- ✅ **Testnet LINK** : VRF gratuit pour tester
- ✅ **Testnet ETH** : Gas fees gratuits
- ✅ **Même code** : Identique au mainnet
- ✅ **Sécurisé** : Tester sans risque

## 📋 Prérequis

1. **Wallet MetaMask** installé
2. **Base Sepolia Testnet** ajouté à MetaMask
3. **Testnet ETH** (gratuit via faucet)
4. **Testnet LINK** (gratuit via faucet)

## 🔗 Ajouter Base Sepolia à MetaMask

### Méthode 1: Automatique

1. Allez sur: https://chainlist.org/
2. Recherchez "Base Sepolia"
3. Cliquez "Connect Wallet"
4. Cliquez "Add to MetaMask"

### Méthode 2: Manuel

1. Ouvrez MetaMask
2. Cliquez sur le réseau actuel (en haut)
3. Cliquez "Add Network" → "Add a network manually"
4. Remplissez:
   - **Network Name:** Base Sepolia
   - **RPC URL:** https://sepolia.base.org
   - **Chain ID:** 84532
   - **Currency Symbol:** ETH
   - **Block Explorer:** https://sepolia.basescan.org

## 💰 Obtenir Testnet ETH (Gratuit)

### Faucet Base Sepolia

1. Allez sur: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
2. Connectez votre wallet
3. Demandez des testnet ETH (gratuit)
4. Attendez quelques minutes

**Alternative:**
- https://faucet.quicknode.com/base/sepolia
- https://www.alchemy.com/faucets/base-sepolia

## 🔗 Obtenir Testnet LINK (Gratuit)

### Faucet Chainlink

1. Allez sur: https://faucets.chain.link/base-sepolia
2. Connectez votre wallet
3. Demandez des testnet LINK (gratuit)
4. Attendez quelques minutes

**Alternative:**
- https://vrf.chain.link/base-sepolia (pour VRF subscription)

## ⚙️ Configuration pour Testnet

### 1. Mettre à jour `.env`

```env
# Base Sepolia Testnet
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# USDC Testnet (Base Sepolia)
USDC_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e

# VRF Coordinator (Base Sepolia)
VRF_COORDINATOR=0x9Ddf0Ac0818886E8A7FdA6904cF1383e8bC41d82
VRF_KEY_HASH=0x89630569c9567e43c4fe7b1633258df9f2531b2fdc2b8a8b57b3c13030cd1fb2
VRF_SUBSCRIPTION_ID=your_testnet_subscription_id_here
VRF_CALLBACK_GAS_LIMIT=500000
```

### 2. Créer VRF Subscription Testnet

1. Allez sur: https://vrf.chain.link/base-sepolia
2. Connectez votre wallet (Base Sepolia)
3. Créez une nouvelle subscription
4. Financez-la avec testnet LINK (gratuit)
5. Notez le Subscription ID dans `.env`

### 3. Déployer sur Testnet

```bash
cd contracts
npm install
npm run deploy:base-sepolia
```

## 🧪 Tester le Contrat

### 1. Vérifier le Déploiement

- Allez sur: https://sepolia.basescan.org
- Collez l'adresse du contrat
- Vérifiez que le contrat est bien déployé

### 2. Tester l'Achat de Tickets

1. Connectez MetaMask (Base Sepolia)
2. Allez sur votre site
3. Connectez le wallet
4. Achetez des tickets (testnet USDC)
5. Vérifiez les événements sur BaseScan

### 3. Tester les Tirages

**Option A: Manuel (pour tester vite)**
- Appelez `requestMainDraw()` directement
- Attendez le callback VRF
- Vérifiez le gagnant

**Option B: Automation (comme mainnet)**
- Configurez Chainlink Automation sur testnet
- Créez 2 upkeeps (21:00 et 21:30 UTC)
- Attendez les tirages automatiques

## 📊 Vérifier les Résultats

### Sur BaseScan

1. Allez sur: https://sepolia.basescan.org
2. Collez l'adresse du contrat
3. Cliquez "Events" pour voir tous les événements
4. Vérifiez:
   - `TicketsPurchased`
   - `DrawRequested`
   - `MainDrawFinalized`
   - `BonusDrawFinalized`
   - `PayoutSent`

### Sur le Site

- Vérifiez que les gagnants s'affichent
- Vérifiez que les payouts sont envoyés
- Vérifiez que les pots se mettent à jour

## 🔧 Troubleshooting

### "Insufficient funds"
- Vérifiez que vous avez testnet ETH dans votre wallet
- Vérifiez que la VRF subscription a testnet LINK

### "Contract not found"
- Vérifiez que vous êtes sur Base Sepolia dans MetaMask
- Vérifiez l'adresse du contrat dans `.env`

### "VRF request failed"
- Vérifiez que la subscription a assez de LINK
- Vérifiez que le callbackGasLimit est correct
- Vérifiez les logs sur vrf.chain.link

## ✅ Checklist Testnet

- [ ] Base Sepolia ajouté à MetaMask
- [ ] Testnet ETH obtenu (via faucet)
- [ ] Testnet LINK obtenu (via faucet)
- [ ] VRF subscription créée et financée
- [ ] `.env` configuré pour testnet
- [ ] Contrat déployé sur testnet
- [ ] Contrat vérifié sur BaseScan
- [ ] Achat de tickets testé
- [ ] Tirages testés (manuel ou automation)
- [ ] Payouts vérifiés

## 🚀 Passer en Mainnet

Une fois les tests OK:

1. Changez `.env` pour mainnet
2. Obtenez du vrai LINK (50-100 LINK)
3. Créez VRF subscription mainnet
4. Déployez sur Base mainnet
5. Configurez Chainlink Automation mainnet

## 📚 Ressources

- Base Sepolia Faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- Chainlink VRF Testnet: https://vrf.chain.link/base-sepolia
- BaseScan Testnet: https://sepolia.basescan.org
- Base Docs: https://docs.base.org/



