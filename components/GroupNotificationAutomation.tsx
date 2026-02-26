'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { emitInAppNotification } from '@/lib/notificationBus';
import { sendBrowserNotification, shouldNotifyOnce } from '@/lib/webNotifications';

function drawDateToTimestamp(drawDate: string) {
  return new Date(`${drawDate}T21:00:00`).getTime();
}

function notify(marker: string, title: string, message: string, type: 'reminder' | 'jackpot' | 'winner') {
  if (!shouldNotifyOnce(marker, 1000 * 60 * 60 * 24)) return;
  emitInAppNotification({ message, type });
  sendBrowserNotification(title, message);
}

export default function GroupNotificationAutomation({ wallet }: { wallet?: string | null }) {
  useEffect(() => {
    if (!wallet) return;
    const normalizedWallet = wallet.toLowerCase();
    let stopped = false;

    const tick = async () => {
      if (stopped) return;
      const supabase = createClient();
      const now = Date.now();
      const dayKey = new Date().toISOString().slice(0, 10);

      const { data: memberships } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('wallet_address', normalizedWallet);
      const ids = [...new Set((memberships ?? []).map((m: { group_id: string }) => m.group_id))];
      if (ids.length === 0) return;

      const { data: groups } = await supabase.from('groups').select('*').in('id', ids);
      for (const group of groups ?? []) {
        const drawTs = drawDateToTimestamp(group.draw_date);
        const diff = drawTs - now;

        // Reminder 1h before draw
        if (diff <= 3600_000 && diff > 3540_000) {
          notify(
            `group-1h-${dayKey}-${group.id}`,
            'Aureus Group Draw in 1 hour',
            `⚡ Only 1 hour left before the draw! Your group ${group.name} has ${Number(group.total_pool || 0).toFixed(2)}$ at stake`,
            'reminder'
          );
        }

        // After draw: check win/loss + close
        if (diff < -15 * 60_000 && group.status === 'active') {
          const { data: winning } = await supabase
            .from('group_winnings')
            .select('total_won')
            .eq('group_id', group.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (winning && Number(winning.total_won || 0) > 0) {
            // calculate personal share
            const { data: members } = await supabase
              .from('group_members')
              .select('wallet_address, amount_contributed')
              .eq('group_id', group.id);
            const totalPool = (members ?? []).reduce(
              (sum: number, m: { amount_contributed: number }) => sum + Number(m.amount_contributed || 0),
              0
            );
            const me = (members ?? []).find(
              (m: { wallet_address: string }) => m.wallet_address.toLowerCase() === normalizedWallet
            );
            const myPart = me && totalPool > 0
              ? (Number(me.amount_contributed || 0) / totalPool) * Number(winning.total_won || 0)
              : 0;

            notify(
              `group-win-${dayKey}-${group.id}`,
              'Group won on Aureus',
              `🏆 Your group ${group.name} won ${Number(winning.total_won || 0).toFixed(2)}$! Your share: ${myPart.toFixed(2)}$`,
              'winner'
            );
          } else {
            notify(
              `group-loss-${dayKey}-${group.id}`,
              'Group result available',
              `😔 Your group ${group.name} did not win this time. Play again tomorrow!`,
              'reminder'
            );
          }

          await supabase.from('groups').update({ status: 'closed' }).eq('id', group.id);
        }
      }
    };

    tick();
    const interval = setInterval(tick, 60_000);
    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, [wallet]);

  return null;
}

