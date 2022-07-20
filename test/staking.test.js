const { ethers, deployments } = require("hardhat");
const { moveBlocks } = require("../utils/move-blocks");
const { moveTime } = require("../utils/move-time");

const SECONDS_IN_A_DAY = 86400;
const SECONDS_IN_A_YEAR = 31449600;

describe("Stake and Claim Rewards", async function () {
  let staking, rewardToken, deployer, stakeAmount;

  beforeEach(async () => {
    const accounts = await ethers.getSigners();
    deployer = accounts[0];
    const rewardTokenFactory = await ethers.getContractFactory("RewardToken");
    rewardToken = await rewardTokenFactory.deploy();
    await rewardToken.deployed();
    console.log("Reward Token Contract Deployed to: ", rewardToken.address);

    const stakingContractFactory = await ethers.getContractFactory("Staking");
    staking = await stakingContractFactory.deploy(
      rewardToken.address,
      rewardToken.address
    );
    await staking.deployed();
    console.log("Staking Contract deployed to: ", staking.address);
    stakeAmount = ethers.utils.parseEther("100000");
  });

  describe("Stake", async function () {
    it("Move token from user to staking contract", async function () {
      console.log(staking.address);
      await rewardToken.approve(staking.address, stakeAmount);
      await staking.stake(stakeAmount);
      await moveTime(SECONDS_IN_A_YEAR);
      await moveBlocks(1);
      const earned = await staking.earned(deployer.address);
      console.log("Rewards earned: ", ethers.utils.formatEther(earned));
    });
  });
});
