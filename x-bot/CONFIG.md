# ⚙️ X Bot Configuration

Complete configuration guide for the AUREUS Twitter/X bot.

## 📝 Environment Variables

All configuration is done through environment variables in `.env` file.

### Required (X API Credentials)

```env
X_API_KEY=your_api_key_here
X_API_SECRET=your_api_secret_here
X_ACCESS_TOKEN=your_access_token_here
X_ACCESS_TOKEN_SECRET=your_access_token_secret_here
```

Get these from: https://developer.twitter.com/en/portal/dashboard

### Optional

```env
X_BEARER_TOKEN=your_bearer_token_here  # For read-only operations
```

### Bot Settings

```env
BOT_USERNAME=@AureusLottery           # Your bot's X username
SITE_URL=https://aureuslottery.app    # Your site URL for tweets
```

### Feature Toggles

```env
POST_JACKPOT_UPDATES=true    # Auto-post jackpot updates
POST_WINNERS=true            # Post winner announcements
POST_PROMOTIONAL=true        # Post promotional content
```

## ⏰ Schedule Configuration

Default schedule (in `index.js`):

```javascript
// Daily promo at 9AM and 5PM UTC
cron.schedule('0 9,17 * * *', ...);

// FOMO post at 8PM UTC
cron.schedule('0 20 * * *', ...);

// Check mentions every 15 minutes
cron.schedule('*/15 * * * *', ...);

// Testimonials every 12 hours
cron.schedule('0 */12 * * *', ...);
```

To customize, edit the cron expressions:
- `0 9 * * *` = 9:00 AM daily
- `*/15 * * * *` = Every 15 minutes
- `0 */12 * * *` = Every 12 hours

## 🎨 Tweet Templates

Templates are in `TWEETS` object in `index.js`. Customize as needed:

### Jackpot Update Template

```javascript
jackpotUpdate: (jackpot) => `🔥 JACKPOT UPDATE 🔥
💰 Current Jackpot: $${jackpot.toLocaleString()}
...
`
```

### Winner Announcement Template

```javascript
winnerAnnouncement: (winner, prize, drawType) => `🚨 WINNER! 🚨
...
`
```

## 🔧 Advanced Configuration

### Change Tweet Frequency

Edit the cron schedules in `index.js`:

```javascript
// More frequent jackpot updates (every 2 hours)
cron.schedule('0 */2 * * *', async () => {
  await postJackpotUpdate(currentJackpot);
});
```

### Custom Hashtags

Edit templates to add/remove hashtags:

```javascript
// Add more hashtags
jackpotUpdate: (jackpot) => `...
#AureusLottery #CryptoLottery #Web3 #DeFi #NFT
`
```

### Custom Auto-Reply Messages

Edit the `checkMentions()` function:

```javascript
const replyText = `🎰 Thanks for mentioning us! 
Your custom message here...
`;
```

## 🔐 Security Settings

### Rate Limiting

The bot includes built-in rate limiting:
- 5-second delay between mention replies
- Respects X API rate limits automatically

### Error Handling

- All errors are logged
- Bot continues running on errors
- Failed tweets don't crash the bot

## 📊 Monitoring

### View Bot Logs

```bash
# If using PM2
pm2 logs aureus-bot

# If using nohup
tail -f bot.log
```

### Check Bot Status

```javascript
// The bot logs all actions:
✅ Tweet posted successfully! ID: 1234567890
ℹ️ Checking mentions...
❌ Error posting tweet: Rate limit exceeded
```

## 🚀 Production Deployment

### Environment Variables in Production

Use your hosting platform's environment variable settings:

**Vercel:**
1. Go to project settings
2. Add environment variables
3. Deploy

**Heroku:**
```bash
heroku config:set X_API_KEY=your_key
heroku config:set X_API_SECRET=your_secret
```

**Docker:**
```dockerfile
ENV X_API_KEY=your_key
ENV X_API_SECRET=your_secret
```

### Keep Bot Running

Use a process manager:
- **PM2** (recommended): `pm2 start index.js`
- **systemd** (Linux): Create a service file
- **cron** (Linux): `@reboot npm start`

## 📝 Example Configurations

### Minimal (Just Jackpot Updates)

```env
POST_JACKPOT_UPDATES=true
POST_WINNERS=false
POST_PROMOTIONAL=false
```

### Full Automation

```env
POST_JACKPOT_UPDATES=true
POST_WINNERS=true
POST_PROMOTIONAL=true
```

### Manual Mode (No Scheduled Posts)

```env
POST_JACKPOT_UPDATES=false
POST_WINNERS=false
POST_PROMOTIONAL=false
```

Then call functions manually from your app.



