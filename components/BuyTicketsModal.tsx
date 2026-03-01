'use client';

import { useEffect, useState } from 'react';
import { X, Ticket, Coins, CreditCard } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { buyTicketsOnChain } from '@/lib/blockchain';
import { BASESCAN_TX_URL, DEFAULT_CHAIN_ID } from '@/lib/config';
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

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialCount?: number;
}

// Packs with bonus tickets (no hidden % discount — simple and clear)
const PACKS: Array<{ tickets: number; bonus: number; emoji: string; label: string; popular?: boolean }> = [
  { tickets: 5,  bonus: 1,  emoji: '⚡', label: 'Starter' },
  { tickets: 10, bonus: 3,  emoji: '🔥', label: 'Populaire', popular: true },
  { tickets: 25, bonus: 10, emoji: '💎', label: 'Elite' },
  { tickets: 50, bonus: 25, emoji: '👑', label: 'VIP' },
];

function getBonusForCount(count: number): number {
  return PACKS.find(p => p.tickets === count)?.bonus ?? 0;
}

export default function BuyTicketsModal({ isOpen, onClose, initialCount = 5 }: Props) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    if (isOpen) setCount(initialCount);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);
  const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'card'>('crypto');
  const [cardProvider, setCardProvider] = useState<'moonpay' | 'ramp'>('moonpay');
  const { jackpot, ticketPrice, user, tickets, buyMultipleTickets, setJackpot, mode, syncOnChainData } = useAppStore();
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
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const bonusTickets = getBonusForCount(count);
  const totalTicketsInDraw = count + bonusTickets;

  // Card payment has 3% fee — price is always count × ticketPrice (no discount)
  const cardFee = paymentMethod === 'card' ? 0.03 : 0;
  const totalCost = count * ticketPrice * (1 + cardFee);

  // Only 85% of what they pay goes to the jackpot (winner's share)
  const newJackpot = isLive ? jackpot : jackpot + (count * ticketPrice * 0.85);

  const handleBuy = async () => {
    if (!user) {
      toast.error('Please create an account first!');
      return;
    }

    if (count < 1) {
      toast.error('Please select at least 1 ticket');
      return;
    }

    // Custodial users in live mode: open Coinbase Onramp to buy USDC
    if (isLive && user.isCustodial) {
      const amountUsd = (count * ticketPrice).toFixed(2);
      const appId = process.env.NEXT_PUBLIC_COINBASE_APP_ID || '';
      const destinationWallets = JSON.stringify([{ address: user.address, assets: ['USDC'], supportedNetworks: ['base'] }]);
      const coinbaseUrl = `https://pay.coinbase.com/buy/select-asset?appId=${appId}&destinationWallets=${encodeURIComponent(destinationWallets)}&presetFiatAmount=${amountUsd}`;
      window.open(coinbaseUrl, '_blank');
      toast.success('Coinbase Pay ouvert — revenez ici après le paiement 👍', { duration: 6000 });
      recordReferralPurchase(user.address, Number(amountUsd), count, bonusTickets);
      return;
    }

    setProcessing(true);
    setTxStatus('pending');
    setTxMessage('Preparing transaction...');

    const loadingToast = toast.loading(
      isLive
        ? 'Submitting transaction...'
        : paymentMethod === 'card'
          ? 'Processing card payment...'
          : 'Processing transaction...'
    );

    try {
      if (isLive) {
        setTxStatus('pending');
        setTxMessage('Waiting for wallet confirmation...');

        const receipt = await buyTicketsOnChain(count);
        setTxHash(receipt.hash);
        setTxStatus('confirming');
        setTxMessage('Transaction submitted! Confirming on blockchain...');

        setTxStatus('success');
        setTxMessage(`Successfully purchased ${count} ticket${count > 1 ? 's' : ''}!`);

        await syncOnChainData(user.address);
        recordReferralPurchase(user.address, totalCost, count, bonusTickets);
        const networkName = DEFAULT_CHAIN_ID === 8453 ? 'Base' : 'Base Sepolia';
        toast.success(
          `🎉 Purchased ${count} ticket${count > 1 ? 's' : ''} on ${networkName}!`,
          { id: loadingToast }
        );
      } else {
        setTxStatus('pending');
        setTxMessage(paymentMethod === 'card' ? 'Processing card payment...' : 'Processing...');
        
        const delay = paymentMethod === 'card' ? 3000 : 1500;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        buyMultipleTickets(user.address, count);
        setJackpot(newJackpot);
        
        setTxStatus('success');
        setTxMessage(`Successfully purchased ${count} ticket${count > 1 ? 's' : ''}!`);
        
        recordReferralPurchase(user.address, totalCost, count, bonusTickets);
        toast.success(
          `🎉 Successfully purchased ${count} ticket${count > 1 ? 's' : ''}!`,
          { id: loadingToast }
        );
      }
      
      // Close modal after short delay
      setTimeout(() => {
        onClose();
        setCount(1);
      }, 2000);
    } catch (error: any) {
      console.error('Purchase failed:', error);
      
      let errorMessage = 'Transaction failed! Please try again.';
      
      if (error?.message || error?.shortMessage) {
        const msg = error.message || error.shortMessage || '';
        
        if (msg.includes('insufficient funds') || msg.includes('balance')) {
          errorMessage = 'Insufficient USDC balance. Please add more USDC to your wallet.';
        } else if (msg.includes('user rejected') || msg.includes('User denied')) {
          errorMessage = 'Transaction cancelled.';
        } else if (msg.includes('network') || msg.includes('Chain ID')) {
          const networkName = DEFAULT_CHAIN_ID === 8453 ? 'Base' : 'Base Sepolia';
          errorMessage = `Wrong network. Please switch to ${networkName}.`;
        } else if (msg.includes('allowance') || msg.includes('approve')) {
          errorMessage = 'Please approve USDC spending first, then try again.';
        } else if (msg.includes('gas')) {
          errorMessage = 'Transaction failed due to gas estimation. Please try again.';
        } else {
          errorMessage = msg.length > 100 ? 'Transaction failed. Please check your wallet and try again.' : msg;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setTxStatus('error');
      setTxMessage(errorMessage);
      toast.error(errorMessage, { id: loadingToast, duration: 6000 });
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
          onComplete={() => {
            setTxHash(null);
            setTxStatus('pending');
            setTxMessage('');
          }}
        />
      )}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 p-3 md:p-4 flex items-start md:items-center justify-center">
      <div className="modal w-full max-w-md bg-[#0D0D1A] border border-gold-500/20 rounded-3xl relative">
        <div className="modal-content p-6 md:p-7">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8A8070] hover:text-[#F5F0E8] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gold-500/10 border border-gold-500/20 rounded-full mb-4">
            <Ticket className="w-6 h-6 text-gold-500" />
          </div>
          <h2 className="text-2xl font-bold text-[#F5F0E8] mb-1 tracking-wide">Acheter des tickets</h2>
          <p className="text-[#8A8070] text-sm">Tentez votre chance ce soir</p>
        </div>

        <div className="space-y-5">
          {/* Payment Method — hidden for custodial users */}
          {!(isLive && user?.isCustodial) && (
          <div>
            <label className="block text-[10px] font-semibold mb-3 text-[#8A8070] uppercase tracking-[0.18em]">
              Méthode de paiement
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod('crypto')}
                className={`relative p-4 rounded-xl border transition-all ${
                  paymentMethod === 'crypto'
                    ? 'border-gold-500 bg-gold-500/10'
                    : 'border-white/10 bg-white/[0.03] hover:border-gold-500/30'
                }`}
              >
                <div className="text-center">
                  <div className="text-xl mb-1.5">◈</div>
                  <div className="font-bold text-[#F5F0E8] text-sm mb-0.5">USDC Wallet</div>
                  <div className="text-xs text-[#8A8070]">Sans frais · Instant</div>
                </div>
                {paymentMethod === 'crypto' && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gold-500 rounded-full flex items-center justify-center">
                    <span className="text-black text-[10px] font-black">✓</span>
                  </div>
                )}
              </button>

              <button
                onClick={() => setPaymentMethod('card')}
                className={`relative p-4 rounded-xl border transition-all ${
                  paymentMethod === 'card'
                    ? 'border-gold-500 bg-gold-500/10'
                    : 'border-white/10 bg-white/[0.03] hover:border-gold-500/30'
                }`}
              >
                <div className="text-center">
                  <div className="text-xl mb-1.5"><CreditCard className="w-5 h-5 mx-auto text-[#8A8070]" /></div>
                  <div className="font-bold text-[#F5F0E8] text-sm mb-0.5">Carte bancaire</div>
                  <div className="text-xs text-[#8A8070]">+3% · 2-3 min</div>
                </div>
                {paymentMethod === 'card' && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gold-500 rounded-full flex items-center justify-center">
                    <span className="text-black text-[10px] font-black">✓</span>
                  </div>
                )}
              </button>
            </div>

            {paymentMethod === 'card' && (
              <div className="mt-3 border border-white/10 rounded-xl p-3 bg-white/[0.02]">
                <p className="text-[#8A8070] text-xs leading-relaxed mb-3">
                  Votre paiement sera converti en USDC via notre partenaire. Visa, Mastercard, Amex acceptés.
                </p>
                <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
                  <button
                    onClick={() => setCardProvider('moonpay')}
                    className={`p-2.5 rounded-lg border text-xs font-semibold transition-all ${cardProvider === 'moonpay' ? 'border-gold-500 bg-gold-500/10 text-gold-400' : 'border-white/10 bg-white/[0.03] text-[#8A8070]'}`}
                  >
                    MoonPay
                  </button>
                  <button
                    onClick={() => setCardProvider('ramp')}
                    className={`p-2.5 rounded-lg border text-xs font-semibold transition-all ${cardProvider === 'ramp' ? 'border-gold-500 bg-gold-500/10 text-gold-400' : 'border-white/10 bg-white/[0.03] text-[#8A8070]'}`}
                  >
                    Ramp
                  </button>
                </div>
                <div className="mt-3 flex flex-col items-center gap-2">
                  <button
                    onClick={() => {
                      const userAddress = (typeof window !== 'undefined' && localStorage.getItem('aureus_wallet')) || '';
                      const amountUsd = (count * ticketPrice).toFixed(2);
                      const moonpayKey = 'YOUR_MOONPAY_API_KEY';
                      const rampUrl = `https://ramp.network/buy?swapAsset=USDC&fiatValue=${amountUsd}&userAddress=${encodeURIComponent(userAddress || '')}`;
                      const moonpayUrl = `https://buy.moonpay.com?apiKey=${moonpayKey}&currencyCode=USDC&baseCurrencyAmount=${amountUsd}`;
                      window.open(cardProvider === 'moonpay' ? moonpayUrl : rampUrl, '_blank');
                    }}
                    className="w-full max-w-sm mx-auto py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-bold text-sm transition-colors"
                  >
                    Continuer avec {cardProvider === 'moonpay' ? 'MoonPay' : 'Ramp'}
                  </button>
                  <span className="text-[10px] text-[#8A8070] text-center">
                    Revenez ici après le paiement pour valider.
                  </span>
                </div>
              </div>
            )}
          </div>
          )}

          {/* Coinbase Pay banner for custodial users */}
          {isLive && user?.isCustodial && (
            <div className="border border-gold-500/20 rounded-xl p-4 text-center bg-gold-500/[0.05]">
              <p className="text-gold-400 text-sm font-bold mb-1">Paiement via Coinbase Pay</p>
              <p className="text-[#8A8070] text-xs">Visa · Mastercard · Apple Pay · Google Pay</p>
            </div>
          )}

          <div>
            {/* Pack selection */}
            <p className="text-[10px] font-bold text-center text-[#8A8070] uppercase tracking-[0.18em] mb-3">Packs — tickets bonus offerts</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {PACKS.map((pack) => {
                const isSelected = count === pack.tickets;
                return (
                  <button
                    key={pack.tickets}
                    onClick={() => setCount(pack.tickets)}
                    className={`relative p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-gold-500 bg-gold-500/10 scale-[1.02]'
                        : 'border-white/10 bg-white/[0.03] hover:border-gold-500/30'
                    }`}
                  >
                    {pack.popular && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gold-500 text-black text-[9px] font-black px-2 py-0.5 rounded-full whitespace-nowrap uppercase tracking-wide">
                        Populaire
                      </div>
                    )}
                    <div className="text-center mt-1">
                      <div className="text-sm font-bold text-[#F5F0E8] mb-0.5">{pack.label}</div>
                      <div className="font-black text-[#F5F0E8] text-lg">{pack.tickets}€</div>
                      <div className="text-xs text-[#8A8070]">{pack.tickets} tickets</div>
                      <div className={`text-[10px] font-bold mt-1.5 px-2 py-0.5 rounded ${
                        isSelected ? 'bg-gold-500 text-black' : 'bg-white/[0.05] text-[#8A8070] border border-white/10'
                      }`}>
                        +{pack.bonus} bonus
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-gold-500 rounded-full flex items-center justify-center">
                        <span className="text-black text-[9px] font-black">✓</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom amount */}
            <label className="block text-[10px] text-[#8A8070] mb-1.5 text-center uppercase tracking-wider">
              Montant personnalisé (sans bonus)
            </label>
            <input
              type="number"
              min="1"
              value={count}
              onChange={(event) => {
                const val = event.target.value;
                if (val === '') { setCount(0); }
                else {
                  const num = parseInt(val, 10);
                  if (!Number.isNaN(num) && num > 0) setCount(num);
                }
              }}
              onBlur={() => { if (count < 1) setCount(1); }}
              className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-[#F5F0E8] text-center text-xl font-bold focus:outline-none focus:border-gold-500/50 transition-colors"
            />
          </div>

          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-[#8A8070] text-sm">Tickets achetés</span>
              <span className="text-[#F5F0E8] font-semibold text-sm">{count} × {ticketPrice.toFixed(2)}€</span>
            </div>
            {bonusTickets > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-[#8A8070] text-sm">Tickets bonus</span>
                <span className="text-gold-400 font-bold text-sm">+{bonusTickets}</span>
              </div>
            )}
            {bonusTickets > 0 && (
              <div className="flex justify-between items-center bg-gold-500/[0.06] border border-gold-500/20 rounded-lg px-3 py-1.5">
                <span className="text-[#8A8070] text-xs">Total en jeu ce soir</span>
                <span className="text-gold-400 font-black text-sm">{totalTicketsInDraw} tickets</span>
              </div>
            )}
            {paymentMethod === 'card' && (
              <div className="flex justify-between items-center">
                <span className="text-[#8A8070] text-sm">Frais carte</span>
                <span className="text-[#F5F0E8]/60 text-sm">
                  +${(count * ticketPrice * cardFee).toFixed(2)} (3%)
                </span>
              </div>
            )}
            <div className="border-t border-white/[0.06] pt-2.5 mt-1">
              <div className="flex justify-between items-center">
                <span className="text-[#8A8070] font-semibold text-sm">Total à payer</span>
                <span className="text-gold-400 font-bold text-xl">
                  {totalCost.toLocaleString('fr-FR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}€
                </span>
              </div>
            </div>
            {/* Probability calculator */}
            {count > 0 && (() => {
              const totalTicketsSold = tickets?.length ?? 0;
              const totalAfterBuy = totalTicketsSold + totalTicketsInDraw;
              const winChance = (totalTicketsInDraw / totalAfterBuy) * 100;
              const oneIn = Math.round(totalAfterBuy / totalTicketsInDraw);
              return (
                <div className="mt-2 border border-gold-500/20 bg-gold-500/[0.05] rounded-lg p-3 text-center">
                  <p className="text-[#8A8070] text-[10px] uppercase tracking-wider mb-1">Vos chances ce soir</p>
                  <p className="text-gold-400 text-xl font-black">
                    {winChance < 0.01 ? '< 0.01' : winChance.toFixed(2)}%
                  </p>
                  <p className="text-[#8A8070] text-[10px] mt-0.5">
                    1 sur {oneIn.toLocaleString('fr-FR')} · {totalTicketsInDraw} ticket{totalTicketsInDraw > 1 ? 's' : ''} en jeu
                  </p>
                </div>
              );
            })()}
            <div className="mt-3 text-[10px] text-[#8A8070]/60 space-y-1 border-t border-white/[0.05] pt-2.5">
              <p>
                Les tickets de loterie sont un produit à haut risque. Vous pouvez perdre 100% du montant investi. Ne jouez jamais avec de l&apos;argent que vous ne pouvez pas vous permettre de perdre.
              </p>
              <p>
                En achetant des tickets, vous confirmez être majeur dans votre pays et que la participation aux loteries en ligne est autorisée dans votre juridiction.
              </p>
            </div>
            {isLive && txHash && (
              <div className="text-xs text-gold-400 text-center mt-2">
                Transaction confirmée —{' '}
                <a href={`${BASESCAN_TX_URL}${txHash}`} target="_blank" rel="noreferrer" className="underline">
                  voir sur BaseScan
                </a>
              </div>
            )}
          </div>
        </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          {isLive && user?.isCustodial && (
            <div className="mb-3 border border-gold-500/20 rounded-xl p-2.5 text-center bg-gold-500/[0.04]">
              <p className="text-[#8A8070] text-[11px]">
                Paiement via <strong className="text-gold-400">Coinbase Pay</strong> — s&apos;ouvre dans un nouvel onglet
              </p>
            </div>
          )}
          <button
            onClick={handleBuy}
            disabled={processing || !user}
            className="w-full py-4 bg-gold-500 hover:bg-gold-400 rounded-xl font-bold text-base text-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 tracking-wide"
          >
            {processing ? (
              <>
                <Coins className="w-4 h-4 animate-pulse" />
                {isLive && user?.isCustodial ? 'Ouverture Coinbase Pay...' : paymentMethod === 'card' ? 'Traitement...' : 'En cours...'}
              </>
            ) : (
              <>
                {isLive && user?.isCustodial
                  ? `Payer ${totalCost.toFixed(2)}€ via Coinbase Pay`
                  : `Acheter ${totalTicketsInDraw} ticket${totalTicketsInDraw > 1 ? 's' : ''}${bonusTickets > 0 ? ` (+${bonusTickets} bonus)` : ''} — ${totalCost.toFixed(2)}€`}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
    </>
  );
}

