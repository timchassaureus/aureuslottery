'use client';

import { useState } from 'react';
import { X, Ticket, Coins } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// Quick buy deals with special discounts
const QUICK_BUY_DEALS = [
  { tickets: 5, discount: 0.02, label: '2% OFF', emoji: '🎫' },
  { tickets: 10, discount: 0.05, label: '5% OFF', emoji: '🔥' },
  { tickets: 20, discount: 0.08, label: '8% OFF', emoji: '⚡' },
  { tickets: 50, discount: 0.12, label: '12% OFF', emoji: '💎' },
  { tickets: 100, discount: 0.15, label: '15% OFF', emoji: '👑' },
  { tickets: 1000, discount: 0.20, label: '20% OFF', emoji: '🚀' },
];

// Calculate discount based on exact quick buy match
function calculateDiscount(count: number): number {
  const deal = QUICK_BUY_DEALS.find(d => d.tickets === count);
  return deal ? deal.discount : 0;
}

export default function BuyTicketsModal({ isOpen, onClose }: Props) {
  const [count, setCount] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'card'>('crypto');
  const [cardProvider, setCardProvider] = useState<'moonpay' | 'ramp'>('moonpay');
  const { jackpot, ticketPrice, user, buyMultipleTickets, setJackpot } = useAppStore();
  const [processing, setProcessing] = useState(false);

  if (!isOpen) return null;

  const discount = calculateDiscount(count);
  const pricePerTicket = ticketPrice * (1 - discount);
  
  // Card payment has 3% fee
  const cardFee = paymentMethod === 'card' ? 0.03 : 0;
  const totalCost = count * pricePerTicket * (1 + cardFee);
  const savings = count * ticketPrice * discount;
  
  // Only 85% of what they pay goes to the jackpot (winner's share)
  const newJackpot = jackpot + (count * pricePerTicket * 0.85);

  const handleBuy = async () => {
    if (!user) {
      toast.error('Please connect your wallet first!');
      return;
    }
    
    if (count < 1) {
      toast.error('Please select at least 1 ticket');
      return;
    }

    // Mock balance check (will be real with blockchain)
    const mockBalance = 47.50;
    if (totalCost > mockBalance) {
      toast.error(`Insufficient USDC balance! You need $${totalCost.toFixed(2)} but have $${mockBalance.toFixed(2)}`);
      return;
    }
    
    setProcessing(true);
    
    // Show loading toast
    const loadingToast = toast.loading(
      paymentMethod === 'card' 
        ? 'Processing card payment...' 
        : 'Processing transaction...'
    );
    
    try {
      // Simulate transaction delay (longer for card payments)
      const delay = paymentMethod === 'card' ? 3000 : 1500;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      buyMultipleTickets(user.address, count);
      setJackpot(newJackpot);
      
      // Success!
      toast.success(
        `🎉 Successfully purchased ${count} ticket${count > 1 ? 's' : ''}!`,
        { id: loadingToast }
      );
      
      onClose();
      setCount(1);
    } catch (error) {
      console.error('Purchase failed:', error);
      toast.error('Transaction failed! Please try again.', { id: loadingToast });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-purple-900 to-purple-800 border border-purple-500/30 rounded-3xl p-6 md:p-8 max-w-md w-full relative my-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500/20 rounded-full mb-4">
            <Ticket className="w-8 h-8 text-primary-400" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Buy Tickets</h2>
          <p className="text-purple-300">Get your chance to win!</p>
        </div>

        <div className="space-y-6">
          {/* Payment Method Selection */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-purple-200">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Crypto Payment */}
              <button
                onClick={() => setPaymentMethod('crypto')}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'crypto'
                    ? 'border-primary-500 bg-primary-500/20'
                    : 'border-purple-600/50 bg-purple-800/30 hover:border-purple-500'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">🔷</div>
                  <div className="font-bold text-white text-sm mb-1">USDC Wallet</div>
                  <div className="text-xs text-purple-300">No fees • Instant</div>
                </div>
                {paymentMethod === 'crypto' && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </button>

              {/* Card Payment */}
              <button
                onClick={() => setPaymentMethod('card')}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'card'
                    ? 'border-primary-500 bg-primary-500/20'
                    : 'border-purple-600/50 bg-purple-800/30 hover:border-purple-500'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">💳</div>
                  <div className="font-bold text-white text-sm mb-1">Credit Card</div>
                  <div className="text-xs text-purple-300">+3% • 2-3 min</div>
                </div>
                {paymentMethod === 'card' && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </button>
            </div>

            {/* Payment Method Info */}
            {paymentMethod === 'card' && (
              <div className="mt-3 bg-blue-900/30 border border-blue-500/30 rounded-lg p-3">
                <p className="text-blue-300 text-xs leading-relaxed">
                  💡 <strong>Card payment:</strong> Your payment will be converted to USDC via our payment partner. 
                  Supports Visa, Mastercard, Amex.
                </p>
                {/* Provider choice */}
                <div className="mt-3 grid grid-cols-2 gap-2 max-w-xs mx-auto">
                  <button
                    onClick={() => setCardProvider('moonpay')}
                    className={`p-3 rounded-lg border text-sm font-semibold ${cardProvider === 'moonpay' ? 'border-yellow-400 bg-yellow-500/20 text-yellow-300' : 'border-white/10 bg-white/5 text-white'}`}
                  >
                    🌙 MoonPay
                  </button>
                  <button
                    onClick={() => setCardProvider('ramp')}
                    className={`p-3 rounded-lg border text-sm font-semibold ${cardProvider === 'ramp' ? 'border-green-400 bg-green-500/20 text-green-300' : 'border-white/10 bg-white/5 text-white'}`}
                  >
                    🟢 Ramp
                  </button>
                </div>
                <div className="mt-4 flex flex-col items-center gap-2 text-xs text-white/70">
                  <button
                    onClick={() => {
                      const userAddress = (typeof window !== 'undefined' && localStorage.getItem('aureus_wallet')) || '';
                      const amountUsd = (count * pricePerTicket).toFixed(2);
                      const moonpayKey = 'YOUR_MOONPAY_API_KEY';
                      const rampUrl = `https://ramp.network/buy?swapAsset=USDC&fiatValue=${amountUsd}&userAddress=${encodeURIComponent(userAddress || '')}`;
                      const moonpayUrl = `https://buy.moonpay.com?apiKey=${moonpayKey}&currencyCode=USDC&baseCurrencyAmount=${amountUsd}`;
                      window.open(cardProvider === 'moonpay' ? moonpayUrl : rampUrl, '_blank');
                    }}
                    className={`w-full max-w-sm mx-auto py-3 rounded-xl border-2 font-bold text-sm shadow-md transition-all
                      ${cardProvider === 'moonpay'
                        ? 'bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 border-white/40 text-white'
                        : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 border-white/40 text-white'}`}
                  >
                    {cardProvider === 'moonpay' ? 'Continue with MoonPay' : 'Continue with Ramp'}
                  </button>
                  <span className="text-center">
                    Complete payment, then return here to continue.
                  </span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-purple-200">
              Number of Tickets
            </label>
            <input
              type="number"
              min="1"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-3 bg-purple-800/50 border border-purple-600/50 rounded-xl text-white text-center text-2xl font-bold focus:outline-none focus:border-primary-500"
            />
            <div className="flex justify-center items-center mt-2 text-sm">
              <span className="text-purple-300">Or choose a quick deal below 👇</span>
            </div>
            
            {/* Quick Buy Deals */}
            <div className="mt-3">
              <p className="text-xs font-bold text-center text-yellow-400 mb-3">⚡ SPECIAL DEALS ⚡</p>
              <div className="grid grid-cols-3 gap-2">
                {QUICK_BUY_DEALS.map((deal) => {
                  const isSelected = count === deal.tickets;
                  return (
                    <button
                      key={deal.tickets}
                      onClick={() => setCount(deal.tickets)}
                      className={`relative p-3 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-yellow-500 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 scale-105'
                          : 'border-purple-600/50 bg-purple-800/30 hover:border-purple-500 hover:scale-105'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-1">{deal.emoji}</div>
                        <div className="font-black text-white text-lg">{deal.tickets}</div>
                        <div className="text-xs text-purple-300 mb-1">tickets</div>
                        <div className={`text-xs font-bold px-2 py-0.5 rounded ${
                          isSelected 
                            ? 'bg-yellow-500 text-black' 
                            : 'bg-green-500/20 text-green-400'
                        }`}>
                          {deal.label}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                          <span className="text-black text-xs font-bold">✓</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-purple-800/30 rounded-xl p-4 space-y-2">
            {discount > 0 ? (
              <>
                <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-2 mb-2">
                  <p className="text-green-300 text-center font-bold text-sm">
                    🎉 SPECIAL DEAL APPLIED! 🎉
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-300">Original price:</span>
                  <span className="text-purple-400 line-through">
                    ${(count * ticketPrice).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-300">Discount savings:</span>
                  <span className="text-green-400 font-bold">
                    -${savings.toFixed(2)} ({Math.round(discount * 100)}% off)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-300 font-semibold">Discounted price:</span>
                  <span className="text-green-400 font-bold text-lg">
                    ${(count * pricePerTicket).toFixed(2)}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex justify-between items-center">
                <span className="text-purple-300">Price:</span>
                <span className="text-white font-semibold text-lg">
                  {count} × ${ticketPrice.toFixed(2)} = ${(count * ticketPrice).toFixed(2)}
                </span>
              </div>
            )}
            {paymentMethod === 'card' && (
              <div className="flex justify-between items-center">
                <span className="text-purple-300">Card processing fee:</span>
                <span className="text-orange-400">
                  +${(count * pricePerTicket * cardFee).toFixed(2)} (3%)
                </span>
              </div>
            )}
            <div className="border-t border-purple-600/30 pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-purple-300 font-semibold">Total to pay:</span>
                <span className="text-primary-400 font-bold text-xl">
                  ${totalCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-300">New prize pool:</span>
              <span className="text-green-400 font-bold">${newJackpot.toLocaleString('en-US')}</span>
            </div>
            <div className="text-xs text-purple-400 text-center mt-2">
              This is the amount the winner will receive (100%)
            </div>
          </div>

          <button
            onClick={handleBuy}
            disabled={processing || !user}
            className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-xl font-bold text-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <Coins className="w-5 h-5 animate-pulse" />
                {paymentMethod === 'card' ? 'Processing card...' : 'Processing...'}
              </>
            ) : (
              <>
                {paymentMethod === 'card' ? '💳' : '🔷'}
                <span className="ml-2">
                  Buy {count} Ticket{count > 1 ? 's' : ''} {paymentMethod === 'card' ? 'with Card' : 'with USDC'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

