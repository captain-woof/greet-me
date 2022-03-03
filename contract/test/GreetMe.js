const { assert } = require("chai");

// Function that resolves only after n seconds
const wait = (secsToWait = 5) => {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, secsToWait * 1000);
    })
}

// Function to get random seed
const getRandomSeed = () => (parseInt(Math.random() * 100));

describe("GreetMe should store and return all greetings correctly", () => {
    let contract = null;
    const winningPrize = "0.001";
    const cooldownPeriod = 1;
    const probabilityPercetage = 99;
    const initialSeed = getRandomSeed();
    const contractFundAmount = 0.1;

    // Deploys contract before running anything else
    before(async () => {
        const contractFactory = await hre.ethers.getContractFactory("GreetMe");
        contract = await contractFactory.deploy(
            initialSeed, // Random seed
            hre.ethers.utils.parseEther(winningPrize), // Winning price
            cooldownPeriod, // Cooldown period
            probabilityPercetage, // Probability percentage of winning,
            {
                value: hre.ethers.utils.parseEther(contractFundAmount.toString())
            }
        )
        const currentSeed = await contract.getSeed();
        console.log(`[+] Current seed: ${currentSeed}`);
        
        // Set event listeners
        contract.on("OutOfBalance", () => {
            console.log("[!] CONTRACT OUT OF BALANCE!");
        });
        contract.on("CooldownPeriodNotOver", () => {
            console.log("[!] CONTRACT COOLDOWN PERIOD NOT YET OVER!");
        });
    })

    // Contract should deploy
    it("Contract should deploy", async () => {
        assert.isNotNull(contract.address, "Contract could not be deployed.");
    });

    // Contract should have correct constants and balance
    it("Contract should have correct constants", async () => {
        const winningPrizeContract = await contract.amountToWin();
        const cooldownPeriodContract = await contract.cooldownPeriod();
        const probabilityPercetageContract = await contract.probabilityOfWinning();
        const contractBalance = await hre.ethers.provider.getBalance(contract.address);
        const contractBalanceFormatted = hre.ethers.utils.formatEther(contractBalance);

        assert.equal(hre.ethers.utils.formatEther(winningPrizeContract), winningPrize, "Winning prize was not set correctly in contract!");
        assert.equal(cooldownPeriodContract, cooldownPeriod, "Cooldown period was not set correctly in contract!");
        assert.equal(probabilityPercetageContract, probabilityPercetage, "Probability percentage was not set correctly in contract!");
        assert.equal(contractBalanceFormatted, contractFundAmount.toString(), "Contract was not funded with the chosen amount!");
        console.log(`[+] Contract funded with: ${contractBalanceFormatted} ETH`);
    });

    // Contract should store and return greetings correctly, and award winners
    it("Contract should store and return greetings correctly", async () => {
        // Send greetings
        const greetingsMsgsToSend = [
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

        console.log(`[+] Sending ${greetingsMsgsToSend.length} test greetings:`);
        for await (let greeting of greetingsMsgsToSend) {
            await wait(2);
            await connectedContract.greet(greeting);
            console.log(`"${greeting}"`);
        }

        // Get greetings from contract
        const [ids, greetings] = await connectedContract.getGreetings(1, 10);

        //// Assertions
        // Verify that all greetings were stored
        assert.equal(greetingsMsgsToSend.length, greetings.length, "Some/all messages were not stored!");

        // Verify that pagination works correctly (in-range)
        const [idsPaginated, greetingsPaginated] = await connectedContract.getGreetings(2, 2);
        assert.equal(greetings[6].greeting, greetingsPaginated[0].greeting, "Pagination does not work correctly for greetings (in-range)!");
        assert.equal(ids[6].toNumber(), idsPaginated[0].toNumber(), "Pagination does not work correctly for ids (in-range)!");

        // Verify that pagination works correctly (out-of-range)
        const [idsPaginated2, greetingsPaginated2] = await connectedContract.getGreetings(3, 4);
        assert.equal(greetings[0].greeting, greetingsPaginated2[0].greeting, "Pagination does not work correctly for greetings (out-of-range)!");
        assert.equal(ids[0].toNumber(), idsPaginated2[0].toNumber(), "Pagination does not work correctly for ids (out-of-range)!");
    });

    // Contract should have rewarded at least one winner
    after("Contract should have rewarded at least one winner", async () => {
        const currentContractBalance = await hre.ethers.provider.getBalance(contract.address);
        const currentContractBalanceFormatted = hre.ethers.utils.formatEther(currentContractBalance);
        const currentSeed = await contract.getSeed();
        console.log(`[+] Current seed: ${currentSeed}`);
        console.log(`[+] Remaining contract balance: ${currentContractBalanceFormatted} ETH`);
        assert.isBelow(parseFloat(currentContractBalanceFormatted), contractFundAmount, "No winners were awarded!");
    });
})