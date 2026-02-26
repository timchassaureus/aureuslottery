'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGroup } from '@/hooks/useGroup';
import toast from 'react-hot-toast';

function short(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function getSecondsUntilDraw(drawDate: string) {
  const target = new Date(`${drawDate}T21:00:00`);
  const now = new Date();
  return Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
}

function formatCountdown(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function JoinGroupPage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const code = (params?.code || '').toUpperCase();
  const { joinGroup, getGroupDetails, isLoading } = useGroup();
  const [group, setGroup] = useState<Awaited<ReturnType<typeof getGroupDetails>>>(null);
  const [amount, setAmount] = useState(20);
  const [countdown, setCountdown] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [lastMemberCount, setLastMemberCount] = useState(0);

  useEffect(() => {
    if (!code) return;
    let mounted = true;
    const fetchGroup = async () => {
      try {
        const supabaseCode = code.startsWith('GRP-') ? code : `GRP-${code}`;
        const details = await (async () => {
          // lookup by code then details by id
          const { createClient } = await import('@/lib/supabase');
          const supabase = createClient();
          const { data: groupRow } = await supabase
            .from('groups')
            .select('id')
            .eq('invite_code', supabaseCode)
            .single();
          if (!groupRow?.id) return null;
          return getGroupDetails(groupRow.id);
        })();

        if (!mounted) return;
        setGroup(details);
        const memberCount = details?.members.length ?? 0;
        if (memberCount > lastMemberCount && lastMemberCount > 0) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 1500);
        }
        setLastMemberCount(memberCount);
      } catch {
        // ignore, handled by null state
      }
    };
    fetchGroup();
    const poll = setInterval(fetchGroup, 8000);
    return () => {
      mounted = false;
      clearInterval(poll);
    };
  }, [code, getGroupDetails, lastMemberCount]);

  useEffect(() => {
    if (!group?.draw_date) return;
    setCountdown(getSecondsUntilDraw(group.draw_date));
    const t = setInterval(() => {
      setCountdown(getSecondsUntilDraw(group.draw_date));
    }, 1000);
    return () => clearInterval(t);
  }, [group?.draw_date]);

  const progress = useMemo(() => {
    if (!group) return 0;
    return Math.min(100, ((group.members.length || 0) / Math.max(1, group.max_members)) * 100);
  }, [group]);

  if (!group) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading group...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-6">
      {showConfetti && (
        <div className="pointer-events-none fixed inset-0 z-50 bg-gradient-to-r from-amber-400/20 via-violet-400/20 to-emerald-400/20 animate-pulse" />
      )}
      <div className="mx-auto max-w-3xl space-y-4">
        <button
          onClick={() => router.push('/groups')}
          className="text-sm text-violet-300 hover:text-violet-200"
        >
          ← Back to groups
        </button>

        <section className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-slate-900 to-violet-950/40 p-5">
          <h1 className="text-2xl font-black text-amber-300">{group.name}</h1>
          <p className="text-sm text-violet-200 mt-1">Code: {group.invite_code}</p>
          <p className="mt-2 text-sm text-slate-200">
            Total pool: <span className="text-emerald-300 font-semibold">${Number(group.total_pool).toFixed(2)}</span>
          </p>
          <p className="text-sm text-slate-200 mt-1">
            9PM draw countdown: <span className="text-amber-200 font-semibold">{formatCountdown(countdown)}</span>
          </p>

          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-xs text-violet-200">
              <span>{group.members.length}/{group.max_members} members joined</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <div className="h-2 rounded-full bg-black/35 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-violet-500 to-amber-400" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-violet-500/30 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold mb-3">Members</h2>
          <div className="space-y-2">
            {group.members.map((member) => (
              <div key={member.id} className="rounded-lg border border-white/10 px-3 py-2 text-sm flex items-center justify-between">
                <span>{short(member.wallet_address)}</span>
                <span className="text-amber-300 font-medium">${Number(member.amount_contributed).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-violet-500/30 bg-slate-900/70 p-5 space-y-3">
          <h2 className="text-lg font-semibold">Join and pay</h2>
          <input
            type="number"
            min={1}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full rounded-lg border border-violet-500/40 bg-slate-900 px-3 py-2"
          />
          <button
            disabled={isLoading}
            onClick={async () => {
              try {
                await joinGroup(group.invite_code, amount);
                toast.success('Successfully joined the group');
              } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Unable to join the group');
              }
            }}
            className="w-full rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 px-4 py-2 font-semibold"
          >
            {isLoading ? 'Processing...' : 'Join and pay'}
          </button>
        </section>
      </div>
    </main>
  );
}

