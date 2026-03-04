'use client';

import { useEffect, useMemo, useState } from 'react';
import { useGroup } from '@/hooks/useGroup';
import { useAppStore, type GroupMember } from '@/lib/store';
import GroupCard from '@/components/GroupCard';
import CreateGroupModal from '@/components/CreateGroupModal';
import toast from 'react-hot-toast';

export default function GroupDashboard() {
  const { wallet, getMyGroups, getGroupDetails, isLoading, leaveGroup } = useGroup();
  const myGroups = useAppStore((s) => s.myGroups);
  const [membersByGroup, setMembersByGroup] = useState<Record<string, GroupMember[]>>({});
  const [openCreate, setOpenCreate] = useState(false);

  useEffect(() => {
    if (!wallet) return;
    getMyGroups().catch((error) => {
      toast.error(error instanceof Error ? error.message : 'Error loading groups');
    });
  }, [wallet, getMyGroups]);

  useEffect(() => {
    let mounted = true;
    const loadMembers = async () => {
      const entries = await Promise.all(
        myGroups.map(async (group) => {
          try {
            const details = await getGroupDetails(group.id);
            return [group.id, details?.members ?? []] as const;
          } catch {
            return [group.id, []] as const;
          }
        })
      );
      if (!mounted) return;
      setMembersByGroup(Object.fromEntries(entries));
    };
    if (myGroups.length > 0) loadMembers();
    return () => {
      mounted = false;
    };
  }, [myGroups, getGroupDetails]);

  const activeGroups = useMemo(() => myGroups.filter((group) => group.status === 'active'), [myGroups]);
  const pastGroups = useMemo(() => myGroups.filter((group) => group.status !== 'active'), [myGroups]);

  return (
    <section className="rounded-2xl border border-amber-500/25 bg-black/40 p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-white">My groups</h2>
          <p className="text-xs text-amber-200/80 mt-1">
            Create your syndicate and split winnings automatically.
          </p>
        </div>
        <button
          onClick={() => setOpenCreate(true)}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-black hover:opacity-90 transition-opacity" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
        >
          Create a new group
        </button>
      </div>

      {!wallet && (
        <div className="mt-4 rounded-xl border border-amber-500/20 bg-black/30 p-4 text-sm text-amber-200/80">
          Connect your wallet to create or join a group.
        </div>
      )}

      {wallet && (
        <>
          <div className="mt-5 space-y-3">
            <h3 className="text-sm font-semibold text-amber-300">Active groups</h3>
            {activeGroups.length === 0 ? (
              <p className="text-sm text-slate-300">No active groups at the moment.</p>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {activeGroups.map((group) => (
                  <div key={group.id} className="space-y-2">
                    <GroupCard
                      group={group}
                      members={membersByGroup[group.id] ?? []}
                      myWallet={wallet}
                      onInvite={async () => {
                        const text = `Join my Aureus group "${group.name}"! Code: ${group.invite_code} - https://aureuslottery.app/group/${group.invite_code}`;
                        await navigator.clipboard.writeText(text);
                        toast.success('Invitation message copied');
                      }}
                    />
                    <button
                      onClick={async () => {
                        try {
                          await leaveGroup(group.id);
                          await getMyGroups();
                          toast.success('You have left the group');
                        } catch (error) {
                          toast.error(error instanceof Error ? error.message : 'Unable to leave the group');
                        }
                      }}
                      className="rounded-lg bg-rose-600/20 hover:bg-rose-600/30 px-3 py-1.5 text-xs text-rose-100"
                    >
                      Leave this group
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-semibold text-amber-300">History</h3>
            {pastGroups.length === 0 ? (
              <p className="text-sm text-slate-300">No group history yet.</p>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {pastGroups.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    members={membersByGroup[group.id] ?? []}
                    myWallet={wallet}
                    won={false}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <CreateGroupModal
        isOpen={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreated={async () => {
          setOpenCreate(false);
          await getMyGroups();
        }}
      />

      {isLoading && (
        <p className="mt-3 text-xs text-amber-200/80">Loading groups...</p>
      )}
    </section>
  );
}

