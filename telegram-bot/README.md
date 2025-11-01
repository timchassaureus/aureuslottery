# 🤖 AUREUS Telegram Bot

Telegram bot for the AUREUS lottery platform. Provides notifications, commands, and community engagement.

## 🚀 Quick Start

### 1. Create a Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow instructions:
   - **Display name**: "AUREUS Lottery Bot" (or any name you want)
   - **Username**: Must end with "bot" (e.g., "AureusLotteryBot" → @AureusLotteryBot)
   - ⚠️ **IMPORTANT**: Username MUST end with "bot" (Telegram requirement)
4. Copy the **bot token** (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2. Create a Telegram Channel

1. In Telegram, click "New Channel"
2. Name it (e.g., "AUREUS Lottery")
3. Set it as **public**
4. Choose a username (e.g., `@AureusLottery`)
5. Add your bot as an **administrator** (so it can post messages)
6. Copy the channel username (e.g., `@AureusLottery`)

### 3. Setup Bot

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your bot token:
   ```
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   SITE_URL=https://aureuslottery.app
   CHANNEL_ID=@AureusLottery
   CHANNEL_USERNAME=AureusLottery
   ```

### 4. Install Dependencies

```bash
cd telegram-bot
npm install
```

### 5. Run Bot

```bash
# Development mode (auto-restart on changes)
npm run dev

# Production mode
npm start
```

## 📋 Bot Commands

- `/start` - Welcome message and instructions
- `/help` - Show all available commands
- `/jackpot` - Check current jackpot amount
- `/tickets` - View your purchased tickets
- `/stats` - Your personal statistics
- `/nextdraw` - Time until next draw
- `/winners` - Recent winners
- `/link` - Instructions to link wallet

## 🔔 Notifications

The bot can send notifications to your channel when:
- A draw happens
- Jackpot reaches milestones
- Important updates

## 🔗 Integration with Website

To integrate with your Next.js app:

1. Create an API route: `app/api/telegram/notify/route.ts`
2. Call the bot's `notifyChannel()` function when draws happen

Example:
```typescript
// app/api/telegram/notify/route.ts
export async function POST(request: Request) {
  const { drawInfo } = await request.json();
  
  // Call your bot's notification function
  // (You'll need to set up a way to communicate with the bot)
  
  return Response.json({ success: true });
}
```

## 🌐 Deploy Bot

You can deploy the bot on:
- **Heroku** (free tier available)
- **Railway** (free tier available)
- **Render** (free tier available)
- **Your own VPS** (DigitalOcean, etc.)

Make sure to:
1. Set environment variables
2. Keep the bot running 24/7
3. Monitor for errors

## 📱 Channel Setup

### What to Post in Your Channel

1. **Welcome Message**
   ```
   🎰 Welcome to AUREUS Lottery! 🎰
   
   Daily draws at 9PM UTC
   $1 tickets • Transparent • Fair
   
   Join: https://aureuslottery.app
   ```

2. **Draw Announcements** (auto-posted by bot)
3. **Winner Announcements** (auto-posted by bot)
4. **Jackpot Updates** (manual or automated)
5. **Tips and Updates**

### Channel Tips

- Post regularly (2-3 times per day)
- Engage with your community
- Share winners to build trust
- Post countdowns before draws
- Celebrate milestones

## 🔧 Troubleshooting

### Bot not responding?
- Check if bot is running: `npm start`
- Verify token is correct in `.env`
- Check Telegram server status

### Can't post to channel?
- Bot must be added as administrator
- Check channel permissions
- Verify channel ID is correct

### Need help?
- Check Telegram Bot API docs: https://core.telegram.org/bots/api
- Check Telegraf docs: https://telegraf.js.org/

## 🎯 Next Steps

1. ✅ Create bot with BotFather
2. ✅ Create public channel
3. ✅ Add bot as channel admin
4. ✅ Setup environment variables
5. ✅ Start bot
6. ✅ Test all commands
7. ✅ Deploy bot (24/7 hosting)
8. ✅ Integrate with website API

---

**Ready to launch!** 🚀

