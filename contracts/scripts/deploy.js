const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying AUREUS Lottery Contract...\n");

  // Get network info
  const network = await hre.ethers.provider.getNetwork();
  console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})\n`);

  // Load environment variables
  const usdcAddress = process.env.USDC_ADDRESS;
  const treasuryAddress = process.env.TREASURY_ADDRESS;
  const vrfCoordinator = process.env.VRF_COORDINATOR;
  const keyHash = process.env.VRF_KEY_HASH;
  const subscriptionId = process.env.VRF_SUBSCRIPTION_ID;
  const callbackGasLimit = process.env.VRF_CALLBACK_GAS_LIMIT || "500000";

  // Validate required addresses
  if (!usdcAddress || !treasuryAddress || !vrfCoordinator || !keyHash || !subscriptionId) {
    console.error("❌ Missing required environment variables!");
    console.error("Required:");
    console.error("  - USDC_ADDRESS");
    console.error("  - TREASURY_ADDRESS");
    console.error("  - VRF_COORDINATOR");
    console.error("  - VRF_KEY_HASH");
    console.error("  - VRF_SUBSCRIPTION_ID");
    process.exit(1);
  }

  const normalizedUsdc = hre.ethers.getAddress(usdcAddress);
  const normalizedTreasury = hre.ethers.getAddress(treasuryAddress);
  const normalizedCoordinator = hre.ethers.getAddress(vrfCoordinator);
  const parsedSubscriptionId = BigInt(subscriptionId);
  const parsedCallbackGas = Number(callbackGasLimit);

  console.log("📋 Configuration:");
  console.log(`   USDC: ${normalizedUsdc}`);
  console.log(`   Treasury: ${normalizedTreasury}`);
  console.log(`   VRF Coordinator: ${normalizedCoordinator}`);
  console.log(`   Key Hash: ${keyHash}`);
  console.log(`   Subscription ID: ${parsedSubscriptionId}`);
  console.log(`   Callback Gas Limit: ${parsedCallbackGas}\n`);

  // Deploy contract
  const [deployer] = await hre.ethers.getSigners();
  console.log(`👤 Deploying from: ${deployer.address}`);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${hre.ethers.formatEther(balance)} ETH\n`);

  console.log("⏳ Deploying AureusLottery...");
  const AureusLottery = await hre.ethers.getContractFactory("AureusLottery");
  const lottery = await AureusLottery.deploy(
    normalizedUsdc,
    normalizedTreasury,
    normalizedCoordinator,
    keyHash,
    parsedSubscriptionId,
    parsedCallbackGas
  );

  await lottery.waitForDeployment();
  const contractAddress = await lottery.getAddress();

  console.log("\n✅ Contract deployed!");
  console.log(`📍 Address: ${contractAddress}\n`);

  // Wait for confirmations
  console.log("⏳ Waiting for confirmations...");
  await lottery.deploymentTransaction().wait(5);

  // Verify contract (if on mainnet/testnet)
  if (network.chainId !== 31337n) {
    console.log("\n🔍 Verifying contract on BaseScan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [
          normalizedUsdc,
          normalizedTreasury,
          normalizedCoordinator,
          keyHash,
          parsedSubscriptionId,
          parsedCallbackGas,
        ],
      });
      console.log("✅ Contract verified!\n");
    } catch (error) {
      console.log("⚠️  Verification failed (might already be verified):", error.message);
    }
  }

  console.log("📝 Next steps:");
  console.log("   1. Fund Chainlink VRF subscription with LINK");
  console.log("   2. Set up Chainlink Automation for auto-draws");
  console.log("   3. Update frontend with contract address");
  console.log(`   4. View on BaseScan: https://basescan.org/address/${contractAddress}\n`);

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



