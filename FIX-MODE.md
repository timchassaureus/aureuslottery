# 🔧 Comment Forcer le Mode Live

Si vous voyez encore le mode "Demo" sur votre téléphone, suivez ces étapes :

## Solution 1 : Vérifier les Variables d'Environnement

1. **Créez ou modifiez `.env.local`** à la racine du projet :

```env
NEXT_PUBLIC_DEFAULT_MODE=live
NEXT_PUBLIC_FORCE_MODE=live
```

2. **Redémarrez le serveur de développement** :

```bash
# Arrêtez le serveur (Ctrl+C)
# Puis relancez :
npm run dev
```

## Solution 2 : Nettoyer le Cache du Navigateur

Le localStorage peut avoir sauvegardé le mode "demo". Pour le nettoyer :

### Sur Mobile (Chrome/Safari) :
1. Ouvrez les outils de développement (si disponible)
2. Allez dans Application/Storage → Local Storage
3. Supprimez les clés :
   - `aureus_mode`
   - `aureus_demo_initialized`

### Ou simplement :
1. Videz le cache du navigateur
2. Rechargez la page (force refresh)

## Solution 3 : Vérifier que les Variables sont Chargées

Ajoutez temporairement ce code dans `app/page.tsx` pour vérifier :

```typescript
useEffect(() => {
  console.log('Mode actuel:', mode);
  console.log('FORCED_MODE:', FORCED_MODE);
  console.log('DEFAULT_MODE:', DEFAULT_MODE);
}, [mode]);
```

Si `FORCED_MODE` est `undefined`, cela signifie que la variable d'environnement n'est pas chargée.

## Solution 4 : Build de Production

Si vous déployez en production, assurez-vous que les variables d'environnement sont configurées dans votre plateforme (Vercel, Netlify, etc.).

## Vérification Rapide

Après avoir fait les modifications, vous devriez voir :
- ✅ Badge "Live • Base Sepolia" en haut à droite
- ✅ Pas de bouton "Go Live" (si FORCED_MODE est actif)
- ✅ Pas de bouton "Demo Data"
- ✅ L'application se connecte directement à la blockchain

Si le problème persiste, vérifiez la console du navigateur pour les erreurs.

