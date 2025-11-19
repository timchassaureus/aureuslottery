const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AureusLottery", function () {
  let lottery;
  let usdc;
  let owner;
  let treasury;
  let user1;
  let user2;
  let vrfCoordinator;

  const TICKET_PRICE = ethers.parseUnits("1", 6); // 1 USDC (6 decimals)
  const MAIN_POT_PERCENT = 85;
  const BONUS_POT_PERCENT = 5;
  const TREASURY_PERCENT = 10;

  beforeEach(async function () {
    [owner, treasury, user1, user2] = await ethers.getSigners();

    // Deploy mock USDC
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    usdc = await MockERC20.deploy("USD Coin", "USDC", 6);
    await usdc.waitForDeployment();

    // Deploy mock VRF Coordinator
    const MockVRFCoordinator = await ethers.getContractFactory("MockVRFCoordinator");
    vrfCoordinator = await MockVRFCoordinator.deploy();
    await vrfCoordinator.waitForDeployment();

    // Deploy lottery contract
    const AureusLottery = await ethers.getContractFactory("AureusLottery");
    lottery = await AureusLottery.deploy(
      await usdc.getAddress(),
      treasury.address,
      await vrfCoordinator.getAddress(),
      ethers.id("keyHash"),
      1, // subscription ID
      500000 // callback gas limit
    );
    await lottery.waitForDeployment();

    // Mint USDC to users
    await usdc.mint(user1.address, ethers.parseUnits("1000", 6));
    await usdc.mint(user2.address, ethers.parseUnits("1000", 6));
    await usdc.mint(owner.address, ethers.parseUnits("1000", 6));

    // Approve lottery contract
    await usdc.connect(user1).approve(await lottery.getAddress(), ethers.MaxUint256);
    await usdc.connect(user2).approve(await lottery.getAddress(), ethers.MaxUint256);
  });

  describe("Deployment", function () {
    it("Should set correct initial values", async function () {
      expect(await lottery.currentDrawId()).to.equal(1);
      expect(await lottery.treasury()).to.equal(treasury.address);
      expect(await lottery.usdcToken()).to.equal(await usdc.getAddress());
    });
  });

  describe("Buy Tickets", function () {
    it("Should allow buying tickets", async function () {
      const count = 10;
      const totalCost = TICKET_PRICE * BigInt(count);

      await expect(lottery.connect(user1).buyTickets(count))
        .to.emit(lottery, "TicketsPurchased")
        .withArgs(
          1, // drawId
          user1.address,
          count,
          totalCost,
          (totalCost * BigInt(MAIN_POT_PERCENT)) / 100n,
          (totalCost * BigInt(BONUS_POT_PERCENT)) / 100n,
          (totalCost * BigInt(TREASURY_PERCENT)) / 100n
        );

      expect(await lottery.getUserTickets(1, user1.address)).to.equal(count);
      expect(await lottery.getTotalTickets(1)).to.equal(count);
    });

    it("Should split funds correctly (85/5/10)", async function () {
      const count = 100;
      const totalCost = TICKET_PRICE * BigInt(count);

      const treasuryBalanceBefore = await usdc.balanceOf(treasury.address);

      await lottery.connect(user1).buyTickets(count);

      const treasuryBalanceAfter = await usdc.balanceOf(treasury.address);
      const treasuryReceived = treasuryBalanceAfter - treasuryBalanceBefore;

      expect(treasuryReceived).to.equal((totalCost * BigInt(TREASURY_PERCENT)) / 100n);

      const [mainPot, bonusPot] = await lottery.getCurrentPots();
      expect(mainPot).to.equal((totalCost * BigInt(MAIN_POT_PERCENT)) / 100n);
      expect(bonusPot).to.equal((totalCost * BigInt(BONUS_POT_PERCENT)) / 100n);
    });

    it("Should apply quick deal discount", async function () {
      const count = 10; // Has 3% discount
      const totalCost = TICKET_PRICE * BigInt(count);
      const discount = (totalCost * 300n) / 10000n; // 3% = 300 bps
      const discountedCost = totalCost - discount;

      await lottery.connect(user1).buyTickets(count);

      const user1Balance = await usdc.balanceOf(user1.address);
      const expectedBalance = ethers.parseUnits("1000", 6) - discountedCost;
      expect(user1Balance).to.equal(expectedBalance);
    });

    it("Should reject buying 0 tickets", async function () {
      await expect(lottery.connect(user1).buyTickets(0))
        .to.be.revertedWith("Count must be > 0");
    });

    it("Should reject buying more than 10,000 tickets", async function () {
      await expect(lottery.connect(user1).buyTickets(10001))
        .to.be.revertedWith("Max 10,000 tickets per transaction");
    });
  });

  describe("Pause/Unpause", function () {
    it("Should pause contract", async function () {
      await lottery.pause();
      expect(await lottery.paused()).to.be.true;
    });

    it("Should prevent buying tickets when paused", async function () {
      await lottery.pause();
      await expect(lottery.connect(user1).buyTickets(10))
        .to.be.revertedWithCustomError(lottery, "EnforcedPause");
    });

    it("Should unpause contract", async function () {
      await lottery.pause();
      await lottery.unpause();
      expect(await lottery.paused()).to.be.false;
    });
  });

  describe("Owner Functions", function () {
    it("Should update treasury", async function () {
      await lottery.setTreasury(user2.address);
      expect(await lottery.treasury()).to.equal(user2.address);
    });

    it("Should reject invalid treasury address", async function () {
      await expect(lottery.setTreasury(ethers.ZeroAddress))
        .to.be.revertedWith("Invalid address");
    });

    it("Should only allow owner to update treasury", async function () {
      await expect(lottery.connect(user1).setTreasury(user2.address))
        .to.be.revertedWithCustomError(lottery, "OwnableUnauthorizedAccount");
    });
  });
});



