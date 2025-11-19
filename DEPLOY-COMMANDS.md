# 🚀 Commandes de Déploiement

## ✅ Code Poussé sur GitHub

Votre code a été poussé sur : `https://github.com/timchassaureus/aureuslottery.git`

## 🌐 Déploiement Vercel

### Option 1 : Via l'Interface Web (Recommandé)

1. **Allez sur** https://vercel.com
2. **Connectez votre compte GitHub**
3. **Cliquez "New Project"**
4. **Importez le repo** : `timchassaureus/aureuslottery`
5. **Configurez les variables d'environnement** (voir ci-dessous)
6. **Cliquez "Deploy"**

### Option 2 : Via CLI

```bash
# Si Vercel CLI est installé
vercel --prod

# Sinon, installez-le d'abord
npm i -g vercel
vercel --prod
```

## 📋 Variables d'Environnement Vercel

Dans **Settings → Environment Variables**, ajoutez :

```
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_BASESCAN_TX_URL=https://basescan.org/tx/
NEXT_PUBLIC_LOTTERY_ADDRESS=votre_contrat_déployé_sur_base_mainnet
NEXT_PUBLIC_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
NEXT_PUBLIC_OWNER_ADDRESS=votre_adresse_admin
NEXT_PUBLIC_DEFAULT_MODE=live
NEXT_PUBLIC_FORCE_MODE=live
```

## ⚠️ Important

**Remplacez** :
- `NEXT_PUBLIC_LOTTERY_ADDRESS` par votre contrat déployé
- `NEXT_PUBLIC_OWNER_ADDRESS` par votre adresse admin

## 🎯 Après le Déploiement

1. ✅ Visitez votre site Vercel
2. ✅ Testez la connexion wallet
3. ✅ Vérifiez le réseau Base
4. ✅ Testez un achat de ticket

---

**Votre application sera en ligne en quelques minutes ! 🎉**

