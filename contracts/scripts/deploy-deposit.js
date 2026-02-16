const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying AureusDeposit contract...");

  // Récupérer les adresses depuis les variables d'environnement
  const USDC_ADDRESS = process.env.USDC_ADDRESS || "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // Base Sepolia
  const UNISWAP_ROUTER = process.env.UNISWAP_ROUTER || "0x2626664c2603336E57B271c5C0b26F421741e481"; // Uniswap V3 Base

  console.log("📋 Configuration:");
  console.log("  USDC Address:", USDC_ADDRESS);
  console.log("  Uniswap Router:", UNISWAP_ROUTER);

  // Déployer le contrat
  const AureusDeposit = await hre.ethers.getContractFactory("AureusDeposit");
  const deposit = await AureusDeposit.deploy(USDC_ADDRESS, UNISWAP_ROUTER);

  await deposit.waitForDeployment();
  const address = await deposit.getAddress();

  console.log("✅ AureusDeposit deployed to:", address);
  console.log("\n📝 Next steps:");
  console.log("  1. Add to .env.local: NEXT_PUBLIC_DEPOSIT_CONTRACT_ADDRESS=" + address);
  console.log("  2. Add accepted tokens: npx hardhat run scripts/add-tokens.js --network baseSepolia");
  console.log("  3. Verify contract: npx hardhat verify --network baseSepolia", address, USDC_ADDRESS, UNISWAP_ROUTER);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


