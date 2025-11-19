# 🐦 AUREUS Twitter/X Bot

Automated Twitter/X bot for AUREUS lottery platform. Posts jackpot updates, winner announcements, promotional content, and responds to mentions.

## ✨ Features

- 🔥 **Auto-post jackpot updates** - Share current jackpot amounts
- 🏆 **Winner announcements** - Post when someone wins
- 💬 **Respond to mentions** - Auto-reply to @mentions
- 📅 **Scheduled posts** - Daily promotional content
- 🎯 **Milestone celebrations** - Post when jackpot hits milestones
- 💬 **Testimonials** - Share winner testimonials

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd x-bot
npm install
```

### 2. Get X/Twitter API Credentials

1. Go to https://developer.twitter.com/en/portal/dashboard
2. Create a new project/app
3. Generate API keys and access tokens
4. Copy your credentials

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your X API credentials:

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

### 4. Run the Bot

```bash
npm start
```

Or in development mode (with auto-reload):

```bash
npm run dev
```

## 📋 API Functions

The bot exports several functions you can use from other scripts:

```javascript
import {
  postJackpotUpdate,
  postWinnerAnnouncement,
  postDailyPromo,
  postMilestone,
  postTestimonial,
  postFOMO
} from './x-bot/index.js';

// Post a jackpot update
await postJackpotUpdate(150000);

// Announce a winner
await postWinnerAnnouncement(
  '0x1234...5678',
  50000,
  'main' // or 'secondary'
);

// Post a milestone
await postMilestone(100000);

// Post FOMO tweet
await postFOMO();
```

## ⏰ Scheduled Tasks

The bot automatically runs these tasks:

- **Daily Promo**: 9AM & 5PM UTC
- **FOMO Post**: 8PM UTC (1 hour before draw)
- **Mentions Check**: Every 15 minutes
- **Testimonials**: Every 12 hours

## 🔧 Configuration Options

In your `.env` file:

- `POST_JACKPOT_UPDATES=true/false` - Enable/disable jackpot posts
- `POST_WINNERS=true/false` - Enable/disable winner announcements
- `POST_PROMOTIONAL=true/false` - Enable/disable promotional posts

## 🎯 Tweet Templates

The bot uses these templates:

1. **Jackpot Update** - Current jackpot amount
2. **Winner Announcement** - Winner details and prize
3. **Daily Promo** - Morning/evening promotional content
4. **Milestone** - Jackpot milestone celebrations
5. **Testimonial** - Winner testimonials
6. **FOMO** - Urgency before draws

## 📝 Notes

- The bot respects X API rate limits
- Mentions are checked every 15 minutes to avoid spam
- All tweets include the site URL and relevant hashtags
- Test in development first before going live!

## 🔐 Security

- Never commit your `.env` file
- Keep your API credentials secure
- Use environment variables in production
- Rotate API keys regularly

## 🐛 Troubleshooting

**Bot not posting?**
- Check your API credentials in `.env`
- Verify your X developer account is active
- Check API rate limits

**Mentions not working?**
- Ensure your bot account follows back users
- Check if mentions include the exact username
- Verify API permissions

**Rate limit errors?**
- Reduce posting frequency
- Check your X API tier limits
- Wait before retrying

## 📚 X API Documentation

- https://developer.twitter.com/en/docs
- https://github.com/PLhery/node-twitter-api-v2

## 🤝 Integration with Main App

To integrate with your main AUREUS app:

1. Import the bot functions in your API routes
2. Call them when events happen (draws, winners, etc.)
3. Or use the bot standalone for automated posting

Example integration in Next.js API route:

```javascript
// app/api/post-winner/route.ts
import { postWinnerAnnouncement } from '../../../x-bot/index.js';

export async function POST(req) {
  const { winner, prize, drawType } = await req.json();
  await postWinnerAnnouncement(winner, prize, drawType);
  return Response.json({ success: true });
}
```



