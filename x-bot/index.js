#!/usr/bin/env node

/**
 * AUREUS Twitter/X Bot
 * Automated posting and engagement for AUREUS lottery
 * 
 * Features:
 * - Auto-post jackpot updates
 * - Post winner announcements
 * - Respond to mentions
 * - Promotional tweets
 * - Daily scheduled posts
 */

import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';
import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// X API Client
const client = new TwitterApi({
  appKey: process.env.X_API_KEY,
  appSecret: process.env.X_API_SECRET,
  accessToken: process.env.X_ACCESS_TOKEN,
  accessSecret: process.env.X_ACCESS_TOKEN_SECRET,
});

// Read/write client
const rwClient = client.readWrite;

// Bot configuration
const BOT_USERNAME = process.env.BOT_USERNAME || '@AureusLottery';
const SITE_URL = process.env.SITE_URL || 'https://aureuslottery.app';
const POST_JACKPOT_UPDATES = process.env.POST_JACKPOT_UPDATES === 'true';
const POST_WINNERS = process.env.POST_WINNERS === 'true';
const POST_PROMOTIONAL = process.env.POST_PROMOTIONAL === 'true';

// Tweet templates
const TWEETS = {
  jackpotUpdate: (jackpot) => `🔥 JACKPOT UPDATE 🔥

💰 Current Jackpot: $${jackpot.toLocaleString()}

🎰 Daily Draw at 9PM UTC
🎫 Tickets: $1 each
🏆 Guaranteed Winner Every Day!

${SITE_URL}

#AureusLottery #CryptoLottery #Web3 #Crypto #DeFi`,
  
  winnerAnnouncement: (winner, prize, drawType = 'main') => {
    const drawEmoji = drawType === 'main' ? '🎰' : '🎁';
    const drawName = drawType === 'main' ? 'MAIN JACKPOT' : 'BONUS DRAW';
    
    return `🚨 ${drawName} WINNER! 🚨

${drawEmoji} Congratulations! 🎉

💰 Prize: $${prize.toLocaleString()}
🏆 Winner: ${winner}

🎰 Next draw: Today at 9PM UTC
🎫 Get your tickets now: ${SITE_URL}

#AureusLottery #CryptoLottery #Web3 #Winner`,
  },
  
  dailyPromo: () => {
    const hour = new Date().getUTCHours();
    const isMorning = hour < 12;
    
    if (isMorning) {
      return `🌅 GOOD MORNING! 🌅

Ready to win BIG today? 🎰

💰 Jackpot growing every second
🎫 $1 tickets • Instant payouts
🏆 Daily draw at 9PM UTC

Start your winning streak now!
${SITE_URL}

#AureusLottery #CryptoLottery #Web3`,
    } else {
      return `🌙 DON'T MISS TODAY'S DRAW! 🌙

🎰 Main Draw: 9PM UTC
🎁 Bonus Draw: 11PM UTC

💰 Jackpot is HUGE today!
🎫 Last chance to buy tickets!

${SITE_URL}

#AureusLottery #CryptoLottery #Web3 #DailyDraw`,
    }
  },
  
  jackpotMilestone: (milestone) => `🎉 MILESTONE ACHIEVED! 🎉

Jackpot just hit $${milestone.toLocaleString()}! 🚀💰

🎰 Daily draw at 9PM UTC
🎫 Tickets only $1
🏆 Join thousands of winners!

${SITE_URL}

#AureusLottery #CryptoLottery #Web3 #Milestone`,
  
  testimonial: () => {
    const testimonials = [
      {
        text: "Just won $12,450 on AUREUS! 🎉 The fastest payout I've ever seen. This is legit! 💰",
        author: "@crypto_winner_123"
      },
      {
        text: "Played AUREUS for a week and won 3 times already! The jackpot is REAL 🚀",
        author: "@lottery_king"
      },
      {
        text: "AUREUS changed my life! Won $28K on my first day. Daily draws are INSANE! 💎",
        author: "@lucky_crypto"
      }
    ];
    
    const testimonial = testimonials[Math.floor(Math.random() * testimonials.length)];
    
    return `💬 REAL WINNER TESTIMONIAL 💬

"${testimonial.text}"

- ${testimonial.author}

🎰 Join the winners today!
${SITE_URL}

#AureusLottery #Testimonial #Web3`,
  },
  
  fomo: () => `⏰ TIME IS RUNNING OUT! ⏰

Today's draw is at 9PM UTC! 🎰

💰 Current jackpot is MASSIVE!
🎫 Only $1 per ticket
🏆 Don't miss your chance!

Last chance: ${SITE_URL}

#AureusLottery #FOMO #CryptoLottery #Web3`,
};

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const emoji = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`${emoji} [${timestamp}] ${message}`);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Tweet functions
async function postTweet(text, replyToId = null) {
  try {
    const options = {};
    if (replyToId) {
      options.reply = { in_reply_to_tweet_id: replyToId };
    }
    
    const tweet = await rwClient.v2.tweet({
      text,
      ...options
    });
    
    log(`Tweet posted successfully! ID: ${tweet.data.id}`, 'success');
    return tweet.data;
  } catch (error) {
    log(`Error posting tweet: ${error.message}`, 'error');
    throw error;
  }
}

async function postJackpotUpdate(jackpot) {
  if (!POST_JACKPOT_UPDATES) {
    log('Jackpot updates are disabled', 'info');
    return;
  }
  
  const text = TWEETS.jackpotUpdate(jackpot);
  await postTweet(text);
}

async function postWinnerAnnouncement(winner, prize, drawType = 'main') {
  if (!POST_WINNERS) {
    log('Winner announcements are disabled', 'info');
    return;
  }
  
  const text = TWEETS.winnerAnnouncement(winner, prize, drawType);
  await postTweet(text);
}

async function postDailyPromo() {
  if (!POST_PROMOTIONAL) {
    log('Promotional posts are disabled', 'info');
    return;
  }
  
  const text = TWEETS.dailyPromo();
  await postTweet(text);
}

async function postMilestone(milestone) {
  if (!POST_JACKPOT_UPDATES) {
    return;
  }
  
  const text = TWEETS.jackpotMilestone(milestone);
  await postTweet(text);
}

async function postTestimonial() {
  if (!POST_PROMOTIONAL) {
    return;
  }
  
  const text = TWEETS.testimonial();
  await postTweet(text);
}

async function postFOMO() {
  if (!POST_PROMOTIONAL) {
    return;
  }
  
  const text = TWEETS.fomo();
  await postTweet(text);
}

// Check mentions and respond
async function checkMentions() {
  try {
    const me = await rwClient.v2.me();
    const mentions = await rwClient.v2.search({
      query: `${BOT_USERNAME} -is:retweet`,
      max_results: 10
    });
    
    if (mentions.data && mentions.data.data) {
      for (const mention of mentions.data.data) {
        // Check if we've already replied
        const replies = await rwClient.v2.search({
          query: `conversation_id:${mention.conversation_id} from:${me.data.username}`,
        });
        
        if (!replies.data?.data?.length) {
          // Auto-reply to mentions
          const replyText = `🎰 Thanks for mentioning us! 

💰 Check out our daily jackpot: ${SITE_URL}
🎫 Buy tickets for only $1
🏆 Daily draw at 9PM UTC!

#AureusLottery 🚀`;
          
          await postTweet(replyText, mention.id);
          log(`Replied to mention: ${mention.id}`, 'success');
          await sleep(5000); // Rate limit protection
        }
      }
    }
  } catch (error) {
    log(`Error checking mentions: ${error.message}`, 'error');
  }
}

// Scheduled tasks
function setupCronJobs() {
  // Post daily promo at 9AM and 5PM UTC
  cron.schedule('0 9,17 * * *', async () => {
    log('Running scheduled daily promo...');
    await postDailyPromo();
  });
  
  // Post jackpot update at 8PM UTC (1 hour before draw)
  cron.schedule('0 20 * * *', async () => {
    log('Running scheduled FOMO post...');
    await postFOMO();
  });
  
  // Check mentions every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    log('Checking mentions...');
    await checkMentions();
  });
  
  // Post testimonial every 12 hours
  cron.schedule('0 */12 * * *', async () => {
    log('Running scheduled testimonial...');
    await postTestimonial();
  });
  
  log('Cron jobs scheduled successfully!', 'success');
}

// Main function
async function main() {
  log('🎰 AUREUS Twitter/X Bot Starting...', 'info');
  log(`Bot Username: ${BOT_USERNAME}`, 'info');
  log(`Site URL: ${SITE_URL}`, 'info');
  
  // Verify API connection
  try {
    const me = await rwClient.v2.me();
    log(`✅ Connected as: @${me.data.username}`, 'success');
  } catch (error) {
    log(`❌ Failed to connect to X API: ${error.message}`, 'error');
    log('Please check your .env file and API credentials', 'error');
    process.exit(1);
  }
  
  // Setup cron jobs
  setupCronJobs();
  
  log('🤖 Bot is running! Press Ctrl+C to stop.', 'success');
  log('Scheduled tasks:', 'info');
  log('  - Daily promo: 9AM & 5PM UTC', 'info');
  log('  - FOMO post: 8PM UTC', 'info');
  log('  - Mentions check: Every 15 minutes', 'info');
  log('  - Testimonials: Every 12 hours', 'info');
}

// Export functions for external use
export {
  postTweet,
  postJackpotUpdate,
  postWinnerAnnouncement,
  postDailyPromo,
  postMilestone,
  postTestimonial,
  postFOMO,
  checkMentions,
};

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

// Keep process alive
process.on('SIGINT', () => {
  log('Bot stopping...', 'info');
  process.exit(0);
});



