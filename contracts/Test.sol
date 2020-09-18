// "SPDX-License-Identifier: Unlicensed"
pragma experimental ABIEncoderV2;
pragma solidity ^0.7.0;

import "./Openzepplin/SafeMath.sol";
import "./User.sol";

contract Test is UserContract {
    using SafeMath for uint;
    
    mapping(uint => Product) private products;

    uint public productCount;
    
    struct Product {
        address payable _seller;
        string _productName;
        string _description;
        string _type;
        uint _productID;
        uint _price;
        uint _quantity;
    }
    
    // Events
    event NewProductCreated(uint _id);
    event DeleteProduct(uint _id);
    
    // Create new product
    function createNewProduct(
        string memory _productName,
        string memory _description,
        string memory _type,
        uint _price,
        uint _quantity
    ) 
        external returns(uint) 
    {
        address payable _seller = msg.sender;
        require(users[_seller]._id > 0, "User does not exist");
        require(
            encode(_productName) != encode('') ||
            encode(_description) != encode('') ||
            encode(_type) != encode(''),
            "Input can not be blank"
        );

        // increment product count
        productCount = incrementCounter(productCount);
        
        Product memory _newProduct = Product(
            msg.sender, _productName, _description, _type, productCount, _price, _quantity
        );
        products[productCount] = _newProduct;
        emit NewProductCreated(productCount);
    }
    
    // Update an existing product
    function updateProduct(
        uint _productID, 
        string memory _productName,
        string memory _description,
        string memory _type,
        uint _price,
        uint _quantity
    ) 
        external returns(bool) 
    {
        require(products[_productID]._productID > 0, "Product does not exist!");
        require(
            msg.sender == products[_productID]._seller, 
            "Only valid owner is allowed to edit product"
        );
        require(
            encode(_productName) != encode('') ||
            encode(_description) != encode('') ||
            encode(_type) != encode(''),
            "Input can not be blank"
        );
        
        products[_productID] = Product(
            msg.sender, _productName, _description, _type, productCount, _price, _quantity
        );
    }
    
    // Delete existing product
    function deleteProduct(uint _productID) public returns(bool) {
        require(products[_productID]._productID > 0, "Product does not exist!");
        require(
            msg.sender == products[_productID]._seller, 
            "Only valid owner is allowed to delete product"
        );
        delete products[_productID];
        require(products[_productID]._productID == 0);
        emit DeleteProduct(_productID);
    }
    
    // Delete account
    function deleteUserAccount() external {
        require(users[msg.sender]._id > 0, "User does not exist");

        for(uint i = 1; i <= productCount; i++) {
            if(products[i]._seller == msg.sender) delete products[i];
        }
        delete users[msg.sender];
    }

    // find product
    function findProduct(uint _id) public view returns(Product memory) {
        require(products[_id]._productID != 0, "Product does not exist!");
        return products[_id];
    }

    // Product count
    function getProductCount() public view returns(uint) {
        return productCount;
    }
}

// 0xBf9C6e1579523cA2400E46Fa20606Cd4e2b396c6