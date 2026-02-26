/**
 * Draw notifications system
 * Notifies users about upcoming draws, winners, and their own wins
 */

export interface DrawNotification {
  id: string;
  type: 'draw_starting' | 'draw_complete' | 'you_won' | 'draw_reminder';
  title: string;
  message: string;
  timestamp: number;
  drawId?: number;
  prize?: number;
  read: boolean;
}

const NOTIFICATION_STORAGE_KEY = 'aureus_draw_notifications';

export function saveNotification(notification: Omit<DrawNotification, 'id' | 'read'>): void {
  if (typeof window === 'undefined') return;
  
  const notifications = getNotifications();
  const newNotification: DrawNotification = {
    ...notification,
    id: `notif-${Date.now()}-${crypto.randomUUID().slice(-9)}`,
    read: false,
  };
  
  notifications.unshift(newNotification);
  
  // Keep only last 50 notifications
  const trimmed = notifications.slice(0, 50);
  localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(trimmed));
}

export function getNotifications(): DrawNotification[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function markNotificationAsRead(id: string): void {
  if (typeof window === 'undefined') return;
  
  const notifications = getNotifications();
  const updated = notifications.map(n => 
    n.id === id ? { ...n, read: true } : n
  );
  localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(updated));
}

export function markAllAsRead(): void {
  if (typeof window === 'undefined') return;
  
  const notifications = getNotifications();
  const updated = notifications.map(n => ({ ...n, read: true }));
  localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(updated));
}

export function getUnreadCount(): number {
  return getNotifications().filter(n => !n.read).length;
}

/**
 * Create notification for draw starting soon
 */
export function notifyDrawStarting(drawType: 'main' | 'bonus', minutesUntil: number): void {
  const title = drawType === 'main' 
    ? '🎰 Main Draw Starting Soon!'
    : '💎 Bonus Draw Starting Soon!';
  
  const message = `The ${drawType === 'main' ? 'main' : 'bonus'} draw starts in ${minutesUntil} minute${minutesUntil > 1 ? 's' : ''}!`;
  
  saveNotification({
    type: 'draw_reminder',
    title,
    message,
    timestamp: Date.now(),
  });
}

/**
 * Create notification for draw complete
 */
export function notifyDrawComplete(
  drawType: 'main' | 'bonus',
  drawId: number,
  winnerAddress: string,
  prize: number
): void {
  const title = drawType === 'main'
    ? '🎉 Main Draw Complete!'
    : '🎁 Bonus Draw Complete!';
  
  const shortAddress = `${winnerAddress.slice(0, 6)}...${winnerAddress.slice(-4)}`;
  const message = `Draw #${drawId} complete! Winner: ${shortAddress} won $${prize.toLocaleString()}!`;
  
  saveNotification({
    type: 'draw_complete',
    title,
    message,
    timestamp: Date.now(),
    drawId,
    prize,
  });
}

/**
 * Create notification for user win
 */
export function notifyUserWin(
  drawType: 'main' | 'bonus',
  drawId: number,
  prize: number
): void {
  const title = '🏆 YOU WON!';
  const message = `Congratulations! You won $${prize.toLocaleString()} in the ${drawType === 'main' ? 'main' : 'bonus'} draw #${drawId}!`;
  
  saveNotification({
    type: 'you_won',
    title,
    message,
    timestamp: Date.now(),
    drawId,
    prize,
  });
}
