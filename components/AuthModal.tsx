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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative border-2 border-[#C9A84C]/ rounded-2xl p-6 max-w-md w-full shadow-2xl" style={{ background: 'linear-gradient(160deg, #0e0d1a 0%, #09090f 100%)' }}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold mb-2">
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </h2>
          <p className="text-[#F5F0E8]/">
            {mode === 'login'
              ? 'Access your AUREUS account'
              : 'Join AUREUS Lottery in seconds'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
          {mode === 'register' && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C9A84C]" />
              <input
                type="text"
                name="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Username"
                autoComplete="name"
                className="w-full pl-10 pr-4 py-3 bg-black/40 border border-[#C9A84C]/ rounded-xl text-white placeholder-[#8A8A95]/60 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C9A84C]" />
            <input
              type="email"
              name="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              autoComplete="email"
              className="w-full pl-10 pr-4 py-3 bg-black/40 border border-[#C9A84C]/ rounded-xl text-white placeholder-[#8A8A95]/60 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C9A84C]" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password (6 characters min.)"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className="w-full pl-10 pr-12 py-3 bg-black/40 border border-[#C9A84C]/ rounded-xl text-white placeholder-[#8A8A95]/60 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C9A84C] hover:text-white"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl font-bold text-lg transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Mail className="w-5 h-5" />
            {loading
              ? mode === 'login' ? 'Signing in...' : 'Creating...'
              : mode === 'login' ? 'Sign in' : 'Create my account'}
          </button>
        </form>

        <div className="mt-5 text-center">
          <button
            onClick={switchMode}
            className="text-[#e8c97a] hover:text-white text-sm transition-colors"
          >
            {mode === 'login'
              ? "No account yet? → Create account"
              : 'Already have an account? → Sign in'}
          </button>
        </div>

        <p className="mt-4 text-xs text-[#C9A84C]/ text-center">
          By using AUREUS, you agree to our terms of service.
        </p>
      </div>
    </div>
  );
}
