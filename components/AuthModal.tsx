'use client';

import { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (mode === 'register' && !name.trim()) {
      toast.error('Please choose a username');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, email, password, name }),
      });

      const data = await response.json();

      if (data.success) {
        const { saveUser } = await import('@/lib/userStorage');
        saveUser(data.user);
        toast.success(
          mode === 'register'
            ? `Account created! Welcome ${data.user.name} 🎉`
            : `Welcome ${data.user.name} 👋`
        );
        onSuccess(data.user);
        onClose();
      } else {
        toast.error(data.error || 'Login error');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(m => (m === 'login' ? 'register' : 'login'));
    setPassword('');
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative bg-[#0D0D1A] border border-gold-500/20 rounded-2xl p-7 max-w-md w-full shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8A8070] hover:text-[#F5F0E8] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gold-500/10 border border-gold-500/20 rounded-full mb-4">
            <User className="w-5 h-5 text-gold-500" />
          </div>
          <h2 className="text-2xl font-bold text-[#F5F0E8] mb-1 tracking-wide">
            {mode === 'login' ? 'Connexion' : 'Créer un compte'}
          </h2>
          <p className="text-[#8A8070] text-sm">
            {mode === 'login'
              ? 'Accédez à votre compte AUREUS'
              : 'Rejoignez AUREUS en quelques secondes'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3" autoComplete="on">
          {mode === 'register' && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8070]" />
              <input
                type="text"
                name="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Votre prénom"
                autoComplete="name"
                className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-[#F5F0E8] placeholder-[#8A8070]/60 focus:outline-none focus:border-gold-500/50 transition-colors text-sm"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8070]" />
            <input
              type="email"
              name="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="votre@email.com"
              autoComplete="email"
              className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-[#F5F0E8] placeholder-[#8A8070]/60 focus:outline-none focus:border-gold-500/50 transition-colors text-sm"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8070]" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mot de passe (6 caractères min.)"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className="w-full pl-10 pr-12 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-[#F5F0E8] placeholder-[#8A8070]/60 focus:outline-none focus:border-gold-500/50 transition-colors text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8070] hover:text-[#F5F0E8] transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-1 bg-gold-500 hover:bg-gold-400 text-black rounded-xl font-bold text-sm tracking-wide transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading
              ? (mode === 'login' ? 'Connexion...' : 'Création...')
              : (mode === 'login' ? 'Se connecter' : 'Créer mon compte')}
          </button>
        </form>

        <div className="mt-5 text-center">
          <button
            onClick={switchMode}
            className="text-[#8A8070] hover:text-gold-400 text-xs transition-colors"
          >
            {mode === 'login'
              ? "Pas encore de compte ? Créer un compte"
              : 'Déjà un compte ? Se connecter'}
          </button>
        </div>

        <p className="mt-4 text-[10px] text-[#8A8070]/50 text-center">
          En utilisant AUREUS, vous acceptez nos conditions d&apos;utilisation.
        </p>
      </div>
    </div>
  );
}
