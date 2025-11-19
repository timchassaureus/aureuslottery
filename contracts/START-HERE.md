# 🚀 START HERE - Testnet Setup en 5 Minutes

Guide ultra-simple pour tester AUREUS sur testnet.

## ⚡ Setup Automatique

### 1. Lancer le setup automatique

```bash
cd contracts
npm run auto-setup
```

Ce script va:
- ✅ Créer `.env` avec les bonnes adresses testnet
- ✅ Installer toutes les dépendances
- ✅ Vérifier que tout est prêt

### 2. Étapes Manuelles (5 minutes)

Le script va te donner les instructions, mais voici les liens directs:

#### A. Obtenir Testnet ETH (GRATUIT)
👉 https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- Connecte MetaMask (Base Sepolia)
- Clique "Request"
- Attends 1-2 minutes

#### B. Obtenir Testnet LINK (GRATUIT)
👉 https://faucets.chain.link/base-sepolia
- Connecte MetaMask (Base Sepolia)
- Clique "Request"
- Attends 1-2 minutes

#### C. Créer VRF Subscription
👉 https://vrf.chain.link/base-sepolia
- Connecte MetaMask (Base Sepolia)
- Clique "Create Subscription"
- Finance avec testnet LINK (minimum 1 LINK)
- **Copie le Subscription ID** (tu en auras besoin)

#### D. Configurer `.env`

Ouvre `contracts/.env` et ajoute:

```env
PRIVATE_KEY=ton_private_key_ici
TREASURY_ADDRESS=ton_adresse_treasury_ici
VRF_SUBSCRIPTION_ID=ton_subscription_id_ici
```

### 3. Déployer sur Testnet

```bash
cd contracts
npm run deploy:testnet
```

C'est tout ! 🎉

## ✅ Vérifier

1. Va sur: https://sepolia.basescan.org
2. Colle l'adresse du contrat
3. Vérifie que le contrat est déployé

## 🧪 Tester

1. Connecte MetaMask (Base Sepolia)
2. Va sur ton site
3. Connecte le wallet
4. Achète des tickets (testnet USDC)
5. Vérifie les événements sur BaseScan

## 📚 Guides Complets

- `QUICK-START-TESTNET.md` - Guide détaillé
- `TESTNET-SETUP.md` - Guide complet avec troubleshooting
- `README.md` - Documentation générale

## 🆘 Problèmes ?

**"Insufficient funds"**
→ Va sur: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

**"VRF subscription not found"**
→ Crée la subscription: https://vrf.chain.link/base-sepolia

**"Contract not found"**
→ Vérifie que tu es sur Base Sepolia dans MetaMask

## 🎯 Prochaines Étapes

Une fois les tests OK:
1. Obtenez du vrai LINK (50-100 LINK)
2. Créez VRF subscription mainnet
3. Déployez sur Base mainnet
4. Configurez Chainlink Automation



