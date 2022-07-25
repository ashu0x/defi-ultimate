const { ethers } = require("hardhat");
const { DAI, DAI_WHALE, WETH, WETH_WHALE } = require("./config");
const IERC20 =
  require("../artifacts/contracts/interfaces/IERC20.sol/IERC20.json").abi;

describe("Test Uniswap Liquidity", async function () {
  const TOKEN_A = WETH;
  const TOKEN_A_WHALE = WETH_WHALE;
  const TOKEN_B = DAI;
  const TOKEN_B_WHALE = DAI_WHALE;
  const TOKEN_A_AMOUNT = ethers.utils.parseEther("1");
  const TOKEN_B_AMOUNT = ethers.utils.parseEther("1");

  let tokenA, tokenB, testUniswapPool, signer;

  beforeEach(async () => {
    signer = await ethers.getSigner();
    tokenA = await ethers.getContractAt(IERC20, TOKEN_A);
    tokenB = await ethers.getContractAt(IERC20, TOKEN_B);
    const testUniswapPoolContract = await ethers.getContractFactory(
      "TestUniswapPool"
    );
    testUniswapPool = await testUniswapPoolContract.deploy();
    await testUniswapPool.deployed();

    console.log("Signer: ", signer.address);
    await signer.sendTransaction({
      to: TOKEN_A_WHALE,
      value: ethers.utils.parseEther("1"),
    });

    await signer.sendTransaction({
      to: TOKEN_B_WHALE,
      value: ethers.utils.parseEther("1"),
    });

    let impersonatedSigner = await ethers.getImpersonatedSigner(WETH_WHALE);
    await tokenA
      .connect(impersonatedSigner)
      .transfer(signer.address, TOKEN_A_AMOUNT);
    impersonatedSigner = await ethers.getImpersonatedSigner(DAI_WHALE);
    await tokenB
      .connect(impersonatedSigner)
      .transfer(signer.address, TOKEN_B_AMOUNT);

    await tokenA.approve(testUniswapPool.address, TOKEN_A_AMOUNT);
    await tokenB.approve(testUniswapPool.address, TOKEN_B_AMOUNT);
  });

  it("add and remove liquidity", async () => {
    console.log(
      "Token A Balance: ",
      ethers.utils.formatUnits(await tokenA.balanceOf(signer.address), 18)
    );
    console.log(
      "Token B Balance: ",
      ethers.utils.formatUnits(await tokenB.balanceOf(signer.address)),
      18
    );

    let txn = await testUniswapPool.addLiquidity(
      TOKEN_A,
      TOKEN_B,
      TOKEN_A_AMOUNT,
      TOKEN_B_AMOUNT
    );
    await txn.wait();

    txn = await testUniswapPool.removeLiquidity(TOKEN_A, TOKEN_B);
    await txn.wait();

    console.log("After removing liquidity");
    console.log(
      "Token A Balance: ",
      ethers.utils.formatUnits(
        await tokenA.balanceOf(testUniswapPool.address),
        18
      )
    );
    console.log(
      "Token B Balance: ",
      ethers.utils.formatUnits(
        await tokenB.balanceOf(testUniswapPool.address),
        18
      )
    );
  });
});
