// const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');

const MyContract = artifacts.require('MyContract');

module.exports = async (deployer, network, accounts) => {
    await deployer.deploy(MyContract)
    // await deployProxy(UserContract, { deployer });
    // await deployProxy(ProductContract, { deployer });
    // const upgraded = await upgradeProxy(instance.address, BoxV2, { deployer });
}