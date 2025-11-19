# 📋 Instructions Finales - Déploiement

## ✅ Ce qui est Prêt

- ✅ Code sur GitHub : https://github.com/timchassaureus/aureuslottery.git
- ✅ Build fonctionnel
- ✅ Configuration optimale
- ✅ Workflow GitHub Actions créé

## 🚀 Pour Déployer MAINTENANT

### Option 1 : Interface Web (2 minutes) ⭐ RECOMMANDÉ

1. **Allez sur** : https://vercel.com/new
2. **Connectez GitHub**
3. **Importez** : `timchassaureus/aureuslottery`
4. **Cliquez "Deploy"**

**C'est tout !** Vercel détectera Next.js automatiquement.

### Option 2 : CLI

```bash
# 1. Login Vercel
npx vercel login

# 2. Déployez
npx vercel --prod
```

### Option 3 : GitHub Actions (Automatique)

Si vous configurez les secrets GitHub :
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Le workflow `.github/workflows/deploy.yml` déploiera automatiquement à chaque push !

## 📋 Variables d'Environnement

**Après le premier déploiement**, ajoutez dans **Vercel → Settings → Environment Variables** :

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

## ⚠️ Important

**Remplacez** :
- `NEXT_PUBLIC_LOTTERY_ADDRESS` → Votre contrat déployé sur Base Mainnet
- `NEXT_PUBLIC_OWNER_ADDRESS` → Votre adresse admin

## 🎯 Après le Déploiement

1. ✅ Visitez votre URL Vercel
2. ✅ Testez la connexion wallet
3. ✅ Vérifiez le réseau Base
4. ✅ Partagez l'URL avec vos joueurs !

---

**L'option la plus simple est l'interface web Vercel ! 🚀**

