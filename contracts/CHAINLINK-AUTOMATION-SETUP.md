# ⏰ Chainlink Automation Setup - 2 Minutes Interval

Guide pour configurer Chainlink Automation pour les tirages automatiques avec 2 minutes d'intervalle.

## 🎯 Configuration Cible

- **Main Draw:** 21:00 UTC (tous les jours)
- **Bonus Draw:** 21:30 UTC (30 minutes après le main draw)

## 📋 Étapes de Configuration

### 1. Créer les Upkeep Jobs sur Chainlink Automation

Allez sur: https://automation.chain.link/

#### Job 1: Main Draw (21:00 UTC)

1. Cliquez "Create Upkeep"
2. **Name:** `Aureus Main Draw`
3. **Target Contract:** Votre adresse de contrat AureusLottery
4. **Function:** `requestMainDraw()` (0 arguments)
5. **Trigger:** Time-based (Cron)
6. **Cron Expression:** `0 21 * * *` (21:00 UTC tous les jours)
7. **Gas Limit:** 500,000
8. **Starting Balance:** 1 ETH (pour payer le gas)

#### Job 2: Bonus Draw (21:30 UTC)

1. Cliquez "Create Upkeep"
2. **Name:** `Aureus Bonus Draw`
3. **Target Contract:** Même adresse AureusLottery
4. **Function:** `requestBonusDraw()` (0 arguments)
5. **Trigger:** Time-based (Cron)
6. **Cron Expression:** `30 21 * * *` (21:30 UTC tous les jours)
7. **Gas Limit:** 500,000
8. **Starting Balance:** 1 ETH (pour payer le gas)

### 2. Financez les Upkeeps

- Chaque upkeep a besoin d'ETH pour payer le gas
- Recommandé: 1-2 ETH par upkeep (pour plusieurs mois)
- Chainlink paie le gas, vous rechargez juste le balance

### 3. Vérification

Après création, vérifiez:
- ✅ Les 2 upkeeps sont "Active"
- ✅ Les balances sont suffisantes (>0.5 ETH)
- ✅ Les cron expressions sont correctes
- ✅ Les fonctions sont bien `requestMainDraw()` et `requestBonusDraw()`

## ⏰ Cron Expressions

**Main Draw (21:00 UTC):**
```
0 21 * * *
```
- `0` = minute 0
- `21` = heure 21 (UTC)
- `*` = tous les jours du mois
- `*` = tous les mois
- `*` = tous les jours de la semaine

**Bonus Draw (21:30 UTC):**
```
30 21 * * *
```
- `30` = minute 30
- `21` = heure 21 (UTC)
- Reste identique

## 💰 Coûts

**Chainlink Automation:**
- Gratuit (pas de fees pour vous)
- Vous payez juste le gas ETH (très bas sur Base L2)
- ~$0.01-0.05 par tirage = ~$0.60-3/mois pour 2 tirages/jour

**Total avec VRF:**
- VRF: ~$200-300/mois (LINK)
- Automation: ~$0.60-3/mois (ETH gas)
- **Total: ~$200-300/mois**

## 🔧 Alternative: Batch en 1 Tirage (Économie 50%)

Si vous voulez économiser sur VRF, vous pouvez faire 1 seul tirage qui sélectionne main + bonus:

**Cron:** `0 21 * * *` (21:00 UTC)
**Function:** `requestCombinedDraw()` (à créer dans le contrat)

**Économie:** ~$100-150/mois (1 VRF au lieu de 2)

## 📝 Notes Importantes

1. **Timezone:** Les cron sont en UTC, vérifiez bien
2. **Gas:** Gardez toujours >0.5 ETH dans chaque upkeep
3. **Monitoring:** Vérifiez les logs quotidiennement les premiers jours
4. **Backup:** Vous pouvez toujours déclencher manuellement si besoin

## 🆘 Troubleshooting

**Upkeep ne se déclenche pas:**
- Vérifiez le balance ETH (>0.5 ETH)
- Vérifiez la cron expression
- Vérifiez que le contrat est bien déployé
- Vérifiez les logs sur automation.chain.link

**Erreur "Insufficient funds":**
- Rechargez le balance de l'upkeep avec ETH

**Tirage ne se finalise pas:**
- Vérifiez que la VRF subscription a assez de LINK
- Vérifiez les logs VRF sur vrf.chain.link

## 🔗 Liens Utiles

- Chainlink Automation: https://automation.chain.link/
- Cron Expression Tester: https://crontab.guru/
- Base Network: https://base.org/
- Chainlink Docs: https://docs.chain.link/automation/

