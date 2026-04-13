# 🔐 Configuration du Bot

## Token de ton Bot

Ton bot est créé : **@Aureuslotterybot**

**⚠️ IMPORTANT : Garde ce token secret !**

Crée un fichier `.env` dans le dossier `telegram-bot/` avec ce contenu :

```env
TELEGRAM_BOT_TOKEN=8322249733:AAHibNf3EIH-nvEnI5D4HF-5UdfjLjHLbAY
SITE_URL=https://aureuslottery.app
API_URL=https://aureuslottery.app
CHANNEL_ID=@LotteryAureus
CHANNEL_USERNAME=LotteryAureus
```

## 📝 Prochaines Étapes

### 1. Configurer le Bot (avec @BotFather)

Envoie ces commandes à @BotFather :

```
/setdescription
```
Description (copie-colle) :
```
🎰 AUREUS Lottery Bot - Daily crypto lottery draws! 🎰

Daily draws at 9PM UTC + Bonus draw at 11PM UTC
Tickets $1 USDC • Fair & Transparent • Guaranteed Winners

Commands:
/jackpot - Check current jackpot
/tickets - View your tickets
/stats - Your statistics
/nextdraw - Time until next draw

Visit: https://aureuslottery.app
```

```
/setabouttext
```
About (copie-colle) :
```
🎰 AUREUS - Decentralized Crypto Lottery 🎰

Daily draws at 9PM UTC
$1 tickets • Transparent • Fair

Website: https://aureuslottery.app
```

```
/setuserpic
```
(Envoie une image - logo AUREUS si tu en as une)

### 2. Créer le Canal Telegram

1. Dans Telegram, clique "New Channel"
2. Nom : **"AUREUS Lottery"**
3. Choisis **Public**
4. Username : **@LotteryAureus** (ou celui que tu veux)
5. Ajoute ton bot comme **Administrateur** :
   - Settings → Administrators → Add Administrator
   - Sélectionne **@Aureuslotterybot**
   - Donne permission "Post Messages"

### 3. Lancer le Bot

```bash
cd telegram-bot
npm install
npm start
```

### 4. Tester le Bot

1. Ouvre Telegram
2. Recherche **@Aureuslotterybot**
3. Clique sur "Start" ou envoie `/start`
4. Teste les commandes : `/help`, `/jackpot`, etc.

## ✅ C'est Prêt !

Ton bot est configuré et prêt à être utilisé !

