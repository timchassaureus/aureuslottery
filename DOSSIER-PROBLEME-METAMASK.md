# 🦊 Dossier Problème de Connexion MetaMask - Aureus Lottery

## 📋 Résumé Exécutif

**Problème** : L'utilisateur ne peut pas se connecter à MetaMask. Après avoir cliqué sur "Connect Wallet" et validé dans MetaMask, la connexion échoue et il y a un retour à la page d'accueil.

**Stack Technique** :
- Next.js 16 avec App Router
- TypeScript
- Ethers.js v6 (BrowserProvider)
- React 19
- Zustand pour le state management
- MetaMask EIP-1193 Provider

---

## 🐛 Description Détaillée du Problème

### Scénario de Reproduction

1. L'utilisateur clique sur le bouton "Connect Wallet"
2. MetaMask s'ouvre et demande l'autorisation de connexion
3. L'utilisateur valide dans MetaMask
4. **PROBLÈME** : Après validation, la connexion ne fonctionne pas et il y a un retour à la page d'accueil

### Symptômes Observés

- MetaMask détecte correctement la demande de connexion
- L'utilisateur peut valider dans MetaMask
- Mais après validation, l'application ne maintient pas la connexion
- Retour à la page d'accueil (comme si une erreur non gérée causait un rechargement)

---

## 📁 Architecture du Code de Connexion

### Flux de Connexion

```
WalletButton.tsx (UI)
    ↓
handleConnect()
    ↓
connectWallet() [lib/web3.ts]
    ↓
connectOnChainWallet() [lib/blockchain.ts]
    ↓
window.ethereum.request({ method: 'eth_requestAccounts' })
    ↓
connectStore(address) [lib/store.ts]
```

---

## 🔍 Code Actuel - Fichiers Clés

### 1. `components/WalletButton.tsx` - Composant UI

**Responsabilité** : Gère l'interface utilisateur et appelle la fonction de connexion

```typescript
const handleConnect = async () => {
  console.log('🔘 Connect button clicked!');
  
  // Vérification MetaMask
  if (typeof window === 'undefined') {
    toast.error('This function must be called in a browser environment.');
    return;
  }
  
  // Attente pour MetaMask (parfois il charge après le chargement de la page)
  let ethereum = window.ethereum;
  if (!ethereum) {
    for (let i = 0; i < 20; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      if (window.ethereum) {
        ethereum = window.ethereum;
        break;
      }
    }
  }
  
  if (!ethereum) {
    toast.error('MetaMask is not installed...');
    return;
  }
  
  setConnecting(true);
  
  try {
    const address = await connectWallet(); // ← Appel à lib/web3.ts
    connectStore(address); // ← Mise à jour du store
    
    if (mode === 'live') {
      // Sync des données blockchain
      await syncOnChainData(address);
    }
    
    toast.success('Wallet connected successfully! 🎉');
  } catch (error: any) {
    // Gestion d'erreurs détaillée
    toast.error(errorMessage, { duration: 6000 });
  } finally {
    setConnecting(false);
  }
};
```

**Points d'attention** :
- ✅ Vérifie que MetaMask est disponible
- ✅ Attend jusqu'à 2 secondes pour MetaMask
- ✅ Gère les erreurs avec des messages spécifiques
- ⚠️ Appelle `syncOnChainData()` qui peut échouer

---

### 2. `lib/web3.ts` - Wrapper de Connexion

**Responsabilité** : Wrapper simple qui retourne uniquement l'adresse

```typescript
export async function connectWallet(): Promise<string> {
  const { address } = await connectOnChainWallet();
  return address;
}
```

**Points d'attention** :
- Simple wrapper qui appelle `blockchain.ts`
- Retourne uniquement l'adresse (pas le provider/signer)

---

### 3. `lib/blockchain.ts` - Fonction de Connexion Principale

**Responsabilité** : Gère la connexion réelle à MetaMask via EIP-1193

```typescript
export async function connectWallet() {
  try {
    console.log('🔌 Starting wallet connection...');
    
    // Vérifications de base
    if (typeof window === 'undefined') {
      throw new Error('This function must be called in a browser environment.');
    }
    
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
    }
    
    console.log('✅ MetaMask detected');
    
    // REQUÊTE PRINCIPALE - eth_requestAccounts
    let accounts: string[];
    try {
      console.log('📋 Requesting account access via window.ethereum.request...');
      
      const ethereum = window.ethereum;
      if (!ethereum || typeof ethereum.request !== 'function') {
        throw new Error('MetaMask is not properly installed...');
      }
      
      accounts = await ethereum.request({ 
        method: 'eth_requestAccounts' 
      }) as string[];
      
      console.log('✅ Accounts received:', accounts);
    } catch (requestError: any) {
      // Gestion d'erreurs spécifiques
      if (requestError.code === 4001) {
        throw new Error('Connection rejected...');
      } else if (requestError.code === -32002) {
        throw new Error('Connection request already pending...');
      }
      throw new Error(`Connection failed: ${requestError.message}`);
    }
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found...');
    }
    
    const address = accounts[0];
    if (!address || typeof address !== 'string') {
      throw new Error('Failed to get wallet address...');
    }
    
    console.log('✅ Account connected:', address);
    
    // Création du provider et signer
    console.log('🔧 Creating provider and signer...');
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    console.log('✅ Provider and signer created');
    
    // Vérification du réseau (non-bloquant)
    try {
      await ensureWalletProvider();
      console.log('✅ Network verified');
    } catch (networkError: any) {
      console.warn('⚠️ Network issue (but wallet is connected):', networkError);
      // Ne pas throw - le wallet est connecté, le réseau peut être changé plus tard
    }
    
    return { provider, signer, address };
  } catch (error) {
    console.error('❌ Wallet connection error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to connect wallet...');
  }
}
```

**Points d'attention** :
- ✅ Utilise `window.ethereum.request()` directement (API standard)
- ✅ Gère les erreurs MetaMask spécifiques (4001, -32002)
- ✅ Crée le provider et signer après avoir obtenu les comptes
- ⚠️ Vérifie le réseau mais ne fait pas échouer la connexion si le réseau est incorrect
- ⚠️ Retourne `{ provider, signer, address }` mais `web3.ts` n'utilise que `address`

---

### 4. `lib/store.ts` - Fonction `connectWallet` dans le Store

**Responsabilité** : Met à jour l'état de l'application avec les informations du wallet connecté

```typescript
connectWallet: (address) => {
  const { draws, tickets } = get();
  const lifetimeTickets = tickets.filter(t => t.owner === address).length;
  
  // Chargement du username depuis localStorage
  const savedUsername = typeof window !== 'undefined' 
    ? localStorage.getItem(`aureus_username_${address.toLowerCase()}`) || undefined
    : undefined;
  
  const ticketsInDraw = tickets.filter(t => t.owner === address && t.drawNumber === get().currentDrawNumber);
  
  const user: User = {
    address,
    username: savedUsername,
    telegramUsername: undefined,
    tickets: ticketsInDraw,
    ticketCount: ticketsInDraw.length,
    totalSpent: lifetimeTickets * TICKET_PRICE,
    totalWon: 0,
    lifetimeTickets,
  };
  
  // Calcul des gains totaux
  const userWins = draws.filter(d => d.winner === address);
  user.totalWon = userWins.reduce((sum, d) => sum + d.prize, 0);
  
  set({
    connected: true,
    user,
  });
},
```

**Points d'attention** :
- ✅ Met à jour `connected: true` et `user`
- ✅ Charge le username depuis localStorage
- ✅ Calcule les statistiques utilisateur
- ⚠️ Utilise les tickets du store local (pas de sync blockchain immédiate)

---

### 5. `lib/store.ts` - Fonction `syncOnChainData`

**Responsabilité** : Synchronise les données depuis la blockchain (appelée après connexion en mode 'live')

```typescript
syncOnChainData: async (address) => {
  if (get().mode !== 'live') return;
  set({ isSyncing: true });
  try {
    const chain = await fetchLotteryState();
    
    set({
      jackpot: chain.mainPot ?? 0,
      secondaryPot: chain.bonusPot ?? 0,
      currentDrawNumber: chain.currentDrawId,
      draws: chain.draws,
      secondaryDraws: chain.secondaryDraws,
      totalTicketsSold: chain.totalTickets,
      lastSynced: Date.now(),
    });

    const targetAddress = address || get().user?.address;
    if (targetAddress) {
      const userData = await fetchUserState(targetAddress, chain.currentDrawId);
      if (userData) {
        // Mise à jour des données utilisateur depuis la blockchain
        set((state) => ({
          connected: true,
          user: {
            address: targetAddress,
            username: state.user?.username,
            telegramUsername: state.user?.telegramUsername,
            tickets: placeholderTickets,
            ticketCount: userData.ticketCount,
            totalSpent: userData.lifetimeTickets * TICKET_PRICE,
            totalWon: state.user?.totalWon || 0,
            lifetimeTickets: userData.lifetimeTickets,
            usdcBalance: userData.usdcBalance ?? 0,
            pendingClaim: userData.pendingClaim,
          },
        }));
      }
    }
  } catch (error) {
    console.error('Failed to sync on-chain data', error);
    // Ne pas throw - les erreurs de sync ne doivent pas casser l'app
  } finally {
    set({ isSyncing: false });
  }
},
```

**Points d'attention** :
- ⚠️ **POTENTIEL PROBLÈME** : Cette fonction fait des appels RPC à la blockchain
- ⚠️ Si `fetchLotteryState()` ou `fetchUserState()` échouent, cela pourrait causer une erreur non gérée
- ⚠️ Appelée immédiatement après `connectStore()` dans `WalletButton.tsx`
- ⚠️ Il y a aussi un `setTimeout` qui appelle `syncOnChainData()` une deuxième fois après 1 seconde

---

## 🎯 Hypothèses sur la Cause du Problème

### Hypothèse 1 : Erreur dans `syncOnChainData()`
**Probabilité** : ⭐⭐⭐⭐⭐ (Très élevée)

- `syncOnChainData()` est appelée immédiatement après la connexion
- Si une erreur RPC se produit (réseau, timeout, etc.), elle pourrait causer un crash
- Même si l'erreur est catchée, elle pourrait déclencher un re-render qui cause un rechargement

**Solution potentielle** :
- Wrapper `syncOnChainData()` dans un try-catch plus robuste
- Ne pas appeler `syncOnChainData()` immédiatement, mais après un délai
- Vérifier que le provider est bien initialisé avant de faire des appels RPC

### Hypothèse 2 : Problème avec `window.ethereum.request()`
**Probabilité** : ⭐⭐ (Faible)

- Le code semble correct pour utiliser l'API EIP-1193
- Les erreurs sont bien gérées (4001, -32002)
- Mais peut-être que MetaMask retourne une erreur non standard

**Solution potentielle** :
- Ajouter plus de logging pour voir exactement ce que retourne MetaMask
- Vérifier si `accounts` est bien un tableau de strings

### Hypothèse 3 : Erreur React non capturée
**Probabilité** : ⭐⭐⭐ (Moyenne)

- Une erreur dans le re-render après `connectStore()` pourrait causer un crash
- L'`ErrorBoundary` devrait capturer, mais peut-être pas toutes les erreurs

**Solution potentielle** :
- Vérifier l'`ErrorBoundary` et s'assurer qu'il capture bien toutes les erreurs
- Ajouter plus de guards dans les composants qui utilisent `user`

### Hypothèse 4 : Conflit avec d'autres extensions
**Probabilité** : ⭐⭐ (Faible)

- D'autres extensions wallet pourraient interférer avec `window.ethereum`
- MetaMask pourrait ne pas être le provider principal

**Solution potentielle** :
- Vérifier que `window.ethereum.isMetaMask === true`
- Utiliser `window.ethereum.providers` si plusieurs wallets sont installés

### Hypothèse 5 : Problème avec le store Zustand
**Probabilité** : ⭐⭐ (Faible)

- `connectStore()` met à jour le store, ce qui déclenche un re-render
- Si le re-render cause une erreur, cela pourrait casser l'app

**Solution potentielle** :
- Vérifier que tous les composants qui utilisent `user` gèrent le cas où `user` est `null`
- S'assurer que `user.address` est toujours défini après `connectStore()`

---

## 🔧 Points à Vérifier et Corriger

### 1. ✅ Vérifier les Logs Console

Ouvrir la console du navigateur et vérifier :
- Est-ce que `✅ Account connected: 0x...` apparaît ?
- Est-ce qu'il y a une erreur après cette ligne ?
- Est-ce que `✅ Wallet address received:` apparaît dans `WalletButton.tsx` ?

### 2. ✅ Vérifier `syncOnChainData()`

- Est-ce que `fetchLotteryState()` réussit ?
- Est-ce que `fetchUserState()` réussit ?
- Y a-t-il une erreur RPC qui n'est pas catchée ?

### 3. ✅ Vérifier le Re-render

- Est-ce qu'un composant plante lors du re-render après `connectStore()` ?
- Est-ce que `user` est bien défini dans tous les composants qui l'utilisent ?

### 4. ✅ Vérifier l'ErrorBoundary

- Est-ce que l'`ErrorBoundary` capture bien les erreurs ?
- Y a-t-il des erreurs qui échappent à l'`ErrorBoundary` ?

---

## 💡 Solutions Proposées

### Solution 1 : Déferrer `syncOnChainData()`

Au lieu d'appeler `syncOnChainData()` immédiatement, attendre que la connexion soit complètement établie :

```typescript
// Dans WalletButton.tsx
try {
  const address = await connectWallet();
  connectStore(address);
  
  toast.success('Wallet connected successfully! 🎉');
  
  // Déferrer la sync pour éviter les erreurs pendant la connexion
  if (mode === 'live') {
    setTimeout(async () => {
      try {
        await syncOnChainData(address);
      } catch (syncError) {
        console.error('⚠️ Background sync failed (non-critical):', syncError);
      }
    }, 2000); // Attendre 2 secondes
  }
} catch (error) {
  // ...
}
```

### Solution 2 : Wrapper `syncOnChainData()` avec un try-catch plus robuste

```typescript
// Dans WalletButton.tsx
if (mode === 'live') {
  try {
    // Ne pas await - laisser tourner en arrière-plan
    syncOnChainData(address).catch(err => {
      console.error('⚠️ Sync failed (non-critical):', err);
      // Ne pas afficher d'erreur à l'utilisateur
    });
  } catch (syncError) {
    // Double protection
    console.error('⚠️ Sync error caught:', syncError);
  }
}
```

### Solution 3 : Vérifier que le provider est prêt avant de sync

```typescript
// Dans blockchain.ts
export async function connectWallet() {
  // ... code existant ...
  
  // Attendre que le provider soit vraiment prêt
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return { provider, signer, address };
}
```

### Solution 4 : Ajouter plus de guards dans les composants

S'assurer que tous les composants qui utilisent `user` gèrent le cas où `user` est `null` ou `undefined` :

```typescript
// Dans les composants
const { user } = useAppStore();
if (!user || !user.address) {
  return null; // ou un fallback UI
}
```

---

## 📝 Checklist de Debugging

- [ ] Ouvrir la console du navigateur
- [ ] Cliquer sur "Connect Wallet"
- [ ] Valider dans MetaMask
- [ ] Noter tous les logs qui apparaissent
- [ ] Noter la dernière ligne de log avant le rechargement
- [ ] Vérifier s'il y a des erreurs dans la console
- [ ] Vérifier s'il y a des warnings React
- [ ] Vérifier le Network tab pour les appels RPC
- [ ] Vérifier si `window.ethereum` est toujours disponible après connexion

---

## 🎯 Ce qui doit être corrigé

1. **Problème principal** : Après validation dans MetaMask, la connexion échoue et retourne à la page d'accueil
2. **Objectif** : 
   - Se connecter correctement à MetaMask
   - Ne pas causer de rechargement de page
   - Afficher l'adresse du wallet connecté
   - Gérer les erreurs sans casser l'application

---

## 📚 Ressources

- [EIP-1193: Ethereum Provider JavaScript API](https://eips.ethereum.org/EIPS/eip-1193)
- [MetaMask Documentation](https://docs.metamask.io/)
- [Ethers.js v6 Documentation](https://docs.ethers.org/v6/)

---

**Date de création** : $(date)
**Version** : 1.0
**Auteur** : Tim (pour Claude)


