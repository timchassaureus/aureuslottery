# 🚀 Guide de Déploiement Rapide

## ⚡ Déploiement en 3 Étapes

### 1️⃣ Préparer le Code

```bash
# Vérifier que le build fonctionne
npm run build

# Si tout est OK, poussez sur GitHub
git add .
git commit -m "Ready for production"
git push
```

### 2️⃣ Déployer sur Vercel (Recommandé)

#### Option A : Via l'Interface Web
1. Allez sur https://vercel.com
2. Cliquez "New Project"
3. Importez votre repo GitHub
4. Configurez les variables d'environnement (voir ci-dessous)
5. Cliquez "Deploy"

#### Option B : Via CLI
```bash
npm i -g vercel
vercel
# Suivez les instructions
vercel --prod
```

### 3️⃣ Configurer les Variables d'Environnement

Dans Vercel/Netlify, ajoutez ces variables dans **Settings → Environment Variables** :

```
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_BASESCAN_TX_URL=https://basescan.org/tx/
NEXT_PUBLIC_LOTTERY_ADDRESS=votre_contrat_déployé
NEXT_PUBLIC_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
NEXT_PUBLIC_OWNER_ADDRESS=votre_adresse_admin
NEXT_PUBLIC_DEFAULT_MODE=live
NEXT_PUBLIC_FORCE_MODE=live
```

## ✅ Vérifications Finales

Après le déploiement :

1. ✅ Visitez votre site déployé
2. ✅ Testez la connexion wallet
3. ✅ Vérifiez que le réseau Base est détecté
4. ✅ Testez un achat de ticket (si possible)

## 🎯 C'est Tout !

Votre application est maintenant en ligne et prête pour les joueurs ! 🎉

