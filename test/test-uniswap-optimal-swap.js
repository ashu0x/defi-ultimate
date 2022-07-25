const { DAI, WETH, DAI_WHALE } = require("./config");
const { ethers } = require("hardhat");
const IERC20 =
  require("../artifacts/contracts/interfaces/IERC20.sol/IERC20.json").abi;

describe("Optimal Swap", async () => {
  let uniswapOptimal, signer, tokenA, tokenB, pair;
  const AMOUNT = ethers.utils.parseEther("10000");

  beforeEach(async () => {
    tokenA = await ethers.getContractAt(IERC20, DAI);
    tokenB = await ethers.getContractAt(IERC20, WETH);
    console.log(
      ethers.utils.formatEther(await tokenA.balanceOf(DAI_WHALE)),
      " ",
      ethers.utils.formatEther(AMOUNT)
    );
    const uniswapOptimalContract = await ethers.getContractFactory(
      "TestUniswapOptimal"
    );
    uniswapOptimal = await uniswapOptimalContract.deploy();
    await uniswapOptimal.deployed();
    pair = await ethers.getContractAt(
      IERC20,
      await uniswapOptimal.getPair(tokenA.address, tokenB.address)
    );
    signer = await ethers.getImpersonatedSigner(DAI_WHALE);
    await tokenA.connect(signer).approve(uniswapOptimal.address, AMOUNT);
  });

  const snapshot = async () => {
    return {
      lp: await pair.balanceOf(uniswapOptimal.address),
      fromToken: await tokenA.balanceOf(uniswapOptimal.address),
      toToken: await tokenB.balanceOf(uniswapOptimal.address),
    };
  };

  it("optimal swap", async () => {
    await uniswapOptimal
      .connect(signer)
      .zap(tokenA.address, tokenB.address, AMOUNT);

    const after = await snapshot();
    console.log("lp", after.lp.toString());
    console.log("from", after.fromToken.toString());
    console.log("to", after.toToken.toString());
  });

  it("sub optimal swap", async () => {
    console.log(tokenA.address, " A ");
    console.log(tokenB.address, " B ");
    await uniswapOptimal
      .connect(signer)
      .subOptimalZap(tokenA.address, tokenB.address, AMOUNT);

    const after = await snapshot();
    console.log("lp", after.lp.toString());
    console.log("from", after.fromToken.toString());
    console.log("to", after.toToken.toString());
  });
});
