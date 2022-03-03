const deploy = async () => {
    try {
        // Get deployer's (me) address
        const [deployer] = await hre.ethers.getSigners();

        // Deploy
        const contractFactory = await hre.ethers.getContractFactory("GreetMe");
        const contract = await contractFactory.deploy(
            parseInt(Math.random() * 500000), // Random seed
            hre.ethers.utils.parseEther("0.001"), // Winning price, 0.001 ether
            60 * 60, // Cooldown period, 15 minutes
            20, // Probability percentage of winning, 20%
            {
                value: hre.ethers.utils.parseEther("0.1") // Fund contract with 0.1 ether
            }
        );

        // Log to console
        const deployerBalance = await deployer.getBalance();
        console.log(`[+] Deployer: ${deployer.address}`);
        console.log(`[+] Deployed GreetMe to: ${contract.address}`);
        console.log(`[+] Deployer's balance left: ${hre.ethers.utils.formatEther(deployerBalance)} ETH`);
    } catch (e) {
        console.log("Encountered exception", e);
    }
}

deploy();