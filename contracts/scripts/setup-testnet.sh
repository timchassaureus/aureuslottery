#!/bin/bash

echo "🧪 AUREUS Testnet Setup Script"
echo "================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env from env.example..."
    cp env.example .env
    echo "✅ .env created!"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and add your:"
    echo "   - PRIVATE_KEY"
    echo "   - VRF_SUBSCRIPTION_ID (after creating on vrf.chain.link)"
    echo ""
else
    echo "✅ .env already exists"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Get testnet ETH: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet"
echo "   2. Get testnet LINK: https://faucets.chain.link/base-sepolia"
echo "   3. Create VRF subscription: https://vrf.chain.link/base-sepolia"
echo "   4. Add VRF_SUBSCRIPTION_ID to .env"
echo "   5. Run: npm run deploy:base-sepolia"
echo ""



