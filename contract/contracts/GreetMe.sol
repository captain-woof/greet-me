// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract GreetMe {
    // Struct to store info about the greetings
    struct Greeting {
        string greeting;
        address greeter;
        uint256 timestamp;
    }

    // Storage
    Greeting[] private greetings; // Greetings stored in contract
    uint8 private seed; // Probability seed
    uint256 private timestampOfLastWinner; // Timestamp when last winner was given ether
    uint256 public amountToWin; // Amount of ether to be given to winners
    uint24 public cooldownPeriod; // Cooldown duration
    uint8 public probabilityOfWinning; // Probability of winning, 0-100
    address owner; // Owner of the contract

    // Events
    event Greet(uint256 indexed id, address indexed greeter, string greeting, uint256 timestamp); // Event fired when new greeting is sent
    event OutOfBalance(); // Event fired when contract has run out of balance
    event CooldownPeriodNotOver(); // Event fired when cooldown period is not yet over
    event Winner(address winnerAddress, uint256 amountWon); // Event if there's a new winner

    // Constructor
    constructor(uint256 _initialSeed, uint256 _amountToWin, uint24 _cooldownPeriod, uint8 _probabilityOfWinning) payable {
        seed = uint8((_initialSeed + block.timestamp + block.difficulty) % 101);
        amountToWin = _amountToWin;
        cooldownPeriod = _cooldownPeriod;
        probabilityOfWinning = _probabilityOfWinning;
        timestampOfLastWinner = block.timestamp;
        owner = msg.sender;
        console.log("[+] GreetMe ready!");
    }

    // Function to store a greeting
    function greet(string memory _greetingMsg) external {
        // Store greeting
        greetings.push(Greeting(_greetingMsg, msg.sender, block.timestamp));
        emit Greet(
            greetings.length - 1,
            msg.sender,
            _greetingMsg,
            block.timestamp
        );

        // Check if user should win some ether
        if (address(this).balance < amountToWin) {
            emit OutOfBalance();
        } else if ((block.timestamp - timestampOfLastWinner) <= cooldownPeriod) {
            emit CooldownPeriodNotOver();
        } else {
            if (seed < probabilityOfWinning) {
                (bool success, ) = (msg.sender).call{value: amountToWin}("");
                if (success) {
                    emit Winner(msg.sender, amountToWin);
                    seed = uint8((block.timestamp + block.difficulty + seed) % 101);
                    timestampOfLastWinner = block.timestamp;
                }
            }
        }
    }

    // Function to get current seed; accessible only by owner
    function getSeed() external view returns (uint8){
        require(msg.sender == owner, "ONLY OWNER CAN SEE THE CURRENT SEED");
        return seed;
    }

    // Function to return number of greetings
    function getNumOfGreetings() public view returns (uint256) {
        return greetings.length;
    }

    // Function to generate a sequence of integers; 'end' is off-by-one.
    function range(uint256 start, uint256 end) internal pure returns (uint256[] memory){
        uint256[] memory arr = new uint256[](end - start);
        for (uint256 i = start; i < end; i++) {
            arr[i - start] = i;
        }
        return arr;
    }

    // Function to return greetings. Greetings are returned in ascending order of their timestamps.
    function getGreetings(uint256 _pageNum, uint256 _pageSize) public view returns (uint256[] memory, Greeting[] memory){
        // Check that pageNum must never be negative
        require(_pageNum >= 0, "pageNum CANNOT BE NEGATIVE!");

        uint256 startIndex; // Start index for results
        uint256 endIndex; // Off-by-one (endIndex won't be included)

        // Check for range and set indices accordingly
        if (greetings.length < _pageNum * _pageSize) {
            require(
                greetings.length > (_pageSize * (_pageNum - 1)),
                "NO MORE GREETINGS TO RETURN!"
            ); // endIndex should not be less than 0, else it is understood that there are no more results for pagination
            startIndex = 0;
            endIndex = greetings.length - (_pageSize * (_pageNum - 1));
        } else {
            startIndex = greetings.length - (_pageNum * _pageSize);
            endIndex = startIndex + _pageSize;
        }

        // If startIndex and endIndex are such that entire array needs to be returned, then return the arraysfrom storage. Else, create new array, fill it up with correct slice (startIndex, endIndex), then return it.
        if (startIndex == 0 && endIndex == greetings.length) {
            return (range(startIndex, endIndex), greetings);
        } else {
            uint256 numOfElementsToReturn = endIndex - startIndex;
            Greeting[] memory greetingsToReturn = new Greeting[](numOfElementsToReturn);
            for (uint256 i = startIndex; i < endIndex; i++) {
                greetingsToReturn[i - startIndex] = greetings[i];
            }
            return (range(startIndex, endIndex), greetingsToReturn);
        }
    }
}
