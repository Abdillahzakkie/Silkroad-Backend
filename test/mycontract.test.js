// Load compiled artifacts
const MyContract = artifacts.require('MyContract');

const userOne = 'user one';
const productOne = {
    productDetails: 'product one'
}

contract('User Contract', accounts => {
    let account1 = null;
    let account2 = null;

    before(async () => {
        this.contract = await MyContract.deployed()
        account1 = accounts[0];
        account2 = accounts[1];
    });

    it('should deploy smart contract properly', async () => assert(this.contract.address !== ''));

    it('should create new account', async () => {
        // create new account
        await this.contract.createNewAccount(userOne);

        const user = await this.contract.findUserByAddress(account1);
        assert.equal(user['_account'], account1);
        assert.equal(user['_hashID'], userOne);
    });

    it('should not create multiple account for one user', async () => {
        try {
            // create new account
            await this.contract.createNewAccount('second account');

        } catch (error) {
            assert(error.message.includes('User has already existed'));
            return;
        }
        assert(false);
    })

    it('should update valid user account', async () => {
        await this.contract.updateAccountDetails('new hash id');
        const user = await this.contract.findUserByAddress(account1);
        assert.equal(user['_hashID'], 'new hash id');
        assert.equal(user['_account'], account1);
        assert.equal(user['_id'], '1')
    })

    it('should not update account details for non existing user', async () => {
        try {
            await this.contract.updateAccountDetails('hash id', { from: account2 });
        } catch (error) {
            assert(error.message.includes('User does not exist'))
        }
    })

    it('should not update valid account with invalid credential', async () => {
        try {
            // should throw an exception 
            await this.contract.updateAccountDetails('');
        } catch (error) {
            assert(error.message.includes('Invalid hash id'));
            return;
        }
        assert(false);
    })

    it('should find user by address', async () => {
        const user = await this.contract.findUserByAddress(account1);
        assert.equal(user['_id'], '1');
        assert.equal(user['_hashID'], 'new hash id');
        assert.equal(user['_account'], account1);
    })

    it('should throw an error if user does not exist', async () => {
        try {
            // should throw an exception 
            await this.contract.findUserByAddress(account2);
        } catch (error) {
            assert(error.message.includes('User does not exist'));
            return;
        }
        assert(false);
    })

    it('should delete user account', async () => {
        try {
            await this.contract.deleteUserAccount();
            // should throw an exception
            await this.contract.findUserByAddress(account1);
        } catch (error) {
            assert(error.message.includes('User does not exist'));
            return;
        }
        assert(false);
    });
})

contract('MyContract Contract', accounts => {
    let account1 = null;
    let account2 = null;

    before(async () => {
        this.contract = await MyContract.deployed()
        account1 = accounts[0];
        account2 = accounts[1];
    });

    it('should create new product for valid user', async () => {
        // create new seller
        await this.contract.createNewAccount(userOne, { from: account1 });

        await this.contract.createNewProduct(productOne.productDetails, { from: account1 });
        const product = await this.contract.findProduct(1);

        assert.equal(product['_seller'], account1);
        assert.equal(product['_productDetails'], productOne.productDetails);
    })

    it('should not create new product for anonymous user', async () => {
        try {
            // should throw an exception
            await this.contract.createNewProduct(productOne.productDetails, { from: account2 });
        } catch (error) {
            assert(error.message.includes('User does not exist'));
            return;
        }
        assert(false);
    })

    it('should update an existing product', async () => {
        await this.contract.updateProduct(1, 'product 2');
        const product = await this.contract.findProduct(1);

        assert.equal(product['_seller'], account1);
        assert.equal(product['_productDetails'], 'product 2');
    })

    it("should not update a non existing user's product", async () => {
        try {
            await this.contract.updateProduct(1, 'product 2', { from: account2 });
        } catch (error) {
            assert(error.message.includes('Only valid owner is allowed to edit product'));
            return;
        }
        assert(false);
    })

    it('should get product by id', async () => {
        const product = await this.contract.findProduct(1);
        assert.equal(product['_seller'], account1);
        assert.equal(product['_productDetails'], 'product 2');
    })

    it('should throw an error if product does not exist', async () => {
        try {
            // should throw an exception
            await this.contract.findProduct(2);
        } catch (error) {
            assert(error.message.includes('Product does not exist!'));
            return;
        }
        assert(false);
    })

    it('should delete an existing product', async () => {
        try {
            await this.contract.deleteProduct(1);
            // should throw an exception
            await this.contract.findProduct(1);
        } catch (error) {
            assert(error.message.includes('Product does not exist!'));
            return;
        }
        assert(false);
    })

    it('should not delete a non existing product', async () => {
        try {
            await this.contract.deleteProduct(2);
        } catch (error) {
            assert(error.message.includes('Product does not exist!'));
            return;
        }
        assert(false);
    })

    it('should delete an existing user account and all his products', async () => {
        try {
            await this.contract.deleteUserAccount();
            await this.contract.findUserByAddress(account1);
        } catch (error) {
            assert(error.message.includes('User does not exist'));
            return;
        }
        assert(false);
    })

    it('should not delete a non existing user account', async () => {
        try {
            await this.contract.deleteUserAccount({ from: account2 });
        } catch (error) {
            assert(error.message.includes('User does not exist'));
            return;
        }
        assert(false);
    })
})