# ✅ Checklist Finale - AUREUS Lottery

## 🎯 Avant de Lancer

### 1. Clés API (15 min)
- [ ] Ramp API Key obtenue
- [ ] Stripe Secret Key obtenue
- [ ] Stripe Publishable Key obtenue
- [ ] Toutes ajoutées dans `.env.local`

### 2. Chainlink VRF (10 min)
- [ ] Subscription créé sur https://vrf.chain.link/
- [ ] Subscription ID noté
- [ ] Subscription financé avec LINK (minimum 2 LINK)
- [ ] Configuré dans `contracts/.env`

### 3. Déploiement Smart Contracts (20 min)
- [ ] Wallet avec ETH sur Base Mainnet
- [ ] Private key dans `contracts/.env`
- [ ] Contrat AureusLottery déployé
- [ ] Contrat AureusDeposit déployé
- [ ] Tokens acceptés configurés (USDT, DAI, LINK)
- [ ] Treasury vérifié : `0xa166D2570d4bBfACcEBE7A78a426991b1Fa8f6eC`

### 4. Chainlink Automation (15 min)
- [ ] Upkeep créé pour main draw (21:00 UTC)
- [ ] Upkeep créé pour bonus draw (21:30 UTC)
- [ ] Upkeeps financés avec LINK (minimum 5 LINK chacun)

### 5. Configuration Frontend (5 min)
- [ ] `.env.local` mis à jour avec toutes les adresses
- [ ] Variables ajoutées dans Vercel (Settings → Environment Variables)
- [ ] Frontend déployé sur Vercel

### 6. Tests (10 min)
- [ ] Création de compte testée
- [ ] Dépôt testé (simulation)
- [ ] Achat de ticket testé
- [ ] Vérification réception 10% sur Ledger

---

## 📋 Commandes Rapides

### Déployer Tout
```bash
cd contracts
npx hardhat run scripts/deploy-all.js --network base
```

### Vérifier Treasury
```bash
npx hardhat run scripts/verify-treasury.js --network base
```

### Ajouter Tokens
```bash
DEPOSIT_CONTRACT_ADDRESS=0x... npx hardhat run scripts/setup-tokens.js --network base
```

---

## 🎉 Une Fois Tout Fait

1. **L'app est live** sur Vercel
2. **Les joueurs peuvent** créer un compte et jouer
3. **Tu reçois** automatiquement 10% sur ton Ledger
4. **Les tirages** se font automatiquement à 21H UTC

**C'est parti ! 🚀**


