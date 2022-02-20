const main = async () => {
    // Deploy contract
    const contractFactory = await hre.ethers.getContractFactory("GreetMe");
    const contract = await contractFactory.deploy();
    await contract.deployed();
    console.log("Contract deployed to:", contract.address);

    // Send greeting, and test if it got stored
    const [me, greeter] = await hre.ethers.getSigners();
    const contractConnectedWithGreeter = await contract.connect(greeter);
    await contractConnectedWithGreeter.greet("Hey there, it's me!");
    console.log(`Greeter (${greeter.address}) sent greeting!`);

    const greetingSent = await contractConnectedWithGreeter.getGreetingBySender(greeter.address);
    console.log(`Greeting stored from greeter: ${greetingSent}`);
};

const runMain = async () => {
    try {
        await main();
        process.exit(0); // exit Node process without error
    } catch (error) {
        console.log(error);
        process.exit(1); // exit Node process while indicating 'Uncaught Fatal Exception' error
    }
    // Read more about Node exit ('process.exit(num)') status codes here: https://stackoverflow.com/a/47163396/7974948
};

runMain();