// Load compiled artifacts
const MyContract = artifacts.require('MyContract');

const userDetails = {
    one: "user one detaiis",
    two: "user two details",
}

const productDetails = {
    one: "product one",
    two: "product two",
}

const errorMessages = {
    duplicateUser: "User has already existed",
    unregisteredUser: "User does not exist",
    emptyData: "Data field can not be empty",
    onlyOwner: "Not a valid owner",
    unregisterdProduct: "Product does not exist",
}

contract('User Contract', accounts => {
    let account1 = null;
    let account2 = null;

    before(async () => {
        this.contract = await MyContract.deployed();
        account1 = accounts[0];
        account2 = accounts[1];
    });

    it('should deploy smart contract properly', async () => assert(this.contract.address !== ''));

    it('should create new account', async () => {
        // create new account
        await this.contract.createNewAccount(userDetails.one);

        const user = await this.contract.findUserByAddress(account1);
        assert.equal(user['user'], account1);
        assert.equal(user['details'], userDetails.one);
    });

    it('should not create multiple account for one user', async () => {
        try {
            // create new account
            await this.contract.createNewAccount(userDetails.two);

        } catch (error) {
            assert(error.message.includes(errorMessages.duplicateUser));
            return;
        }
        assert(false);
    })

    it('should update valid user account', async () => {
        await this.contract.updateAccountDetails(userDetails.two);
        const user = await this.contract.findUserByAddress(account1);
        assert.equal(user['id'], '1');
        assert.equal(user['details'], userDetails.two);
        assert.equal(user['user'], account1);
    })

    it('should not update account details for non existing user', async () => {
        try {
            await this.contract.updateAccountDetails(userDetails.two, { from: account2 });
        } catch (error) {
            assert(error.message.includes(errorMessages.unregisteredUser))
        }
    })

    it('should not update valid account with invalid credential', async () => {
        try {
            // should throw an exception 
            await this.contract.updateAccountDetails('');
        } catch (error) {
            assert(error.message.includes(errorMessages.emptyData));
            return;
        }
        assert(false);
    })

    it('should find user by address', async () => {
        const user = await this.contract.findUserByAddress(account1);
        assert.equal(user['id'], '1');
        assert.equal(user['details'], userDetails.two);
        assert.equal(user['user'], account1);
    })

    it('should throw an error if user does not exist', async () => {
        try {
            // should throw an exception 
            await this.contract.findUserByAddress(account2);
        } catch (error) {
            assert(error.message.includes(errorMessages.unregisteredUser));
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
            assert(error.message.includes(errorMessages.unregisteredUser));
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
        await this.contract.createNewAccount(userDetails.one, { from: account1 });

        await this.contract.createNewProduct(productDetails.one, { from: account1 });
        const product = await this.contract.findProduct(1);

        assert.equal(product['seller'], account1);
        assert.equal(product['details'], productDetails.one);
    })

    it('should not create new product for anonymous user', async () => {
        try {
            // should throw an exception
            await this.contract.createNewProduct(productDetails.one, { from: account2 });
        } catch (error) {
            assert(error.message.includes(errorMessages.unregisteredUser));
            return;
        }
        assert(false);
    })

    it('should update an existing product', async () => {
        await this.contract.updateProduct(1, productDetails.two);
        const product = await this.contract.findProduct(1);

        assert.equal(product['seller'], account1);
        assert.equal(product['details'], productDetails.two);
    })

    it("should not update a non existing user's product", async () => {
        try {
            await this.contract.updateProduct(1, productDetails.two, { from: account2 });
        } catch (error) {
            assert(error.message.includes(errorMessages.onlyOwner));
            return;
        }
        assert(false);
    })

    it('should find product by id', async () => {
        const product = await this.contract.findProduct(1);
        assert.equal(product['seller'], account1);
        assert.equal(product['id'], 1);
    })

    it('should throw an error if product does not exist', async () => {
        try {
            // should throw an exception
            await this.contract.findProduct(2);
        } catch (error) {
            assert(error.message.includes(errorMessages.unregisterdProduct));
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
            assert(error.message.includes(errorMessages.unregisterdProduct));
            return;
        }
        assert(false);
    })

    it('should not delete a non existing product', async () => {
        try {
            await this.contract.deleteProduct(2);
        } catch (error) {
            assert(error.message.includes(errorMessages.unregisterdProduct));
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
            assert(error.message.includes(errorMessages.unregisteredUser));
            return;
        }
        assert(false);
    })
})