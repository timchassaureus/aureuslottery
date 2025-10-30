'use client';

import { Activity, Zap, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';

interface ActivityEvent {
  id: string;
  type: 'purchase' | 'big_purchase' | 'milestone';
  player: string;
  amount?: number;
  timestamp: number;
}

export default function LiveActivityFeed() {
  const { totalTicketsSold } = useAppStore();
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [onlinePlayers, setOnlinePlayers] = useState(234);

  useEffect(() => {
    // Simulate live activity
    const generateActivity = () => {
      const names = ['Alex', 'Sarah', 'Mike', 'Emma', 'John', 'Lisa', 'David', 'Maria', 'Chris', 'Anna'];
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomAmount = Math.floor(Math.random() * 50) + 1;
      
      let activityType: 'purchase' | 'big_purchase' | 'milestone' = 'purchase';
      if (randomAmount >= 20) activityType = 'big_purchase';
      if (randomAmount >= 50) activityType = 'milestone';

      const newActivity: ActivityEvent = {
        id: `activity-${Date.now()}-${Math.random()}`,
        type: activityType,
        player: randomName,
        amount: randomAmount,
        timestamp: Date.now(),
      };

      setActivities(prev => [newActivity, ...prev.slice(0, 4)]);
    };

    // Generate activity every 3-7 seconds
    const interval = setInterval(() => {
      generateActivity();
      // Simulate online players fluctuation
      setOnlinePlayers(prev => prev + Math.floor(Math.random() * 10) - 5);
    }, Math.random() * 4000 + 3000);

    // Initial activities
    generateActivity();
    
    return () => clearInterval(interval);
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'big_purchase':
        return '🔥';
      case 'milestone':
        return '⭐';
      default:
        return '🎫';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'big_purchase':
        return 'from-orange-500/20 to-red-500/20 border-orange-500/40';
      case 'milestone':
        return 'from-yellow-500/20 to-amber-500/20 border-yellow-500/40';
      default:
        return 'from-blue-500/20 to-indigo-500/20 border-blue-500/40';
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-950/50 via-purple-950/50 to-blue-950/50 backdrop-blur-xl border-2 border-white/10 rounded-2xl p-6 hover:border-white/30 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-green-400 animate-pulse" />
          <h3 className="text-xl font-bold text-white">Live Activity</h3>
        </div>
        <div className="flex items-center gap-2 bg-green-900/20 px-3 py-1 rounded-full border border-green-700/30">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-400 font-bold">{onlinePlayers} online</span>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="space-y-2 max-h-64 overflow-hidden">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className={`bg-gradient-to-r ${getActivityColor(activity.type)} p-3 rounded-lg border transition-all duration-500 hover:scale-102`}
            style={{
              animation: `slideIn 0.5s ease-out ${index * 0.1}s`,
              opacity: 1 - (index * 0.15),
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                <div>
                  <p className="text-white font-bold">{activity.player}</p>
                  <p className="text-xs text-slate-400">
                    bought {activity.amount} ticket{activity.amount! > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {activity.type === 'big_purchase' && (
                  <span className="text-xs bg-orange-500/20 px-2 py-1 rounded-full text-orange-400 font-bold">
                    BIG BUY!
                  </span>
                )}
                {activity.type === 'milestone' && (
                  <span className="text-xs bg-yellow-500/20 px-2 py-1 rounded-full text-yellow-400 font-bold">
                    WHALE! 🐋
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FOMO Message */}
      <div className="mt-4 p-3 bg-gradient-to-r from-violet-900/30 to-fuchsia-900/30 rounded-lg border border-violet-700/30">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          <p className="text-sm text-white font-bold">
            {totalTicketsSold > 100 ? 'Hot Pot! ' : ''}{' '}
            <span className="text-violet-400">{totalTicketsSold}</span> tickets sold today!
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(-20px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

