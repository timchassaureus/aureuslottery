'use client';

import { useState } from 'react';
import { X, Mail, Chrome, Apple } from 'lucide-react';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleEmailSignup = async () => {
    if (!email || !name) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'email',
          email,
          name,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Sauvegarder l'utilisateur localement
        const { saveUser } = await import('@/lib/userStorage');
        saveUser(data.user);
        
        toast.success('Compte créé avec succès ! 🎉');
        onSuccess(data.user);
        onClose();
      } else {
        toast.error('Erreur lors de la création du compte');
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    // TODO: Implémenter Google OAuth
    toast.info('Connexion Google - À venir');
  };

  const handleAppleSignup = async () => {
    // TODO: Implémenter Apple Sign In
    toast.info('Connexion Apple - À venir');
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
          <h2 className="text-3xl font-bold mb-2">Créer un compte</h2>
          <p className="text-purple-200">
            Rejoignez AUREUS Lottery en quelques secondes
          </p>
        </div>

        {/* Email Signup */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Nom / Pseudo
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre nom"
              className="w-full px-4 py-3 bg-purple-800/50 border border-purple-600/50 rounded-xl text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className="w-full px-4 py-3 bg-purple-800/50 border border-purple-600/50 rounded-xl text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            onClick={handleEmailSignup}
            disabled={loading}
            className="w-full py-3 bg-primary-500 hover:bg-primary-600 rounded-xl font-semibold transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Mail className="w-5 h-5" />
            {loading ? 'Création...' : 'Créer avec Email'}
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-purple-600/50"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-purple-900 text-purple-300">Ou</span>
          </div>
        </div>

        {/* Social Signup */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleSignup}
            className="w-full py-3 bg-white hover:bg-gray-100 text-gray-900 rounded-xl font-semibold transition-all hover:scale-105 flex items-center justify-center gap-2"
          >
            <Chrome className="w-5 h-5" />
            Continuer avec Google
          </button>
          <button
            onClick={handleAppleSignup}
            className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold transition-all hover:scale-105 flex items-center justify-center gap-2"
          >
            <Apple className="w-5 h-5" />
            Continuer avec Apple
          </button>
        </div>

        <p className="mt-6 text-xs text-purple-300 text-center">
          En créant un compte, vous acceptez nos conditions d'utilisation.
          Un wallet sera créé automatiquement pour vous.
        </p>
      </div>
    </div>
  );
}

