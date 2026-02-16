# 💰 Système de Dépôt Multi-Crypto - AUREUS

## 📋 Vue d'ensemble

Le système de dépôt permet aux utilisateurs de :
- Créer un compte avec authentification sociale (Email, Google, Apple)
- Recevoir automatiquement une adresse de dépôt
- Envoyer n'importe quelle crypto (ETH, USDT, USDC, DAI, etc.)
- Conversion automatique en USDC
- Payer par carte bancaire (Stripe/Ramp)

## 🏗️ Architecture

### 1. Authentification Sociale
- **AuthModal** : Création de compte
- **lib/auth.ts** : Génération automatique de wallets
- **lib/userStorage.ts** : Stockage local des utilisateurs

### 2. Smart Contract
- **AureusDeposit.sol** : Accepte les dépôts multi-crypto
- Conversion automatique via Uniswap V3
- Crédit en USDC dans le compte utilisateur

### 3. Paiement par Carte
- **CardPaymentModal** : Interface de paiement
- **Ramp Network** : Achat direct de crypto avec carte
- **Stripe** : Paiement fiat converti en USDC

## 🚀 Déploiement

### 1. Déployer le Smart Contract

```bash
cd contracts
npm install
npx hardhat run scripts/deploy-deposit.js --network baseSepolia
```

### 2. Configurer les Variables d'Environnement

Ajouter dans `.env.local` :

```env
# Smart Contract
NEXT_PUBLIC_DEPOSIT_CONTRACT_ADDRESS=0x...

# Paiements
NEXT_PUBLIC_RAMP_API_KEY=your_ramp_key
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Uniswap
NEXT_PUBLIC_UNISWAP_ROUTER=0x2626664c2603336E57B271c5C0b26F421741e481
```

### 3. Obtenir les Clés API

#### Ramp Network
1. Aller sur https://ramp.network/
2. Créer un compte
3. Obtenir la clé API

#### Stripe
1. Aller sur https://stripe.com/
2. Créer un compte
3. Obtenir les clés API (test puis production)

## 📝 Utilisation

### Pour les Utilisateurs

1. **Créer un compte** : Cliquer sur "Se connecter"
2. **Voir l'adresse de dépôt** : Affichée automatiquement
3. **Déposer des cryptos** : Envoyer à l'adresse (ETH, USDT, USDC, etc.)
4. **Payer par carte** : Cliquer sur "Acheter avec carte bancaire"
5. **Acheter des tickets** : Utiliser le solde USDC

### Pour les Développeurs

#### Écouter les Dépôts

```typescript
import { listenForDeposits } from '@/lib/depositListener';

listenForDeposits(userWalletAddress, (amount) => {
  console.log('Deposit received:', amount);
  // Mettre à jour le solde
});
```

#### Vérifier le Solde

```typescript
import { checkUserBalance } from '@/lib/depositListener';

const balance = await checkUserBalance(userWalletAddress);
console.log('Balance:', balance);
```

## 🔒 Sécurité

⚠️ **Important** : En production, utiliser :
- Base de données sécurisée (PostgreSQL, MongoDB)
- Stockage sécurisé des clés privées (HSM, AWS KMS)
- Authentification robuste (NextAuth.js, Clerk)
- Rate limiting sur les APIs

## 🎯 Prochaines Étapes

1. ✅ Smart Contract créé
2. ✅ Interface utilisateur créée
3. ⏳ Déployer le contrat sur Base Sepolia
4. ⏳ Configurer Stripe/Ramp
5. ⏳ Implémenter le listener de dépôts
6. ⏳ Tester le flux complet


