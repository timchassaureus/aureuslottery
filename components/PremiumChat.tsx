'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Users, Crown, Sparkles } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { getDisplayName, getShortAddress } from '@/lib/utils';

interface Message {
  id: string;
  author: string;
  address: string;
  text: string;
  timestamp: number;
  level?: 'legend' | 'master' | 'expert' | 'amateur' | 'beginner';
}

function getLevel(tickets: number): 'legend' | 'master' | 'expert' | 'amateur' | 'beginner' {
  if (tickets >= 500) return 'legend';
  if (tickets >= 100) return 'master';
  if (tickets >= 50) return 'expert';
  if (tickets >= 10) return 'amateur';
  return 'beginner';
}

function getLevelIcon(level: string) {
  switch (level) {
    case 'legend': return '👑';
    case 'master': return '💎';
    case 'expert': return '🏆';
    case 'amateur': return '⭐';
    default: return '🎯';
  }
}

export default function PremiumChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const { user, connected } = useAppStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialMessages: Message[] = [
      {
        id: '1',
        author: 'LotteryBot',
        address: '0xBot',
        text: 'Welcome to AUREUS! 🎰 Today\'s jackpot is incredible!',
        timestamp: Date.now() - 30000,
        level: 'expert',
      },
      {
        id: '2',
        author: '0x742d35',
        address: '0x742d35Cc6634C0532925a3b8D8F3DFE6F3A9a1b9',
        text: 'Thanks to all participants! 🔥',
        timestamp: Date.now() - 20000,
        level: 'legend',
      },
    ];
    setMessages(initialMessages);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !user) return;

    const message: Message = {
      id: Date.now().toString(),
      author: getDisplayName(user.address, user.username, user.telegramUsername),
      address: user.address,
      text: input,
      timestamp: Date.now(),
      level: getLevel(user.lifetimeTickets),
    };

    setMessages([...messages, message]);
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasTickets = user && user.tickets.length > 0;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 md:bottom-6 right-4 md:right-6 w-14 h-14 md:w-16 md:h-16 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all z-[60] hover:shadow-purple-500/50"
      >
        <MessageCircle className="w-6 h-6 md:w-7 md:h-7" />
        {messages.length > 2 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center font-bold animate-pulse text-[10px] md:text-xs">
            {messages.length - 2}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-3 md:p-4">
          <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 border-2 border-purple-500/30 rounded-3xl p-4 md:p-6 w-full max-w-2xl h-[85vh] md:h-[700px] flex flex-col relative shadow-2xl">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10 text-2xl"
            >
              ✕
            </button>

            <div className="flex items-center justify-between mb-6 pb-4 border-b border-purple-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-primary-500/20 to-primary-600/20 rounded-xl">
                  <MessageCircle className="w-6 h-6 text-primary-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">AUREUS Chat</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Users className="w-4 h-4 text-purple-300" />
                    <span className="text-sm text-purple-300">
                      {messages.length + 156} connected
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-900/30 rounded-full border border-green-700/50">
                <Sparkles className="w-4 h-4 text-green-400" />
                <span className="text-xs text-green-400 font-semibold">Premium</span>
              </div>
            </div>

            <div className="flex-1 bg-purple-950/50 rounded-xl p-4 overflow-y-auto space-y-3 mb-4 border border-purple-800/50">
              {messages.map((message) => {
                const isUser = message.address === user?.address;
                const levelIcon = getLevelIcon(message.level || 'beginner');
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 ${
                        isUser
                          ? 'bg-gradient-to-r from-primary-500/20 to-primary-600/20 border border-primary-500/30'
                          : 'bg-purple-800/30 border border-purple-700/30'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{levelIcon}</span>
                        <span className="text-sm font-bold text-primary-400">
                          {message.author}
                        </span>
                        <span className="text-xs text-purple-400">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{message.text}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {!hasTickets && (
              <div className="mb-4 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-xl">
                <p className="text-sm text-yellow-300 text-center">
                  💡 Buy a ticket to participate in the chat!
                </p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={connected && hasTickets ? "Write a message..." : "Connect and buy a ticket to chat"}
                disabled={!connected || !hasTickets}
                className="flex-1 px-4 py-3 bg-purple-950/70 border border-purple-700/50 rounded-xl text-white placeholder-purple-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || !connected || !hasTickets}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-xl font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

