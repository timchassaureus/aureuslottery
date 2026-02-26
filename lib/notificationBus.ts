export type InAppNotificationType = 'reminder' | 'jackpot' | 'winner';

export interface InAppNotificationPayload {
  id?: string;
  message: string;
  type: InAppNotificationType;
  time?: string;
}

const IN_APP_EVENT = 'aureus:in-app-notification';

export function emitInAppNotification(payload: InAppNotificationPayload): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(IN_APP_EVENT, { detail: payload }));
}

export function subscribeToInAppNotifications(
  handler: (payload: InAppNotificationPayload) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  const listener = (event: Event) => {
    const custom = event as CustomEvent<InAppNotificationPayload>;
    if (!custom.detail) return;
    handler(custom.detail);
  };

  window.addEventListener(IN_APP_EVENT, listener);
  return () => window.removeEventListener(IN_APP_EVENT, listener);
}

