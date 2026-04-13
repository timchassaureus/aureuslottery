# 📢 Configuration du Canal Telegram

## ✅ Checklist

- [x] Canal créé
- [ ] Bot ajouté comme administrateur
- [ ] Permissions "Post Messages" données au bot
- [ ] Channel ID mis à jour dans .env

## 🔧 Étapes

### 1. Ajouter le Bot comme Administrateur

1. Va dans ton canal Telegram
2. Clique sur le nom du canal (en haut)
3. Settings → Administrators
4. Add Administrator
5. Recherche **@Aureuslotterybot**
6. Sélectionne-le
7. Coche **"Post Messages"** (important !)
8. Save

### 2. Récupérer le Channel ID

Si ton canal est public (username) :
- Le Channel ID est juste le username (ex: `@LotteryAureus`)

Si ton canal est privé :
- Utilise un bot comme @userinfobot pour obtenir l'ID numérique
- Ou utilise le format `-1001234567890` (avec le `-100` au début)

### 3. Mettre à jour le .env

Édite le fichier `.env` dans `telegram-bot/` :

```env
CHANNEL_ID=@TonNomDeCanal
CHANNEL_USERNAME=TonNomDeCanal
```

**Exemple si ton canal est @LotteryAureus :**
```env
CHANNEL_ID=@LotteryAureus
CHANNEL_USERNAME=LotteryAureus
```

### 4. Redémarrer le Bot

Après avoir mis à jour le `.env`, redémarre le bot :
```bash
# Arrête le bot (Ctrl+C)
# Puis relance :
npm start
```

## 📝 Messages pour le Canal

### Message de Bienvenue
```
🎰 Welcome to AUREUS Lottery! 🎰

Daily crypto lottery draws!
🏆 Main Jackpot: 9PM UTC
💎 Bonus Draw: 11PM UTC

💰 Tickets: $1 USDC only
✅ Fair & Transparent
🎯 Guaranteed Winners

Join now: https://aureuslottery.app
```

### Message de Tirage (sera envoyé automatiquement par le bot)
Le bot enverra automatiquement un message quand un draw se produit :
- Winner annoncé
- Prize amount
- Next draw time

## ✅ Test

Pour tester si le bot peut poster sur le canal :
1. Teste manuellement en envoyant un message au bot dans le canal
2. Ou attends qu'un draw se produise (le bot enverra automatiquement)

