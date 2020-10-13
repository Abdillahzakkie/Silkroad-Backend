// SPDX-License-Identifier: MIT
pragma experimental ABIEncoderV2;
pragma solidity >=0.4.22 <0.8.0;

import "@openzeppelin/contracts-ethereum-package/contracts/access/Ownable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/Initializable.sol";

contract UserContract is Initializable {
    using SafeMath for uint;
    uint userCounter;
    address payable public admin;


    mapping(address => User) public users;
    
    // Structures
    struct User {
        address payable user;
        string details;
        uint id;
    }
    
    // Events
    event NewSellerCreated(uint indexed id);

    function initialize(address payable _admin) initializer public {
        admin = _admin;
    }
    
    // Create new User
    function createNewAccount(string calldata _details) external {
        address payable _user = msg.sender;
        require(users[_user].id == 0, "User has already existed");
        require(encode(_details) != encode(''), "Data field can not be empty");

        userCounter = userCounter.add(1);
        User memory _newUser = User(_user, _details, userCounter);
        users[_user] = _newUser;
        emit NewSellerCreated(userCounter);
    }
    
    // Update account details
    function updateAccountDetails(string calldata _details) external {
        address payable _user = msg.sender;
        require(users[_user].id > 0, "User does not exist");
        require(encode(_details) != encode(''), "Data field can not be empty");
        require(_user == users[_user].user, "Not a valid owner");

        users[_user].details = _details;
    }

    // Find user by address
    function findUserByAddress(address _user) public view returns(User memory) {
        require(users[_user].id > 0, "User does not exist");
        return users[_user];
    }

    function encode(string memory _data) internal pure returns(bytes32) {
        return keccak256(abi.encodePacked(_data));
    }

}

contract ProductContract is UserContract {
    using SafeMath for uint;
    uint public productCount;
    
    mapping(uint => Product) private products;

    struct Product {
        address payable seller;
        string details;
        uint id;
        // uint price;
    }
    
    // Events
    event NewProductCreated(uint id);
    event DeleteProduct(uint id);
    
    // Create new product
    function createNewProduct(string calldata _details) external {
        address payable _seller = msg.sender;
        findUserByAddress(_seller);
        require(encode(_details) != encode(''), "Data field can not be empty");

        // increment product count
        productCount = productCount.add(1);
        
        Product memory _newProduct = Product(_seller, _details, productCount);
        products[productCount] = _newProduct;
        emit NewProductCreated(productCount);
    }
    
    // Update an existing product
    function updateProduct(uint _id, string calldata _details) external {
        address payable _seller = msg.sender;
        require(products[_id].id > 0, "Product does not exist!");
        require(_seller == products[_id].seller, "Not a valid owner");
        require(encode(_details) != encode(''), "Input can not be blank");
        
        products[_id] = Product(_seller, _details, _id);
    }
    
    // Delete existing product
    function deleteProduct(uint _id) public returns(bool) {
        address payable _seller = msg.sender;
        require(products[_id].id > 0, "Product does not exist!");
        require(
            _seller == products[_id].seller, 
            "Only valid owner is allowed to delete product"
        );
        delete products[_id];
        emit DeleteProduct(_id);
        assert(products[_id].id == 0);
    }
    
    // Delete account
    function deleteUserAccount() external {
        address payable _seller = msg.sender;
        require(users[_seller].id > 0, "User does not exist");

        for(uint i = 1; i <= productCount; i++) {
            if(_seller == products[i].seller) delete products[i];
        }
        delete users[_seller];
    }

    // find product
    function findProduct(uint _id) public view returns(Product memory) {
        require(products[_id].id != 0, "Product does not exist!");
        return products[_id];
    }
}

contract OrderBook is ProductContract {
    uint orderCount;
    mapping(uint => Order) public orders;

    struct Order {
        uint id;
        address payable seller;
        address payable buyer;
    }

    // function buy(uint _id) public payable returns(uint) {
    //     Product memory product = super.findProduct(_id);
    //     uint price = product;
    //     require(product);
    // }
}

contract MyContract is OrderBook { }