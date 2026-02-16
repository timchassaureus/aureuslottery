# 📋 Tout Ce Qui Reste À Faire - Checklist Complète

## ✅ Déjà Fait (Par Moi)

- [x] Système d'authentification sociale (Email/Google/Apple)
- [x] Génération automatique de wallets
- [x] Smart contract de dépôt multi-crypto
- [x] Smart contract de loterie (avec treasury)
- [x] Paiement par carte bancaire (Ramp + Stripe)
- [x] Configuration Base Mainnet
- [x] Treasury configuré : `0xa166D2570d4bBfACcEBE7A78a426991b1Fa8f6eC`
- [x] Scripts de déploiement
- [x] Documentation complète

---

## ⏳ À Faire (Par Toi)

### 🔑 ÉTAPE 1 : Obtenir les Clés API (15-20 min)

#### 1.1 Ramp Network
- [ ] Aller sur https://ramp.network/
- [ ] Créer un compte
- [ ] Créer une application
- [ ] Copier l'API Key
- [ ] Ajouter dans `.env.local` : `NEXT_PUBLIC_RAMP_API_KEY=...`

#### 1.2 Stripe
- [ ] Aller sur https://stripe.com/
- [ ] Créer un compte
- [ ] Aller dans Developers → API keys
- [ ] Copier Secret Key et Publishable Key
- [ ] Ajouter dans `.env.local` :
  ```env
  STRIPE_SECRET_KEY=sk_test_...
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
  ```

**Temps estimé : 15-20 minutes**

---

### 🔗 ÉTAPE 2 : Configurer Chainlink VRF (10-15 min)

#### 2.1 Créer un Subscription
- [ ] Aller sur https://vrf.chain.link/
- [ ] Connecter ton wallet
- [ ] Sélectionner "Base Mainnet"
- [ ] Créer un nouveau subscription
- [ ] Noter le **Subscription ID**

#### 2.2 Financer le Subscription
- [ ] Ajouter des fonds LINK (minimum 2 LINK recommandé)
- [ ] Vérifier que le subscription est actif

#### 2.3 Configurer dans `contracts/.env`
- [ ] Ajouter `VRF_SUBSCRIPTION_ID=ton_id_ici`

**Temps estimé : 10-15 minutes**

---

### 🚀 ÉTAPE 3 : Déployer les Smart Contracts (20-30 min)

#### 3.1 Préparer le Wallet de Déploiement
- [ ] Créer un wallet avec de l'ETH sur Base Mainnet
- [ ] Noter la private key (⚠️ GARDE LA SECRÈTE !)
- [ ] Ajouter dans `contracts/.env` : `PRIVATE_KEY=...`

#### 3.2 Déployer les Contrats
```bash
cd contracts
npm install
npx hardhat run scripts/deploy-all.js --network base
```

- [ ] Noter l'adresse de `AureusLottery`
- [ ] Noter l'adresse de `AureusDeposit`

#### 3.3 Vérifier le Treasury
```bash
LOTTERY_ADDRESS=0x... npx hardhat run scripts/verify-treasury.js --network base
```

- [ ] Vérifier que le treasury est bien `0xa166D2570d4bBfACcEBE7A78a426991b1Fa8f6eC`

**Temps estimé : 20-30 minutes**

---

### ⚙️ ÉTAPE 4 : Configurer Chainlink Automation (15-20 min)

#### 4.1 Main Draw (21:00 UTC)
- [ ] Aller sur https://automation.chain.link/
- [ ] Créer un nouveau "Upkeep"
- [ ] Sélectionner ton contrat `AureusLottery`
- [ ] Configurer :
  - **Trigger** : Time-based
  - **Cron** : `0 21 * * *` (21:00 UTC tous les jours)
  - **Function** : `requestMainDraw()`
- [ ] Financer avec LINK (minimum 5 LINK)

#### 4.2 Bonus Draw (21:30 UTC)
- [ ] Créer un deuxième Upkeep
- [ ] Même contrat `AureusLottery`
- [ ] Configurer :
  - **Trigger** : Time-based
  - **Cron** : `30 21 * * *` (21:30 UTC tous les jours)
  - **Function** : `requestBonusDraw()`
- [ ] Financer avec LINK (minimum 5 LINK)

**Temps estimé : 15-20 minutes**

---

### 🔧 ÉTAPE 5 : Configuration Frontend (10 min)

#### 5.1 Mettre à jour `.env.local`
- [ ] Ajouter `NEXT_PUBLIC_LOTTERY_ADDRESS=0x...` (après déploiement)
- [ ] Ajouter `NEXT_PUBLIC_DEPOSIT_CONTRACT_ADDRESS=0x...` (après déploiement)
- [ ] Vérifier toutes les autres variables

#### 5.2 Ajouter dans Vercel
- [ ] Aller sur Vercel Dashboard
- [ ] Ton projet → Settings → Environment Variables
- [ ] Ajouter toutes les variables de `.env.local`
- [ ] Redéployer

**Temps estimé : 10 minutes**

---

### 🧪 ÉTAPE 6 : Tests (15-20 min)

#### 6.1 Test de Création de Compte
- [ ] Ouvrir l'app déployée
- [ ] Créer un compte (email ou Google)
- [ ] Vérifier qu'un wallet est généré
- [ ] Vérifier l'affichage de l'adresse de dépôt

#### 6.2 Test de Dépôt (Simulation)
- [ ] Vérifier que l'adresse de dépôt s'affiche
- [ ] Tester le bouton "Acheter avec carte bancaire"
- [ ] Vérifier que Ramp/Stripe s'ouvrent

#### 6.3 Test d'Achat de Ticket
- [ ] Acheter un ticket (en mode test)
- [ ] Vérifier que le ticket est enregistré
- [ ] Vérifier que les 10% arrivent sur ton Ledger

**Temps estimé : 15-20 minutes**

---

## 📊 Résumé des Temps

| Étape | Temps |
|-------|-------|
| 1. Clés API | 15-20 min |
| 2. Chainlink VRF | 10-15 min |
| 3. Déploiement Contrats | 20-30 min |
| 4. Chainlink Automation | 15-20 min |
| 5. Configuration Frontend | 10 min |
| 6. Tests | 15-20 min |
| **TOTAL** | **~1h30 - 2h** |

---

## 🎯 Une Fois Tout Fait

### L'app sera 100% opérationnelle :
- ✅ Les joueurs peuvent créer un compte
- ✅ Les joueurs peuvent déposer (crypto ou carte)
- ✅ Les joueurs peuvent acheter des tickets
- ✅ Les tirages se font automatiquement à 21H UTC
- ✅ Tu reçois automatiquement 10% sur ton Ledger
- ✅ Les gagnants peuvent retirer leurs gains

### Maintenance Quotidienne :
- **Aucune** ! Tout est automatique :
  - Tirages automatiques (Chainlink Automation)
  - Réception automatique des 10%
  - Conversion automatique des cryptos

---

## 🚨 Points d'Attention

### Sécurité
- ⚠️ **NE JAMAIS** commiter la private key
- ⚠️ **GARDER SECRET** le `WALLET_SEED` si utilisé
- ⚠️ **VÉRIFIER** que le treasury est correct avant de lancer

### Coûts
- **Chainlink VRF** : ~0.002 LINK par tirage
- **Chainlink Automation** : ~0.1 LINK par tirage
- **Gas fees** : Très bas sur Base (~0.001$ par transaction)
- **Stripe** : 2.9% + 0.30€ par transaction
- **Ramp** : ~1-2% inclus dans le prix

---

## ✅ Checklist Finale

Avant de lancer en production :

- [ ] Toutes les clés API obtenues
- [ ] Contrats déployés et vérifiés
- [ ] Treasury vérifié : `0xa166D2570d4bBfACcEBE7A78a426991b1Fa8f6eC`
- [ ] Chainlink VRF configuré et financé
- [ ] Chainlink Automation configuré (2 upkeeps)
- [ ] Frontend déployé sur Vercel
- [ ] Tests effectués
- [ ] Variables d'environnement configurées partout

**Une fois tout coché → L'app est PRÊTE ! 🚀**


