const { assert } = require("chai");

describe("GreetMe should store and return all greetings correctly", () => {
    let contract = null;

    // Deploys contract before running anything else
    before(async () => {
        const contractFactory = await hre.ethers.getContractFactory("GreetMe");
        contract = await contractFactory.deploy();
    })

    // Contract should deploy
    it("Contract should deploy", async () => {
        assert.isNotNull(contract.address, "Contract could not be deployed.");
    });

    // Contract should store and return greetings correctly
    it("Contract should store and return greetings correctly", async () => {
        // Send greetings
        const greetingsToSend = [
            "Hi there buddy",
            "gm",
            "Hi, what's up?"
        ]
        const greeters = (await hre.ethers.getSigners()).slice(1, 1 + greetingsToSend.length);
        const contractConnWithGreeters = await Promise.all(greeters.map((greeter) => (
            contract.connect(greeter)
        )));
        await Promise.all(contractConnWithGreeters.map((contractConnWithGreeter, index) => (
            contractConnWithGreeter.greet(greetingsToSend[index])
        )));

        // Test correctness of stored data
        const numOfMessagesStored = await contract.getNumOfGreetings();
        assert.equal(numOfMessagesStored, greetingsToSend.length, "Incorrect number of messages stored");

        const [greetingsStored, greetersStored] = await contract.getGreetings(2);
        greetersStored.forEach((greeterStoredAddress, indexStored) => {
            let greeterIndex = -1;
            greeters.forEach((greeter, index) => {
                if(greeter.address === greeterStoredAddress){
                    greeterIndex = index;
                }
            });
            assert.isAbove(greeterIndex, -1, "Greeter's address was not stored correctly!");
            assert.equal(greetingsStored[indexStored], greetingsToSend[greeterIndex], "Invalid message was stored!");
        });
    });
})