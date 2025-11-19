#!/bin/bash

# Script de déploiement automatique pour AUREUS
# Usage: ./deploy.sh [vercel|netlify]

set -e

echo "🚀 Déploiement AUREUS"
echo "===================="

# Vérifier que le build fonctionne
echo ""
echo "📦 Vérification du build..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Le build a échoué. Corrigez les erreurs avant de déployer."
    exit 1
fi

echo "✅ Build réussi !"
echo ""

# Vérifier les variables d'environnement
echo "🔍 Vérification des variables d'environnement..."
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local n'existe pas"
    echo "📝 Créez .env.local avec vos variables (voir env.example)"
    echo ""
fi

# Choix de la plateforme
PLATFORM=${1:-vercel}

if [ "$PLATFORM" = "vercel" ]; then
    echo "🌐 Déploiement sur Vercel..."
    
    # Vérifier si Vercel CLI est installé
    if ! command -v vercel &> /dev/null; then
        echo "📦 Installation de Vercel CLI..."
        npm i -g vercel
    fi
    
    echo ""
    echo "🔧 Configuration Vercel..."
    vercel --prod
    
elif [ "$PLATFORM" = "netlify" ]; then
    echo "🌐 Déploiement sur Netlify..."
    
    # Vérifier si Netlify CLI est installé
    if ! command -v netlify &> /dev/null; then
        echo "📦 Installation de Netlify CLI..."
        npm i -g netlify-cli
    fi
    
    echo ""
    echo "🔧 Configuration Netlify..."
    netlify deploy --prod
    
else
    echo "❌ Plateforme inconnue: $PLATFORM"
    echo "Usage: ./deploy.sh [vercel|netlify]"
    exit 1
fi

echo ""
echo "✅ Déploiement terminé !"
echo ""
echo "📋 N'oubliez pas de configurer les variables d'environnement dans votre dashboard :"
echo "   - NEXT_PUBLIC_CHAIN_ID=8453"
echo "   - NEXT_PUBLIC_RPC_URL=https://mainnet.base.org"
echo "   - NEXT_PUBLIC_LOTTERY_ADDRESS=votre_contrat"
echo "   - NEXT_PUBLIC_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
echo "   - NEXT_PUBLIC_OWNER_ADDRESS=votre_adresse"
echo "   - NEXT_PUBLIC_DEFAULT_MODE=live"
echo "   - NEXT_PUBLIC_FORCE_MODE=live"

