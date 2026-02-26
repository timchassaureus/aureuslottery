'use client';

import { useCallback, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { createClient } from '@/lib/supabase';
import { useAppStore, type Group, type GroupMember } from '@/lib/store';
import { emitInAppNotification } from '@/lib/notificationBus';

const CODE_PREFIX = 'GRP-';
const CODE_LENGTH = 5;
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateInviteCode() {
  let s = '';
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    s += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return `${CODE_PREFIX}${s}`;
}

function normalizeWallet(wallet: string | undefined | null): string | null {
  if (!wallet) return null;
  return wallet.toLowerCase().trim();
}

export interface GroupWithMembers extends Group {
  members: GroupMember[];
}

export function useGroup(walletOverride?: string) {
  const { address } = useAccount();
  const wallet = useMemo(
    () => normalizeWallet(walletOverride || address),
    [walletOverride, address]
  );
  const getSupabaseClient = useCallback(() => createClient(), []);
  const setMyGroups = useAppStore((s) => s.setMyGroups);
  const addGroupNotification = useAppStore((s) => s.addGroupNotification);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const notifyGroup = useCallback(
    (
      message: string,
      type: 'join' | 'pool' | 'reminder' | 'win' | 'loss'
    ) => {
      addGroupNotification({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        message,
        type,
        createdAt: Date.now(),
      });
      emitInAppNotification({
        message,
        type: type === 'win' ? 'winner' : type === 'pool' ? 'jackpot' : 'reminder',
      });
    },
    [addGroupNotification]
  );

  const calculateShares = useCallback(
    async (groupId: string) => {
      const supabase = getSupabaseClient();
      const { data: members, error: membersError } = await supabase
        .from('group_members')
        .select('id, amount_contributed')
        .eq('group_id', groupId);
      if (membersError) throw new Error(membersError.message);
      if (!members || members.length === 0) return [];

      const total = members.reduce((sum, m) => sum + Number(m.amount_contributed || 0), 0);
      if (total <= 0) return [];

      const updates = members.map((member) => {
        const share = (Number(member.amount_contributed) / total) * 100;
        return {
          id: member.id,
          share_percentage: Number(share.toFixed(4)),
        };
      });

      for (const update of updates) {
        const { error: updateError } = await supabase
          .from('group_members')
          .update({ share_percentage: update.share_percentage })
          .eq('id', update.id);
        if (updateError) throw new Error(updateError.message);
      }
      return updates;
    },
    [getSupabaseClient]
  );

  const createGroup = useCallback(
    async (name: string, maxMembers: number, drawDate: string, amount: number) => {
      if (!wallet) throw new Error('Wallet non connecté');
      setError(null);
      setIsLoading(true);
      try {
        const supabase = getSupabaseClient();
        const normalizedMax = Math.min(20, Math.max(2, Math.floor(maxMembers)));
        const normalizedAmount = Number(amount);
        if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
          throw new Error('Mise invalide');
        }

        let inviteCode = generateInviteCode();
        for (let attempt = 0; attempt < 8; attempt += 1) {
          const { data: existing } = await supabase
            .from('groups')
            .select('id')
            .eq('invite_code', inviteCode)
            .maybeSingle();
          if (!existing) break;
          inviteCode = generateInviteCode();
        }

        const { data: group, error: groupError } = await supabase
          .from('groups')
          .insert({
            name,
            creator_wallet: wallet,
            invite_code: inviteCode,
            max_members: normalizedMax,
            draw_date: drawDate,
            total_pool: normalizedAmount,
          })
          .select('*')
          .single();
        if (groupError || !group) throw new Error(groupError?.message || 'Création groupe impossible');

        const { error: creatorMemberError } = await supabase.from('group_members').insert({
          group_id: group.id,
          wallet_address: wallet,
          amount_contributed: normalizedAmount,
          share_percentage: 100,
          status: 'paid',
        });
        if (creatorMemberError) throw new Error(creatorMemberError.message);

        await calculateShares(group.id);
        notifyGroup(`🎉 Groupe "${name}" créé avec succès. Code: ${inviteCode}`, 'join');
        return group as Group;
      } finally {
        setIsLoading(false);
      }
    },
    [wallet, getSupabaseClient, calculateShares, notifyGroup]
  );

  const joinGroup = useCallback(
    async (inviteCode: string, amount: number) => {
      if (!wallet) throw new Error('Wallet non connecté');
      setError(null);
      setIsLoading(true);
      try {
        const supabase = getSupabaseClient();
        const normalizedAmount = Number(amount);
        if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
          throw new Error('Mise invalide');
        }

        const { data: group, error: groupError } = await supabase
          .from('groups')
          .select('*')
          .eq('invite_code', inviteCode.toUpperCase())
          .eq('status', 'active')
          .single();
        if (groupError || !group) throw new Error('Groupe introuvable');

        const { data: members, error: membersError } = await supabase
          .from('group_members')
          .select('id, wallet_address')
          .eq('group_id', group.id);
        if (membersError) throw new Error(membersError.message);

        if ((members?.length ?? 0) >= group.max_members) {
          throw new Error('Ce groupe est complet');
        }
        if (members?.some((m) => m.wallet_address.toLowerCase() === wallet)) {
          throw new Error('Tu es déjà dans ce groupe');
        }

        const { error: joinError } = await supabase.from('group_members').insert({
          group_id: group.id,
          wallet_address: wallet,
          amount_contributed: normalizedAmount,
          share_percentage: 0,
          status: 'paid',
        });
        if (joinError) throw new Error(joinError.message);

        const nextPool = Number(group.total_pool || 0) + normalizedAmount;
        const { error: poolError } = await supabase
          .from('groups')
          .update({ total_pool: nextPool })
          .eq('id', group.id);
        if (poolError) throw new Error(poolError.message);

        await calculateShares(group.id);
        notifyGroup(`🎉 ${wallet.slice(0, 6)}... a rejoint ton groupe !`, 'join');
        notifyGroup(`💰 Le pool de ${group.name} est maintenant à ${nextPool.toFixed(2)}$`, 'pool');
      } finally {
        setIsLoading(false);
      }
    },
    [wallet, getSupabaseClient, calculateShares, notifyGroup]
  );

  const getGroupDetails = useCallback(
    async (groupId: string): Promise<GroupWithMembers | null> => {
      const supabase = getSupabaseClient();
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single();
      if (groupError || !group) return null;

      const { data: members, error: membersError } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId)
        .order('joined_at', { ascending: true });
      if (membersError) throw new Error(membersError.message);

      return {
        ...(group as Group),
        total_pool: Number(group.total_pool || 0),
        members: (members ?? []).map((m) => ({
          ...m,
          amount_contributed: Number(m.amount_contributed || 0),
          share_percentage: Number(m.share_percentage || 0),
        })),
      };
    },
    [getSupabaseClient]
  );

  const getMyGroups = useCallback(async () => {
    if (!wallet) {
      setMyGroups([]);
      return [];
    }
    const supabase = getSupabaseClient();
    setError(null);
    const { data: memberRows, error: memberRowsError } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('wallet_address', wallet);
    if (memberRowsError) throw new Error(memberRowsError.message);

    const groupIds = [...new Set((memberRows ?? []).map((m) => m.group_id))];
    if (groupIds.length === 0) {
      setMyGroups([]);
      return [];
    }

    const { data: groups, error: groupsError } = await supabase
      .from('groups')
      .select('*')
      .in('id', groupIds)
      .order('created_at', { ascending: false });
    if (groupsError) throw new Error(groupsError.message);

    const normalized = (groups ?? []).map((group) => ({
      ...(group as Group),
      total_pool: Number(group.total_pool || 0),
    }));
    setMyGroups(normalized);
    return normalized;
  }, [wallet, getSupabaseClient, setMyGroups]);

  const distributeWinnings = useCallback(
    async (groupId: string, totalWon: number) => {
      const normalizedTotalWon = Number(totalWon);
      if (!Number.isFinite(normalizedTotalWon) || normalizedTotalWon <= 0) {
        throw new Error('Montant invalide');
      }
      setError(null);
      setIsLoading(true);
      try {
        const supabase = getSupabaseClient();
        const details = await getGroupDetails(groupId);
        if (!details) throw new Error('Groupe introuvable');
        const totalPool = details.members.reduce((sum, member) => sum + Number(member.amount_contributed || 0), 0);
        if (totalPool <= 0) throw new Error('Pool vide');

        const { error: insertWinningsError } = await supabase.from('group_winnings').insert({
          group_id: groupId,
          total_won: normalizedTotalWon,
          draw_date: new Date().toISOString(),
          distributed: true,
        });
        if (insertWinningsError) throw new Error(insertWinningsError.message);

        for (const member of details.members) {
          const sharePercentage = (Number(member.amount_contributed) / totalPool) * 100;
          const { error: memberUpdateError } = await supabase
            .from('group_members')
            .update({
              share_percentage: Number(sharePercentage.toFixed(4)),
              status: 'won',
            })
            .eq('id', member.id);
          if (memberUpdateError) throw new Error(memberUpdateError.message);
        }

        const me = details.members.find((member) => member.wallet_address.toLowerCase() === wallet);
        if (me) {
          const myShare = (Number(me.amount_contributed) / totalPool) * normalizedTotalWon;
          notifyGroup(
            `🏆 Ton groupe ${details.name} a gagné ${normalizedTotalWon.toFixed(2)}$ ! Ta part : ${myShare.toFixed(2)}$`,
            'win'
          );
        } else {
          notifyGroup(
            `🏆 Le groupe ${details.name} a gagné ${normalizedTotalWon.toFixed(2)}$`,
            'win'
          );
        }
      } finally {
        setIsLoading(false);
      }
    },
    [getGroupDetails, getSupabaseClient, wallet, notifyGroup]
  );

  const leaveGroup = useCallback(
    async (groupId: string) => {
      if (!wallet) throw new Error('Wallet non connecté');
      setError(null);
      setIsLoading(true);
      try {
        const supabase = getSupabaseClient();
        const { data: membership, error: membershipError } = await supabase
          .from('group_members')
          .select('id, amount_contributed')
          .eq('group_id', groupId)
          .eq('wallet_address', wallet)
          .single();
        if (membershipError || !membership) throw new Error('Membre introuvable');

        const amount = Number(membership.amount_contributed || 0);
        const { error: deleteError } = await supabase
          .from('group_members')
          .delete()
          .eq('id', membership.id);
        if (deleteError) throw new Error(deleteError.message);

        const { data: group, error: groupError } = await supabase
          .from('groups')
          .select('total_pool')
          .eq('id', groupId)
          .single();
        if (!groupError && group) {
          const nextPool = Math.max(0, Number(group.total_pool || 0) - amount);
          await supabase.from('groups').update({ total_pool: nextPool }).eq('id', groupId);
        }

        await calculateShares(groupId);
      } finally {
        setIsLoading(false);
      }
    },
    [wallet, getSupabaseClient, calculateShares]
  );

  return {
    wallet,
    isLoading,
    error,
    createGroup,
    joinGroup,
    getGroupDetails,
    getMyGroups,
    calculateShares,
    distributeWinnings,
    leaveGroup,
  };
}

