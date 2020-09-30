// const { deployProxy } = require('@openzeppelin/truffle-upgrades');
 
// // Load compiled artifacts
// const MyContract = artifacts.require('MyContract');
 
// // Start test block
// contract('MyContract (proxy)', accounts => {
//   beforeEach(async () => {
//     // Deploy a new Box contract for each test
//     this.contract = await deployProxy(MyContract, [accounts[0]], {initializer: 'initialize'});
//   });
 
//   // Test case
//   it('retrieve returns a value previously initialized', async () => {
//     const admin = await this.contract.admin();
//     assert(admin === accounts[0])
//   });
// });