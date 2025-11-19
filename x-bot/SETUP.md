# 🔧 X Bot Setup Guide

Step-by-step guide to set up the AUREUS Twitter/X bot.

## 📋 Prerequisites

- X/Twitter account for AUREUS
- X Developer Account (free tier works)
- Node.js 18+ installed

## 🔑 Step 1: Get X API Credentials

### 1.1 Create X Developer Account

1. Go to https://developer.twitter.com/
2. Sign in with your X account
3. Click "Sign up" or "Get started"
4. Complete the developer application

### 1.2 Create a New App

1. Go to https://developer.twitter.com/en/portal/dashboard
2. Click "Create Project"
3. Fill in:
   - **Project name**: AUREUS Bot
   - **Use case**: Making a bot
   - **Description**: Automated bot for AUREUS lottery

### 1.3 Get API Keys

1. In your project, click "Create App"
2. App name: `AureusLotteryBot`
3. Once created, go to "Keys and tokens" tab

You'll need:
- **API Key** (Consumer Key)
- **API Secret** (Consumer Secret)
- **Access Token** (create one if needed)
- **Access Token Secret**

### 1.4 Set App Permissions

1. Go to "Settings" → "User authentication settings"
2. Enable "Read and Write" permissions
3. Save changes

## 📦 Step 2: Install Bot

```bash
cd x-bot
npm install
```

## ⚙️ Step 3: Configure Environment

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` and add your credentials:
```env
X_API_KEY=your_api_key_here
X_API_SECRET=your_api_secret_here
X_ACCESS_TOKEN=your_access_token_here
X_ACCESS_TOKEN_SECRET=your_access_token_secret_here
X_BEARER_TOKEN=your_bearer_token_here

BOT_USERNAME=@AureusLottery
SITE_URL=https://aureuslottery.app
POST_JACKPOT_UPDATES=true
POST_WINNERS=true
POST_PROMOTIONAL=true
```

**⚠️ Important**: Replace all placeholder values with your actual credentials!

## ✅ Step 4: Test Connection

Run the bot to test:

```bash
npm start
```

You should see:
```
✅ Connected as: @YourUsername
🤖 Bot is running!
```

If you see errors, check:
- API credentials are correct
- App has read/write permissions
- X Developer account is active

## 🚀 Step 5: Run the Bot

### Development Mode (with auto-reload):

```bash
npm run dev
```

### Production Mode:

```bash
npm start
```

### Run as Background Process (Linux/Mac):

```bash
nohup npm start > bot.log 2>&1 &
```

### Run with PM2 (recommended):

```bash
npm install -g pm2
pm2 start index.js --name aureus-bot
pm2 save
pm2 startup
```

## 📅 Scheduled Tasks

The bot automatically runs:

- **9AM UTC**: Daily morning promo
- **5PM UTC**: Daily evening promo  
- **8PM UTC**: FOMO post (1h before draw)
- **Every 15 min**: Check mentions
- **Every 12h**: Post testimonials

## 🎯 Manual Functions

You can also call bot functions manually:

```javascript
import {
  postJackpotUpdate,
  postWinnerAnnouncement,
  postFOMO
} from './index.js';

// Post current jackpot
await postJackpotUpdate(150000);

// Announce winner
await postWinnerAnnouncement('0x1234...', 50000, 'main');

// Post FOMO
await postFOMO();
```

## 🔐 Security Tips

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use environment variables in production** - Don't hardcode secrets
3. **Rotate API keys regularly** - Change them every few months
4. **Use read-only tokens when possible** - Less risk if compromised
5. **Monitor bot activity** - Check X dashboard regularly

## 🐛 Common Issues

### "Invalid or expired token"

- Regenerate your access tokens
- Check if tokens are correct in `.env`
- Ensure app has read/write permissions

### "Rate limit exceeded"

- Reduce posting frequency
- Check your X API tier limits
- Wait before retrying

### "Bot not responding to mentions"

- Verify bot username in `.env` matches your account
- Check if bot account is public
- Ensure mentions include exact username

## 📚 Next Steps

1. Test the bot with a test tweet
2. Monitor the first few automated posts
3. Adjust tweet templates in `index.js` if needed
4. Integrate with your main app (see README.md)

## 🆘 Need Help?

- Check X API docs: https://developer.twitter.com/en/docs
- Review bot logs for errors
- Test with a single manual function first
- Verify all environment variables are set



