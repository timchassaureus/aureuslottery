'use client';

import { useState } from 'react';
import { Wallet, Loader } from 'lucide-react';
import { connectWallet, disconnectWallet } from '@/lib/web3';
import { useAppStore } from '@/lib/store';
import { getDisplayName } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function WalletButton() {
  const { connected, user, connectWallet: connectStore, disconnectWallet: disconnectStore } = useAppStore();
  const [connecting, setConnecting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const address = await connectWallet();
      connectStore(address);
      toast.success('Wallet connected successfully! 🎉');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
    disconnectStore();
    setShowDropdown(false);
    toast.success('Wallet disconnected');
  };

  if (connected && user) {
    // Mock balance for now - will be real when connected to blockchain
    const mockBalance = 47.50;
    const userTicketsCount = user.tickets.length;

    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-3 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-xl font-semibold transition-all hover:scale-105"
        >
          <Wallet className="w-5 h-5" />
          <div className="hidden md:flex flex-col items-start text-left">
            <span className="text-xs text-green-200">
              {mockBalance.toFixed(2)} USDC
            </span>
            <span className="text-xs text-green-200">
              {userTicketsCount} ticket{userTicketsCount !== 1 ? 's' : ''}
            </span>
          </div>
          <span className="hidden lg:inline text-sm">
            {getDisplayName(user.address, user.username, user.telegramUsername)}
          </span>
        </button>

        {showDropdown && (
          <>
            <div 
              className="fixed inset-0 z-[80]" 
              onClick={() => setShowDropdown(false)}
            />
            <div className="absolute md:absolute right-0 top-full mt-2 w-64 md:w-64 max-w-[calc(100vw-2rem)] bg-purple-900 border border-purple-600/50 rounded-xl shadow-2xl z-[90] overflow-hidden">
              <div className="p-4 border-b border-purple-600/30">
                <p className="text-xs text-purple-300 mb-1">Wallet Address</p>
                <p className="font-mono text-sm">{user.address}</p>
              </div>
              <div className="p-4 border-b border-purple-600/30">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-purple-300">Balance:</span>
                  <span className="font-bold">{mockBalance.toFixed(2)} USDC</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-300">Tickets:</span>
                  <span className="font-bold">{userTicketsCount}</span>
                </div>
              </div>
              <button
                onClick={handleDisconnect}
                className="w-full p-3 text-left hover:bg-purple-800 transition-colors text-red-400 font-semibold"
              >
                Disconnect Wallet
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={connecting}
      className="flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 rounded-xl font-semibold transition-all hover:scale-105 disabled:opacity-50"
    >
      {connecting ? (
        <Loader className="w-5 h-5 animate-spin" />
      ) : (
        <Wallet className="w-5 h-5" />
      )}
      {connecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}

