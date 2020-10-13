const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const MyContract = artifacts.require("MyContract");

module.exports = async function (deployer, _, accounts) {
  const instance = await deployProxy(
    MyContract, 
    [accounts[0]], 
    { 
      deployer, 
      initializer: 'initialize',
      unsafeAllowCustomTypes: true 
    }
  );
  console.log(`Deployed contract: ${instance.address}`);
}