// "SPDX-License-Identifier: Unlicensed"
pragma experimental ABIEncoderV2;
pragma solidity ^0.7.0;

import "./Openzepplin/SafeMath.sol";
import "./User.sol";

contract ProductContract is UserContract {
    using SafeMath for uint;
    
    mapping(uint => Product) private products;

    uint public productCount;
    
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
        require(users[_seller]._id > 0, "User does not exist");
        require(encode(_productDetails) != encode(''), "Input can not be blank");

        // increment product count
        productCount = incrementCounter(productCount);
        
        Product memory _newProduct = Product(msg.sender, _productDetails, productCount);
        products[productCount] = _newProduct;
        emit NewProductCreated(productCount);
    }
    
    // Update an existing product
    function updateProduct(uint _productId, string memory _productDetails) external {
        require(products[_productId]._productId > 0, "Product does not exist!");
        require(
            msg.sender == products[_productId]._seller, 
            "Only valid owner is allowed to edit product"
        );
        require(encode(_productDetails) != encode(''), "Input can not be blank");
        
        products[_productId] = Product(msg.sender, _productDetails, _productId);
    }
    
    // Delete existing product
    function deleteProduct(uint _productId) public returns(bool) {
        require(products[_productId]._productId > 0, "Product does not exist!");
        require(
            msg.sender == products[_productId]._seller, 
            "Only valid owner is allowed to delete product"
        );
        delete products[_productId];
        require(products[_productId]._productId == 0);
        emit DeleteProduct(_productId);
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
    function findProduct(uint _productId) public view returns(Product memory) {
        require(products[_productId]._productId != 0, "Product does not exist!");
        return products[_productId];
    }

    // Product count
    function getProductCount() public view returns(uint) {
        return productCount;
    }
}