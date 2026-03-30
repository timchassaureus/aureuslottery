'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import CreateGroupModal from '@/components/CreateGroupModal';

type PublicGroup = {
  id: string;
  name: string;
  invite_code: string;
  max_members: number;
  total_pool: number;
  draw_date: string;
  status: 'active' | 'closed';
};

export default function GroupsPublicPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<PublicGroup[]>([]);
  const [membersByGroup, setMembersByGroup] = useState<Record<string, number>>({});
  const [sortBy, setSortBy] = useState<'pool' | 'spots'>('pool');
  const [openCreate, setOpenCreate] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const supabase = createClient();
      const { data: groupsData } = await supabase
        .from('groups')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      const { data: memberCounts } = await supabase
        .from('group_members')
        .select('group_id');

      if (!mounted) return;
      const counts: Record<string, number> = {};
      (memberCounts ?? []).forEach((row: { group_id: string }) => {
        counts[row.group_id] = (counts[row.group_id] || 0) + 1;
      });
      setMembersByGroup(counts);
      setGroups((groupsData ?? []).map((group) => ({
        ...group,
        total_pool: Number(group.total_pool || 0),
      })));
    };
    load();
    const poll = setInterval(load, 10000);
    return () => {
      mounted = false;
      clearInterval(poll);
    };
  }, []);

  const filtered = useMemo(() => {
    const openGroups = groups.filter((group) => {
      const members = membersByGroup[group.id] || 0;
      return members < group.max_members;
    });
    return openGroups.sort((a, b) => {
      if (sortBy === 'pool') return b.total_pool - a.total_pool;
      const spotsA = a.max_members - (membersByGroup[a.id] || 0);
      const spotsB = b.max_members - (membersByGroup[b.id] || 0);
      return spotsA - spotsB;
    });
  }, [groups, membersByGroup, sortBy]);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-6">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-slate-900 to-[#0A0A0F] p-6">
          <p className="text-sm text-[#F5F0E8]">Social discovery</p>
          <h1 className="mt-1 text-3xl md:text-4xl font-black text-amber-300">Open groups</h1>
          <p className="mt-2 text-sm text-slate-200">
            Join an existing group or create your own to play together in the 9PM draw.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setOpenCreate(true)}
              className="rounded-lg bg-[#C9A84C] hover:bg-[#e8c97a] px-4 py-2 font-semibold"
            >
              Create my own group 🚀
            </button>
            <button
              onClick={() => setSortBy('pool')}
              className={`rounded-lg px-3 py-2 text-sm ${sortBy === 'pool' ? 'bg-amber-500/20 text-amber-200' : 'bg-white/5 text-white'}`}
            >
              Sort by pool
            </button>
            <button
              onClick={() => setSortBy('spots')}
              className={`rounded-lg px-3 py-2 text-sm ${sortBy === 'spots' ? 'bg-amber-500/20 text-amber-200' : 'bg-white/5 text-white'}`}
            >
              Sort by remaining spots
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((group) => {
            const members = membersByGroup[group.id] || 0;
            const remaining = Math.max(0, group.max_members - members);
            return (
              <div key={group.id} className="rounded-2xl border border-[#C9A84C]/30 bg-slate-900/70 p-4">
                <h3 className="text-lg font-semibold">{group.name}</h3>
                <p className="mt-1 text-sm text-slate-300">
                  Pool: <span className="text-emerald-300 font-semibold">${group.total_pool.toFixed(2)}</span>
                </p>
                <p className="mt-1 text-xs text-[#F5F0E8]">
                  {members}/{group.max_members} members • {remaining} spot{remaining > 1 ? 's' : ''} remaining
                </p>
                <p className="mt-1 text-xs text-slate-300">
                  Draw: {group.draw_date} at 9PM UTC
                </p>
                <button
                  onClick={() => router.push(`/group/${group.invite_code}`)}
                  className="mt-3 rounded-lg bg-[#C9A84C] hover:bg-[#e8c97a] px-4 py-2 text-sm font-semibold"
                >
                  Join
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <CreateGroupModal isOpen={openCreate} onClose={() => setOpenCreate(false)} />
    </main>
  );
}

