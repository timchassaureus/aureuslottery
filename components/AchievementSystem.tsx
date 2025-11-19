'use client';

import { Trophy, Star, Award, Crown, Lock } from 'lucide-react';
import { useAppStore } from '@/lib/store';

interface Achievement {
  icon: string;
  title: string;
  desc: string;
  earned: boolean;
  requiredLevel: string;
  requiredTickets: number;
  category: 'novice' | 'dedicated' | 'expert' | 'master' | 'legend';
}

export default function AchievementSystem() {
  const { user } = useAppStore();
  const ticketCount = user?.ticketCount ?? user?.tickets.length ?? 0;

  // ALL achievements organized by level tiers
  const allAchievements: Achievement[] = [
    // ========== NOVICE TIER (0-100 tickets) ==========
    { icon: '🎯', title: 'First Ticket', desc: 'Bought your first ticket', earned: ticketCount >= 1, requiredLevel: 'Novice', requiredTickets: 0, category: 'novice' },
    { icon: '🎫', title: 'Getting Started', desc: 'Buy 10 tickets', earned: ticketCount >= 10, requiredLevel: 'Novice', requiredTickets: 0, category: 'novice' },
    { icon: '🌟', title: 'Regular Player', desc: 'Buy 25 tickets', earned: ticketCount >= 25, requiredLevel: 'Novice', requiredTickets: 0, category: 'novice' },
    { icon: '💸', title: 'First Win', desc: 'Win your first prize', earned: false, requiredLevel: 'Novice', requiredTickets: 0, category: 'novice' },
    { icon: '🎰', title: 'Lucky Start', desc: 'Participate in 5 draws', earned: ticketCount >= 5, requiredLevel: 'Novice', requiredTickets: 0, category: 'novice' },
    { icon: '📱', title: 'Connected', desc: 'Connect your wallet', earned: !!user, requiredLevel: 'Novice', requiredTickets: 0, category: 'novice' },
    
    // ========== DEDICATED TIER (300-500 tickets) ==========
    { icon: '🔥', title: 'On Fire', desc: 'Buy 50 tickets in one day', earned: false, requiredLevel: 'Dedicated', requiredTickets: 300, category: 'dedicated' },
    { icon: '💰', title: 'Big Spender', desc: 'Spend $500+ in total', earned: ticketCount >= 500, requiredLevel: 'Dedicated', requiredTickets: 300, category: 'dedicated' },
    { icon: '🎲', title: 'Risk Taker', desc: 'Buy 100+ tickets in one draw', earned: false, requiredLevel: 'Dedicated', requiredTickets: 300, category: 'dedicated' },
    { icon: '⚡', title: 'Speed Buyer', desc: 'Buy tickets within 1 min of draw', earned: false, requiredLevel: 'Dedicated', requiredTickets: 300, category: 'dedicated' },
    { icon: '🌙', title: 'Night Owl', desc: 'Participate in 20 draws', earned: false, requiredLevel: 'Dedicated', requiredTickets: 300, category: 'dedicated' },
    { icon: '📈', title: 'Investor', desc: 'Reach Amateur level', earned: ticketCount >= 100, requiredLevel: 'Dedicated', requiredTickets: 300, category: 'dedicated' },
    
    // ========== EXPERT TIER (800-2000 tickets) ==========
    { icon: '👑', title: 'High Roller', desc: 'Buy 500+ tickets', earned: ticketCount >= 500, requiredLevel: 'Expert', requiredTickets: 800, category: 'expert' },
    { icon: '💎', title: 'Diamond Hands', desc: 'Never miss a draw for 30 days', earned: false, requiredLevel: 'Expert', requiredTickets: 800, category: 'expert' },
    { icon: '🏆', title: 'Big Winner', desc: 'Win over $10,000', earned: false, requiredLevel: 'Expert', requiredTickets: 800, category: 'expert' },
    { icon: '🎯', title: 'Sharpshooter', desc: 'Win with less than 10 tickets', earned: false, requiredLevel: 'Expert', requiredTickets: 800, category: 'expert' },
    { icon: '🔮', title: 'Fortune Seeker', desc: 'Reach Expert level', earned: ticketCount >= 800, requiredLevel: 'Expert', requiredTickets: 800, category: 'expert' },
    { icon: '⭐', title: 'Consistent', desc: 'Buy tickets every day for 60 days', earned: false, requiredLevel: 'Expert', requiredTickets: 800, category: 'expert' },
    
    // ========== MASTER TIER (5000-8000 tickets) ==========
    { icon: '👾', title: 'Whale', desc: 'Buy 1000+ tickets', earned: ticketCount >= 1000, requiredLevel: 'Master', requiredTickets: 5000, category: 'master' },
    { icon: '🎪', title: 'VIP Status', desc: 'Reach Master level', earned: ticketCount >= 5000, requiredLevel: 'Master', requiredTickets: 5000, category: 'master' },
    { icon: '💵', title: 'Mega Winner', desc: 'Win over $50,000', earned: false, requiredLevel: 'Master', requiredTickets: 5000, category: 'master' },
    { icon: '🌊', title: 'Unstoppable', desc: 'Win 3 times in a month', earned: false, requiredLevel: 'Master', requiredTickets: 5000, category: 'master' },
    { icon: '🚀', title: 'To The Moon', desc: 'Buy 2000+ tickets', earned: ticketCount >= 2000, requiredLevel: 'Master', requiredTickets: 5000, category: 'master' },
    { icon: '🎖️', title: 'Veteran', desc: 'Play for 6 months straight', earned: false, requiredLevel: 'Master', requiredTickets: 5000, category: 'master' },
    
    // ========== LEGEND TIER (12000+ tickets) ==========
    { icon: '🦄', title: 'Legendary', desc: 'Reach Legend level', earned: ticketCount >= 20000, requiredLevel: 'Legend', requiredTickets: 12000, category: 'legend' },
    { icon: '💰', title: 'Millionaire', desc: 'Win over $100,000 total', earned: false, requiredLevel: 'Legend', requiredTickets: 12000, category: 'legend' },
    { icon: '🎰', title: 'Jackpot King', desc: 'Win the jackpot', earned: false, requiredLevel: 'Legend', requiredTickets: 12000, category: 'legend' },
    { icon: '🌟', title: 'Hall of Fame', desc: 'Win 10 times total', earned: false, requiredLevel: 'Legend', requiredTickets: 12000, category: 'legend' },
    { icon: '👽', title: 'Alien Gambler', desc: 'Buy 5000+ tickets', earned: ticketCount >= 5000, requiredLevel: 'Legend', requiredTickets: 12000, category: 'legend' },
    { icon: '🔱', title: 'Immortal', desc: 'Play for 1 year straight', earned: false, requiredLevel: 'Legend', requiredTickets: 12000, category: 'legend' },
  ];

  // Filter achievements based on current ticket count
  const visibleAchievements = allAchievements.filter(a => ticketCount >= a.requiredTickets);
  const earnedCount = visibleAchievements.filter(a => a.earned).length;
  
  // Get next tier achievements (preview)
  const nextTierAchievements = allAchievements.filter(a => 
    a.requiredTickets > ticketCount && 
    a.requiredTickets <= ticketCount + 5000
  ).slice(0, 3); // Show max 3 locked achievements

  return (
    <div className="bg-purple-800/30 rounded-2xl p-6 backdrop-blur-xl border border-purple-700/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Crown className="w-6 h-6 text-yellow-400" />
          <h3 className="text-2xl font-bold">Achievements</h3>
        </div>
        <div className="text-right">
          <p className="text-sm text-purple-300">
            {earnedCount} / {visibleAchievements.length} unlocked
          </p>
        </div>
      </div>

      {/* Visible Achievements (Current Level) */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {visibleAchievements.map((achievement, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-xl text-center transition-all ${
              achievement.earned
                ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50 scale-100'
                : 'bg-purple-900/20 border-2 border-purple-700/20 scale-90 opacity-60'
            }`}
          >
            <div className="text-4xl mb-2">{achievement.icon}</div>
            <div className="text-xs font-bold mb-1">{achievement.title}</div>
            <div className="text-xs text-purple-300 opacity-75">{achievement.desc}</div>
          </div>
        ))}
      </div>

      {/* Next Tier Preview (Locked) */}
      {nextTierAchievements.length > 0 && (
        <div className="border-t border-purple-700/30 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-4 h-4 text-purple-400" />
            <p className="text-sm font-bold text-purple-300">
              Unlock at {nextTierAchievements[0].requiredLevel} level ({nextTierAchievements[0].requiredTickets} tickets)
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {nextTierAchievements.map((achievement, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl text-center bg-purple-950/40 border-2 border-purple-600/30 scale-90 grayscale opacity-50 relative"
              >
                <Lock className="absolute top-2 right-2 w-3 h-3 text-purple-400" />
                <div className="text-4xl mb-2 blur-sm">{achievement.icon}</div>
                <div className="text-xs font-bold mb-1 text-purple-400">???</div>
                <div className="text-xs text-purple-500 opacity-75">Locked</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Total Progress */}
      <div className="mt-6 text-center">
        <p className="text-xs text-purple-400">
          {allAchievements.filter(a => a.earned).length} / {allAchievements.length} total achievements earned
        </p>
      </div>
    </div>
  );
}

