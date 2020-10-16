const web3 = require('web3');
const MyContract = artifacts.require('MyContract');

const token = value => web3.utils.toWei(String(value));

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
    invalidPrice: "Price must be above zero",
    noCartProduct: "No cart detail found",
    invalidCartOverride: "Cannot override cart details directly",
}

contract('User', accounts => {
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

        const account = await this.contract.findUserByAddress(account1);
        const { user, details, id } = account;
        assert.equal(user, account1);
        assert.equal(details, userDetails.one);
        assert.equal(id.toString(), "1");
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
        const account = await this.contract.findUserByAddress(account1);
        const { id, user, details } = account;
        assert.equal(id, '1');
        assert.equal(details, userDetails.two);
        assert.equal(user, account1);
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
        const account = await this.contract.findUserByAddress(account1);
        const { id, user, details } = account;
        assert.equal(id, '1');
        assert.equal(details, userDetails.two);
        assert.equal(user, account1);
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

contract('Product', accounts => {
    let account1 = null;
    let account2 = null;

    before(async () => {
        this.contract = await MyContract.deployed()
        account1 = accounts[0];
        account2 = accounts[1];
    });

    it('should validate and create new product for existing user', async () => {
        // create new seller
        await this.contract.createNewAccount(userDetails.one, { from: account1 });

        await this.contract.createNewProduct(productDetails.one, token(100), { from: account1 });
        const product = await this.contract.findProduct(1);

        const { seller, details, price, featured } = product;

        assert.equal(seller, account1);
        assert.equal(details, productDetails.one);
        assert.equal(price, token(100));
        assert(price > 0);
        assert.equal(featured, false);

        // should not create new product for anonymous user
        this.contract.createNewProduct(productDetails.one, token(100), { from: account2 })
            .then(() => assert(false))
            .catch(error => {
                assert(error.message.includes(errorMessages.unregisteredUser));
            });
    })

    it('should validate and update an existing product', async () => {
        await this.contract.updateProduct(1, token(100), productDetails.two, { from: account1 });
        const product = await this.contract.findProduct(1);
        const { seller, details, price, featured } = product;

        assert.equal(seller, account1);
        assert.equal(details, productDetails.two);
        assert.equal(price.toString(), token(100));
        assert.equal(featured, false);

        // should not update product if details is empty
        this.contract.updateProduct(1, token(100), '', { from: account1 })
            .then(() => assert(false))
            .catch(error => {
                assert(error.message.includes(errorMessages.emptyData))
            });
        
        // should not update product if price is less than or equal to zero
        this.contract.updateProduct(1, token(0), productDetails.one, { from: account1 })
            .then(() => assert(false))
            .catch(error => {
                assert(error.message.includes(errorMessages.invalidPrice));
            });
    })

    it("should not update a non existing user's product", async () => {
        try {
            await this.contract.updateProduct(1, token(100), productDetails.two, { from: account2 });
        } catch (error) {
            assert(error.message.includes(errorMessages.onlyOwner));
            return;
        }
        assert(false);
    })

    it('should validate and add product to cart', async () => {
        try {
            await this.contract.addProductToCart("cart details", { from: account1 });
            const cart = await this.contract.findCartProduct(account1);
            const { buyer, details } = cart;
            assert.equal(buyer, account1);
            assert.equal(details, "cart details");

            // should not add product to cart for non existing user
            await this.contract.addProductToCart("cart details", { from: account2 });
        } catch (error) {
            assert(error.message.includes(errorMessages.unregisteredUser));
            return
        }
        assert(false)
    })

    it('should not override already cart product directly', async () => {
        try {
            await this.contract.addProductToCart("cart details", { from: account1 });
        } catch (error) {
            assert(error.message.includes(errorMessages.invalidCartOverride));
            return
        }
        assert(false)
    })

    it('should validate and update cart details', async () => {
        await this.contract.updateCartProduct("new cart details");
        const cart = await this.contract.findCartProduct(account1);
        const { details } = cart;
        assert.equal(details, "new cart details");

        // should not update cart if details field is empty 
        try {
            await this.contract.updateCartProduct("", { from: account1 });
        } catch (error) {
            assert(error.message.includes(errorMessages.emptyData));
            return
        }
        assert(false);
    })

    it('should delete product from cart', async () => {
        try {
            await this.contract.removeProductFromCart();
            await this.contract.findCartProduct(account1);
        } catch (error) {
            assert(error.message.includes(errorMessages.noCartProduct));
            return
        }
        assert(false)
    })

    it('should find product by id and through an excetion when product does not exist', async () => {
        const product = await this.contract.findProduct(1);
        const { seller, id, price} = product;
        assert.equal(seller, account1);
        assert.equal(id, 1);
        assert.equal(price, token(100));

        // should throw an error if product does not exist
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

            this.contract.findProduct(1)
                .then(() => assert(false))
                .catch(error => {
                    assert(error.message.includes(errorMessages.unregisterdProduct))
                });

            await this.contract.findUserByAddress(account1);
        } catch (error) {
            assert(error.message.includes(errorMessages.unregisteredUser));
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