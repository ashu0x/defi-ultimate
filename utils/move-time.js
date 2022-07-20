const { network } = require("hardhat");

async function moveTime(amount) {
  console.log("Moving Blocks...");
  await network.provider.send("evm_increaseTime", [amount]);
  console.log(`Moved ${amount} blocks`);
}

module.exports = {
  moveTime,
};
