'use client';

import { useMemo } from 'react';
import type { Group, GroupMember } from '@/lib/store';

function short(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function initials(addr: string) {
  return addr.slice(2, 4).toUpperCase();
}

function colorFor(addr: string) {
  const colors = [
    'bg-violet-600',
    'bg-fuchsia-600',
    'bg-blue-600',
    'bg-emerald-600',
    'bg-violet-600',
  ];
  let hash = 0;
  for (let i = 0; i < addr.length; i += 1) hash = (hash + addr.charCodeAt(i)) % colors.length;
  return colors[hash];
}

export default function GroupCard({
  group,
  members,
  myWallet,
  won,
  onInvite,
}: {
  group: Group;
  members: GroupMember[];
  myWallet?: string | null;
  won?: boolean;
  onInvite?: () => void;
}) {
  const memberCount = members.length;
  const drawDate = new Date(group.draw_date);
  const msLeft = drawDate.getTime() - Date.now();
  const hoursLeft = Math.max(0, Math.floor(msLeft / (1000 * 60 * 60)));
  const progress = Math.min(100, (memberCount / Math.max(1, group.max_members)) * 100);
  const myMember = members.find((m) => m.wallet_address.toLowerCase() === (myWallet || '').toLowerCase());
  const myShare = useMemo(() => Number(myMember?.share_percentage || 0), [myMember]);
  const myContribution = useMemo(() => Number(myMember?.amount_contributed || 0), [myMember]);
  const isCreator = myWallet?.toLowerCase() === group.creator_wallet.toLowerCase();

  return (
    <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-slate-900/90 to-violet-950/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-white font-semibold">{group.name}</h3>
          <p className="text-xs text-violet-200 mt-1">Code: {group.invite_code}</p>
        </div>
        <div className="flex gap-2">
          {isCreator && (
            <span className="rounded-full border border-violet-400/40 bg-violet-500/10 px-2 py-0.5 text-[11px] text-violet-200">
              Creator
            </span>
          )}
          {won && (
            <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-200">
              Winner 🏆
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        {members.slice(0, 5).map((member) => (
          <div
            key={member.id}
            title={short(member.wallet_address)}
            className={`h-7 w-7 rounded-full text-[11px] font-bold text-white flex items-center justify-center ${colorFor(member.wallet_address)}`}
          >
            {initials(member.wallet_address)}
          </div>
        ))}
        {memberCount > 5 && <span className="text-xs text-violet-200">+{memberCount - 5}</span>}
      </div>

      <div className="mt-3">
        <p className="text-2xl font-black text-violet-300">${Number(group.total_pool || 0).toFixed(2)}</p>
        <p className="text-xs text-slate-300">{memberCount} members • ${Number(group.total_pool || 0).toFixed(2)} at stake</p>
      </div>

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-[11px] text-violet-200">
          <span>Group progress</span>
          <span>{memberCount}/{group.max_members}</span>
        </div>
        <div className="h-2 rounded-full bg-black/35 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-violet-500 to-violet-400" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mt-3 text-xs text-violet-100/90">
        <p>My share: <span className="text-violet-300 font-semibold">{myShare.toFixed(2)}%</span> (${myContribution.toFixed(2)})</p>
        <p className="mt-1">Draw in ~{hoursLeft}h</p>
      </div>

      <div className="mt-3 flex gap-2">
        {onInvite && (
          <button
            onClick={onInvite}
            className="rounded-lg bg-violet-600 hover:bg-violet-500 px-3 py-2 text-xs font-medium text-white"
          >
            Invite more friends
          </button>
        )}
        <span className={`rounded-lg px-3 py-2 text-xs font-medium ${
          group.status === 'active'
            ? 'bg-emerald-600/20 text-emerald-200'
            : 'bg-rose-600/20 text-rose-200'
        }`}>
          {group.status === 'active' ? 'Active' : 'Closed'}
        </span>
      </div>
    </div>
  );
}

