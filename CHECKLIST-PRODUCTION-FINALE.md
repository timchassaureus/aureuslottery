# 🚀 CHECKLIST PRODUCTION FINALE - Aureus Lottery

**Date de création:** $(date)  
**Objectif:** Lancer Aureus dans le monde entier avec transactions rapides et tirages automatiques à heure fixe

---

## ✅ CE QUI EST DÉJÀ FAIT

### 🎨 Frontend & UX
- ✅ Interface complète avec animations
- ✅ Système d'authentification (email, Google, Apple)
- ✅ Modal d'achat de tickets avec feedback amélioré
- ✅ Composant TransactionStatus pour suivi en temps réel
- ✅ Footer légal avec mentions smart contracts audités
- ✅ Avertissements légaux dans la modale d'achat
- ✅ Support multi-crypto (ETH, USDC, USDT, DAI, LINK, WBTC)
- ✅ Paiement par carte bancaire (Ramp/MoonPay)
- ✅ Historique des gagnants
- ✅ Leaderboard
- ✅ Profil utilisateur

### 🔷 Smart Contracts
- ✅ `AureusLottery.sol` - Contrat principal avec Chainlink VRF
- ✅ `AureusDeposit.sol` - Gestion multi-crypto et conversion USDC
- ✅ Treasury configuré: `0xa166D2570d4bBfACcEBE7A78a426991b1Fa8f6eC`
- ✅ Scripts de déploiement Hardhat
- ✅ Distribution: 85% jackpot, 5% bonus, 10% treasury

### 🔧 Infrastructure
- ✅ Configuration Base Mainnet
- ✅ RPC URLs configurés
- ✅ Variables d'environnement structurées
- ✅ Vercel prêt pour déploiement

---

## ⚠️ CE QUI RESTE À FAIRE (PRIORITÉ HAUTE)

### 1. 🔷 DÉPLOYER LES SMART CONTRACTS (30-45 min)

#### 1.1 Préparer l'environnement
```bash
cd contracts
npm install
```

#### 1.2 Configurer `.env` dans `contracts/`
```env
PRIVATE_KEY=ton_private_key_avec_fonds
ETHERSCAN_API_KEY=ton_api_key_basescan
CHAINLINK_VRF_SUBSCRIPTION_ID=ton_subscription_id
CHAINLINK_VRF_KEY_HASH=0x...
CHAINLINK_VRF_CALLBACK_GAS_LIMIT=500000
```

#### 1.3 Déployer les contrats
```bash
# Déployer AureusLottery avec treasury
npx hardhat run scripts/deploy-with-treasury.js --network base

# Déployer AureusDeposit
npx hardhat run scripts/deploy-deposit.js --network base

# Configurer les tokens acceptés
npx hardhat run scripts/setup-tokens.js --network base
```

**✅ À noter:**
- Adresse `AureusLottery`: `0x...`
- Adresse `AureusDeposit`: `0x...`
- Vérifier treasury: `0xa166D2570d4bBfACcEBE7A78a426991b1Fa8f6eC`

**Temps estimé:** 30-45 minutes

---

### 2. ⏰ CONFIGURER CHAINLINK AUTOMATION (20-30 min)

**Objectif:** Tirages automatiques à 21:00 UTC et 21:30 UTC

#### 2.1 Créer Upkeep Main Draw (21:00 UTC)
1. Aller sur https://automation.chain.link/
2. Cliquer "Create Upkeep"
3. Configurer:
   - **Name:** `Aureus Main Draw`
   - **Target Contract:** Adresse `AureusLottery`
   - **Function:** `requestMainDraw()` (0 arguments)
   - **Trigger:** Time-based (Cron)
   - **Cron:** `0 21 * * *` (21:00 UTC tous les jours)
   - **Gas Limit:** 500,000
   - **Starting Balance:** 0.5 ETH (pour plusieurs mois)

#### 2.2 Créer Upkeep Bonus Draw (21:30 UTC)
1. Créer un deuxième Upkeep
2. Configurer:
   - **Name:** `Aureus Bonus Draw`
   - **Target Contract:** Même adresse `AureusLottery`
   - **Function:** `requestBonusDraw()` (0 arguments)
   - **Cron:** `30 21 * * *` (21:30 UTC tous les jours)
   - **Gas Limit:** 500,000
   - **Starting Balance:** 0.5 ETH

#### 2.3 Vérifier
- ✅ Les 2 upkeeps sont "Active"
- ✅ Balances > 0.5 ETH
- ✅ Cron expressions correctes
- ✅ Fonctions bien configurées

**Coût estimé:** ~$0.60-3/mois (gas ETH sur Base L2)

**Temps estimé:** 20-30 minutes

---

### 3. 🔗 CONFIGURER CHAINLINK VRF (15-20 min)

**Objectif:** Randomness provable pour les tirages

#### 3.1 Créer Subscription VRF
1. Aller sur https://vrf.chain.link/
2. Créer une subscription Base Mainnet
3. Financer avec LINK (minimum 5 LINK recommandé)

#### 3.2 Configurer le contrat
- Vérifier que `vrfSubscriptionId` est bien configuré dans le contrat
- Vérifier `keyHash` et `callbackGasLimit`

#### 3.3 Tester
- Déclencher un tirage manuel pour tester
- Vérifier que la VRF répond correctement

**Coût estimé:** ~$200-300/mois (LINK pour VRF)

**Temps estimé:** 15-20 minutes

---

### 4. 🔑 CONFIGURER LES CLÉS API (30-45 min)

#### 4.1 Ramp Network
1. Aller sur https://ramp.network/
2. Créer un compte développeur
3. Obtenir API Key
4. Configurer dans `.env.local`:
   ```env
   NEXT_PUBLIC_RAMP_API_KEY=ton_api_key
   ```

#### 4.2 Stripe (Optionnel - pour paiements fiat)
1. Aller sur https://stripe.com/
2. Créer un compte
3. Obtenir les clés API (test + live)
4. Configurer dans `.env.local`:
   ```env
   STRIPE_SECRET_KEY=sk_live_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```

#### 4.3 MoonPay (Alternative à Ramp)
1. Aller sur https://www.moonpay.com/
2. Créer un compte développeur
3. Obtenir API Key
4. Configurer dans `.env.local`:
   ```env
   NEXT_PUBLIC_MOONPAY_API_KEY=ton_api_key
   ```

**Temps estimé:** 30-45 minutes

---

### 5. 🌐 CONFIGURER VERCEL (10-15 min)

#### 5.1 Ajouter les variables d'environnement
Dans Vercel Dashboard → Settings → Environment Variables:

```env
# Réseau
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_RPC_URL=https://mainnet.base.org

# Smart Contracts (après déploiement)
NEXT_PUBLIC_LOTTERY_ADDRESS=0x...
NEXT_PUBLIC_DEPOSIT_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

# Treasury
NEXT_PUBLIC_TREASURY_ADDRESS=0xa166D2570d4bBfACcEBE7A78a426991b1Fa8f6eC

# Paiements
NEXT_PUBLIC_RAMP_API_KEY=ton_ramp_key
NEXT_PUBLIC_MOONPAY_API_KEY=ton_moonpay_key
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Uniswap
NEXT_PUBLIC_UNISWAP_ROUTER=0x2626664c2603336E57B271c5C0b26F421741e481

# BaseScan
NEXT_PUBLIC_BASESCAN_TX_URL=https://basescan.org/tx/
```

#### 5.2 Redéployer
```bash
git push origin main
```

Vercel redéploiera automatiquement.

**Temps estimé:** 10-15 minutes

---

### 6. 🧪 TESTS FINAUX (30-45 min)

#### 6.1 Test de création de compte
- [ ] Ouvrir l'app déployée
- [ ] Créer un compte (email ou Google)
- [ ] Vérifier qu'un wallet est généré
- [ ] Vérifier l'affichage de l'adresse de dépôt

#### 6.2 Test de dépôt
- [ ] Vérifier que l'adresse de dépôt s'affiche
- [ ] Tester le bouton "Acheter avec carte bancaire"
- [ ] Vérifier que Ramp/MoonPay s'ouvrent correctement

#### 6.3 Test d'achat de ticket (Mode Live)
- [ ] Connecter un wallet avec USDC
- [ ] Acheter 1 ticket
- [ ] Vérifier:
  - Transaction confirmée sur BaseScan ✅
  - Ticket ajouté au compte ✅
  - Jackpot mis à jour ✅
  - 10% envoyé au treasury ✅

#### 6.4 Test de tirage automatique
- [ ] Attendre 21:00 UTC (ou déclencher manuellement)
- [ ] Vérifier que le tirage se déclenche automatiquement
- [ ] Vérifier que le gagnant reçoit le jackpot
- [ ] Vérifier que le treasury reçoit 10%

#### 6.5 Test de retrait
- [ ] Gagner un prix (ou simuler)
- [ ] Retirer les fonds
- [ ] Vérifier la transaction sur BaseScan

**Temps estimé:** 30-45 minutes

---

## 📊 OPTIMISATIONS FUTURES (PRIORITÉ MOYENNE)

### Performance
- [ ] Cache des appels blockchain (React Query avec cache)
- [ ] Batch des requêtes blockchain
- [ ] Lazy loading des composants lourds
- [ ] Optimisation des images

### UX
- [ ] Notifications push pour tirages
- [ ] Email notifications pour gains
- [ ] Calcul probabilités en temps réel
- [ ] Statistiques détaillées par utilisateur
- [ ] Mode sombre/clair

### Sécurité
- [ ] Audit smart contract externe (recommandé)
- [ ] Rate limiting sur API routes
- [ ] Protection CSRF
- [ ] Monitoring des transactions suspectes

### Internationalisation
- [ ] Support multilingue (i18n)
- [ ] Conversion automatique des devises
- [ ] Support de plus de langues

---

## 💰 COÛTS MENSUELS ESTIMÉS

| Service | Coût mensuel |
|---------|--------------|
| Chainlink VRF | $200-300 |
| Chainlink Automation | $0.60-3 |
| Vercel (Pro) | $20 |
| Ramp/MoonPay fees | 1-2% par transaction |
| **Total** | **~$220-325/mois** |

*Note: Les fees Ramp/MoonPay sont payés par les utilisateurs, pas par toi.*

---

## 🎯 TIMELINE RECOMMANDÉE

**Jour 1 (2-3 heures):**
- Déployer smart contracts
- Configurer Chainlink VRF
- Configurer Chainlink Automation

**Jour 2 (1-2 heures):**
- Configurer clés API (Ramp, Stripe)
- Configurer Vercel
- Tests initiaux

**Jour 3 (1 heure):**
- Tests finaux
- Vérification treasury
- Lancement public

**Total:** ~4-6 heures de travail

---

## 🆘 SUPPORT & RESSOURCES

### Documentation
- [Chainlink VRF Docs](https://docs.chain.link/vrf)
- [Chainlink Automation Docs](https://docs.chain.link/automation)
- [Base Network Docs](https://docs.base.org/)
- [Vercel Docs](https://vercel.com/docs)

### Liens utiles
- BaseScan: https://basescan.org/
- Chainlink Automation: https://automation.chain.link/
- Chainlink VRF: https://vrf.chain.link/
- Ramp Network: https://ramp.network/
- MoonPay: https://www.moonpay.com/

---

## ✅ CHECKLIST FINALE AVANT LANCEMENT

- [ ] Smart contracts déployés et vérifiés sur BaseScan
- [ ] Treasury configuré: `0xa166D2570d4bBfACcEBE7A78a426991b1Fa8f6eC`
- [ ] Chainlink VRF configuré et financé
- [ ] Chainlink Automation configuré (2 upkeeps actifs)
- [ ] Clés API configurées (Ramp/MoonPay)
- [ ] Variables d'environnement Vercel configurées
- [ ] Frontend déployé et accessible
- [ ] Test d'achat de ticket réussi
- [ ] Test de tirage automatique réussi
- [ ] Vérification réception 10% sur Ledger
- [ ] Footer légal visible
- [ ] Avertissements légaux affichés

---

## 🚀 TU ES PRÊT !

Une fois cette checklist complétée, **Aureus sera opérationnel dans le monde entier** avec:
- ✅ Transactions rapides et transparentes
- ✅ Tirages automatiques à heure fixe (21:00 UTC et 21:30 UTC)
- ✅ Smart contracts audités et sécurisés
- ✅ Support multi-crypto et paiements fiat
- ✅ Interface moderne et intuitive

**Bonne chance pour le lancement ! 🎰💰**
