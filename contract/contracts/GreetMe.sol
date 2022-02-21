// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract GreetMe {
    string[] greetings; // Array of messages
    address[] greeters; // Array of message senders

    // Event fired when new greeting is sent
    event Greet(address indexed greeter, string greeting);

    constructor() {
        console.log("GreetMe ready!");
    }

    // Function to store a greeting
    function greet(string memory greetingMsg) external {
        greetings.push(greetingMsg);
        greeters.push(msg.sender);
        emit Greet(msg.sender, greetingMsg);
    }

    // Function to return number of greetings
    function getNumOfGreetings() public view returns (uint256) {
        return greetings.length;
    }

    // Function to return greetings. 'numOfMessages' must be 0 to get all messages. For anything other than 0, say 'n', last n messages are returned
    function getGreetings(uint256 _numOfMessagesNeeded) public view returns (string[] memory, address[] memory) {
        uint256 _numOfMessagesStored = getNumOfGreetings();
        if((_numOfMessagesNeeded == 0) || (_numOfMessagesNeeded > _numOfMessagesStored)){
            return (greetings, greeters);
        } else {
            string[] memory _greetingsToReturn = new string[](_numOfMessagesNeeded);
            address[] memory _greetersToReturn = new address[](_numOfMessagesNeeded);
            uint256 currentIndex = 0;
            for (uint256 i = _numOfMessagesStored - _numOfMessagesNeeded; i < _numOfMessagesStored; i++){
                _greetingsToReturn[currentIndex] = greetings[i];
                _greetersToReturn[currentIndex] = greeters[i];
                currentIndex += 1;
            }
            return (_greetingsToReturn, _greetersToReturn);
        }
    }
}
