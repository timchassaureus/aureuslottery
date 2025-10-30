'use client';

import { useState } from 'react';
import { X as CloseIcon, Gift, Sparkles } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  ticketCount: number;
  jackpot: number;
}

export default function ViralShareModal({ isOpen, onClose, ticketCount, jackpot }: Props) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bonusClaimed, setBonusClaimed] = useState(false);
  const [tweetUrl, setTweetUrl] = useState('');
  const [isTweetValid, setIsTweetValid] = useState(false);
  const { user, giveShareBonus } = useAppStore();

  if (!isOpen) return null;

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://example.com';

  const viralTweetMessage = `I just bought ${ticketCount} ticket${ticketCount > 1 ? 's' : ''} for the $${jackpot.toLocaleString()} Aureus jackpot!\nDraw 9PM UTC + bonus 11PM. $1/ticket. #Aureus`;

  const handleShareOnX = () => {
    const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const rawOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    let shareUrl = envUrl || rawOrigin || 'https://aureus.app';
    if (shareUrl.startsWith('http://')) shareUrl = shareUrl.replace('http://', 'https://');
    if (shareUrl.includes('localhost')) shareUrl = envUrl || 'https://aureus.app';
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(viralTweetMessage)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(tweetUrl, '_blank');
    
    // Show confirmation after 2 seconds
    setTimeout(() => {
      setShowConfirmation(true);
    }, 2000);
  };

  const validateTweetUrl = (url: string) => {
    const regex = /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/[^\/]+\/status\/\d+/i;
    return regex.test(url.trim());
  };

  const handleClaimBonus = async () => {
    if (!isTweetValid) {
      toast.error('Please paste your tweet link to claim the bonus.');
      return;
    }
    try {
      const res = await fetch('/api/verify-tweet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: tweetUrl })
      });
      const data = await res.json();
      if (!data.valid) {
        toast.error('Tweet could not be verified. Please try again.');
        return;
      }
      if (user && !bonusClaimed) {
        giveShareBonus(user.address);
        setBonusClaimed(true);
        toast.success('🎉 +1 FREE TICKET added! Thanks for sharing!', { duration: 5000 });
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (e) {
      toast.error('Verification service unavailable. Try again later.');
    }
  };

  const handleShare = (platform: 'telegram' | 'whatsapp') => {
    const messages = {
      telegram: `🎰 I just entered the $${jackpot.toLocaleString()} jackpot draw!\n\nAureus Lottery - Daily crypto draws at 9PM UTC 🔥\nTickets $1 only!\n\nJoin: ${siteUrl}`,
      whatsapp: `🎰 Check this out! $${jackpot.toLocaleString()} jackpot TODAY!\n\nAureus - Daily crypto lottery\n✅ Fair & transparent\n✅ $1 tickets\n✅ Draw at 9PM UTC\n\n${siteUrl}`
    };

    const urls = {
      telegram: `https://t.me/share/url?url=${encodeURIComponent(siteUrl)}&text=${encodeURIComponent(messages.telegram)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(messages.whatsapp)}`
    };

    window.open(urls[platform], '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
      <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-900 border-4 border-yellow-400 rounded-3xl p-6 md:p-8 max-w-lg w-full relative overflow-hidden shadow-2xl">
        {/* Animated sparkles background */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <Sparkles
              key={i}
              className="absolute text-yellow-400 opacity-20 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <CloseIcon className="w-6 h-6" />
        </button>

        {!showConfirmation ? (
          /* Initial State - Show Offer */
          <div className="relative z-10">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4 animate-bounce">
                <Gift className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl font-black text-yellow-400 mb-2 drop-shadow-lg">
                🎉 SPECIAL OFFER! 🎉
              </h2>
              <p className="text-xl font-bold text-white mb-2">
                Tickets Purchased Successfully!
              </p>
            </div>

            {/* The Offer - SUPER Visible */}
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-4 border-green-400 rounded-2xl p-6 mb-6 animate-pulse-slow">
              <p className="text-center text-2xl font-black text-green-300 mb-3">
                GET +1 FREE TICKET! 🎫
              </p>
              <p className="text-center text-white text-lg mb-4">
                Share your purchase on <strong className="text-yellow-300">X (Twitter)</strong> and receive:
              </p>
              <ul className="space-y-2 text-left text-white">
                <li className="flex items-center gap-2">
                  <span className="text-green-400 text-xl">✅</span>
                  <span><strong>+1 FREE TICKET</strong> instantly</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400 text-xl">✅</span>
                  <span><strong>"Viral Ambassador"</strong> badge</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400 text-xl">✅</span>
                  <span>Help the jackpot grow <strong>BIGGER!</strong></span>
                </li>
              </ul>
              <div className="mt-4 bg-yellow-500/10 border border-yellow-400/40 rounded-lg p-3">
                <p className="text-center text-yellow-300 text-sm font-bold">
                  📣 Tell your friends to join — more players = a jackpot that can reach <span className="text-white">MILLIONS</span> daily! 🚀
                </p>
              </div>
            </div>

            {/* Main CTA - Share on X */}
            <button
              onClick={handleShareOnX}
              className="w-full py-5 bg-gradient-to-r from-black via-gray-900 to-black hover:from-gray-900 hover:to-black rounded-2xl font-black text-white text-xl transition-all border-4 border-white/30 hover:border-yellow-400 hover:scale-105 flex items-center justify-center gap-3 mb-4 shadow-xl"
            >
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span>🎁 Share on X & Get FREE Ticket!</span>
            </button>

            {/* Alternative sharing options (smaller) */}
            <div className="border-t border-white/20 pt-4 mt-4">
              <p className="text-center text-sm text-white/60 mb-3">Or share on:</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleShare('telegram')}
                  className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold text-white text-sm transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                  </svg>
                  Telegram
                </button>

                <button
                  onClick={() => handleShare('whatsapp')}
                  className="flex-1 py-3 bg-green-500 hover:bg-green-600 rounded-lg font-semibold text-white text-sm transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  WhatsApp
                </button>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-4 py-3 text-white/40 hover:text-white/60 transition-colors text-sm"
            >
              Skip for now
            </button>
          </div>
        ) : (
          /* Confirmation State - After sharing */
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-4">
              <Gift className="w-10 h-10 text-white animate-bounce" />
            </div>
            <h2 className="text-3xl font-black text-green-400 mb-4">Awesome! 🎉</h2>
            <p className="text-lg text-white mb-4">Paste your tweet link below to claim your bonus:</p>
            <div className="max-w-xl mx-auto text-left mb-4">
              <label className="block text-sm text-white/70 mb-2">Tweet URL</label>
              <input
                type="url"
                value={tweetUrl}
                onChange={(e) => {
                  const v = e.target.value;
                  setTweetUrl(v);
                  setIsTweetValid(validateTweetUrl(v));
                }}
                placeholder="https://x.com/yourhandle/status/1234567890"
                className={`w-full px-4 py-3 rounded-xl bg-black/40 border ${isTweetValid ? 'border-green-500' : 'border-white/20'} text-white placeholder-white/40 focus:outline-none focus:border-yellow-400`}
              />
              <p className={`mt-2 text-sm ${isTweetValid ? 'text-green-400' : 'text-white/50'}`}>
                {isTweetValid ? '✅ Looks good!' : 'Paste your public tweet URL from X/Twitter'}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleClaimBonus}
                disabled={bonusClaimed || !isTweetValid}
                className={`w-full py-5 rounded-2xl font-black text-xl transition-all border-4 flex items-center justify-center gap-3 ${
                  bonusClaimed
                    ? 'bg-gray-600 border-gray-500 cursor-not-allowed'
                    : isTweetValid
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-green-400 hover:scale-105 shadow-xl'
                      : 'bg-gray-700 border-gray-500 cursor-not-allowed opacity-70'
                }`}
              >
                {bonusClaimed ? (
                  <>
                    <span className="text-white">✅ Bonus Claimed!</span>
                  </>
                ) : (
                  <>
                    <Gift className="w-6 h-6 text-white" />
                    <span className="text-white">Yes! Claim My FREE Ticket 🎫</span>
                  </>
                )}
              </button>

              {!bonusClaimed && (
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="w-full py-3 bg-purple-700 hover:bg-purple-600 rounded-xl font-semibold text-white transition-all"
                >
                  Not yet, let me share again
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

