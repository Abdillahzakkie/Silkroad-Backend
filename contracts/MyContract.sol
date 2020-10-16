// SPDX-License-Identifier: MIT
pragma experimental ABIEncoderV2;
pragma solidity >=0.4.22 <0.8.0;

import "@openzeppelin/contracts-ethereum-package/contracts/access/Ownable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/Initializable.sol";

contract UserContract {
    using SafeMath for uint;
    bool internal reEntrancyMutex;
    uint userCounter;


    mapping(address => User) public users;
    
    // Structures
    struct User {
        address payable user;
        string details;
        uint id;
    }
    
    // Events
    event NewSellerCreated(uint indexed id);
    
    // Create new User
    function createNewAccount(string memory _details) public {
        address payable _user = msg.sender;
        require(users[_user].id == 0, "User has already existed");
        require(encode(_details) != encode(''), "Data field can not be empty");

        userCounter = userCounter.add(1);
        User memory _newUser = User(_user, _details, userCounter);
        users[_user] = _newUser;
        emit NewSellerCreated(userCounter);
    }
    
    // Update account details
    function updateAccountDetails(string memory _details) public {
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
    mapping (address => Cart) public carts;
    mapping(address => bool) public inCart;


    struct Product {
        address payable seller;
        string details;
        uint id;
        uint price;
        bool featured;
    }

    struct Cart {
        address buyer;
        string details;
    }

    // Events
    event NewProductCreated(uint id);
    event DeleteProduct(uint id);
    
    // Create new product
    function createNewProduct(string memory _details, uint _price) public {
        address payable _seller = msg.sender;
        super.findUserByAddress(_seller);
        require(encode(_details) != encode(""), "Data field can not be empty");
        require(_price > 0, "Price must be above zero");

        // increment product count
        productCount = productCount.add(1);
        
        Product memory _newProduct = Product(_seller, _details, productCount, _price, false);
        products[productCount] = _newProduct;
        emit NewProductCreated(productCount);
    }
    
    // Update an existing product
    function updateProduct(uint _id, uint _price, string memory _details) public {
        address payable _seller = msg.sender;
        require(findProduct(_id).id > 0, "Product does not exist!");
        require(_seller == findProduct(_id).seller, "Not a valid owner");
        require(encode(_details) != encode(""), "Data field can not be empty");
        require(_price > 0, "Price must be above zero");

        bool _featured = findProduct(_id).featured;
        
        products[_id] = Product(_seller, _details, _id, _price, _featured);
    }

    // Add product to cart
    function addProductToCart(string memory _details) public {
        address _buyer = msg.sender;
        findUserByAddress(_buyer);
        require(inCart[_buyer] == false, "Cannot override cart details directly");
        require(encode(_details) != encode(""), "Data field can not be empty");
        
        Cart memory _newCart = Cart(_buyer, _details);
        inCart[_buyer] = true;
        carts[_buyer] = _newCart;
    } 

    // Update cart product
    function updateCartProduct(string memory _details) public {
        address _buyer = msg.sender;
        findCartProduct(_buyer);
        require(encode(_details) != encode(""), "Data field can not be empty");
        carts[_buyer].details = _details;
    }

    // Remove product from cart
    function removeProductFromCart() public {
        address _buyer = msg.sender;
        findCartProduct(_buyer);
        inCart[_buyer] = false;
        delete carts[_buyer];
    }
    
    // find product
    function findProduct(uint _id) public view returns(Product memory) {
        require(products[_id].id != 0, "Product does not exist!");
        return products[_id];
    }

    // Find cart product
    function findCartProduct(address _buyer) public view returns(Cart memory) {
        require(inCart[_buyer] == true, "No cart detail found");
        return carts[_buyer];
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
    function deleteUserAccount() public {
        address payable _seller = msg.sender;
        require(users[_seller].id > 0, "User does not exist");

        for(uint i = 1; i <= productCount; i++) {
            if(_seller == products[i].seller) delete products[i];
        }
        delete users[_seller];
    }
}

contract MyContract is Initializable, ProductContract {
    using SafeMath for uint;
    address payable public admin;
    uint public featureProductRate;
    uint public orderCount;

    mapping(uint => Order) public orders;
    mapping(uint => bool) public isFeaturedProduct;

    
    modifier onlyAdmin() {
        require(msg.sender == admin);
        _;
    }

    struct Order {
        address buyer;
        uint id;
    }

    // Events
    event BuyProduct(uint id);

    function initialize(address payable _admin) initializer public {
        admin = _admin;
        reEntrancyMutex = false;
        featureProductRate = 5;
    }

    // Set feature product rate 
    function setFeatureProductRate(uint _rate) public onlyAdmin {
        featureProductRate = _rate;
    }

    function calcFeatureProductRate(uint _id) public view returns(uint result) {
        Product memory _product = super.findProduct(_id);
        uint _price = _product.price;
        result = _price.mul(featureProductRate.div(100));
        return result;
    }

    // Feature products
    function featureProduct(uint _id) public payable {
        uint _amount = msg.value;
        uint _price = calcFeatureProductRate(_id);

        Product memory _product = findProduct(_id);

        require(isFeaturedProduct[_id] == false, "Product has already been featured");
        require(_amount >= _price, "Not enough fund to proceed");
        require(msg.sender == _product.seller, "Not a valid owner");

        uint _prevBalance = address(this).balance;

        payable(address(this)).transfer(_amount);
        uint _currBalance = address(this).balance;
        assert(_currBalance >= _prevBalance.add(_amount));

        isFeaturedProduct[_id] = true;

        _product = Product(
            _product.seller,
            _product.details,
            _product.id,
            _product.price,
            true
        );
    }

    // Buy product
    function buy(uint _id) public payable returns(uint) {
        address _buyer = msg.sender;
        uint _amount = msg.value;
        uint _contractBalance = address(this).balance;

        Product memory _product = findProduct(_id);
        uint _price = _product.price;

        require(_price >= _amount, "Not enough balance");

        payable(address(this)).transfer(_amount);
        assert(_contractBalance < _contractBalance.add(_amount));

        orderCount = orderCount.add(1);
        orders[orderCount] = Order(_buyer, orderCount);

        emit BuyProduct(orderCount);
    }
}