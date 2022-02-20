const deploy = async () => {
    try {
        // Get deployer's (me) address and log balance
        const [deployer] = await hre.ethers.getSigners();
        let deployerBalance = await deployer.getBalance();
        console.log(`Deployer (${deployer.address}) has balance of ${deployerBalance}`);

        // Deploy
        const contractFactory = await hre.ethers.getContractFactory("GreetMe");
        const contract = await contractFactory.deploy();
        await contract.deployed();

        // Log to console
        deployerBalance = await deployer.getBalance();
        console.log(`Deployer deployed GreetMe to ${contract.address}`);
        console.log(`Deployer's balance left: ${deployerBalance}`);

        // Exit
        process.exit(0);
    } catch (e) {
        console.log("Encountered exception", e);
        process.exit(1);
    }
}

deploy();