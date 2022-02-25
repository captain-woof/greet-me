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
            "Hi, what's up?",
            "Random message here",
            "Hey buddy",
            "gn",
            "hi, let's talk",
            "how are you doing?",
            "How have you been?",
            "What will you do with these many greetings?"
        ] // Test greetings, 10 in number
        const [, signer] = await hre.ethers.getSigners();
        const connectedContract = await contract.connect(signer);
        await Promise.all(greetingsToSend.map((greeting) => (
            connectedContract.greet(greeting)
        )));

        // Get greetings from contract
        const [ids, greetings, ,] = await connectedContract.getGreetings(1, 10);

        //// Assertions
        // Verify that all greetings were stored
        assert.equal(10, greetings.length, "All messages were not stored!");

        // Verify that pagination works correctly (in-range)
        const [idsPaginated, greetingsPaginated, ,] = await connectedContract.getGreetings(2, 2);
        assert.equal(greetings[6], greetingsPaginated[0], "Pagination does not work correctly for greetings (in-range)!");
        assert.equal(ids[6].toNumber(), idsPaginated[0].toNumber(), "Pagination does not work correctly for ids (in-range)!");

        // Verify that pagination works correctly (out-of-range)
        const [idsPaginated2, greetingsPaginated2, ,] = await connectedContract.getGreetings(3, 4);
        assert.equal(greetings[0], greetingsPaginated2[0], "Pagination does not work correctly for greetings (out-of-range)!");
        assert.equal(ids[0].toNumber(), idsPaginated2[0].toNumber(), "Pagination does not work correctly for ids (out-of-range)!");
    });
})