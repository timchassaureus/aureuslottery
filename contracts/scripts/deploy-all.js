const hre = require("hardhat");

/**
 * Script de déploiement complet
 * Déploie AureusLottery + AureusDeposit en une seule fois
 */
async function main() {
  console.log("🚀 Déploiement complet AUREUS Lottery\n");

  // Configuration
  const TREASURY_ADDRESS = "0xa166D2570d4bBfACcEBE7A78a426991b1Fa8f6eC";
  
  const network = await hre.ethers.provider.getNetwork();
  const isMainnet = network.chainId === 8453n;
  
  console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`🌐 Mode: ${isMainnet ? 'PRODUCTION' : 'TESTNET'}\n`);

  // Configuration selon le réseau
  const config = isMainnet ? {
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    vrfCoordinator: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
    keyHash: "0x99675afd988000c7b611e1eb4026b5c01f3f66d6d2b6f0ff04ac45e8b79256f0",
    uniswapRouter: "0x2626664c2603336E57B271c5C0b26F421741e481",
  } : {
    usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    vrfCoordinator: "0x9Ddf0Ac0818886E8A7FdA6904cF1383e8bC41d82",
    keyHash: "0x89630569c9567e43c4fe7b1633258df9f2531b2fdc2b8a8b57b3c13030cd1fb2",
    uniswapRouter: "0x2626664c2603336E57B271c5C0b26F421741e481",
  };

  const subscriptionId = process.env.VRF_SUBSCRIPTION_ID;
  if (!subscriptionId) {
    console.error("❌ VRF_SUBSCRIPTION_ID not set!");
    console.error("Create a subscription on: https://vrf.chain.link/");
    process.exit(1);
  }

  const [deployer] = await hre.ethers.getSigners();
  console.log(`👤 Deploying from: ${deployer.address}`);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${hre.ethers.formatEther(balance)} ETH\n`);

  // ============ 1. Déployer AureusLottery ============
  console.log("📦 Step 1/2: Deploying AureusLottery...");
  const AureusLottery = await hre.ethers.getContractFactory("AureusLottery");
  const lottery = await AureusLottery.deploy(
    config.usdc,
    TREASURY_ADDRESS,
    config.vrfCoordinator,
    config.keyHash,
    BigInt(subscriptionId),
    500000 // callbackGasLimit
  );
  await lottery.waitForDeployment();
  const lotteryAddress = await lottery.getAddress();
  console.log(`✅ AureusLottery deployed: ${lotteryAddress}`);

  // Vérifier treasury
  const treasury = await lottery.treasury();
  console.log(`✅ Treasury configured: ${treasury}\n`);

  // ============ 2. Déployer AureusDeposit ============
  console.log("📦 Step 2/2: Deploying AureusDeposit...");
  const AureusDeposit = await hre.ethers.getContractFactory("AureusDeposit");
  const deposit = await AureusDeposit.deploy(
    config.usdc,
    config.uniswapRouter
  );
  await deposit.waitForDeployment();
  const depositAddress = await deposit.getAddress();
  console.log(`✅ AureusDeposit deployed: ${depositAddress}\n`);

  // ============ 3. Configurer les Tokens Acceptés ============
  console.log("🔧 Configuring accepted tokens...");
  
  // Tokens sur Base Mainnet
  const tokens = isMainnet ? [
    { name: "USDT", address: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2" },
    { name: "DAI", address: "0x50c5725949A6F0c72E6C4a641F24049A917E0C69" },
    { name: "LINK", address: "0x88DfaAABaf06f3a41D2606EA98BC8edA109AbeBb" },
  ] : [
    // Tokens testnet (si besoin)
  ];

  for (const token of tokens) {
    try {
      const tx = await deposit.addAcceptedToken(token.address);
      await tx.wait();
      console.log(`✅ ${token.name} added`);
    } catch (error) {
      console.log(`⚠️  ${token.name} failed: ${error.message}`);
    }
  }

  // ============ 4. Résumé ============
  console.log("\n" + "=".repeat(60));
  console.log("✅ DÉPLOIEMENT TERMINÉ !");
  console.log("=".repeat(60) + "\n");
  
  console.log("📋 Adresses des Contrats:");
  console.log(`   AureusLottery: ${lotteryAddress}`);
  console.log(`   AureusDeposit: ${depositAddress}`);
  console.log(`   Treasury:      ${TREASURY_ADDRESS}\n`);

  console.log("📝 Ajouter dans .env.local:");
  console.log(`   NEXT_PUBLIC_LOTTERY_ADDRESS=${lotteryAddress}`);
  console.log(`   NEXT_PUBLIC_DEPOSIT_CONTRACT_ADDRESS=${depositAddress}\n`);

  console.log("🔗 BaseScan:");
  console.log(`   Lottery:  https://basescan.org/address/${lotteryAddress}`);
  console.log(`   Deposit:  https://basescan.org/address/${depositAddress}`);
  console.log(`   Treasury: https://basescan.org/address/${TREASURY_ADDRESS}\n`);

  console.log("⏭️  Prochaines étapes:");
  console.log("   1. Configurer Chainlink Automation (tirages auto à 21H)");
  console.log("   2. Ajouter les adresses dans .env.local");
  console.log("   3. Déployer sur Vercel");
  console.log("   4. Tester l'achat d'un ticket\n");

  return {
    lottery: lotteryAddress,
    deposit: depositAddress,
    treasury: TREASURY_ADDRESS,
  };
}

main()
  .then((addresses) => {
    console.log("✅ All contracts deployed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });


