# 🌐 Configuration Réseau - Base Mainnet vs Sepolia

## 📊 Différence entre les Réseaux

### Base Mainnet (Production) - Chain ID: **8453**
- ✅ **Argent réel** (vraie USDC)
- ✅ **Transactions permanentes** sur la blockchain
- ✅ **Frais de gas réels** (payés en ETH)
- ✅ **Pour les joueurs réels** qui veulent jouer avec de l'argent réel
- 🔗 Explorer: https://basescan.org
- 💰 USDC: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`

### Base Sepolia (Testnet) - Chain ID: **84532**
- 🧪 **Argent de test** (USDC de test gratuit)
- 🧪 **Pour les tests et développement**
- 🧪 **Frais de gas gratuits** (ETH de test)
- 🧪 **Pour tester avant de déployer en production**
- 🔗 Explorer: https://sepolia.basescan.org
- 💰 USDC Test: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`

## 🚀 Configuration pour Production (Base Mainnet)

Créez `.env.local` avec :

```env
# Base Mainnet - Production
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_BASESCAN_TX_URL=https://basescan.org/tx/
NEXT_PUBLIC_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
NEXT_PUBLIC_LOTTERY_ADDRESS=votre_contrat_sur_mainnet
NEXT_PUBLIC_OWNER_ADDRESS=votre_adresse_admin
NEXT_PUBLIC_DEFAULT_MODE=live
NEXT_PUBLIC_FORCE_MODE=live
```

## 🧪 Configuration pour Tests (Base Sepolia)

```env
# Base Sepolia - Testnet
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_BASESCAN_TX_URL=https://sepolia.basescan.org/tx/
NEXT_PUBLIC_USDC_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e
NEXT_PUBLIC_LOTTERY_ADDRESS=votre_contrat_sur_sepolia
NEXT_PUBLIC_OWNER_ADDRESS=votre_adresse_admin
NEXT_PUBLIC_DEFAULT_MODE=live
NEXT_PUBLIC_FORCE_MODE=live
```

## ⚠️ Important

1. **Pour la production** : Utilisez **Base Mainnet** (Chain ID 8453)
2. **Les joueurs** se connecteront automatiquement au bon réseau
3. **MetaMask** ajoutera/switch automatiquement vers Base si nécessaire
4. **L'argent est réel** sur Base Mainnet - soyez prudent !

## 🔄 Changer de Réseau

Pour passer de Sepolia à Mainnet (ou vice versa) :

1. Modifiez `.env.local` avec les valeurs ci-dessus
2. Redémarrez le serveur : `npm run dev`
3. Les utilisateurs devront reconnecter leur wallet

## ✅ Configuration Actuelle

Par défaut, l'application est maintenant configurée pour **Base Mainnet** (production).

Pour utiliser Sepolia (testnet), modifiez `.env.local` avec les valeurs Sepolia.

