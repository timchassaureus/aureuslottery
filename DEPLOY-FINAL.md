# ✅ Code Poussé sur GitHub !

Votre code est maintenant sur : **https://github.com/timchassaureus/aureuslottery.git**

## 🚀 Déploiement Immédiat sur Vercel

### Méthode 1 : Interface Web (2 minutes)

1. **Allez sur** https://vercel.com
2. **Connectez votre compte GitHub** (si pas déjà fait)
3. **Cliquez "Add New..." → "Project"**
4. **Importez le repo** : `timchassaureus/aureuslottery`
5. **Configurez les variables d'environnement** (voir ci-dessous)
6. **Cliquez "Deploy"**

### Méthode 2 : CLI (si vous avez les permissions)

```bash
# Installez Vercel CLI (peut nécessiter sudo)
sudo npm i -g vercel

# Déployez
vercel --prod
```

## 📋 Variables d'Environnement à Configurer

Dans **Vercel Dashboard → Settings → Environment Variables**, ajoutez **TOUTES** ces variables :

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

⚠️ **IMPORTANT** : Remplacez :
- `NEXT_PUBLIC_LOTTERY_ADDRESS` par votre contrat réel
- `NEXT_PUBLIC_OWNER_ADDRESS` par votre adresse admin

## 🎯 Après le Déploiement

1. ✅ Visitez votre URL Vercel (ex: `aureuslottery.vercel.app`)
2. ✅ Testez la connexion wallet
3. ✅ Vérifiez que le badge "Live • Base" s'affiche
4. ✅ Testez un achat de ticket

## 📱 Votre Application Sera Accessible Sur :

- **Desktop** : Votre URL Vercel
- **Mobile** : Même URL (responsive)
- **Tous les navigateurs** : Chrome, Safari, Firefox, etc.

## 🔗 Liens Utiles

- **GitHub** : https://github.com/timchassaureus/aureuslottery
- **Vercel Dashboard** : https://vercel.com/dashboard
- **BaseScan** : https://basescan.org

---

**Votre application sera en ligne dans quelques minutes ! 🎉**

Une fois déployée, partagez l'URL avec vos joueurs !

