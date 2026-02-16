# 💰 Configuration Treasury - AUREUS Lottery

## 📍 Adresse Treasury (Ledger)

**Adresse configurée** : `0xa166D2570d4bBfACcEBE7A78a426991b1Fa8f6eC`

Cette adresse recevra automatiquement **10% de tous les tickets vendus** en USDC sur Base Mainnet.

## ✅ Ce qui a été configuré

1. **`lib/config.ts`** : Adresse treasury par défaut
2. **`contracts/scripts/deploy.js`** : Utilise cette adresse par défaut
3. **`contracts/scripts/deploy-with-treasury.js`** : Script dédié avec treasury pré-configuré
4. **`contracts/scripts/set-treasury.js`** : Script pour changer le treasury si contrat déjà déployé

## 🚀 Déploiement

### Option 1 : Nouveau déploiement (recommandé)

```bash
cd contracts
npx hardhat run scripts/deploy-with-treasury.js --network base
```

Le treasury sera automatiquement configuré avec ton adresse Ledger.

### Option 2 : Contrat déjà déployé

Si le contrat est déjà déployé, change le treasury :

```bash
cd contracts
LOTTERY_ADDRESS=0x... npx hardhat run scripts/set-treasury.js --network base
```

## 📊 Comment ça marche

1. **Un joueur achète un ticket** → 1 USDC
2. **Répartition automatique** :
   - 85% → Jackpot (gagnant)
   - 5% → Bonus pot (25 gagnants)
   - **10% → Directement sur `0xa166D2570d4bBfACcEBE7A78a426991b1Fa8f6eC`** ✅

3. **Tu reçois instantanément** les USDC sur Base

## 🔍 Vérifier le Treasury

Après déploiement, vérifie que le treasury est bien configuré :

```bash
# Sur BaseScan
https://basescan.org/address/0x... (adresse du contrat)
# Vérifier la variable "treasury"
```

Ou via Hardhat :

```javascript
const treasury = await lottery.treasury();
console.log("Treasury:", treasury);
```

## 💡 Important

- ✅ L'adresse est configurée par défaut dans tous les scripts
- ✅ Les 10% arrivent automatiquement à chaque achat de ticket
- ✅ Pas besoin de faire quoi que ce soit après le déploiement
- ✅ Tu peux voir tes USDC sur BaseScan ou dans MetaMask (avec réseau Base ajouté)


