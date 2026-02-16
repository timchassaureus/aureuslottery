const hre = require("hardhat");

/**
 * Script pour changer le treasury d'un contrat déjà déployé
 * Utilise si le contrat est déjà déployé et que tu veux changer le treasury
 */
async function main() {
  const CONTRACT_ADDRESS = process.env.LOTTERY_ADDRESS;
  const NEW_TREASURY = "0xa166D2570d4bBfACcEBE7A78a426991b1Fa8f6eC"; // Ton adresse Ledger

  if (!CONTRACT_ADDRESS) {
    console.error("❌ LOTTERY_ADDRESS not set in .env");
    process.exit(1);
  }

  console.log("🔧 Setting treasury address...");
  console.log(`Contract: ${CONTRACT_ADDRESS}`);
  console.log(`New Treasury: ${NEW_TREASURY}\n`);

  const [deployer] = await hre.ethers.getSigners();
  console.log(`👤 Using account: ${deployer.address}\n`);

  const AureusLottery = await hre.ethers.getContractAt("AureusLottery", CONTRACT_ADDRESS);
  
  // Vérifier l'ancien treasury
  const oldTreasury = await AureusLottery.treasury();
  console.log(`Current treasury: ${oldTreasury}`);
  
  if (oldTreasury.toLowerCase() === NEW_TREASURY.toLowerCase()) {
    console.log("✅ Treasury is already set to this address!");
    return;
  }

  // Changer le treasury
  console.log("⏳ Setting new treasury...");
  const tx = await AureusLottery.setTreasury(NEW_TREASURY);
  await tx.wait();

  // Vérifier
  const newTreasury = await AureusLottery.treasury();
  console.log(`✅ New treasury: ${newTreasury}`);
  
  if (newTreasury.toLowerCase() === NEW_TREASURY.toLowerCase()) {
    console.log("✅ Treasury updated successfully!\n");
  } else {
    console.log("❌ Error: Treasury address mismatch!\n");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


