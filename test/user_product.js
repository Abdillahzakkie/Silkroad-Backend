const ProductContract = artifacts.require('ProductContract');

let account1 = null;
let account2 = null;
const userOne = 'user one';
const productOne = {
    productDetails: 'product one'
}

contract('User Contract', accounts => {
    let contract = null;
    
    before(async () => {
        contract = await ProductContract.deployed()
        account1 = accounts[0];
        account2 = accounts[1];
    });

    it('should deploy smart contract properly', async () => assert(contract.address !== ''));

    it('should create new account', async () => {
        // create new account
        await contract.createNewAccount(userOne);

        const user = await contract.findUserByAddress(account1);
        assert(user['_account'] === account1);
        assert(user['_hashID'] === userOne);
    });

    it('should not create multiple account for one user', async () => {
        try {
            // create new account
            await contract.createNewAccount('second account');

        } catch (error) {
            assert(error.message.includes('User has already existed'));
            return;
        }
        assert(false);
    })

    it('should update valid user account', async () => {
        await contract.updateAccountDetails('new hash id');
        const user = await contract.findUserByAddress(account1);
        assert(user['_hashID'] === 'new hash id');
        assert(user['_account'] === account1);
        assert(user['_id'] === '1')
    })

    it('should not update account details for non existing user', async () => {
        try {
            await contract.updateAccountDetails('hash id', { from: account2 });
        } catch (error) {
            assert(error.message.includes('User does not exist'))
        }
    })

    it('should not update valid account with invalid credential', async () => {
        try {
            // should throw an exception 
            await contract.updateAccountDetails('');
        } catch (error) {
            assert(error.message.includes('Invalid hash id'));
            return;
        }
        assert(false);
    })

    it('should find user by address', async () => {
        const user = await contract.findUserByAddress(account1);
        assert(user['_id'] === '1');
        assert(user['_hashID'] === 'new hash id');
        assert(user['_account'] === account1);
    })

    it('should throw an error if user does not exist', async () => {
        try {
            // should throw an exception 
            await contract.findUserByAddress(account2);
        } catch (error) {
            assert(error.message.includes('User does not exist'));
            return;
        }
        assert(false);
    })

    it('should delete user account', async () => {
        try {
            await contract.deleteUserAccount();
            // should throw an exception
            await contract.findUserByAddress(account1);
        } catch (error) {
            assert(error.message.includes('User does not exist'));
            return;
        }
        assert(false);
    });
})

contract('Product Contract', () => {
    let contract = null;
    
    before(async () => contract = await ProductContract.deployed());

    it('should create new product for valid user', async () => {
        // create new seller
        await contract.createNewAccount(userOne, { from: account1 });

        await contract.createNewProduct(productOne.productDetails, { from: account1 });
        const product = await contract.findProduct(1);

        assert(product['_seller'] === account1);
        assert(product['_productDetails'] === productOne.productDetails);
    })

    it('should not create new product for anonymous user', async () => {
        try {
            // should throw an exception
            await contract.createNewProduct(productOne.productDetails, { from: account2 });
        } catch (error) {
            assert(error.message.includes('User does not exist'));
            return;
        }
        assert(false);
    })

    it('should update an existing product', async () => {
        await contract.updateProduct(1, 'product 2');
        const product = await contract.findProduct(1);

        assert(product['_seller'] === account1);
        assert(product['_productDetails'] === 'product 2');
    })

    it('should not update a non existing user', async () => {
        try {
            await contract.updateProduct(1, 'product 2', { from: account2 });
        } catch (error) {
            assert(error.message.includes('Only valid owner is allowed to edit product'));
            return;
        }
        assert(false);
    })

    it('should get product by id', async () => {
        const product = await contract.findProduct(1);
        assert(product['_seller'] === account1);
        assert(product['_productDetails'] === 'product 2');
    })

    it('should throw an error if product does not exist', async () => {
        try {
            // should throw an exception
            await contract.findProduct(2);
        } catch (error) {
            assert(error.message.includes('Product does not exist!'));
            return;
        }
        assert(false);
    })

    it('should delete an existing product', async () => {
        try {
            await contract.deleteProduct(1);
            // should throw an exception
            await contract.findProduct(1);
        } catch (error) {
            assert(error.message.includes('Product does not exist!'));
            return;
        }
        assert(false);
    })

    it('should not delete a non existing product', async () => {
        try {
            await contract.deleteProduct(2);
        } catch (error) {
            assert(error.message.includes('Product does not exist!'));
            return;
        }
        assert(false);
    })

    it('should delete an existing user account and all his products', async () => {
        try {
            await contract.deleteUserAccount();
            await contract.findUserByAddress(account1);
            // await contract.findProduct(1);
        } catch (error) {
            assert(error.message.includes('User does not exist'));
            // assert(error.message.includes('Product does not exist!'));
            return;
        }
        assert(false);
    })

    it('should not delete a non user account', async () => {
        try {
            await contract.deleteUserAccount({ from: account2 });
        } catch (error) {
            assert(error.message.includes('User does not exist'));
            return;
        }
        assert(false);
    })
})