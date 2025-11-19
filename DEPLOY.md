# 🚀 Guide de Déploiement - AUREUS

## 📦 Préparation

### 1. Build de Test Local

Avant de déployer, testez le build localement :

```bash
npm run build
npm start
```

Visitez http://localhost:3000 pour vérifier que tout fonctionne.

## 🌐 Déploiement sur Vercel (Recommandé)

### Option 1 : Via l'Interface Vercel

1. **Installez Vercel CLI** (optionnel) :
   ```bash
   npm i -g vercel
   ```

2. **Connectez votre projet** :
   ```bash
   vercel
   ```

3. **Configurez les variables d'environnement** dans le dashboard Vercel :
   - Allez dans Settings → Environment Variables
   - Ajoutez toutes les variables `NEXT_PUBLIC_*` :

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

4. **Déployez** :
   ```bash
   vercel --prod
   ```

### Option 2 : Via GitHub

1. **Poussez votre code sur GitHub**
2. **Connectez votre repo à Vercel** :
   - Allez sur https://vercel.com
   - Cliquez "New Project"
   - Importez votre repo GitHub
   - Configurez les variables d'environnement
   - Déployez !

## 🌐 Déploiement sur Netlify

1. **Installez Netlify CLI** :
   ```bash
   npm i -g netlify-cli
   ```

2. **Créez `netlify.toml`** (déjà créé) :
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"
   
   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

3. **Déployez** :
   ```bash
   netlify deploy --prod
   ```

4. **Configurez les variables d'environnement** dans le dashboard Netlify :
   - Site settings → Environment variables
   - Ajoutez toutes les variables `NEXT_PUBLIC_*`

## 🔧 Variables d'Environnement Requises

**Obligatoires pour la production** :

```env
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_BASESCAN_TX_URL=https://basescan.org/tx/
NEXT_PUBLIC_LOTTERY_ADDRESS=votre_contrat_déployé
NEXT_PUBLIC_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
NEXT_PUBLIC_OWNER_ADDRESS=votre_adresse_admin
NEXT_PUBLIC_DEFAULT_MODE=live
NEXT_PUBLIC_FORCE_MODE=live
```

## ✅ Checklist de Déploiement

- [ ] Code poussé sur GitHub/GitLab
- [ ] Variables d'environnement configurées
- [ ] Contrat déployé sur Base Mainnet
- [ ] `NEXT_PUBLIC_LOTTERY_ADDRESS` mis à jour
- [ ] `NEXT_PUBLIC_OWNER_ADDRESS` configuré
- [ ] Build testé localement (`npm run build`)
- [ ] Application déployée
- [ ] Test de connexion wallet sur le site déployé
- [ ] Test d'achat de ticket (si possible)

## 🎯 Après le Déploiement

1. **Testez la connexion wallet** sur votre site déployé
2. **Vérifiez que le réseau Base est détecté**
3. **Testez un achat de ticket** (si vous avez des fonds de test)
4. **Vérifiez les transactions** sur BaseScan

## 🔗 URLs Utiles

- **Vercel Dashboard** : https://vercel.com/dashboard
- **Netlify Dashboard** : https://app.netlify.com
- **BaseScan** : https://basescan.org
- **Base Mainnet RPC** : https://mainnet.base.org

## 🆘 Dépannage

### Build échoue

```bash
# Nettoyez et réinstallez
rm -rf node_modules .next
npm install
npm run build
```

### Variables d'environnement non chargées

- Vérifiez que toutes les variables commencent par `NEXT_PUBLIC_`
- Redéployez après avoir ajouté les variables
- Vérifiez dans les logs de build

### Erreurs de réseau blockchain

- Vérifiez que `NEXT_PUBLIC_RPC_URL` est correct
- Testez la connexion RPC
- Vérifiez que le contrat est bien déployé

---

**Votre application est maintenant prête pour le web ! 🎉**

