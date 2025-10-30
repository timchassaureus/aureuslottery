'use client';

import { useState, useEffect } from 'react';
import { Clock, Zap, AlertTriangle } from 'lucide-react';

interface Props {
  targetHour: number; // 20 for 8PM or 22 for 10PM
  drawType: '8pm' | '10pm';
}

export default function DramaticCountdown({ targetHour, drawType }: Props) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isUrgent, setIsUrgent] = useState(false);
  const [isCritical, setIsCritical] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const target = new Date();
      target.setHours(targetHour, 0, 0, 0);

      // If target time has passed today, set for next day
      if (now > target) {
        target.setDate(target.getDate() + 1);
      }

      const diff = target.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      // Set urgency flags
      const totalMinutes = hours * 60 + minutes;
      setIsUrgent(totalMinutes <= 10 && totalMinutes > 5); // Last 10 minutes
      setIsCritical(totalMinutes <= 5); // Last 5 minutes

      return { hours, minutes, seconds };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetHour]);

  if (!isUrgent && !isCritical) {
    return null; // Only show during urgent moments
  }

  const title = drawType === '8pm' ? '🏆 MAIN JACKPOT DRAW' : '🎁 BONUS DRAW';
  const bgColor = drawType === '8pm' 
    ? 'from-yellow-900/90 to-orange-900/90' 
    : 'from-violet-900/90 to-fuchsia-900/90';
  const borderColor = drawType === '8pm' ? 'border-yellow-500' : 'border-violet-500';
  const textColor = drawType === '8pm' ? 'text-yellow-400' : 'text-violet-400';

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-gradient-to-r ${bgColor} border-t-4 ${borderColor} z-50 ${
      isCritical ? 'animate-pulse' : ''
    }`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Warning */}
          <div className="flex items-center gap-3">
            {isCritical ? (
              <AlertTriangle className="w-8 h-8 text-red-500 animate-bounce" />
            ) : (
              <Zap className="w-8 h-8 text-yellow-500 animate-pulse" />
            )}
            <div>
              <p className={`text-xl md:text-2xl font-black ${textColor}`}>
                {isCritical ? '⚠️ LAST CHANCE!' : '🔥 DRAW SOON!'}
              </p>
              <p className="text-sm text-white">
                {title}
              </p>
            </div>
          </div>

          {/* Center: Countdown */}
          <div className="flex items-center gap-2">
            <Clock className={`w-6 h-6 ${textColor}`} />
            <div className="flex items-center gap-2">
              <div className={`bg-black/50 px-4 py-2 rounded-lg border-2 ${borderColor}`}>
                <span className={`text-4xl font-black ${textColor}`}>
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
              </div>
              <span className={`text-3xl ${textColor} font-black`}>:</span>
              <div className={`bg-black/50 px-4 py-2 rounded-lg border-2 ${borderColor}`}>
                <span className={`text-4xl font-black ${textColor}`}>
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
              </div>
              <span className={`text-3xl ${textColor} font-black`}>:</span>
              <div className={`bg-black/50 px-4 py-2 rounded-lg border-2 ${borderColor} ${
                isCritical ? 'animate-pulse' : ''
              }`}>
                <span className={`text-4xl font-black ${textColor}`}>
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>

          {/* Right: CTA */}
          <button
            onClick={() => {
              // Scroll to buy tickets section
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`px-6 py-3 bg-gradient-to-r ${
              drawType === '8pm' 
                ? 'from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700' 
                : 'from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700'
            } rounded-xl font-bold text-white transition-all hover:scale-105 shadow-2xl border-2 border-white/30 ${
              isCritical ? 'animate-bounce' : ''
            }`}
          >
            {isCritical ? '⚡ BUY NOW!' : '🎫 Get Tickets'}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="w-full bg-black/30 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${
                drawType === '8pm' ? 'from-yellow-500 to-orange-500' : 'from-violet-500 to-fuchsia-500'
              } transition-all duration-1000 ${isCritical ? 'animate-pulse' : ''}`}
              style={{
                width: `${100 - ((timeLeft.hours * 60 + timeLeft.minutes) / 10) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

