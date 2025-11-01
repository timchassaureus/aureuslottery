require('dotenv').config();
const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Store user data (in production, use a database)
const userData = new Map();

// ============================================
// COMMANDS
// ============================================

// Start command
bot.start(async (ctx) => {
  const userId = ctx.from.id;
  const username = ctx.from.username || ctx.from.first_name;
  
  await ctx.reply(
    `🎰 *Welcome to AUREUS!* 🎰\n\n` +
    `I'm your AUREUS lottery assistant! 🚀\n\n` +
    `*Available commands:*\n` +
    `/jackpot - Check current jackpot\n` +
    `/tickets - View your tickets\n` +
    `/stats - Your statistics\n` +
    `/nextdraw - Time until next draw\n` +
    `/help - Show all commands\n\n` +
    `🎯 Daily draws at *9PM UTC*\n` +
    `💰 Tickets: *$1 USDC*\n` +
    `🏆 Main Jackpot + Bonus Draw at 11PM UTC!\n\n` +
    `Visit: ${process.env.SITE_URL || 'https://aureuslottery.app'}`,
    { parse_mode: 'Markdown' }
  );
});

// Help command
bot.help(async (ctx) => {
  await ctx.reply(
    `📋 *AUREUS Bot Commands*\n\n` +
    `/start - Start the bot\n` +
    `/jackpot - Check current jackpot amount\n` +
    `/tickets - View your purchased tickets\n` +
    `/stats - Your personal statistics\n` +
    `/nextdraw - Time until next draw\n` +
    `/link - Link your Telegram to AUREUS\n` +
    `/winners - Recent winners\n` +
    `/help - Show this help message\n\n` +
    `🌐 Website: ${process.env.SITE_URL || 'https://aureuslottery.app'}\n` +
    `📢 Channel: @${process.env.CHANNEL_USERNAME || 'AureusLottery'}`,
    { parse_mode: 'Markdown' }
  );
});

// Jackpot command
bot.command('jackpot', async (ctx) => {
  try {
    // In production, fetch from your API
    const response = await fetch(`${process.env.API_URL || process.env.SITE_URL}/api/jackpot`);
    const data = await response.json();
    
    await ctx.reply(
      `💰 *Current Jackpot*\n\n` +
      `🏆 Main Jackpot: *$${data.mainJackpot?.toLocaleString() || '850'}*\n` +
      `💎 Bonus Draw: *$${data.secondaryPot?.toLocaleString() || '50'}*\n\n` +
      `🎯 Next draw: *9PM UTC*\n` +
      `🎁 Bonus draw: *11PM UTC*\n\n` +
      `Buy tickets now: ${process.env.SITE_URL || 'https://aureuslottery.app'}`,
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    await ctx.reply(
      `💰 *Current Jackpot*\n\n` +
      `🏆 Main Jackpot: *$850*\n` +
      `💎 Bonus Draw: *$50*\n\n` +
      `🎯 Next draw: *9PM UTC*\n` +
      `🎁 Bonus draw: *11PM UTC*`,
      { parse_mode: 'Markdown' }
    );
  }
});

// Tickets command
bot.command('tickets', async (ctx) => {
  const userId = ctx.from.id;
  const user = userData.get(userId) || { tickets: 0, address: null };
  
  if (!user.address) {
    await ctx.reply(
      `⚠️ *No wallet linked*\n\n` +
      `To view your tickets, link your wallet first:\n` +
      `/link - Link your wallet\n\n` +
      `Or visit: ${process.env.SITE_URL || 'https://aureuslottery.app'}`,
      { parse_mode: 'Markdown' }
    );
    return;
  }
  
  await ctx.reply(
    `🎫 *Your Tickets*\n\n` +
    `📊 Current draw: *${user.tickets}* tickets\n` +
    `🏆 Lifetime: *${user.lifetimeTickets || user.tickets}* tickets\n` +
    `💰 Total spent: *$${user.totalSpent || 0}*\n` +
    `🎁 Total won: *$${user.totalWon || 0}*\n\n` +
    `Buy more: ${process.env.SITE_URL || 'https://aureuslottery.app'}`,
    { parse_mode: 'Markdown' }
  );
});

// Stats command
bot.command('stats', async (ctx) => {
  const userId = ctx.from.id;
  const user = userData.get(userId) || {};
  const username = ctx.from.username || ctx.from.first_name;
  
  await ctx.reply(
    `📊 *Your Statistics*\n\n` +
    `👤 Username: *${username}*\n` +
    `🎫 Tickets: *${user.tickets || 0}*\n` +
    `💰 Total spent: *$${user.totalSpent || 0}*\n` +
    `🏆 Total won: *$${user.totalWon || 0}*\n` +
    `🎯 Level: *${getLevel(user.lifetimeTickets || 0)}*\n\n` +
    `Buy tickets: ${process.env.SITE_URL || 'https://aureuslottery.app'}`,
    { parse_mode: 'Markdown' }
  );
});

// Next draw command
bot.command('nextdraw', async (ctx) => {
  const now = new Date();
  const target = new Date();
  target.setUTCHours(21, 0, 0, 0);
  if (now.getUTCHours() >= 21) {
    target.setUTCDate(target.getUTCDate() + 1);
  }
  
  const diff = target.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  await ctx.reply(
    `⏰ *Next Draw*\n\n` +
    `🎰 Main Jackpot: *${hours}h ${minutes}m ${seconds}s*\n` +
    `🕘 Time: *9PM UTC*\n\n` +
    `💎 Bonus Draw: *${hours + 2}h ${minutes}m ${seconds}s*\n` +
    `🕚 Time: *11PM UTC*\n\n` +
    `Get your tickets: ${process.env.SITE_URL || 'https://aureuslottery.app'}`,
    { parse_mode: 'Markdown' }
  );
});

// Winners command
bot.command('winners', async (ctx) => {
  await ctx.reply(
    `🏆 *Recent Winners*\n\n` +
    `Check the latest winners on our website:\n` +
    `${process.env.SITE_URL || 'https://aureuslottery.app'}\n\n` +
    `🎯 Next draw: *9PM UTC*`,
    { parse_mode: 'Markdown' }
  );
});

// Get Channel ID command (helper for private channels)
bot.command('getchannelid', async (ctx) => {
  // If message is forwarded from a channel, we can get the ID
  if (ctx.message.forward_from_chat) {
    const chatId = ctx.message.forward_from_chat.id;
    await ctx.reply(
      `📢 *Channel ID:*\n\n` +
      `ID: \`${chatId}\`\n\n` +
      `Use this ID in your .env file:\n` +
      `CHANNEL_ID=${chatId}`,
      { parse_mode: 'Markdown' }
    );
  } else {
    await ctx.reply(
      `📢 *How to get Channel ID:*\n\n` +
      `1. Go to your channel\n` +
      `2. Share any message from the channel\n` +
      `3. Forward it to me\n\n` +
      `Or use @userinfobot:\n` +
      `1. Share a message from your channel\n` +
      `2. Send it to @userinfobot\n` +
      `3. It will reply with the channel ID`,
      { parse_mode: 'Markdown' }
    );
  }
});

// Link command (for future wallet linking)
bot.command('link', async (ctx) => {
  const userId = ctx.from.id;
  const username = ctx.from.username;
  
  await ctx.reply(
    `🔗 *Link Your Wallet*\n\n` +
    `To link your Telegram to AUREUS:\n\n` +
    `1. Visit: ${process.env.SITE_URL || 'https://aureuslottery.app'}\n` +
    `2. Connect your wallet\n` +
    `3. Go to your profile\n` +
    `4. Link Telegram: *@${username || 'your_username'}*\n\n` +
    `Once linked, I'll be able to show your tickets and stats! 🎯`,
    { parse_mode: 'Markdown' }
  );
});

// ============================================
// NOTIFICATIONS (to be called from your API)
// ============================================

// This function can be called from your Next.js API when a draw happens
async function notifyChannel(drawInfo) {
  const channelId = process.env.CHANNEL_ID || '@AureusLottery';
  
  await bot.telegram.sendMessage(
    channelId,
    `🎰 *AUREUS Draw Complete!* 🎰\n\n` +
    `🏆 Winner: *${drawInfo.winner}*\n` +
    `💰 Prize: *$${drawInfo.prize?.toLocaleString()}*\n` +
    `🎫 Winning ticket: *${drawInfo.ticketId}*\n` +
    `📊 Total tickets: *${drawInfo.totalTickets}*\n\n` +
    `🎯 Next draw: *Tomorrow 9PM UTC*\n` +
    `Buy tickets: ${process.env.SITE_URL || 'https://aureuslottery.app'}`,
    { parse_mode: 'Markdown' }
  );
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getLevel(tickets) {
  if (tickets >= 500) return 'Legend 👑';
  if (tickets >= 100) return 'Master 💎';
  if (tickets >= 50) return 'Expert 🏆';
  if (tickets >= 10) return 'Amateur ⭐';
  return 'Beginner 🎯';
}

// ============================================
// ERROR HANDLING
// ============================================

bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}:`, err);
});

// ============================================
// START BOT
// ============================================

bot.launch().then(() => {
  console.log('🤖 AUREUS Telegram bot is running!');
}).catch((err) => {
  console.error('❌ Failed to start bot:', err);
});

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = { bot, notifyChannel };

