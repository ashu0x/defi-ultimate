const { ethers } = require("hardhat");
const IERC20 =
  require("../artifacts/contracts/interfaces/IERC20.sol/IERC20.json").abi;

describe("Test Uniswap", async function () {
  const DAI = "0x6b175474e89094c44da98b954eedeac495271d0f";
  const DAI_WHALE = "0x7c8CA1a587b2c4c40fC650dB8196eE66DC9c46F4";
  const WBTC = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";
  const WHALE = DAI_WHALE;
  const AMOUNT_IN = ethers.utils.parseEther("50000");
  const AMOUNT_OUT_MINIMUM = ethers.utils.parseUnits("1", 8);
  const TOKEN_IN = DAI;
  const TOKEN_OUT = WBTC;
  const accounts = await ethers.getSigners();
  const TO = accounts[0].address;

  describe("Swap", async function () {
    it("swap tokens", async () => {
      const tokenIn = await ethers.getContractAt(IERC20, TOKEN_IN);
      const tokenOut = await ethers.getContractAt(IERC20, TOKEN_OUT);

      const impersonatedSigner = await ethers.getImpersonatedSigner(WHALE);

      const testUniswapContract = await ethers.getContractFactory(
        "TestUniswap"
      );
      const testUniswap = await testUniswapContract.deploy();
      await testUniswap.deployed();

      await tokenIn
        .connect(impersonatedSigner)
        .approve(testUniswap.address, AMOUNT_IN);

      console.log(ethers.utils.formatUnits(AMOUNT_OUT_MINIMUM, 8));

      let txn = await testUniswap
        .connect(impersonatedSigner)
        .swap(TOKEN_IN, TOKEN_OUT, AMOUNT_IN, AMOUNT_OUT_MINIMUM, TO);

      const wbtcBalance = await tokenOut.balanceOf(TO);

      console.log(`out ${ethers.utils.formatUnits(wbtcBalance, 8)}`);
    });
  });
});
