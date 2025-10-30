'use client';

import { useState } from 'react';
import { Megaphone, Share2, Twitter } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InviteBar() {
  const [copied, setCopied] = useState(false);
  const envUrl = typeof process !== 'undefined' ? (process as any).env?.NEXT_PUBLIC_SITE_URL : undefined;
  const rawOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  let siteUrl = envUrl || rawOrigin || 'https://aureus.app';
  if (siteUrl.startsWith('http://')) siteUrl = siteUrl.replace('http://', 'https://');
  if (siteUrl.includes('localhost')) siteUrl = envUrl || 'https://aureus.app';
  const shareMessage = `Join me on Aureus! $1 tickets • Draw 9PM UTC + bonus 11PM. Let’s push the pot to millions! #Aureus`;

  const shareOnX = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(siteUrl)}`;
    window.open(url, '_blank');
  };

  const shareOnTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(siteUrl)}&text=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(siteUrl);
      setCopied(true);
      toast.success('Link copied! Share it with your friends to grow the jackpot!');
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      toast.error('Failed to copy. Try manually: aureus.app');
    }
  };

  return (
    <div className="fixed left-0 right-0 bottom-24 md:bottom-24 z-[45] px-4 md:px-6">
      <div className="max-w-3xl mx-auto bg-gradient-to-r from-yellow-600/15 via-orange-600/15 to-red-600/15 rounded-2xl backdrop-blur-md p-3 md:p-4 shadow-xl">
        <div className="flex items-center gap-3 md:gap-4 flex-wrap justify-between">
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-yellow-300" />
            <p className="text-xs md:text-sm text-yellow-200 font-bold">
              Invite friends → Push the jackpot to MILLIONS daily! 🚀
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={shareOnX}
              className="px-3 py-2 bg-black/80 hover:bg-black text-white rounded-lg text-xs md:text-sm border border-white/20 flex items-center gap-2"
            >
              <Twitter className="w-4 h-4" /> Share on X
            </button>
            <button
              onClick={shareOnTelegram}
              className="px-3 py-2 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg text-xs md:text-sm border border-white/20"
            >
              Telegram
            </button>
            <button
              onClick={copyLink}
              className="px-3 py-2 bg-yellow-500/80 hover:bg-yellow-500 text-black rounded-lg text-xs md:text-sm border border-yellow-300/50 flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" /> {copied ? 'Copied!' : 'Copy link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


