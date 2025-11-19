#!/usr/bin/env node

/**
 * Auto-setup script for Base Sepolia testnet
 * Does everything that can be automated
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CONTRACTS_DIR = __dirname.replace('/scripts', '');

console.log('🧪 AUREUS Testnet Auto-Setup');
console.log('============================\n');

// Step 1: Check if .env exists
console.log('📝 Step 1: Checking .env file...');
const envPath = path.join(CONTRACTS_DIR, '.env');
const envExamplePath = path.join(CONTRACTS_DIR, 'env.example');

if (!fs.existsSync(envPath)) {
  console.log('   Creating .env from env.example...');
  if (fs.existsSync(envExamplePath)) {
    const envExample = fs.readFileSync(envExamplePath, 'utf8');
    // Set testnet defaults
    const testnetEnv = envExample
      .replace('USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', 'USDC_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e')
      .replace('VRF_COORDINATOR=0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625', 'VRF_COORDINATOR=0x9Ddf0Ac0818886E8A7FdA6904cF1383e8bC41d82')
      .replace('VRF_KEY_HASH=0x99675afd988000c7b611e1eb4026b5c01f3f66d6d2b6f0ff04ac45e8b79256f0', 'VRF_KEY_HASH=0x89630569c9567e43c4fe7b1633258df9f2531b2fdc2b8a8b57b3c13030cd1fb2');
    
    fs.writeFileSync(envPath, testnetEnv);
    console.log('   ✅ .env created with testnet defaults!\n');
  } else {
    console.log('   ❌ env.example not found!');
    process.exit(1);
  }
} else {
  console.log('   ✅ .env already exists\n');
}

// Step 2: Install dependencies
console.log('📦 Step 2: Installing dependencies...');
try {
  process.chdir(CONTRACTS_DIR);
  execSync('npm install', { stdio: 'inherit' });
  console.log('   ✅ Dependencies installed!\n');
} catch (error) {
  console.log('   ⚠️  npm install failed, but continuing...\n');
}

// Step 3: Check if Hardhat is installed
console.log('🔍 Step 3: Checking Hardhat...');
try {
  execSync('npx hardhat --version', { stdio: 'pipe' });
  console.log('   ✅ Hardhat is ready!\n');
} catch (error) {
  console.log('   ⚠️  Hardhat not found, will install with npm install\n');
}

// Step 4: Instructions for manual steps
console.log('📋 Step 4: Manual Steps Required\n');
console.log('   You need to do these steps manually:\n');
console.log('   1️⃣  Get Testnet ETH (FREE):');
console.log('      → https://www.coinbase.com/faucets/base-ethereum-goerli-faucet');
console.log('      → Connect MetaMask (Base Sepolia)');
console.log('      → Click "Request"\n');
console.log('   2️⃣  Get Testnet LINK (FREE):');
console.log('      → https://faucets.chain.link/base-sepolia');
console.log('      → Connect MetaMask (Base Sepolia)');
console.log('      → Click "Request"\n');
console.log('   3️⃣  Create VRF Subscription:');
console.log('      → https://vrf.chain.link/base-sepolia');
console.log('      → Connect MetaMask (Base Sepolia)');
console.log('      → Click "Create Subscription"');
console.log('      → Fund with testnet LINK (minimum 1 LINK)');
console.log('      → Copy the Subscription ID\n');
console.log('   4️⃣  Add to .env:');
console.log('      → Open contracts/.env');
console.log('      → Add: PRIVATE_KEY=your_private_key');
console.log('      → Add: TREASURY_ADDRESS=your_treasury_address');
console.log('      → Add: VRF_SUBSCRIPTION_ID=your_subscription_id\n');
console.log('   5️⃣  Deploy:');
console.log('      → cd contracts');
console.log('      → npm run deploy:testnet\n');

console.log('✅ Auto-setup complete!');
console.log('   Follow the manual steps above, then deploy.\n');



