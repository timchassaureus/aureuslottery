'use client';

import { useState } from 'react';
import { X, CreditCard, Loader } from 'lucide-react';
import { toast } from 'sonner';

interface CardPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number; // Montant en USDC
  userWalletAddress?: string; // Adresse de dépôt de l'utilisateur
  onSuccess: (amount: number) => void;
}

export default function CardPaymentModal({ isOpen, onClose, amount, userWalletAddress, onSuccess }: CardPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'ramp' | 'stripe' | null>(null);

  if (!isOpen) return null;

  const handleRampPayment = async () => {
    setLoading(true);
    try {
      // Récupérer l'adresse de l'utilisateur depuis le localStorage
      const currentUserStr = localStorage.getItem('aureus_current_user');
      if (!currentUserStr) {
        toast.error('Veuillez vous connecter d\'abord');
        setLoading(false);
        return;
      }
      
      const currentUser = JSON.parse(currentUserStr);
      const userAddress = currentUser.walletAddress;
      
      // Appeler l'API Ramp
      const response = await fetch('/api/payment/ramp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress,
          amount,
          currency: 'USDC',
        }),
      });

      const data = await response.json();
      
      if (data.success && data.rampUrl) {
        // Ouvrir Ramp dans une nouvelle fenêtre
        window.open(data.rampUrl, 'ramp', 'width=500,height=700');
        toast.success('Redirection vers Ramp...');
      } else {
        toast.error('Erreur lors de l\'ouverture de Ramp');
      }
    } catch (error) {
      console.error('Ramp error:', error);
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleStripePayment = async () => {
    setLoading(true);
    try {
      // Créer une session Stripe
      const response = await fetch('/api/payment/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount * 100, // Stripe utilise les centimes
          currency: 'usd',
        }),
      });

      const data = await response.json();
      
      if (data.success && data.sessionId) {
        // Rediriger vers Stripe Checkout
        // En production, utiliser Stripe Checkout
        toast.success('Redirection vers Stripe...');
        // window.location.href = data.checkoutUrl;
      } else {
        toast.error('Erreur lors de la création de la session de paiement');
      }
    } catch (error) {
      console.error('Stripe error:', error);
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-purple-900 to-indigo-900 border-2 border-purple-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-full mb-4">
            <CreditCard className="w-8 h-8 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Paiement par carte</h2>
          <p className="text-purple-200">
            Achetez {amount} USDC avec votre carte bancaire
          </p>
        </div>

        <div className="space-y-4">
          {/* Option Ramp (Crypto on-ramp) */}
          <button
            onClick={handleRampPayment}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl font-semibold transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                <span>Payer avec Ramp (Crypto)</span>
              </>
            )}
          </button>

          {/* Option Stripe (Fiat → USDC) */}
          <button
            onClick={handleStripePayment}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl font-semibold transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                <span>Payer avec Stripe (Carte bancaire)</span>
              </>
            )}
          </button>

          <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3 text-sm text-blue-200">
            <p className="font-semibold mb-1">💳 Options de paiement</p>
            <ul className="list-disc list-inside space-y-1 text-blue-100">
              <li><strong>Ramp:</strong> Achat direct de crypto avec carte</li>
              <li><strong>Stripe:</strong> Paiement fiat converti en USDC</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

