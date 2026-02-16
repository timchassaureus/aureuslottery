const hre = require("hardhat");

/**
 * Script pour ajouter les tokens acceptés au contrat AureusDeposit
 * Tokens sur Base Mainnet:
 * - ETH: natif (address(0))
 * - USDC: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
 * - USDT: 0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2
 * - DAI: 0x50c5725949A6F0c72E6C4a641F24049A917E0C69
 * - LINK: 0x88DfaAABaf06f3a41D2606EA98BC8edA109AbeBb
 */

async function main() {
  const DEPOSIT_CONTRACT = process.env.DEPOSIT_CONTRACT_ADDRESS;
  
  if (!DEPOSIT_CONTRACT) {
    console.error("❌ DEPOSIT_CONTRACT_ADDRESS not set in .env");
    process.exit(1);
  }

  console.log("🔧 Setting up accepted tokens...");
  console.log("Contract:", DEPOSIT_CONTRACT);

  const AureusDeposit = await hre.ethers.getContractAt("AureusDeposit", DEPOSIT_CONTRACT);
  
  // Tokens sur Base Mainnet
  const tokens = [
    { name: "USDT", address: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2" },
    { name: "DAI", address: "0x50c5725949A6F0c72E6C4a641F24049A917E0C69" },
    { name: "LINK", address: "0x88DfaAABaf06f3a41D2606EA98BC8edA109AbeBb" },
  ];

  for (const token of tokens) {
    try {
      console.log(`Adding ${token.name} (${token.address})...`);
      const tx = await AureusDeposit.addAcceptedToken(token.address);
      await tx.wait();
      console.log(`✅ ${token.name} added successfully`);
    } catch (error) {
      console.error(`❌ Error adding ${token.name}:`, error.message);
    }
  }

  console.log("\n✅ Setup complete!");
  console.log("Note: ETH is accepted natively (no need to add)");
  console.log("Note: USDC is already accepted in constructor");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


