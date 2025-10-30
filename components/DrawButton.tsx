'use client';

import { useState } from 'react';
import { Trophy, Loader, Sparkles } from 'lucide-react';
import { useAppStore } from '@/lib/store';

interface Props {
  onWinnerSelected?: (winner: string, prize: number) => void;
}

export default function DrawButton({ onWinnerSelected }: Props) {
  const [processing, setProcessing] = useState(false);
  const { performDraw, currentDrawNumber, tickets, jackpot } = useAppStore();
  const ticketsInDraw = tickets.filter(t => t.drawNumber === currentDrawNumber);

  const handleDraw = async () => {
    if (ticketsInDraw.length === 0) return;
    
    setProcessing(true);
    
    try {
      // Add dramatic delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Call async performDraw with VRF
      const result = await performDraw();
      
      // Trigger winner animation if callback provided and result exists
      if (onWinnerSelected && result) {
        onWinnerSelected(result.winner, result.prize);
      }
    } catch (error) {
      console.error('Draw error:', error);
    } finally {
      setProcessing(false);
    }
  };

  const canDraw = ticketsInDraw.length > 0 && !processing;

  return (
    <button
      onClick={handleDraw}
      disabled={!canDraw}
      className="group relative w-full max-w-2xl mx-auto overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {processing ? (
        <>
          {/* Processing state */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 animate-pulse"></div>
          <div className="relative py-8 px-12 rounded-3xl border-4 border-yellow-400">
            <div className="flex items-center justify-center gap-4">
              <Loader className="w-10 h-10 animate-spin text-white" />
              <span className="font-black text-3xl text-white drop-shadow-lg">
                🎰 Selecting Winner... 🎰
              </span>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Animated background */}
          <div className={`absolute inset-0 ${canDraw ? 'bg-gradient-to-r from-yellow-600 via-orange-600 via-amber-600 to-yellow-600 animate-gradient-x' : 'bg-gradient-to-r from-gray-700 to-gray-800'}`}></div>
          
          {/* Glow effect */}
          {canDraw && (
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-amber-400 blur-xl"></div>
            </div>
          )}
          
          {/* Button content */}
          <div className={`relative py-8 px-12 rounded-3xl border-4 ${canDraw ? 'border-yellow-400' : 'border-gray-600'}`}>
            {canDraw ? (
              <div>
                <div className="flex items-center justify-center gap-4 mb-2">
                  <Trophy className="w-12 h-12 text-yellow-300 group-hover:scale-110 transition-transform" />
                  <span className="font-black text-3xl text-white drop-shadow-lg">
                    Perform Draw
                  </span>
                  <Sparkles className="w-12 h-12 text-yellow-300 group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex items-center justify-center gap-2 text-yellow-300 font-bold">
                  <span className="text-2xl">🎫</span>
                  <span>{ticketsInDraw.length} tickets in draw</span>
                  <span className="text-2xl">🎲</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <span className="text-4xl">❌</span>
                <span className="font-bold text-2xl text-gray-400">
                  No tickets yet
                </span>
              </div>
            )}
          </div>
          
          {/* Shine effect */}
          {canDraw && (
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          )}
        </>
      )}
    </button>
  );
}

