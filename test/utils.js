const { ethers } = require("hardhat");

async function sendEther(_from, _to, amount) {
  const tx = {
    from: _from,
    to: _to,
    value: ethers.utils.parseEther(amount),
  };

  return await ethers.provider
    .sendTransaction(tx)
    .then((txn) => console.log(txn))
    .catch((err) => console.log(err));
}

module.exports = {
  sendEther,
};
