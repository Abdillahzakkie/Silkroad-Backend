const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const MyContract = artifacts.require('MyContract');

module.exports = async (deployer, network, accounts) => {
    // await deployProxy(MyContract, [accounts[0]], { deployer, initializer: 'initialize' })
    await deployer.deploy(MyContract)
}