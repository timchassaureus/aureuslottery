'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, X, CheckCircle, Gift } from 'lucide-react';
import {
  subscribeToInAppNotifications,
  type InAppNotificationPayload,
} from '@/lib/notificationBus';
import { ensureNotificationPermission } from '@/lib/webNotifications';

interface Notification {
  id: string;
  message: string;
  time: string;
  type: 'reminder' | 'jackpot' | 'winner';
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('unsupported');

  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [notification, ...prev.slice(0, 4)]);

    // Auto close after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter(n => n.id !== notification.id));
    }, 5000);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToInAppNotifications((payload: InAppNotificationPayload) => {
      addNotification({
        id: payload.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        message: payload.message,
        type: payload.type,
        time: payload.time ?? new Date().toLocaleTimeString(),
      });
    });

    addNotification({
      id: 'notif-welcome',
      message: '👋 Notifications are live. Turn on browser alerts for draw reminders.',
      time: new Date().toLocaleTimeString(),
      type: 'reminder',
    });

    return unsubscribe;
  }, [addNotification]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermission('unsupported');
      return;
    }
    setPermission(Notification.permission);
  }, []);

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

          <div className="mb-4">
            <button
              onClick={async () => {
                const result = await ensureNotificationPermission();
                setPermission(result);
                if (result === 'granted') {
                  addNotification({
                    id: `perm-${Date.now()}`,
                    message: 'Browser notifications enabled. You will receive draw reminders.',
                    time: new Date().toLocaleTimeString(),
                    type: 'reminder',
                  });
                }
              }}
              className="w-full rounded-lg border border-blue-400/30 bg-blue-500/15 px-3 py-2 text-sm text-blue-100 hover:bg-blue-500/25 transition-colors"
            >
              {permission === 'granted'
                ? 'Browser notifications enabled'
                : permission === 'denied'
                  ? 'Browser notifications blocked (allow in browser settings)'
                  : 'Enable browser notifications'}
            </button>
          </div>

          <div className="space-y-3">
            {notifications.length === 0 ? (
              <p className="text-purple-300 text-center py-8">No notifications</p>
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

