'use client';

import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, Gift } from 'lucide-react';

interface Notification {
  id: string;
  message: string;
  time: string;
  type: 'reminder' | 'jackpot' | 'winner';
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const scheduleNotifications = () => {
      const now = new Date();
      const currentHour = now.getUTCHours();
      const currentMinute = now.getUTCMinutes();

      // Notification à 12h UTC
      if (currentHour === 12 && currentMinute === 0) {
        addNotification({
          id: Date.now().toString(),
          message: '✨ Bonne chance pour le tirage de ce soir à 20h UTC!',
          time: now.toLocaleTimeString(),
          type: 'reminder',
        });
      }

      // Notification à 19h UTC (1h avant le tirage)
      if (currentHour === 19 && currentMinute === 0) {
        addNotification({
          id: (Date.now() + 1).toString(),
          message: '🔥 Il reste 1 heure! Le jackpot de ce soir tire à 20h UTC!',
          time: now.toLocaleTimeString(),
          type: 'jackpot',
        });
      }
    };

    // Check every minute for notifications
    const interval = setInterval(scheduleNotifications, 60000);

    // Add demo notification
    addNotification({
      id: 'demo-1',
      message: '👋 Bienvenue sur AUREUS!',
      time: new Date().toLocaleTimeString(),
      type: 'reminder',
    });

    return () => clearInterval(interval);
  }, []);

  const addNotification = (notification: Notification) => {
    setNotifications((prev) => [notification, ...prev.slice(0, 4)]);
    
    // Auto close after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter(n => n.id !== id));
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-r from-pink-600 via-purple-600 via-indigo-600 to-blue-600 hover:from-pink-700 hover:to-blue-700 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all z-40 border-2 border-white/20"
      >
        <Bell className="w-7 h-7" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-32 right-6 w-96 bg-gradient-to-br from-pink-900 via-purple-900 via-indigo-900 to-blue-900 border-2 border-purple-500/30 rounded-2xl p-6 shadow-2xl z-40 max-h-[500px] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Bell className="w-6 h-6 text-primary-400" />
              Notifications
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            {notifications.length === 0 ? (
              <p className="text-purple-300 text-center py-8">Aucune notification</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="bg-purple-800/30 border border-purple-700/50 rounded-xl p-4 relative hover:bg-purple-800/40 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {notification.type === 'winner' && (
                      <Gift className="w-5 h-5 text-yellow-400 mt-1" />
                    )}
                    {notification.type === 'jackpot' && (
                      <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
                    )}
                    {notification.type === 'reminder' && (
                      <Bell className="w-5 h-5 text-blue-400 mt-1" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-purple-400 mt-1">{notification.time}</p>
                    </div>
                    <button
                      onClick={() => removeNotification(notification.id)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}

