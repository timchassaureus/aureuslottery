# ⚡ Quick Start - Production

## 🎯 En 5 Minutes

### 1. Obtenir les Clés API (5 min)

#### Ramp
1. https://ramp.network/ → Créer compte → Developer Dashboard
2. Créer app → Copier API Key

#### Stripe  
1. https://stripe.com/ → Créer compte → Developers → API keys
2. Copier Secret Key + Publishable Key

### 2. Configurer `.env.local`

```env
# Réseau (Base Mainnet)
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_RPC_URL=https://mainnet.base.org

# Paiements
NEXT_PUBLIC_RAMP_API_KEY=ton_ramp_key
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Treasury (déjà configuré)
NEXT_PUBLIC_TREASURY_ADDRESS=0xa166D2570d4bBfACcEBE7A78a426991b1Fa8f6eC
```

### 3. Déployer les Contrats

```bash
cd contracts
npm install

# Configurer contracts/.env avec :
# - PRIVATE_KEY (wallet avec ETH sur Base)
# - VRF_SUBSCRIPTION_ID (créer sur https://vrf.chain.link/)

# Déployer
npx hardhat run scripts/deploy-with-treasury.js --network base
npx hardhat run scripts/deploy-deposit.js --network base
```

### 4. Mettre à jour `.env.local` avec les Adresses

```env
NEXT_PUBLIC_LOTTERY_ADDRESS=0x... (après déploiement)
NEXT_PUBLIC_DEPOSIT_CONTRACT_ADDRESS=0x... (après déploiement)
```

### 5. Déployer sur Vercel

```bash
git add .
git commit -m "Production ready"
git push
```

**C'est tout ! 🎉**

---

## 📝 Checklist Rapide

- [ ] 3 clés API obtenues (Ramp + 2 Stripe)
- [ ] Contrats déployés sur Base Mainnet
- [ ] Adresses ajoutées dans `.env.local`
- [ ] Vercel déployé
- [ ] Test d'achat réussi

**Temps total : ~30 minutes**


