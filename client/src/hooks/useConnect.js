import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import swal from "sweetalert";
import CONTRACT from "../contract/GreetMe.json";

// Hook to connect wallet
export const useConnect = (connectOnLoad = false) => {
    const [signer, setSigner] = useState(null); // State to track currently selected account in Metamask.
    const [signerAddress, setSignerAddress] = useState(null); // State to hold current signer's address
    const [provider, setProvider] = useState(null); // Provider
    const [loading, setLoading] = useState(false);
    const [greetMeContract, setGreetMeContract] = useState(null); // State to store Smart Contract

    // Function to connect wallet
    const handleConnect = useCallback(async (askPermission = true) => {
        if (!("ethereum" in window)) { // If metamask is not present
            swal({
                title: "Metamask not found!",
                text: "Please install Metamask to continue.",
                icon: "error"
            });
        } else { // If metamask is present
            try {
                setLoading(true);

                // Get current account address
                await window.ethereum.request({ method: askPermission ? "eth_requestAccounts" : "eth_accounts" });

                // Set provider
                const currentProvider = new ethers.providers.Web3Provider(window.ethereum);
                setProvider(currentProvider);

                // Set current account
                const currentSigner = currentProvider.getSigner();
                const currentSignerAddress = await currentSigner.getAddress();
                setSigner(currentSigner);
                setSignerAddress(currentSignerAddress);

                // Set connection to contract
                const contract = new ethers.Contract(import.meta.env.VITE_GREET_ME_CONTRACT_ADDRESS, CONTRACT.abi, currentSigner);
                setGreetMeContract(contract);

                // Show swal
                askPermission && swal({
                    title: "Connected!",
                    icon: "success"
                });
            } catch (e) {
                askPermission && swal({
                    title: "Error in connecting!",
                    text: e?.message || "",
                    icon: "error"
                });
            } finally {
                setLoading(false);
            }
        }
    }, [setLoading])

    // If 'connectOnLoad' is true, show connection prompt
    useEffect(() => {
        if (connectOnLoad) {
            handleConnect(false);
        }
    }, [connectOnLoad])

    // Listen for account changes
    useEffect(() => {
        if ("ethereum" in window) {
            window.ethereum.on("accountsChanged", async (newAccounts) => {
                if (!!newAccounts && newAccounts?.length > 0 && !!provider) {
                    const currentSigner = provider.getSigner();
                    const currentSignerAddress = await currentSigner.getAddress();
                    const contract = new ethers.Contract(import.meta.env.VITE_GREET_ME_CONTRACT_ADDRESS, CONTRACT.abi, currentSigner);
                    setGreetMeContract(contract);
                    setSigner(currentSigner);
                    setSignerAddress(currentSignerAddress);
                } else {
                    setSigner(null);
                    setGreetMeContract(null);
                    setSignerAddress(null);
                }
            });
        }
    }, [provider])

    // Return
    return {
        loading,
        signer,
        setSigner,
        handleConnect,
        signerAddress,
        greetMeContract
    }
}