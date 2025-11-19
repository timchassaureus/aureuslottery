# 🚀 Déploiement Immédiat

## Option 1 : Vercel (Recommandé - 2 minutes)

```bash
# 1. Installez Vercel CLI
npm i -g vercel

# 2. Déployez
vercel --prod

# 3. Suivez les instructions
# 4. Configurez les variables d'environnement dans le dashboard Vercel
```

## Option 2 : Script Automatique

```bash
# Utilisez le script de déploiement
./deploy.sh vercel
# ou
./deploy.sh netlify
```

## Option 3 : Via GitHub + Vercel Web

1. **Poussez votre code sur GitHub** :
   ```bash
   git add .
   git commit -m "Ready for production"
   git push
   ```

2. **Allez sur https://vercel.com**
3. **Cliquez "New Project"**
4. **Importez votre repo**
5. **Configurez les variables d'environnement**
6. **Déployez !**

## 📋 Variables d'Environnement à Configurer

Dans votre dashboard (Vercel/Netlify), ajoutez :

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

## ✅ Après le Déploiement

1. Testez la connexion wallet
2. Vérifiez le réseau Base
3. Testez un achat de ticket

---

**Votre application sera en ligne en quelques minutes ! 🎉**

