// SPDX-License-Identifier: MIT
pragma experimental ABIEncoderV2;
pragma solidity ^0.7.0;

// import "./User.sol";
import "./Openzepplin/Ownable.sol";
import "./Openzepplin/SafeMath.sol";

contract UserContract is Ownable {
    using SafeMath for uint;

    mapping(address => User) public users;
    uint userCounter;
    
    // Structures
    struct User {
        address payable _account;
        string _hashID;
        uint _id;
    }
    
    // Events
    event NewSellerCreated(uint indexed _id);
    

    // Create new User
    function createNewAccount(string memory _hashID) external returns(bool) {
        address payable _user = msg.sender;
        require(users[_user]._id == 0, "User has already existed");
        require(encode(_hashID) != encode(''), 'Invalid hash id');

        userCounter = incrementCounter(userCounter);
        
        User memory _newUser = User(_user, _hashID, userCounter);
        
        users[_user] = _newUser;
        emit NewSellerCreated(userCounter);
        return true;
    }
    
    // Update account details
    function updateAccountDetails(string memory _hashID) external {
        address payable _account = msg.sender;
        require(users[_account]._id > 0, "User does not exist");
        require(encode(_hashID) != encode(''), 'Invalid hash id');
        require(_account == users[_account]._account, 'Not a valid owner');

        users[_account]._hashID = _hashID;
    }

    // Find user by address
    function findUserByAddress(address _account) public view returns(User memory) {
        require(users[_account]._id > 0, "User does not exist");
        return users[_account];
    }

    // Increment seller's count
    function incrementCounter(uint _count) internal pure returns(uint) {
        return _count.add(1);
    }

    function encode(string memory _data) internal pure returns(bytes32) {
        return keccak256(abi.encodePacked(_data));
    }

}

contract MyContract is UserContract {
    using SafeMath for uint;
    uint public productCount;
    
    mapping(uint => Product) private products;

    struct Product {
        address payable _seller;
        string _productDetails;
        uint _productId;
    }
    
    // Events
    event NewProductCreated(uint _id);
    event DeleteProduct(uint _id);
    
    // Create new product
    function createNewProduct(string memory _productDetails) external {
        address payable _seller = msg.sender;
        findUserByAddress(_seller);
        require(encode(_productDetails) != encode(''), "Input can not be blank");

        // increment product count
        productCount = incrementCounter(productCount);
        
        Product memory _newProduct = Product(_seller, _productDetails, productCount);
        products[productCount] = _newProduct;
        emit NewProductCreated(productCount);
    }
    
    // Update an existing product
    function updateProduct(uint _productId, string memory _productDetails) external {
        address payable _seller = msg.sender;
        require(products[_productId]._productId > 0, "Product does not exist!");
        require(
            _seller == products[_productId]._seller, 
            "Only valid owner is allowed to edit product"
        );
        require(encode(_productDetails) != encode(''), "Input can not be blank");
        
        products[_productId] = Product(_seller, _productDetails, _productId);
    }
    
    // Delete existing product
    function deleteProduct(uint _productId) public returns(bool) {
        address payable _seller = msg.sender;
        require(products[_productId]._productId > 0, "Product does not exist!");
        require(
            _seller == products[_productId]._seller, 
            "Only valid owner is allowed to delete product"
        );
        delete products[_productId];
        require(products[_productId]._productId == 0);
        emit DeleteProduct(_productId);
    }
    
    // Delete account
    function deleteUserAccount() external {
        address payable _seller = msg.sender;
        require(users[_seller]._id > 0, "User does not exist");

        for(uint i = 1; i <= productCount; i++) {
            if(products[i]._seller == _seller) delete products[i];
        }
        delete users[_seller];
    }

    // find product
    function findProduct(uint _productId) public view returns(Product memory) {
        require(products[_productId]._productId != 0, "Product does not exist!");
        return products[_productId];
    }

    // Product count
    // function getProductCount() public view returns(uint) {
    //     return productCount;
    // }
}