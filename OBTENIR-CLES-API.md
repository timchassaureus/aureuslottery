# 🔑 Guide : Obtenir les Clés API

## 📋 Résumé

Tu as besoin de **3 clés API** pour que tout fonctionne :
1. **Ramp Network** (1 clé)
2. **Stripe** (2 clés : secret + publishable)

---

## 1️⃣ Ramp Network (Crypto On-Ramp)

### Étapes

1. **Aller sur** : https://ramp.network/
2. **Créer un compte** (gratuit)
3. **Aller dans** : Developer Dashboard
4. **Créer une nouvelle application** :
   - Nom : "Aureus Lottery"
   - Description : "Crypto lottery platform"
5. **Copier la Host API Key** (commence par `pk_...`)

### Ajouter dans `.env.local`

```env
NEXT_PUBLIC_RAMP_API_KEY=pk_ton_api_key_ici
```

### Coût
- **Gratuit** (pas de frais d'inscription)
- Frais sur transactions : ~1-2% (inclus dans le prix)

---

## 2️⃣ Stripe (Paiement Carte Bancaire)

### Étapes

1. **Aller sur** : https://stripe.com/
2. **Créer un compte** (gratuit)
3. **Aller dans** : Developers → API keys
4. **Mode Test** (pour commencer) :
   - Copier **Secret key** (commence par `sk_test_...`)
   - Copier **Publishable key** (commence par `pk_test_...`)
5. **Mode Production** (quand prêt) :
   - Activer le mode Live
   - Copier **Secret key** (commence par `sk_live_...`)
   - Copier **Publishable key** (commence par `pk_live_...`)

### Ajouter dans `.env.local`

```env
# Mode Test
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Mode Production (quand prêt)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Coût
- **Gratuit** (pas de frais d'inscription)
- Frais par transaction : **2.9% + 0.30€**

---

## 3️⃣ (Optionnel) Google OAuth

Si tu veux "Continuer avec Google" :

1. **Aller sur** : https://console.cloud.google.com/
2. **Créer un projet**
3. **Aller dans** : APIs & Services → Credentials
4. **Créer OAuth 2.0 Client ID**
5. **Copier** :
   - Client ID
   - Client Secret

### Ajouter dans `.env.local`

```env
GOOGLE_CLIENT_ID=ton_client_id
GOOGLE_CLIENT_SECRET=ton_client_secret
```

---

## 4️⃣ (Optionnel) Apple Sign In

Si tu veux "Continuer avec Apple" :

1. **Aller sur** : https://developer.apple.com/
2. **Créer un compte** (nécessite compte développeur Apple - $99/an)
3. **Créer un App ID**
4. **Configurer Sign in with Apple**
5. **Copier** :
   - Client ID
   - Client Secret

### Ajouter dans `.env.local`

```env
APPLE_CLIENT_ID=ton_client_id
APPLE_CLIENT_SECRET=ton_client_secret
```

---

## ✅ Checklist

### Minimum (pour fonctionner)
- [ ] Ramp API Key
- [ ] Stripe Secret Key
- [ ] Stripe Publishable Key

### Complet (meilleure UX)
- [ ] Tout ci-dessus
- [ ] Google OAuth (optionnel)
- [ ] Apple Sign In (optionnel)

---

## ⏱️ Temps Estimé

- **Ramp** : 5 minutes
- **Stripe** : 10 minutes
- **Google** : 15 minutes (optionnel)
- **Apple** : 30 minutes (optionnel, nécessite compte dev)

**Total minimum : ~15 minutes**

---

## 🎯 Prochaines Étapes

Une fois les clés obtenues :
1. Ajouter dans `.env.local`
2. Ajouter dans Vercel (Settings → Environment Variables)
3. Redéployer

**C'est tout ! 🚀**


