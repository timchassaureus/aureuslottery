# 📝 Setup Instructions

## 1. Create Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Send command: `/newbot`
3. Follow instructions:
   - **Display name**: "AUREUS Lottery Bot" (or any name you want)
   - **Username**: Must end with "bot" (e.g., "AureusLotteryBot" → @AureusLotteryBot)
   - ⚠️ **IMPORTANT**: Username MUST end with "bot" (Telegram requirement)
4. Copy the **bot token** (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

## 2. Create Telegram Channel

1. In Telegram, click **"New Channel"**
2. Name it: **"AUREUS Lottery"**
3. Set it as **Public**
4. Choose username: **@AureusLottery** (or your choice)
5. Add your bot as **Administrator** (so it can post):
   - Go to channel settings → Administrators → Add Administrator
   - Select your bot → Grant permission to "Post Messages"

## 3. Configure Environment Variables

Create a `.env` file in the `telegram-bot` folder:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
SITE_URL=https://aureuslottery.app
API_URL=https://aureuslottery.app
CHANNEL_ID=@AureusLottery
CHANNEL_USERNAME=AureusLottery
```

**Replace:**
- `your_bot_token_here` with your actual bot token from BotFather
- Channel ID if different

## 4. Install & Run

```bash
cd telegram-bot
npm install
npm start
```

## 5. Test Bot

1. Open Telegram
2. Search for your bot (by username)
3. Send `/start`
4. Test commands: `/jackpot`, `/help`, etc.

## 6. Deploy Bot (24/7)

Choose a hosting service:
- **Heroku** (free tier)
- **Railway** (free tier)
- **Render** (free tier)
- **DigitalOcean** (paid, $5/month)

Make sure to:
- Set environment variables in hosting dashboard
- Keep bot running 24/7

## ✅ Done!

Your bot is ready to use!

