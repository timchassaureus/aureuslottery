# 🚀 Checklist — 1 000 joueurs demain

## ✅ Ce qui a été corrigé automatiquement (déjà dans le code)

- **Rate limiter** sur toutes les routes API sensibles (anti-spam, anti-abus)
- **Cache 60s** sur `/api/winners` — réduit les appels Supabase de ~1 000× en pic
- **FallbackProvider RPC** — si `mainnet.base.org` est throttlé, bascule auto sur LlamaRPC, PublicNode, 1RPC
- **Streak inline** — l'auto-fetch HTTP interne fragile est remplacé par une logique directe dans `record-purchase`
- **Cache assets statiques** — JS/CSS cachés 1 an côté navigateur, images 24h

---

## 🔴 À faire AVANT d'ouvrir au public (critique)

### 1. Déployer le smart contract
```bash
cd contracts
npm install
npx hardhat run scripts/deploy.js --network base
```
Puis copier l'adresse du contrat déployé dans Vercel :
```
NEXT_PUBLIC_LOTTERY_ADDRESS=0x...votre_contrat...
```

### 2. Configurer CRON_SECRET sur Vercel
Le tirage automatique est protégé par ce secret — sans lui, les crons Vercel échoueront silencieusement.
```
CRON_SECRET=un-secret-long-et-aléatoire-ici
```

### 3. Variables d'environnement manquantes sur Vercel
Vérifier que toutes ces variables sont bien définies dans **Vercel → Settings → Environment Variables** :
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_LOTTERY_ADDRESS=   ← critique
CRON_SECRET=                   ← critique
ADMIN_SECRET=
STRIPE_SECRET_KEY=             (si Stripe actif)
STRIPE_WEBHOOK_SECRET=         (si Stripe actif)
```

---

## 🟠 Fortement recommandé (avant 1 000 joueurs)

### 4. Remplacer le RPC public par Alchemy (gratuit)
Le code utilise maintenant un FallbackProvider avec 4 RPCs, mais un RPC dédié est toujours plus fiable.
1. Créer un compte sur [alchemy.com](https://alchemy.com) (gratuit)
2. Créer une app sur **Base Mainnet**
3. Copier l'URL HTTPS et l'ajouter dans Vercel :
```
NEXT_PUBLIC_RPC_URL=https://base-mainnet.g.alchemy.com/v2/VOTRE_CLE
```

### 5. Passer Supabase en plan Pro
Le plan gratuit limite les connexions simultanées à ~60.
Pour 1 000 joueurs actifs : plan Pro ($25/mois) ou au minimum vérifier dans
**Supabase → Settings → Database** que le "connection pooling" via PgBouncer est activé.

### 6. Tester le tirage manuellement avant l'ouverture
```bash
curl -X POST https://VOTRE_DOMAINE.vercel.app/api/draw/trigger?type=main \
  -H "Authorization: Bearer VOTRE_CRON_SECRET"
```
→ Vérifier que la réponse contient `"success": true` et un wallet gagnant.

---

## 🟡 Optionnel mais bien (après lancement)

- **Upstash Redis** pour un rate limiter distribué (actuellement in-memory, suffisant pour démarrer)
- **Sentry** pour le monitoring des erreurs en production
- **Vercel Analytics** pour suivre le trafic en temps réel
- Ajouter un index sur `purchases(created_at)` si la table grossit vite

---

## ✅ Test rapide avant d'ouvrir

1. Ouvrir l'app en navigation privée
2. Connecter MetaMask sur Base Mainnet
3. Vérifier que le solde USDC s'affiche correctement
4. Acheter 1 ticket de test (petite somme)
5. Vérifier dans Supabase → `purchases` que la ligne apparaît
6. Vérifier dans Supabase → `streaks` que le streak est à 1

Si tout ça fonctionne → vous êtes prêts. 🏆
