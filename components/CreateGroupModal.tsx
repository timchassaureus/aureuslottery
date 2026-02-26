'use client';

import { useMemo, useState } from 'react';
import { Copy, X } from 'lucide-react';
import { useGroup } from '@/hooks/useGroup';
import toast from 'react-hot-toast';

function getDefaultDrawDate() {
  const d = new Date();
  if (d.getHours() >= 21) d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export default function CreateGroupModal({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}) {
  const { createGroup, isLoading } = useGroup();
  const [name, setName] = useState('');
  const [maxMembers, setMaxMembers] = useState(10);
  const [drawDate, setDrawDate] = useState(getDefaultDrawDate());
  const [myAmount, setMyAmount] = useState(20);
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  const shareText = useMemo(() => {
    if (!inviteCode) return '';
    return `Join my Aureus group "${name}"!\nLet's play together tonight for the jackpot 🎰\nCode: ${inviteCode}\nLink: https://aureuslottery.app/group/${inviteCode}`;
  }, [inviteCode, name]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl border border-amber-500/30 bg-gradient-to-br from-slate-900 to-violet-950/50 p-6">
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-bold text-white">Create a group</h2>
          <button onClick={onClose} className="text-slate-300 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Office colleagues 🏢"
            className="w-full rounded-lg border border-violet-500/40 bg-slate-900/60 px-3 py-2 text-white"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="number"
              min={2}
              max={20}
              value={maxMembers}
              onChange={(e) => setMaxMembers(Number(e.target.value))}
              className="rounded-lg border border-violet-500/40 bg-slate-900/60 px-3 py-2 text-white"
            />
            <input
              type="date"
              value={drawDate}
              onChange={(e) => setDrawDate(e.target.value)}
              className="rounded-lg border border-violet-500/40 bg-slate-900/60 px-3 py-2 text-white"
            />
          </div>
          <input
            type="number"
            min={1}
            step="0.01"
            value={myAmount}
            onChange={(e) => setMyAmount(Number(e.target.value))}
            placeholder="My stake in $"
            className="w-full rounded-lg border border-violet-500/40 bg-slate-900/60 px-3 py-2 text-white"
          />

          <button
            disabled={isLoading || !name.trim()}
            onClick={async () => {
              try {
                const group = await createGroup(name.trim(), maxMembers, drawDate, myAmount);
                setInviteCode(group.invite_code);
                onCreated?.();
                toast.success('Group created');
              } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Error creating group');
              }
            }}
            className="w-full rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 px-4 py-2 font-semibold text-white"
          >
            {isLoading ? 'Creating...' : 'Create the group'}
          </button>
        </div>

        {inviteCode && (
          <div className="mt-5 rounded-xl border border-amber-400/30 bg-amber-500/10 p-4">
            <p className="text-xs text-amber-100">Invite code</p>
            <div className="mt-1 flex items-center justify-between gap-2">
              <p className="text-lg font-black text-amber-300">{inviteCode}</p>
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(inviteCode);
                  toast.success('Code copied');
                }}
                className="rounded-lg bg-slate-800/70 px-2 py-1 text-slate-100 hover:bg-slate-700"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(shareText);
                  toast.success('Message copied');
                }}
                className="rounded-lg border border-white/20 px-3 py-1.5 text-xs text-white"
              >
                Copy message
              </button>
              <a
                target="_blank"
                rel="noreferrer"
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
                className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs text-white"
              >
                Twitter
              </a>
              <a
                target="_blank"
                rel="noreferrer"
                href={`https://t.me/share/url?url=${encodeURIComponent(`https://aureuslottery.app/group/${inviteCode}`)}&text=${encodeURIComponent(shareText)}`}
                className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs text-white"
              >
                Telegram
              </a>
              <a
                target="_blank"
                rel="noreferrer"
                href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs text-white"
              >
                WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

