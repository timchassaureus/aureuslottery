'use client';

import { useState } from 'react';
import { Wallet, Loader } from 'lucide-react';
import { connectWallet, disconnectWallet } from '@/lib/web3';
import { useAppStore } from '@/lib/store';
import { getDisplayName } from '@/lib/utils';
import NetworkStatus from './NetworkStatus';
import toast from 'react-hot-toast';

export default function WalletButton() {
  const { connected, user, connectWallet: connectStore, disconnectWallet: disconnectStore, mode, syncOnChainData } = useAppStore();
  const [connecting, setConnecting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleConnect = async () => {
    console.log('🔘 Connect button clicked!');
    
    // Check if MetaMask is installed first
    if (typeof window === 'undefined') {
      console.error('❌ Window is undefined');
      toast.error('This function must be called in a browser environment.', { duration: 6000 });
      return;
    }
    
    if (!window.ethereum) {
      console.error('❌ MetaMask not detected');
      toast.error('MetaMask is not installed. Please install MetaMask to continue.', { duration: 6000 });
      return;
    }
    
    console.log('✅ MetaMask detected, starting connection...');
    setConnecting(true);
    
    try {
      console.log('🔄 Attempting to connect wallet...');
      const address = await connectWallet();
      console.log('✅ Wallet address received:', address);
      
      connectStore(address);
      
      if (mode === 'live') {
        // Force sync to get fresh data from blockchain
        await syncOnChainData(address);
        // Sync again after a short delay to ensure data is fresh
        setTimeout(() => syncOnChainData(address).catch(console.error), 1000);
      }
      
      toast.success('Wallet connected successfully! 🎉');
    } catch (error: any) {
      console.error('❌ Failed to connect wallet:', error);
      
      // Provide specific error messages
      let errorMessage = 'Failed to connect wallet';
      
      if (error?.message) {
        const msg = error.message.toLowerCase();
        
        if (msg.includes('metamask') || msg.includes('wallet')) {
          errorMessage = error.message;
        } else if (msg.includes('rejected') || error.code === 4001) {
          errorMessage = 'Connection rejected. Please approve the connection request in MetaMask.';
        } else if (msg.includes('pending') || error.code === -32002) {
          errorMessage = 'Connection request already pending. Please check your MetaMask window.';
        } else if (msg.includes('network') || msg.includes('chain')) {
          errorMessage = error.message;
        } else if (msg.includes('unlock')) {
          errorMessage = 'Please unlock your MetaMask wallet and try again.';
        } else if (msg.includes('install')) {
          errorMessage = 'MetaMask is not installed. Please install MetaMask to continue.';
        } else {
          errorMessage = error.message.length > 100 
            ? 'Connection failed. Please check your MetaMask and try again.' 
            : error.message;
        }
      } else if (error?.code) {
        if (error.code === 4001) {
          errorMessage = 'Connection rejected. Please approve the connection request.';
        } else if (error.code === -32002) {
          errorMessage = 'Connection request already pending. Please check your MetaMask.';
        }
      }
      
      toast.error(errorMessage, { duration: 6000 });
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
    // Use real balance from blockchain, default to 0 if not available
    const balance = typeof user.usdcBalance === 'number' ? user.usdcBalance : 0;
    const userTicketsCount = user.ticketCount ?? user.tickets.length;

    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-3 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-xl font-semibold transition-all hover:scale-105"
        >
          <Wallet className="w-5 h-5" />
          <div className="hidden md:flex flex-col items-start text-left">
            <span className="text-xs text-green-200">
              {balance.toFixed(2)} USDC
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
                  <span className="font-bold">{balance.toFixed(2)} USDC</span>
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
    <div className="flex items-center gap-2">
      {typeof window !== 'undefined' && window.ethereum && <NetworkStatus />}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('🔘 Button onClick triggered');
          handleConnect();
        }}
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
    </div>
  );
}

