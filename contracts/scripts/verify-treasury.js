const hre = require("hardhat");

/**
 * Script pour vérifier que le treasury est bien configuré
 */
async function main() {
  const CONTRACT_ADDRESS = process.env.LOTTERY_ADDRESS;
  const EXPECTED_TREASURY = "0xa166D2570d4bBfACcEBE7A78a426991b1Fa8f6eC";

  if (!CONTRACT_ADDRESS) {
    console.error("❌ LOTTERY_ADDRESS not set");
    process.exit(1);
  }

  console.log("🔍 Vérification du Treasury...\n");
  console.log(`Contract: ${CONTRACT_ADDRESS}`);
  console.log(`Expected Treasury: ${EXPECTED_TREASURY}\n`);

  const AureusLottery = await hre.ethers.getContractAt("AureusLottery", CONTRACT_ADDRESS);
  const treasury = await AureusLottery.treasury();

  console.log(`Current Treasury: ${treasury}\n`);

  if (treasury.toLowerCase() === EXPECTED_TREASURY.toLowerCase()) {
    console.log("✅ Treasury est correctement configuré !");
    console.log(`✅ Les 10% iront sur: ${treasury}`);
  } else {
    console.log("❌ Treasury ne correspond pas !");
    console.log(`   Attendu: ${EXPECTED_TREASURY}`);
    console.log(`   Actuel:  ${treasury}`);
    console.log("\n💡 Pour changer:");
    console.log(`   npx hardhat run scripts/set-treasury.js --network base`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


