'use client';

import { useEffect, useState } from 'react';
import { X, Ticket, Coins, Copy, Check } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { BASESCAN_TX_URL } from '@/lib/config';
import { getStoredReferralCodeForPurchase } from '@/hooks/useReferral';
import TransactionStatus from './TransactionStatus';

async function recordReferralPurchase(
  walletAddress: string,
  amountUsd: number,
  ticketsCount: number,
  bonusTickets = 0,
) {
  try {
    const referralCode = getStoredReferralCodeForPurchase();
    await fetch('/api/referral/record-purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress: walletAddress.toLowerCase(),
        amountUsd,
        ticketsCount,
        bonusTickets,
        referralCode: referralCode || null,
      }),
    });
  } catch (e) {
    console.warn('Referral record failed (non-blocking):', e);
  }
}

const TREASURY = process.env.NEXT_PUBLIC_TREASURY_ADDRESS || '0x47d918C2e303855da1AD3e08A4128211284aD837';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialCount?: number;
}

const PACKS: Array<{ tickets: number; bonus: number; emoji: string; label: string; popular?: boolean }> = [
  { tickets: 5,  bonus: 1,  emoji: '⚡', label: 'Starter' },
  { tickets: 10, bonus: 3,  emoji: '🔥', label: 'Popular', popular: true },
  { tickets: 25, bonus: 10, emoji: '💎', label: 'Elite' },
  { tickets: 50, bonus: 25, emoji: '👑', label: 'VIP' },
];

function getBonusForCount(count: number): number {
  return PACKS.find(p => p.tickets === count)?.bonus ?? 0;
}

export default function BuyTicketsModal({ isOpen, onClose, initialCount = 5 }: Props) {
  const [count, setCount] = useState(initialCount);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) setCount(initialCount);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'card'>('card');
  const { jackpot, ticketPrice, user, tickets, buyMultipleTickets, setJackpot, mode } = useAppStore();
  const [processing, setProcessing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<'pending' | 'confirming' | 'success' | 'error'>('pending');
  const [txMessage, setTxMessage] = useState<string>('');
  const isLive = mode === 'live';

  useEffect(() => {
    if (!isOpen) {
      setTxHash(null);
      setProcessing(false);
      setTxStatus('pending');
      setTxMessage('');
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const bonusTickets = getBonusForCount(count);
  const totalTicketsInDraw = count + bonusTickets;
  const totalCost = count * ticketPrice;
  const newJackpot = isLive ? jackpot : jackpot + (count * ticketPrice * 0.85);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(TREASURY);
    setCopied(true);
    toast.success('Address copied!');
    setTimeout(() => setCopied(false), 3000);
  };

  // Demo mode buy
  const handleDemoBuy = async () => {
    if (!user) { toast.error('Please create an account first!'); return; }
    if (count < 1) { toast.error('Please select at least 1 ticket'); return; }

    setProcessing(true);
    setTxStatus('pending');
    setTxMessage(paymentMethod === 'card' ? 'Processing card payment...' : 'Processing...');
    const loadingToast = toast.loading('Processing...');

    try {
      const delay = paymentMethod === 'card' ? 3000 : 1500;
      await new Promise(resolve => setTimeout(resolve, delay));
      buyMultipleTickets(user.address, count);
      setJackpot(newJackpot);
      setTxStatus('success');
      setTxMessage(`Successfully purchased ${count} ticket${count > 1 ? 's' : ''}!`);
      recordReferralPurchase(user.address, totalCost, count, bonusTickets);
      toast.success(`🎉 Purchased ${count} ticket${count > 1 ? 's' : ''}!`, { id: loadingToast });
      setTimeout(() => { onClose(); setCount(1); }, 2000);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Transaction failed. Please try again.';
      setTxStatus('error');
      setTxMessage(msg);
      toast.error(msg, { id: loadingToast, duration: 6000 });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      {txHash && txStatus !== 'error' && (
        <TransactionStatus
          txHash={txHash}
          status={txStatus === 'pending' ? 'pending' : txStatus === 'confirming' ? 'confirming' : 'success'}
          message={txMessage}
          onComplete={() => { setTxHash(null); setTxStatus('pending'); setTxMessage(''); }}
        />
      )}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 p-3 md:p-4 flex items-start md:items-center justify-center">
        <div className="modal w-full max-w-md bg-gradient-to-br from-purple-900 to-purple-800 border border-purple-500/30 rounded-3xl relative">
          <div className="modal-content p-6 md:p-8">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500/20 rounded-full mb-4">
                <Ticket className="w-8 h-8 text-primary-400" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Buy Tickets</h2>
              <p className="text-purple-300">1 USDC = 1 ticket · Base network</p>
            </div>

            <div className="space-y-6">

              {/* Demo mode: payment method selector */}
              {!isLive && (
                <div>
                  <label className="block text-sm font-semibold mb-3 text-purple-200">Payment Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMethod('crypto')}
                      className={`relative p-4 rounded-xl border-2 transition-all ${paymentMethod === 'crypto' ? 'border-primary-500 bg-primary-500/20' : 'border-purple-600/50 bg-purple-800/30 hover:border-purple-500'}`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-1">🔷</div>
                        <div className="font-bold text-white text-sm mb-1">USDC Wallet</div>
                        <div className="text-xs text-purple-300">No fees · Instant</div>
                      </div>
                      {paymentMethod === 'crypto' && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </button>
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`relative p-4 rounded-xl border-2 transition-all ${paymentMethod === 'card' ? 'border-primary-500 bg-primary-500/20' : 'border-purple-600/50 bg-purple-800/30 hover:border-purple-500'}`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-1">💳</div>
                        <div className="font-bold text-white text-sm mb-1">Credit Card</div>
                        <div className="text-xs text-purple-300">+3% · 2-3 min</div>
                      </div>
                      {paymentMethod === 'card' && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Pack selection */}
              <div>
                <p className="text-xs font-bold text-center text-yellow-400 mb-3">🎁 PACKS — FREE BONUS TICKETS</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {PACKS.map((pack) => {
                    const isSelected = count === pack.tickets;
                    return (
                      <button
                        key={pack.tickets}
                        onClick={() => setCount(pack.tickets)}
                        className={`relative p-3 rounded-xl border-2 transition-all ${isSelected ? 'border-yellow-500 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 scale-105' : 'border-purple-600/50 bg-purple-800/30 hover:border-purple-500 hover:scale-105'}`}
                      >
                        {pack.popular && (
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap">
                            ⭐ POPULAR
                          </div>
                        )}
                        <div className="text-center mt-1">
                          <div className="text-xl mb-0.5">{pack.emoji} {pack.label}</div>
                          <div className="font-black text-white text-lg">{pack.tickets} USDC</div>
                          <div className="text-xs text-purple-300">{pack.tickets} tickets</div>
                          <div className={`text-xs font-bold mt-1 px-2 py-0.5 rounded ${isSelected ? 'bg-yellow-500 text-black' : 'bg-green-500/20 text-green-400'}`}>
                            +{pack.bonus} FREE BONUS{pack.bonus > 1 ? 'ES' : ''}
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

                <label className="block text-xs text-purple-400 mb-1 text-center">Or enter a custom amount</label>
                <input
                  type="number"
                  min="1"
                  value={count}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') { setCount(0); }
                    else { const n = parseInt(val, 10); if (!isNaN(n) && n > 0) setCount(n); }
                  }}
                  onBlur={() => { if (count < 1) setCount(1); }}
                  className="w-full px-4 py-2 bg-purple-800/50 border border-purple-600/50 rounded-xl text-white text-center text-xl font-bold focus:outline-none focus:border-primary-500"
                />
              </div>

              {/* Summary */}
              <div className="bg-purple-800/30 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-purple-300">Tickets:</span>
                  <span className="text-white font-semibold">{count} × 1 USDC</span>
                </div>
                {bonusTickets > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-green-300">🎁 Free bonus tickets:</span>
                    <span className="text-green-400 font-bold">+{bonusTickets}</span>
                  </div>
                )}
                {bonusTickets > 0 && (
                  <div className="flex justify-between items-center bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-1.5">
                    <span className="text-green-200 font-semibold text-sm">🏆 Total in draw tonight:</span>
                    <span className="text-green-300 font-black">{totalTicketsInDraw} tickets</span>
                  </div>
                )}
                <div className="border-t border-purple-600/30 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-purple-300 font-semibold">Amount to send:</span>
                    <span className="text-primary-400 font-bold text-xl">{totalCost.toFixed(2)} USDC</span>
                  </div>
                </div>
                {/* Probability */}
                {count > 0 && (() => {
                  const totalTicketsSold = tickets?.length ?? 0;
                  const totalAfterBuy = totalTicketsSold + totalTicketsInDraw;
                  const winChance = (totalTicketsInDraw / totalAfterBuy) * 100;
                  const oneIn = Math.round(totalAfterBuy / totalTicketsInDraw);
                  return (
                    <div className="mt-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-center">
                      <p className="text-yellow-300 text-xs font-bold mb-1">Your chances of winning tonight</p>
                      <p className="text-yellow-400 text-xl font-black">
                        {winChance < 0.01 ? '< 0.01' : winChance.toFixed(2)}%
                      </p>
                      <p className="text-yellow-300/70 text-xs">
                        1 in {oneIn.toLocaleString('en-US')} · {totalTicketsInDraw} ticket{totalTicketsInDraw > 1 ? 's' : ''} in draw
                      </p>
                    </div>
                  );
                })()}

                {/* Live mode: treasury address to copy */}
                {isLive && (
                  <div className="mt-3 bg-violet-900/40 border border-violet-500/40 rounded-xl p-3">
                    <p className="text-xs text-violet-300 font-semibold mb-1">Send exactly <span className="text-white font-black">{totalCost.toFixed(2)} USDC</span> to:</p>
                    <p className="font-mono text-xs text-violet-200 break-all mb-2">{TREASURY}</p>
                    <p className="text-xs text-slate-400">⚠️ Base network only · Your tickets are registered automatically</p>
                  </div>
                )}

                <div className="mt-3 text-[11px] text-purple-200/80 space-y-1 border-t border-purple-600/40 pt-2">
                  <p>⚠️ Lottery tickets are a high-risk product. You can lose 100% of the amount you spend. Never play with money you cannot afford to lose.</p>
                  <p>By buying tickets, you confirm that you are of legal age in your country and that participation in online lotteries is permitted in your jurisdiction.</p>
                </div>

                {isLive && txHash && (
                  <div className="text-xs text-green-300 text-center mt-2">
                    Tx confirmed — <a href={`${BASESCAN_TX_URL}${txHash}`} target="_blank" rel="noreferrer" className="underline">view on BaseScan</a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            {isLive ? (
              <button
                onClick={handleCopyAddress}
                className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
              >
                {copied ? <Check className="w-5 h-5 text-green-300" /> : <Copy className="w-5 h-5" />}
                {copied ? 'Address copied!' : `Copy address · send ${totalCost.toFixed(2)} USDC`}
              </button>
            ) : (
              <button
                onClick={handleDemoBuy}
                disabled={processing || !user}
                className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-xl font-bold text-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing ? (
                  <><Coins className="w-5 h-5 animate-pulse" /> Processing...</>
                ) : (
                  <>{paymentMethod === 'card' ? '💳' : '🔷'} Buy {totalTicketsInDraw} ticket{totalTicketsInDraw > 1 ? 's' : ''}{bonusTickets > 0 ? ` (incl. ${bonusTickets} bonus)` : ''}</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
