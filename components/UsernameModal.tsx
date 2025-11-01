'use client';

import { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function UsernameModal() {
  const { user, connected, setUsername } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsernameInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    // Show modal if user is connected but has no username
    if (connected && user && !user.username && !user.telegramUsername) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [connected, user]);

  const validateUsername = (name: string): boolean => {
    // Username rules: 3-20 chars, alphanumeric and underscores only
    const regex = /^[a-zA-Z0-9_]{3,20}$/;
    return regex.test(name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const trimmedUsername = username.trim();
    
    if (!trimmedUsername) {
      toast.error('Please enter a username!');
      return;
    }

    if (!validateUsername(trimmedUsername)) {
      toast.error('Username must be 3-20 characters, letters, numbers, and underscores only!');
      return;
    }

    setIsValidating(true);

    // In future: Check if username is taken (via API/smart contract)
    // For now, just save it
    try {
      setUsername(user.address, trimmedUsername);
      toast.success(`Welcome, ${trimmedUsername}! 🎉`);
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to set username. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-md rounded-xl border border-white/15 bg-gradient-to-br from-indigo-950 via-purple-950 to-blue-950 p-6 text-white shadow-2xl">

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-500/20 to-primary-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-primary-400" />
          </div>
          <h2 className="text-2xl font-black mb-2">
            Choose Your Username
          </h2>
          <p className="text-sm text-slate-400">
            Pick a unique name to represent yourself in AUREUS
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-purple-200">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="Enter your username"
              maxLength={20}
              className="w-full px-4 py-3 bg-purple-900/50 border border-purple-600/50 rounded-xl text-white placeholder-purple-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/50"
              autoFocus
            />
            <p className="mt-2 text-xs text-slate-400">
              3-20 characters • Letters, numbers, and underscores only
            </p>
          </div>

          <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-700/30 rounded-lg p-3">
            <p className="text-xs text-yellow-200 leading-relaxed">
              💡 <strong>Tip:</strong> In the future, if you connect via Telegram, your Telegram username will be used automatically!
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="submit"
              disabled={!username.trim() || isValidating || !validateUsername(username.trim())}
              className="w-full py-3 rounded-lg text-sm font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:scale-105 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isValidating ? 'Setting username...' : '✅ Continue to AUREUS'}
            </button>
            <p className="text-center text-xs text-slate-400 mt-2">
              You must choose a username to continue
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

