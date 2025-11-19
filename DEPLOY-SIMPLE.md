# 🚀 Déploiement Ultra-Simple (2 Minutes)

## ⚡ Méthode la Plus Rapide

Je ne peux pas déployer directement (nécessite votre authentification), mais voici la méthode la plus simple :

### 1️⃣ Allez sur Vercel

**https://vercel.com/new**

### 2️⃣ Connectez GitHub

- Cliquez "Continue with GitHub"
- Autorisez Vercel

### 3️⃣ Importez votre Repo

- Cherchez : `timchassaureus/aureuslottery`
- Cliquez "Import"

### 4️⃣ Configurez (Optionnel - peut être fait après)

Dans "Environment Variables", ajoutez :

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

### 5️⃣ Déployez !

- Cliquez "Deploy"
- Attendez 2-3 minutes
- Votre site sera en ligne ! 🎉

## 🎯 Résultat

Vous obtiendrez une URL comme : `aureuslottery.vercel.app`

**C'est tout ! Votre application sera en ligne ! 🚀**

---

**Note** : Les variables d'environnement peuvent être ajoutées après le déploiement dans Settings.

