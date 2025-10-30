# 📖 Guide d'utilisation - AUREUS

## 🚀 Démarrage rapide

### Lancer l'application

```bash
npm run dev
```

Puis ouvrez [http://localhost:3000](http://localhost:3000)

## 🎮 Utilisation de l'application

### 1. Connexion du portefeuille

1. Cliquez sur le bouton "Connect Wallet" en haut à droite
2. Un faux portefeuille sera créé automatiquement
3. Votre adresse s'affichera (raccourcie)
4. Vous pouvez cliquer à nouveau pour déconnecter

### 2. Acheter des tickets

1. Assurez-vous d'être connecté
2. Cliquez sur "Buy Tickets Now"
3. Dans la modale, sélectionnez le nombre de tickets (1-100)
4. Les réductions s'appliquent automatiquement:
   - 5+ tickets: 5% de réduction
   - 10+ tickets: 10% de réduction
   - 20+ tickets: 15% de réduction
   - 50+ tickets: 20% de réduction
5. Le coût total (avec réduction) et le nouveau jackpot s'affichent
6. Cliquez sur "Buy X Tickets" pour confirmer
7. Vos tickets sont maintenant dans le tirage en cours
8. Votre niveau utilisateur s'affiche automatiquement sous le jackpot

### 3. Effectuer un tirage

1. Cliquez sur le bouton "Perform Draw"
2. Attendez que le tirage se termine
3. Un gagnant est sélectionné aléatoirement parmi tous les tickets
4. 85% du jackpot va au gagnant
5. Le prochain tirage commence avec le jackpot de départ

### 4. Utiliser la fonctionnalité RIDE

1. Connectez votre portefeuille
2. Cliquez sur "RIDE Feature"
3. Entrez un montant à risquer (minimum 10 USDC)
4. Vous payez 50% du montant
5. 50% de chance de gagner 10×, 50% de chance de perdre
6. Les résultats sont affichés immédiatement

### 5. Chat avec la communauté

1. Achetez au moins un ticket
2. Cliquez sur l'icône de chat (en bas à droite)
3. Écrivez des messages et discutez avec les autres participants
4. Seuls les détenteurs de tickets peuvent chatter

### 6. Suivre votre niveau

1. Achetez des tickets pour monter de niveau
2. Votre niveau s'affiche sous le jackpot:
   - Bronze: 0 ticket
   - Amateur: 10+ tickets (Silver)
   - Expert: 50+ tickets (Gold)
   - Maître: 100+ tickets (Platinum)
   - Légende: 500+ tickets (Crown)
3. La barre de progression montre l'avancement vers le prochain niveau

### 7. Voir l'historique

1. Cliquez sur l'icône "History" dans l'en-tête
2. Consultez tous les tirages récents
3. Si vous avez gagné, vous verrez un badge "YOU!" vert
4. Voir les montants des prix distribués

## 🎯 Fonctionnalités principales

### 💰 Jackpot

- Le jackpot commence à 42,500 USDC
- Il augmente avec chaque ticket acheté (+1 USDC par ticket)
- Affiché en temps réel

### 🎫 Tickets

- Prix: 1 USDC par ticket
- Chaque ticket est unique avec un ID
- Liés à votre adresse de portefeuille
- Apparaissent dans le tirage actuel uniquement

### 🏆 Tirages

- Automatisés (peuvent être déclenchés manuellement)
- Sélection aléatoire parmi tous les tickets
- Distribution:
  - 85% au gagnant
  - 10% brûlés (déflationniste)
  - 5% au trésor (jackpot suivant)

### 🔥 RIDE

- Risque 50% pour une chance de gagner 10×
- Probabilité: 50/50
- Exemple: Si vous misez 100 USDC
  - Vous payez: 50 USDC
  - Vous pouvez gagner: 1000 USDC
  - Vous pouvez perdre: 50 USDC

## 📊 Économie

### Distribution du jackpot

```
100% Jackpot
├── 85% → Gagnant (prize)
├── 10% → Brûlé (burn)
└── 5% → Trésor (nouveau jackpot)
```

### Fonctionnalité RIDE

```
Mise initiale: 100 USDC
├── Coût effectif: 50 USDC
├── Si vous gagnez: 1000 USDC
└── Si vous perdez: -50 USDC
```

## 🔧 Technologie

- **Next.js 16** - Framework React
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styling
- **Zustand** - Gestion d'état
- **Lucide React** - Icônes

## ⚠️ Notes importantes

1. **Ceci est une simulation**: Les transactions blockchain réelles ne sont pas implémentées
2. **Portefeuille factice**: Un faux portefeuille est généré pour les démos
3. **Données en mémoire**: Les données sont stockées en mémoire, pas de persistence
4. **Production**: Pour un déploiement réel, implémentez des smart contracts

## 🐛 Dépannage

### L'application ne démarre pas

```bash
npm install
npm run dev
```

### Erreurs de port

Port 3000 déjà utilisé? Changez-le:

```bash
PORT=3001 npm run dev
```

### Problèmes de cache

```bash
rm -rf .next
npm run dev
```

## 📚 Prochaines étapes pour la production

1. Implémenter des smart contracts sur Ethereum/Polygon
2. Utiliser Chainlink VRF pour le vrai aléatoire
3. Ajouter un système d'authentification multi-signature
4. Audit de sécurité
5. Tests complets
6. Compliance réglementaire

---

Bon jeu! 🎮

