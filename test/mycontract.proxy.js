const { deployProxy } = require('@openzeppelin/truffle-upgrades');
 
// Load compiled artifacts
const MyContract = artifacts.require('MyContract');
 
// Start test block
contract('MyContract (proxy)', function () {
  beforeEach(async function () {
    // Deploy a new Box contract for each test
    this.contract = await deployProxy(MyContract, [42], {initializer: 'store'});
  });
 
  // Test case
  it('retrieve returns a value previously initialized', async function () {
    // Test if the returned value is the same one
    // Note that we need to use strings to compare the 256 bit integers
    expect((await this.contract.retrieve()).toString()).to.equal('42');
  });
});