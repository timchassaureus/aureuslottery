'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Props {
  onBuyClick: () => void;
  isConnected: boolean;
}

export default function StickyBuyButton({ onBuyClick, isConnected }: Props) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky button after scrolling down 300px
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 px-4 z-[60] md:hidden animate-slide-up">
      <button
        onClick={() => {
          if (isConnected) {
            onBuyClick();
          } else {
            toast.error('Connect wallet first! 👛');
          }
        }}
        className="w-full py-4 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-2xl font-black text-xl text-white shadow-2xl border-2 border-white/50 active:scale-95 transition-transform"
      >
        🎫 BUY TICKETS NOW 💰
      </button>
    </div>
  );
}

