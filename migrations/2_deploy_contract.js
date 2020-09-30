const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const MyContract = artifacts.require("MyContract");

module.exports = async function (deployer) {
  const instance = await deployProxy(MyContract, [], { deployer, unsafeAllowCustomTypes: true });
  console.log(`Deployed: ${instance.address}`);
}