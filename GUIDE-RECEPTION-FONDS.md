# 💰 Guide : Recevoir tes 10% sur Base Mainnet

## 🎯 Solution Simple

**Tu reçois directement sur Base Mainnet** → Pas de manipulation compliquée !

## 📋 Configuration

### 1. Créer un Wallet sur Base avec ton Ledger

1. **Ouvre MetaMask** (ou ton wallet)
2. **Ajoute le réseau Base** :
   - Network Name: `Base`
   - RPC URL: `https://mainnet.base.org`
   - Chain ID: `8453`
   - Currency Symbol: `ETH`
   - Block Explorer: `https://basescan.org`

3. **Connecte ton Ledger** et sélectionne le compte que tu veux utiliser

4. **Note l'adresse** : C'est cette adresse que tu vas mettre dans le contrat

### 2. Configurer le Contrat

Quand tu déploies le contrat `AureusLottery`, tu passes ton adresse Ledger comme `treasury` :

```javascript
// Dans le script de déploiement
const treasuryAddress = "0x..."; // Ton adresse Ledger sur Base
```

OU après déploiement, tu peux changer avec :

```javascript
await lottery.setTreasury("0x..."); // Ton adresse Ledger
```

### 3. Comment ça marche

1. **Un joueur achète un ticket** → 1 USDC
2. **Répartition automatique** :
   - 85% → Jackpot (gagnant)
   - 5% → Bonus pot (25 gagnants)
   - **10% → Directement sur ton wallet Ledger** ✅

3. **Tu reçois instantanément** les 10% en USDC sur Base

## 💸 Retirer vers Ethereum (si besoin)

Si tu veux retirer tes USDC de Base vers Ethereum :

### Option 1 : Bridge Officiel Base (Simple)
1. Va sur https://bridge.base.org/
2. Connecte ton wallet
3. Sélectionne USDC
4. Bridge Base → Ethereum
5. **Frais : ~1-2$**

### Option 2 : Garder sur Base (Recommandé)
- **Frais ultra bas** sur Base
- **USDC = USDC** (même valeur partout)
- Tu peux utiliser tes USDC sur Base directement
- Si besoin d'Ethereum plus tard, tu bridges

## 📊 Exemple Concret

**Scénario** : 1000 tickets vendus = 1000 USDC

- **850 USDC** → Jackpot (gagnant)
- **50 USDC** → Bonus pot (25 gagnants)
- **100 USDC** → **Directement sur ton Ledger** ✅

**Tu reçois 100 USDC instantanément sur Base**, pas besoin de faire quoi que ce soit !

## ✅ Avantages

- ✅ **Argent réel** (Base Mainnet)
- ✅ **Réception automatique** (pas de manipulation)
- ✅ **Frais très bas** (~0.001$ par transaction)
- ✅ **USDC = USDC** (même valeur partout)
- ✅ **Retrait facile** vers Ethereum si besoin (bridge simple)

## 🚀 Prochaines Étapes

1. **Déployer sur Base Mainnet** (pas Sepolia)
2. **Configurer ton adresse Ledger** comme treasury
3. **C'est tout !** Les 10% arrivent automatiquement

---

**Note** : BTC n'est pas directement sur Base. Les utilisateurs peuvent :
- Acheter WBTC (Wrapped BTC) sur Base
- Ou utiliser un service comme Ramp qui convertit BTC → USDC directement


