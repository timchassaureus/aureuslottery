'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

type FloatingReaction = {
  id: number;
  emoji: string;
  x: number;
  size: number;
  durationMs: number;
};

const EMOJIS = ['🔥', '💎', '🚀', '🎉', '👏', '😱', '❤️', '⚡', '🏆'];

export default function LiveDrawReactions({
  active,
  viewerCount = 0,
}: {
  active: boolean;
  viewerCount?: number;
}) {
  const [items, setItems] = useState<FloatingReaction[]>([]);
  const [counter, setCounter] = useState(0);

  const totalViewers = useMemo(() => {
    if (viewerCount <= 0) return 0;
    // Add light social-proof variance for "live room" feeling
    return Math.max(1, viewerCount + Math.floor(viewerCount * 0.12));
  }, [viewerCount]);

  const pushReaction = useCallback((emoji: string) => {
    const id = Date.now() + counter;
    setCounter((c) => c + 1);
    const next: FloatingReaction = {
      id,
      emoji,
      x: 6 + Math.random() * 88,
      size: 18 + Math.random() * 18,
      durationMs: 2000 + Math.random() * 1400,
    };
    setItems((prev) => [...prev.slice(-80), next]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((it) => it.id !== id));
    }, next.durationMs + 200);
  }, [counter]);

  useEffect(() => {
    if (!active) return;
    const interval = window.setInterval(() => {
      const burst = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < burst; i += 1) {
        const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
        pushReaction(emoji);
      }
    }, 650);
    return () => window.clearInterval(interval);
  }, [active, pushReaction]);

  if (!active) return null;

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-[120] overflow-hidden">
        {items.map((item) => (
          <span
            key={item.id}
            className="absolute bottom-4 animate-live-float select-none"
            style={{
              left: `${item.x}%`,
              fontSize: `${item.size}px`,
              animationDuration: `${item.durationMs}ms`,
            }}
          >
            {item.emoji}
          </span>
        ))}
      </div>

      <div className="fixed bottom-5 right-4 z-[130] flex items-end gap-2">
        {totalViewers > 0 && (
          <div className="rounded-full border border-white/20 bg-black/45 px-3 py-1 text-xs text-white/90 backdrop-blur-sm">
            {totalViewers.toLocaleString('en-US')} watching
          </div>
        )}
        <div className="flex gap-1.5 rounded-full border border-white/20 bg-black/45 px-2 py-1 backdrop-blur-sm">
          {['🔥', '💎', '🎉', '❤️'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => pushReaction(emoji)}
              className="rounded-full px-2 py-1 text-base transition-transform hover:scale-125"
              aria-label={`Send ${emoji} reaction`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes live-float {
          0% {
            transform: translateY(0) scale(0.8);
            opacity: 0;
          }
          10% {
            opacity: 1;
            transform: translateY(-8vh) scale(1);
          }
          100% {
            transform: translateY(-72vh) scale(1.2);
            opacity: 0;
          }
        }
        .animate-live-float {
          animation-name: live-float;
          animation-timing-function: ease-out;
          animation-fill-mode: forwards;
        }
      `}</style>
    </>
  );
}

