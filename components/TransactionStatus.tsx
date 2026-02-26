'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, XCircle, ExternalLink, Clock } from 'lucide-react';
import { BASESCAN_TX_URL } from '@/lib/config';

interface Props {
  txHash?: string | null;
  status: 'pending' | 'confirming' | 'success' | 'error';
  message?: string;
  onComplete?: () => void;
}

export default function TransactionStatus({ txHash, status, message, onComplete }: Props) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (status === 'success' || status === 'error') {
      const timer = setTimeout(() => {
        setShow(false);
        onComplete?.();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status, onComplete]);

  if (!show) return null;

  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-400',
          bg: 'bg-yellow-900/30',
          border: 'border-yellow-500/40',
          text: 'Transaction pending...',
        };
      case 'confirming':
        return {
          icon: Loader2,
          color: 'text-blue-400',
          bg: 'bg-blue-900/30',
          border: 'border-blue-500/40',
          text: 'Confirming on blockchain...',
        };
      case 'success':
        return {
          icon: CheckCircle2,
          color: 'text-green-400',
          bg: 'bg-green-900/30',
          border: 'border-green-500/40',
          text: message || 'Transaction confirmed!',
        };
      case 'error':
        return {
          icon: XCircle,
          color: 'text-red-400',
          bg: 'bg-red-900/30',
          border: 'border-red-500/40',
          text: message || 'Transaction failed',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`fixed top-4 right-4 z-50 ${config.bg} ${config.border} border-2 rounded-xl p-4 shadow-2xl backdrop-blur-sm max-w-sm animate-slide-in-right`}>
      <div className="flex items-start gap-3">
        <div className={`${config.color} flex-shrink-0`}>
          {status === 'confirming' ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Icon className="w-6 h-6" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold ${config.color} mb-1`}>
            {config.text}
          </p>
          {txHash && status !== 'error' && (
            <a
              href={`${BASESCAN_TX_URL}${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 underline"
            >
              View on BaseScan
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {status === 'confirming' && (
            <p className="text-xs text-slate-400 mt-2">
              Waiting for network confirmation...
            </p>
          )}
        </div>
        <button
          onClick={() => {
            setShow(false);
            onComplete?.();
          }}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <XCircle className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
