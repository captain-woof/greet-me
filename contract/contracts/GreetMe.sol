// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract GreetMe {
    mapping (address => string) addressToGreeting;
    uint256 numOfMsgs;

    constructor() {
        numOfMsgs = 0;
        console.log("GreetMe ready!");
    }

    function greet(string memory greetingMsg) external {
        addressToGreeting[msg.sender] = greetingMsg;
        numOfMsgs += 1;
    }

    function getNumOfGreetings() public view returns (uint256) {
        return numOfMsgs;
    }

    function getGreetingBySender(address greeter) public view returns (string memory) {
        return addressToGreeting[greeter];
    }
}
