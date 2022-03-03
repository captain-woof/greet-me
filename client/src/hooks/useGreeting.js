import { useConnect } from "./useConnect";
import moment from "moment";
import swal from '@sweetalert/with-react';
import { useCallback, useEffect, useState } from "react";

const DEFAULT_PAGE_SIZE = 10;

export const useGreeting = (pageSize = DEFAULT_PAGE_SIZE) => {

    const [greetingsDisplayed, setGreetingsDisplayed] = useState([]); // [{id, greeting, greeter, timestamp}]
    const [initialGreetingsLoaded, setInitialGreetingsLoaded] = useState(false); // State to track if initial message loading is done
    const [sending, setSending] = useState(false);
    const { signer, greetMeContract, greetMeContractReadOnly } = useConnect(true);
    const [page, setPage] = useState(2); // Page numbers start from 1, but since first page is already loaded at first render time, store 2 as initial paging index
    const [totalGreetings, setTotalGreetings] = useState(0); // State to store total num of greetings
    const [noMoreGreetingsToLoad, setNoMoreGreetingsToLoad] = useState(false); // Tracks if there are no more greetings to load

    ///////////////
    // FUNCTIONS //
    ///////////////

    // Function to handle form submission
    const sendGreeting = useCallback(async (greetingMsg) => {
        if (!!signer) {
            try {
                setSending(true);
                const txResp = await greetMeContract.greet(greetingMsg);
                const txReceipt = await txResp.wait();
                if (txReceipt.confirmations === 0) { // Transaction was not included on Block
                    throw Error("Transaction was not included on Block");
                }
            } catch (e) {
                swal({ icon: "error", title: "Error", text: e.message });
                throw Error(e.message);
            } finally {
                setSending(false);
            }
        }
    }, [signer, setSending, greetMeContract])

    // Internal function to get paginated greeting
    const getGreetings = useCallback(async (pageNum, pageSize = pageSize) => {
        if (!!greetMeContractReadOnly) {
            try {
                const [ids, greetings] = await greetMeContractReadOnly.getGreetings(pageNum, pageSize);
                const greetingObjs = greetings.map(({ greeting, greeter, timestamp }, i) => ({
                    id: ids[i].toNumber(),
                    greeting,
                    timestamp: moment.unix(timestamp.toNumber()).format("Do MMM, YYYY / hh:mm a"),
                    greeter
                }));
                return greetingObjs.reverse();
            } catch (e) {
                if (e?.data?.message !== "Error: VM Exception while processing transaction: reverted with reason string 'NO MORE GREETINGS TO RETURN!'" && import.meta.env.DEV) {
                    console.log(e.message);
                }
                return [];
            }
        }
        return [];
    }, [greetMeContractReadOnly, totalGreetings])

    // Get and set next page of messages (pagination)
    const loadMoreGreetings = useCallback(async () => {
        if (!noMoreGreetingsToLoad && initialGreetingsLoaded) { // Try to load more only if there are more greetings and initial greetings have been loaded
            const greetingObjs = await getGreetings(page, pageSize);
            if (greetingObjs.length !== 0) { // If there are greetings stored
                setNoMoreGreetingsToLoad(greetingsDisplayed.length + greetingObjs.length === totalGreetings);
                setGreetingsDisplayed((prevGreetings) => [...prevGreetings, ...greetingObjs]);
                setPage((prev) => prev + 1);
            }
        }
    }, [setGreetingsDisplayed, noMoreGreetingsToLoad, page, setPage, initialGreetingsLoaded, greetingsDisplayed, totalGreetings])

    /////////////
    // EFFECTS //
    /////////////

    // Get and set latest messages to display them (INITIAL), and also set total number of messages
    useEffect(async () => {
        if (!!greetMeContractReadOnly) {
            const greetingObjs = await getGreetings(1, pageSize);
            let totalGreetingsStored = await greetMeContractReadOnly.getNumOfGreetings();
            totalGreetingsStored = totalGreetingsStored.toNumber();
            if (greetingObjs.length !== 0) { // If there are greetings stored
                setGreetingsDisplayed(greetingObjs);
                setTotalGreetings(totalGreetingsStored);
            }
            if (greetingObjs.length === totalGreetingsStored) {
                setNoMoreGreetingsToLoad(true);
            }
            setInitialGreetingsLoaded(true);
        }
    }, [greetMeContractReadOnly])

    // Add new messages when the Greeting event is fired by contract
    useEffect(() => {
        if (!!greetMeContract && initialGreetingsLoaded) {
            greetMeContract.on("Greet", (id, greeter, greeting, timestamp) => {

                // Construct new message
                const newGreeting = {
                    id: id.toNumber(),
                    greeting,
                    timestamp: moment.unix(timestamp.toNumber()).format("Do MMM, YYYY / hh:mm a"),
                    greeter
                };

                // Store new greeting to display it
                const lastMsgStored = greetingsDisplayed[0];
                if (greetingsDisplayed.length === 0 || lastMsgStored?.id !== newGreeting?.id) { // If the greeting display array is empty, or if greeting is indeed new
                    if (import.meta.env.DEV) {
                        console.log("[+] NEW GREETING EVENT:", newGreeting);
                    }
                    // Add new greeting to display arr
                    setGreetingsDisplayed((prevGreetings) => {
                        let newGreetings = [newGreeting, ...prevGreetings]; // Adding the new greeting to the front of the array
                        return newGreetings;
                    });
                    setTotalGreetings((prev) => prev + 1);
                }
            });
            return () => greetMeContract.removeAllListeners("Greet");
        }
    }, [greetMeContract, initialGreetingsLoaded])

    // LOG WHENEVER GREETINGS CHANGE
    useEffect(() => {
        if (import.meta.env.DEV) {
            console.log("[+] GREETINGS CHANGED:", greetingsDisplayed);
        }
    }, [greetingsDisplayed])

    return {
        sendGreeting,
        sending,
        greetingsDisplayed,
        loadMoreGreetings,
        noMoreGreetingsToLoad,
        totalGreetings
    }
}