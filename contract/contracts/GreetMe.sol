// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract GreetMe {
    string[] greetings; // Array of messages
    address[] greeters; // Array of message senders
    uint256[] timestamps; // Array of timestamps of messages

    // Event fired when new greeting is sent
    event Greet(uint256 indexed id, address indexed greeter, string greeting, uint256 timestamp);

    constructor() {
        console.log("GreetMe ready!");
    }

    // Function to store a greeting
    function greet(string memory greetingMsg) external {
        greetings.push(greetingMsg);
        greeters.push(msg.sender);
        timestamps.push(block.timestamp);
        emit Greet(greetings.length - 1, msg.sender, greetingMsg, block.timestamp);
    }

    // Function to return number of greetings
    function getNumOfGreetings() public view returns (uint256) {
        return greetings.length;
    }

    // Function to return greetings. 'numOfMessages' must be 0 to get all messages. For anything other than 0, say 'n', last n messages are returned
    function getGreetings(uint256 _numOfMessagesNeeded) public view returns (uint256[] memory, string[] memory, address[] memory, uint256[] memory) {
        uint256 _numOfMessagesStored = getNumOfGreetings();
        if((_numOfMessagesNeeded == 0) || (_numOfMessagesNeeded >= _numOfMessagesStored)){
            uint256[] memory _ids = new uint256[](_numOfMessagesStored);
            for(uint256 i = 0; i < _numOfMessagesStored; i++){
                _ids[i] = i;
            }
            return (_ids, greetings, greeters, timestamps);
        } else {
            uint256[] memory _ids = new uint256[](_numOfMessagesStored);
            string[] memory _greetingsToReturn = new string[](_numOfMessagesNeeded);
            address[] memory _greetersToReturn = new address[](_numOfMessagesNeeded);
            uint256[] memory _timestampsToReturn = new uint256[](_numOfMessagesNeeded);
            uint256 currentIndex = 0;
            for (uint256 i = _numOfMessagesStored - _numOfMessagesNeeded; i < _numOfMessagesStored; i++){
                _ids[currentIndex] = i;
                _greetingsToReturn[currentIndex] = greetings[i];
                _greetersToReturn[currentIndex] = greeters[i];
                _timestampsToReturn[currentIndex] = timestamps[i];
                currentIndex += 1;
            }
            return (_ids, _greetingsToReturn, _greetersToReturn, _timestampsToReturn);
        }
    }
}
