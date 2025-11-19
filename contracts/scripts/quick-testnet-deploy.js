const hre = require("hardhat");

/**
 * Quick testnet deployment script
 * Automatically uses testnet addresses
 */
async function main() {
  console.log("🧪 Quick Testnet Deployment - Base Sepolia\n");

  // Testnet addresses (Base Sepolia)
  const USDC_TESTNET = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
  const VRF_COORDINATOR_TESTNET = "0x9Ddf0Ac0818886E8A7FdA6904cF1383e8bC41d82";
  const VRF_KEY_HASH_TESTNET = "0x89630569c9567e43c4fe7b1633258df9f2531b2fdc2b8a8b57b3c13030cd1fb2";

  // Get deployer
  const [deployer] = await hre.ethers.getSigners();
  console.log(`👤 Deploying from: ${deployer.address}`);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${hre.ethers.formatEther(balance)} ETH\n`);

  if (balance < hre.ethers.parseEther("0.01")) {
    console.error("❌ Insufficient balance! Get testnet ETH:");
    console.error("   https://www.coinbase.com/faucets/base-ethereum-goerli-faucet\n");
    process.exit(1);
  }

  // Get treasury address (use deployer for testnet)
  const treasuryAddress = process.env.TREASURY_ADDRESS || deployer.address;
  console.log(`💼 Treasury: ${treasuryAddress}`);

  // Get VRF subscription ID
  const subscriptionId = process.env.VRF_SUBSCRIPTION_ID;
  if (!subscriptionId) {
    console.error("❌ VRF_SUBSCRIPTION_ID not set in .env!");
    console.error("   Create subscription at: https://vrf.chain.link/base-sepolia");
    console.error("   Then add VRF_SUBSCRIPTION_ID to .env\n");
    process.exit(1);
  }

  console.log(`🔗 VRF Subscription ID: ${subscriptionId}\n`);

  // Deploy contract
  console.log("⏳ Deploying AureusLottery...");
  const AureusLottery = await hre.ethers.getContractFactory("AureusLottery");
  const lottery = await AureusLottery.deploy(
    USDC_TESTNET,
    treasuryAddress,
    VRF_COORDINATOR_TESTNET,
    VRF_KEY_HASH_TESTNET,
    subscriptionId,
    500000 // callback gas limit
  );

  await lottery.waitForDeployment();
  const contractAddress = await lottery.getAddress();

  console.log("\n✅ Contract deployed!");
  console.log(`📍 Address: ${contractAddress}`);
  console.log(`🔗 BaseScan: https://sepolia.basescan.org/address/${contractAddress}\n`);

  // Wait for confirmations
  console.log("⏳ Waiting for confirmations...");
  await lottery.deploymentTransaction().wait(3);

  console.log("\n📝 Next steps:");
  console.log("   1. Fund VRF subscription with testnet LINK");
  console.log("   2. Add contract as consumer in VRF subscription");
  console.log("   3. Set up Chainlink Automation (optional for testnet)");
  console.log("   4. Test buying tickets");
  console.log("   5. Test draws (call requestMainDraw() and requestBonusDraw())\n");

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



