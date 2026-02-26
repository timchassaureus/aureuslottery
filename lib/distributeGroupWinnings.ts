import { createServiceClient } from '@/lib/supabase-server';

export interface DistributionRow {
  walletAddress: string;
  amountContributed: number;
  sharePercentage: number;
  wonAmount: number;
}

/**
 * Distribue les gains d'un groupe proportionnellement aux mises.
 * Cette fonction est prévue pour être appelée côté serveur (API/cron).
 */
export async function distributeGroupWinnings(
  groupId: string,
  totalWon: number
): Promise<DistributionRow[]> {
  const supabase = createServiceClient();
  const normalizedTotalWon = Number(totalWon);
  if (!Number.isFinite(normalizedTotalWon) || normalizedTotalWon <= 0) {
    throw new Error('Montant total gagné invalide');
  }

  const { data: members, error: membersError } = await supabase
    .from('group_members')
    .select('id, wallet_address, amount_contributed')
    .eq('group_id', groupId);

  if (membersError) {
    throw new Error(`Erreur récupération membres: ${membersError.message}`);
  }
  if (!members || members.length === 0) {
    throw new Error('Aucun membre trouvé pour ce groupe');
  }

  const totalPool = members.reduce((sum, member) => sum + Number(member.amount_contributed || 0), 0);
  if (totalPool <= 0) {
    throw new Error('Le pool du groupe est vide');
  }

  const distribution: DistributionRow[] = members.map((member) => {
    const amountContributed = Number(member.amount_contributed || 0);
    const sharePercentage = (amountContributed / totalPool) * 100;
    const wonAmount = (normalizedTotalWon * sharePercentage) / 100;
    return {
      walletAddress: member.wallet_address,
      amountContributed,
      sharePercentage: Number(sharePercentage.toFixed(4)),
      wonAmount: Number(wonAmount.toFixed(6)),
    };
  });

  // 1) Enregistrer le gain du groupe
  const { data: insertedWinnings, error: insertWinningsError } = await supabase
    .from('group_winnings')
    .insert({
      group_id: groupId,
      total_won: normalizedTotalWon,
      draw_date: new Date().toISOString(),
      distributed: false,
    })
    .select('id')
    .single();
  if (insertWinningsError) {
    throw new Error(`Erreur insertion gains groupe: ${insertWinningsError.message}`);
  }

  // 2) Mettre à jour les parts des membres et marquer status "won"
  for (const row of distribution) {
    const { error: updateMemberError } = await supabase
      .from('group_members')
      .update({
        share_percentage: row.sharePercentage,
        status: 'won',
      })
      .eq('group_id', groupId)
      .eq('wallet_address', row.walletAddress);

    if (updateMemberError) {
      throw new Error(`Erreur update membre ${row.walletAddress}: ${updateMemberError.message}`);
    }
  }

  // 3) Marquer le groupe comme distribué
  const { error: markDistributedError } = await supabase
    .from('group_winnings')
    .update({ distributed: true })
    .eq('id', insertedWinnings.id);

  if (markDistributedError) {
    throw new Error(`Erreur confirmation distribution: ${markDistributedError.message}`);
  }

  return distribution;
}

