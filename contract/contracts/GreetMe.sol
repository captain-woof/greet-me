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

    // Function to generate a sequence of integers; 'end' is off-by-one.
    function range(uint256 start, uint256 end) pure internal returns (uint256[] memory){
        uint256[] memory arr = new uint256[](end - start);
        for (uint256 i = start; i < end; i++){
            arr[i - start] = i;
        }
        return arr;
    }

    // Function to return greetings. Greetings are returned in ascending order of their timestamps, starting from last element. Returns arrays of ids, greetings, addresses and timestamps.
    function getGreetings(uint256 pageNum, uint256 pageSize) public view returns (uint256[] memory, string[] memory, address[] memory, uint256[] memory) {
        uint256 startIndex = greetings.length - (pageNum * pageSize);
        startIndex = startIndex < 0 ? 0 : startIndex;
        uint256 endIndex = startIndex + pageSize; // Off-by-one (endIndex won't be included)

        // If startIndex and endIndex are such that entire array needs to be returned, then return the arrays from storage. Else, create new arrays, fill it up with correct slice (startIndex, endIndex), then return it.
        if(startIndex == 0 && endIndex == greetings.length){
            return (range(startIndex, endIndex), greetings, greeters, timestamps);
        } else {
            uint256 numOfElementsToReturn = endIndex - startIndex;
            string[] memory greetingsToReturn = new string[](numOfElementsToReturn);
            address[] memory greetersToReturn = new address[](numOfElementsToReturn);
            uint256[] memory timestampsToReturn = new uint256[](numOfElementsToReturn);

            for(uint256 i = startIndex; i < endIndex; i++){
                greetingsToReturn[i - startIndex] = greetings[i];
                greetersToReturn[i - startIndex] = greeters[i];
                timestampsToReturn[i - startIndex] = timestamps[i];
            }

            return (range(startIndex, endIndex), greetingsToReturn, greetersToReturn, timestampsToReturn);
        }
    }
}
