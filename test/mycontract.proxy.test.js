const { deployProxy } = require('@openzeppelin/truffle-upgrades');
 
// Load compiled artifacts
const MyContract = artifacts.require('MyContract');
 
// Start test block
contract('MyContract (proxy)', () => {
  beforeEach(async () => this.contract = await deployProxy(MyContract, [], { unsafeAllowCustomTypes: true }));

  it('should set upgrade proxy correctly', () => assert(this.contract.address !== ''))
});