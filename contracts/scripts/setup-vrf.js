const hre = require("hardhat");

/**
 * Script to set up Chainlink VRF subscription
 * Run this BEFORE deploying the contract
 */
async function main() {
  console.log("🔗 Setting up Chainlink VRF Subscription...\n");

  const network = await hre.ethers.provider.getNetwork();
  console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})\n`);

  // VRF Coordinator addresses
  const VRF_COORDINATOR_BASE = "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625";
  const VRF_COORDINATOR_SEPOLIA = "0x9Ddf0Ac0818886E8A7FdA6904cF1383e8bC41d82";

  let vrfCoordinator;
  if (network.chainId === 8453n) {
    vrfCoordinator = VRF_COORDINATOR_BASE;
    console.log("🌐 Using Base Mainnet VRF Coordinator");
  } else if (network.chainId === 84532n) {
    vrfCoordinator = VRF_COORDINATOR_SEPOLIA;
    console.log("🧪 Using Base Sepolia Testnet VRF Coordinator");
  } else {
    console.error("❌ Unsupported network for VRF");
    process.exit(1);
  }

  console.log(`📍 VRF Coordinator: ${vrfCoordinator}\n`);

  console.log("📋 Manual Steps Required:");
  console.log("   1. Go to https://vrf.chain.link/");
  console.log("   2. Connect your wallet");
  console.log("   3. Create a new subscription");
  console.log("   4. Fund it with LINK (minimum 10-20 LINK recommended)");
  console.log("   5. Add your contract address as a consumer (after deployment)");
  console.log("   6. Copy the Subscription ID to your .env file\n");

  console.log("💡 Tips:");
  console.log("   - Start with 50-100 LINK for 1-2 months of draws");
  console.log("   - Each draw costs ~0.25 LINK");
  console.log("   - With 2 draws/day = ~0.5 LINK/day = ~15 LINK/month");
  console.log("   - Keep subscription funded to avoid failed draws\n");

  console.log("🔗 Links:");
  console.log("   VRF Dashboard: https://vrf.chain.link/");
  console.log("   Buy LINK: https://coinbase.com/advanced-trade/LINK-USDC");
  console.log("   Base Bridge: https://bridge.base.org/\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });



