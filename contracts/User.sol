// SPDX-License-Identifier: MIT
pragma experimental ABIEncoderV2;
pragma solidity ^0.7.0;

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
    // event AccountDeleted(User _user);
    

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