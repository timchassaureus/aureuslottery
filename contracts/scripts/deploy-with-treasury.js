const hre = require("hardhat");

/**
 * Script de déploiement avec treasury pré-configuré
 * Treasury: 0xa166D2570d4bBfACcEBE7A78a426991b1Fa8f6eC (Ledger)
 */
async function main() {
  console.log("🚀 Deploying AUREUS Lottery Contract...\n");

  // Treasury address (Ledger)
  const TREASURY_ADDRESS = "0xa166D2570d4bBfACcEBE7A78a426991b1Fa8f6eC";
  
  // Get network info
  const network = await hre.ethers.provider.getNetwork();
  console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})\n`);

  // Configuration Base Mainnet
  const config = {
    base: {
      usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      vrfCoordinator: "0x41034678D6C633D8a95c75e1138A360a28Ba15d1", // Base Mainnet VRF
      keyHash: "0x08ba8f62ff6c40a58877a106147661db43bc58dabfb814793847a839aa03367f", // Base Mainnet
      callbackGasLimit: 500000,
    },
    baseSepolia: {
      usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      vrfCoordinator: "0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B07", // Base Sepolia VRF
      keyHash: "0x17cd47325080e7bd7b0b8e5e9c5c8c5c8c5c8c5c8c5c8c5c8c5c8c5c8c5c8c", // À vérifier
      callbackGasLimit: 500000,
    }
  };

  const networkConfig = network.chainId === 8453n ? config.base : config.baseSepolia;
  
  // VRF Subscription ID (à créer sur Chainlink)
  const subscriptionId = process.env.VRF_SUBSCRIPTION_ID;
  if (!subscriptionId) {
    console.error("❌ VRF_SUBSCRIPTION_ID not set!");
    console.error("Create a subscription on Chainlink: https://vrf.chain.link/");
    process.exit(1);
  }

  console.log("📋 Configuration:");
  console.log(`   Treasury (Ledger): ${TREASURY_ADDRESS}`);
  console.log(`   USDC: ${networkConfig.usdc}`);
  console.log(`   VRF Coordinator: ${networkConfig.vrfCoordinator}`);
  console.log(`   VRF Subscription ID: ${subscriptionId}`);
  console.log(`   Key Hash: ${networkConfig.keyHash}\n`);

  // Deploy contract
  const [deployer] = await hre.ethers.getSigners();
  console.log(`👤 Deploying from: ${deployer.address}`);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${hre.ethers.formatEther(balance)} ETH\n`);

  console.log("⏳ Deploying AureusLottery...");
  const AureusLottery = await hre.ethers.getContractFactory("AureusLottery");
  const lottery = await AureusLottery.deploy(
    networkConfig.usdc,
    TREASURY_ADDRESS, // ← Ton adresse Ledger
    networkConfig.vrfCoordinator,
    networkConfig.keyHash,
    BigInt(subscriptionId),
    networkConfig.callbackGasLimit
  );

  await lottery.waitForDeployment();
  const contractAddress = await lottery.getAddress();

  console.log("\n✅ Contract deployed!");
  console.log(`📍 Address: ${contractAddress}`);
  console.log(`💰 Treasury (10%): ${TREASURY_ADDRESS}\n`);

  // Verify treasury
  const treasury = await lottery.treasury();
  console.log(`✅ Treasury configured: ${treasury}`);
  if (treasury.toLowerCase() === TREASURY_ADDRESS.toLowerCase()) {
    console.log("✅ Treasury address matches!\n");
  } else {
    console.log("⚠️  Treasury address mismatch!\n");
  }

  // Wait for confirmations
  console.log("⏳ Waiting for confirmations...");
  await lottery.deploymentTransaction().wait(5);

  // Verify contract
  if (network.chainId !== 31337n) {
    console.log("\n🔍 Verifying contract on BaseScan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [
          networkConfig.usdc,
          TREASURY_ADDRESS,
          networkConfig.vrfCoordinator,
          networkConfig.keyHash,
          BigInt(subscriptionId),
          networkConfig.callbackGasLimit,
        ],
      });
      console.log("✅ Contract verified!\n");
    } catch (error) {
      console.log("⚠️  Verification failed:", error.message);
    }
  }

  console.log("📝 Next steps:");
  console.log("   1. Fund Chainlink VRF subscription with LINK");
  console.log("   2. Set up Chainlink Automation for auto-draws at 21:00 UTC");
  console.log("   3. Update .env.local: NEXT_PUBLIC_LOTTERY_ADDRESS=" + contractAddress);
  console.log(`   4. View on BaseScan: https://basescan.org/address/${contractAddress}`);
  console.log(`   5. Check treasury: https://basescan.org/address/${TREASURY_ADDRESS}\n`);

  return contractAddress;
}

main()
  .then((address) => {
    console.log(`✅ Deployment complete! Contract: ${address}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });


