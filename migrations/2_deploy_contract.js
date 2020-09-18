const UserContract = artifacts.require('UserContract');
const ProductContract = artifacts.require('ProductContract');

module.exports = async (deployer, network, accounts) => {
    await deployer.deploy(UserContract);
    await deployer.deploy(ProductContract);
}