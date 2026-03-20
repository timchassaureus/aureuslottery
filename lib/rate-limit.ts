/**
 * rate-limit.ts
 * In-memory sliding-window rate limiter for Next.js API routes.
 *
 * Limits are per serverless instance, so this is a "best-effort" guard
 * against bursts — not a replacement for a Redis-backed solution.
 * For 1 000 concurrent users it is sufficient to prevent spam and abuse.
 */

interface Window {
  count: number;
  resetAt: number;
}

const store = new Map<string, Window>();

// Auto-cleanup every 5 minutes to prevent memory leaks on long-lived instances
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, win] of store.entries()) {
      if (win.resetAt < now) store.delete(key);
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  /** Unique key for this limit bucket (e.g. "wallet:0xabc" or "ip:1.2.3.4") */
  key: string;
  /** Max requests allowed in the window */
  limit: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number; // epoch ms
}

export function rateLimit({ key, limit, windowMs }: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || existing.resetAt < now) {
    // New window
    const win: Window = { count: 1, resetAt: now + windowMs };
    store.set(key, win);
    return { ok: true, remaining: limit - 1, resetAt: win.resetAt };
  }

  existing.count += 1;
  const remaining = Math.max(0, limit - existing.count);
  return {
    ok: existing.count <= limit,
    remaining,
    resetAt: existing.resetAt,
  };
}

/**
 * Convenience helper: extract IP from Next.js request headers.
 * Falls back to "unknown" for rate-limiting purposes.
 */
export function getClientIp(request: Request): string {
  const headers = [
    'x-real-ip',
    'x-forwarded-for',
    'cf-connecting-ip',
  ];
  for (const h of headers) {
    const val = (request as Request & { headers: Headers }).headers.get(h);
    if (val) return val.split(',')[0].trim();
  }
  return 'unknown';
}
