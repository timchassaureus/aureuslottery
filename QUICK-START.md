# 🚀 Guide de Démarrage Rapide - AUREUS

## Configuration Initiale

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```bash
cp env.example .env.local
```

Puis éditez `.env.local` avec vos valeurs :

```env
# Mode opérationnel (recommandé pour production)
NEXT_PUBLIC_DEFAULT_MODE=live
NEXT_PUBLIC_FORCE_MODE=live

# Configuration réseau Base Sepolia
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org

# Adresses des smart contracts
NEXT_PUBLIC_LOTTERY_ADDRESS=0xe94cFa075B46966e17Ad3Fc6d0676Eb9552ECEc6
NEXT_PUBLIC_USDC_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e

# Adresse du propriétaire (pour les contrôles admin)
NEXT_PUBLIC_OWNER_ADDRESS=votre_adresse_ici

# Explorer blockchain
NEXT_PUBLIC_BASESCAN_TX_URL=https://sepolia.basescan.org/tx/
```

### 3. Lancer l'application

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## Mode Opérationnel (Live)

Avec `NEXT_PUBLIC_FORCE_MODE=live`, l'application :

- ✅ Se lance directement en mode opérationnel
- ✅ Se connecte automatiquement à Base Sepolia
- ✅ Synchronise les données depuis la blockchain
- ✅ Permet l'achat de tickets avec USDC réel
- ✅ Bloque le retour en mode démo

## Fonctionnalités Principales

### Connexion Wallet
1. Cliquez sur "Connect Wallet"
2. Autorisez la connexion dans MetaMask
3. Votre solde USDC et vos tickets s'affichent

### Achat de Tickets
1. Cliquez sur "Buy Tickets Now"
2. Choisissez le nombre de tickets
3. Les remises sont appliquées automatiquement (5, 10, 20, 50, 100, 1000 tickets)
4. Confirmez la transaction dans MetaMask

### Tirage au Sort
- **Tirage principal (9PM UTC)** : Un gagnant remporte 85% du jackpot
- **Tirage bonus (9:30PM UTC)** : 25 gagnants se partagent 5% du pot

### Contrôles Admin
Si vous êtes le propriétaire (`NEXT_PUBLIC_OWNER_ADDRESS`), vous pouvez :
- Déclencher le tirage principal
- Déclencher le tirage bonus

## Dépannage

### L'application ne se connecte pas à la blockchain

1. Vérifiez que MetaMask est installé
2. Vérifiez que vous êtes sur le réseau Base Sepolia (Chain ID: 84532)
3. Vérifiez que `NEXT_PUBLIC_RPC_URL` est correct

### Erreur "Failed to fetch lottery state"

1. Vérifiez que `NEXT_PUBLIC_LOTTERY_ADDRESS` est correct
2. Vérifiez que le contrat est déployé sur Base Sepolia
3. Vérifiez votre connexion internet

### Les transactions échouent

1. Vérifiez que vous avez assez d'USDC
2. Vérifiez que vous avez assez d'ETH pour les frais de gas
3. Vérifiez que l'approbation USDC a été effectuée

## Production

Pour déployer en production :

1. Configurez `NEXT_PUBLIC_FORCE_MODE=live` dans votre `.env.local`
2. Déployez sur Vercel, Netlify, ou votre hébergeur préféré
3. Configurez les variables d'environnement dans votre plateforme de déploiement

## Support

Pour toute question ou problème, consultez :
- Le README.md pour la documentation complète
- Les logs de la console du navigateur pour les erreurs
- BaseScan pour vérifier les transactions : https://sepolia.basescan.org

