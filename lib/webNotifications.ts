const NOTIF_MARKERS_KEY = 'aureus_notification_markers_v1';

type NotificationMarkers = Record<string, number>;

function readMarkers(): NotificationMarkers {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(NOTIF_MARKERS_KEY);
    return raw ? (JSON.parse(raw) as NotificationMarkers) : {};
  } catch {
    return {};
  }
}

function writeMarkers(markers: NotificationMarkers) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NOTIF_MARKERS_KEY, JSON.stringify(markers));
  } catch {
    // Ignore storage failures
  }
}

export function canUseBrowserNotifications(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export async function ensureNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!canUseBrowserNotifications()) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  return Notification.requestPermission();
}

export function sendBrowserNotification(title: string, body: string): void {
  if (!canUseBrowserNotifications()) return;
  if (Notification.permission !== 'granted') return;
  try {
    new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `aureus-${title}`,
    });
  } catch {
    // Ignore runtime notification failures
  }
}

export function shouldNotifyOnce(marker: string, ttlMs: number): boolean {
  const markers = readMarkers();
  const last = markers[marker];
  const now = Date.now();
  if (last && now - last < ttlMs) return false;
  markers[marker] = now;
  writeMarkers(markers);
  return true;
}

