const { ethers } = require("ethers");

const deploy = async () => {
    try {
        // Get deployer's (me) address
        const [deployer] = await hre.ethers.getSigners();

        // Deploy
        const contractFactory = await hre.ethers.getContractFactory("GreetMe");
        const contract = await contractFactory.deploy();

        // Log to console
        const deployerBalance = await deployer.getBalance();
        console.log(`Deployer deployed GreetMe to ${contract.address}`);
        console.log(`Deployer's balance left: ${ethers.utils.formatEther(deployerBalance)} ETH`);
    } catch (e) {
        console.log("Encountered exception", e);
    }
}

deploy();