# 🚀 Guide Complet de Déploiement - AUREUS Lottery

## 📋 Checklist Avant Déploiement

### ✅ Déjà Fait
- [x] Système d'authentification sociale (Email/Google/Apple)
- [x] Génération automatique de wallets
- [x] Smart contract de dépôt multi-crypto
- [x] Paiement par carte bancaire (Ramp + Stripe)
- [x] Configuration Base Mainnet
- [x] Treasury configuré : `0xa166D2570d4bBfACcEBE7A78a426991b1Fa8f6eC`

### ⏳ À Faire
- [ ] Obtenir les clés API (Ramp + Stripe)
- [ ] Déployer le contrat AureusLottery
- [ ] Déployer le contrat AureusDeposit
- [ ] Configurer Chainlink VRF
- [ ] Configurer Chainlink Automation (tirages auto à 21H)

---

## 🔑 Étape 1 : Obtenir les Clés API

### 1.1 Ramp Network (Crypto on-ramp)

1. Aller sur https://ramp.network/
2. Créer un compte développeur
3. Aller dans "Developer Dashboard"
4. Créer une nouvelle application
5. Copier la **Host API Key**
6. Ajouter dans `.env.local` :
   ```env
   NEXT_PUBLIC_RAMP_API_KEY=ton_api_key_ici
   ```

**Coût** : Gratuit (frais sur transactions uniquement)

### 1.2 Stripe (Paiement carte bancaire)

1. Aller sur https://stripe.com/
2. Créer un compte
3. Aller dans "Developers" → "API keys"
4. Copier :
   - **Secret key** (commence par `sk_test_` pour test, `sk_live_` pour prod)
   - **Publishable key** (commence par `pk_test_` pour test, `pk_live_` pour prod)
5. Ajouter dans `.env.local` :
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

**Coût** : Gratuit (frais : 2.9% + 0.30€ par transaction)

---

## 📦 Étape 2 : Installer les Dépendances

```bash
cd contracts
npm install
```

---

## 🔗 Étape 3 : Configurer Chainlink VRF

### 3.1 Créer un Subscription sur Chainlink

1. Aller sur https://vrf.chain.link/
2. Connecter ton wallet
3. Sélectionner "Base Mainnet"
4. Créer un nouveau subscription
5. Noter le **Subscription ID**
6. Ajouter des fonds LINK (minimum 2 LINK recommandé)

### 3.2 Configuration VRF Base Mainnet

- **VRF Coordinator** : `0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625`
- **Key Hash** : `0x99675afd988000c7b611e1eb4026b5c01f3f66d6d2b6f0ff04ac45e8b79256f0`
- **Subscription ID** : (celui que tu as créé)

Ajouter dans `contracts/.env` :
```env
VRF_COORDINATOR=0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625
VRF_KEY_HASH=0x99675afd988000c7b611e1eb4026b5c01f3f66d6d2b6f0ff04ac45e8b79256f0
VRF_SUBSCRIPTION_ID=ton_subscription_id
VRF_CALLBACK_GAS_LIMIT=500000
```

---

## 🚀 Étape 4 : Déployer les Smart Contracts

### 4.1 Préparer le fichier `.env` dans `contracts/`

Créer `contracts/.env` :
```env
# Private Key (wallet avec ETH sur Base pour déployer)
PRIVATE_KEY=ton_private_key_ici

# Treasury (déjà configuré)
TREASURY_ADDRESS=0xa166D2570d4bBfACcEBE7A78a426991b1Fa8f6eC

# USDC Base Mainnet
USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

# Chainlink VRF
VRF_COORDINATOR=0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625
VRF_KEY_HASH=0x99675afd988000c7b611e1eb4026b5c01f3f66d6d2b6f0ff04ac45e8b79256f0
VRF_SUBSCRIPTION_ID=ton_subscription_id
VRF_CALLBACK_GAS_LIMIT=500000

# BaseScan API (pour vérifier le contrat)
BASESCAN_API_KEY=ton_api_key
```

### 4.2 Déployer AureusLottery

```bash
cd contracts
npx hardhat run scripts/deploy-with-treasury.js --network base
```

**Important** : Assure-toi d'avoir :
- De l'ETH sur Base (pour les frais de gas)
- Un wallet avec la private key dans `.env`
- Le VRF Subscription ID configuré

### 4.3 Déployer AureusDeposit

```bash
npx hardhat run scripts/deploy-deposit.js --network base
```

### 4.4 Configurer les Tokens Acceptés

```bash
DEPOSIT_CONTRACT_ADDRESS=0x... npx hardhat run scripts/setup-tokens.js --network base
```

---

## ⚙️ Étape 5 : Configurer Chainlink Automation

Pour les tirages automatiques à 21H UTC :

1. Aller sur https://automation.chain.link/
2. Créer un nouveau "Upkeep"
3. Sélectionner ton contrat AureusLottery
4. Configurer :
   - **Trigger** : Time-based (21:00 UTC)
   - **Function** : `requestMainDraw()`
5. Ajouter des fonds LINK (minimum 5 LINK recommandé)

**Répéter pour le bonus draw à 21:30 UTC** avec `requestBonusDraw()`

---

## 🔧 Étape 6 : Configuration Frontend

### 6.1 Mettre à jour `.env.local`

```env
# Réseau
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_RPC_URL=https://mainnet.base.org

# Smart Contracts
NEXT_PUBLIC_LOTTERY_ADDRESS=0x... (adresse après déploiement)
NEXT_PUBLIC_DEPOSIT_CONTRACT_ADDRESS=0x... (adresse après déploiement)
NEXT_PUBLIC_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

# Treasury (déjà configuré)
NEXT_PUBLIC_TREASURY_ADDRESS=0xa166D2570d4bBfACcEBE7A78a426991b1Fa8f6eC

# Paiements
NEXT_PUBLIC_RAMP_API_KEY=ton_ramp_key
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Uniswap
NEXT_PUBLIC_UNISWAP_ROUTER=0x2626664c2603336E57B271c5C0b26F421741e481
```

### 6.2 Déployer sur Vercel

```bash
git add .
git commit -m "Ready for production deployment"
git push
```

Vercel déploiera automatiquement avec les variables d'environnement configurées.

---

## ✅ Vérification Post-Déploiement

### Checklist

- [ ] Contrat AureusLottery déployé et vérifié
- [ ] Contrat AureusDeposit déployé et vérifié
- [ ] Treasury configuré : `0xa166D2570d4bBfACcEBE7A78a426991b1Fa8f6eC`
- [ ] Chainlink VRF configuré et financé
- [ ] Chainlink Automation configuré (tirages auto)
- [ ] Tokens acceptés ajoutés (USDT, DAI, LINK)
- [ ] Frontend déployé sur Vercel
- [ ] Variables d'environnement configurées
- [ ] Test d'achat de ticket réussi
- [ ] Vérification réception 10% sur Ledger

---

## 🎯 Test Final

1. **Créer un compte** sur l'app
2. **Déposer des USDC** (ou autre crypto)
3. **Acheter un ticket**
4. **Vérifier** :
   - Ticket acheté ✅
   - 10% reçu sur ton Ledger ✅
   - Solde mis à jour ✅

---

## 📞 Support

Si problème :
- Vérifier les logs Vercel
- Vérifier BaseScan pour les transactions
- Vérifier Chainlink VRF/Automation dashboard

**Tout est prêt ! 🚀**


