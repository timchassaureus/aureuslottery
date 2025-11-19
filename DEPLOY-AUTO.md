# 🚀 Déploiement Automatique

## ⚠️ Limitation

Je ne peux pas déployer directement car cela nécessite :
- Authentification Vercel (login)
- Token d'accès
- Confirmation interactive

## ✅ Solution : Déploiement en 2 Minutes

### Option 1 : Interface Web Vercel (Le Plus Simple)

1. **Allez sur** : https://vercel.com/new
2. **Connectez GitHub** (si pas déjà fait)
3. **Importez** : `timchassaureus/aureuslottery`
4. **Cliquez "Deploy"** (les variables peuvent être ajoutées après)

Vercel détectera automatiquement Next.js et déploiera !

### Option 2 : CLI avec Authentification

```bash
# 1. Installez Vercel CLI
npm i -g vercel

# 2. Login (ouvrira le navigateur)
vercel login

# 3. Déployez
vercel --prod
```

### Option 3 : GitHub Actions (Automatique)

Je peux créer un workflow GitHub Actions qui déploie automatiquement à chaque push !

Souhaitez-vous que je crée ce workflow ?

## 📋 Variables d'Environnement

Une fois déployé, ajoutez dans **Vercel → Settings → Environment Variables** :

```
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_BASESCAN_TX_URL=https://basescan.org/tx/
NEXT_PUBLIC_LOTTERY_ADDRESS=votre_contrat
NEXT_PUBLIC_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
NEXT_PUBLIC_OWNER_ADDRESS=votre_adresse
NEXT_PUBLIC_DEFAULT_MODE=live
NEXT_PUBLIC_FORCE_MODE=live
```

---

**L'option la plus rapide est l'interface web Vercel ! 🚀**

