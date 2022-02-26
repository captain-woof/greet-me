import { useConnect } from "./useConnect";
import moment from "moment";
import swal from '@sweetalert/with-react';
import { useCallback, useEffect, useState } from "react";

const DEFAULT_PAGE_SIZE = 10;

export const useGreeting = (pageSize = DEFAULT_PAGE_SIZE) => {

    const [greetingsDisplayed, setGreetingsDisplayed] = useState([]); // [{message, timestamp, address}]
    const [initialGreetingsLoaded, setInitialGreetingsLoaded] = useState(false); // State to track if initial message loading is done
    const [sending, setSending] = useState(false);
    const { signer, greetMeContract } = useConnect(true);
    const [page, setPage] = useState(2); // Page numbers start from 1, but since first page is already loaded at first render time, store 2 as initial paging index
    const [totalGreetings, setTotalGreetings] = useState(0); // State to store total num of greetings
    const [noMoreGreetingsToLoad, setNoMoreGreetingsToLoad] = useState(false); // Tracks if there are no more greetings to load

    // Function to handle form submission
    const sendGreeting = useCallback(async (greeting) => {
        if (!!signer) {
            try {
                setSending(true);
                const txResp = await greetMeContract.greet(greeting);
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
        if (!!greetMeContract) {
            try {
                const [ids, messages, addresses, timestamps] = await greetMeContract.getGreetings(pageNum, pageSize);
                const greetingObjs = messages.map((message, i) => ({
                    id: ids[i].toNumber(),
                    message: message,
                    timestamp: moment.unix(timestamps[i].toNumber()).format("Do MMM, YYYY / hh:mm a"),
                    address: addresses[i]
                }));
                return greetingObjs.reverse();
            } catch (e) {
                if (import.meta.env.DEV) {
                    if (e?.data?.message === "Error: VM Exception while processing transaction: reverted with reason string 'NO MORE GREETINGS TO RETURN!'") {
                        setNoMoreGreetingsToLoad(true);
                        console.log("No more data to fetch!");
                    } else {
                        console.log(e.message);
                    }
                }
                return [];
            }
        }
        return [];
    }, [greetMeContract])

    // Get and set next page of messages (pagination)
    const loadMoreGreetings = useCallback(async () => {
        if (!noMoreGreetingsToLoad) { // Try to load more only if there are more greetings
            const greetingObjs = await getGreetings(page, pageSize);
            if (greetingObjs.length !== 0) { // If there are greetings stored
                setGreetingsDisplayed((prevGreetings) => [...greetingObjs, ...prevGreetings]);
                setTotalGreetings((prev) => prev + greetingObjs.length);
                setPage((prev) => prev + 1);
            }
        }
    }, [greetMeContract, setGreetingsDisplayed, noMoreGreetingsToLoad])

    // Get and set latest messages to display them (INITIAL)
    useEffect(async () => {
        if (!!greetMeContract) {
            const greetingObjs = await getGreetings(1, pageSize);
            if (greetingObjs.length !== 0) { // If there are greetings stored
                setGreetingsDisplayed(greetingObjs);
                setTotalGreetings(greetingObjs.length);
            }
            setInitialGreetingsLoaded(true);
        }
    }, [greetMeContract])

    // Add new messages when the Greeting event is fired by contract
    useEffect(() => {
        if (!!greetMeContract && initialGreetingsLoaded) {
            greetMeContract.on("Greet", (id, greeter, greeting, timestamp) => {

                // Construct new message
                const newGreeting = {
                    id: id.toNumber(),
                    message: greeting,
                    timestamp: moment.unix(timestamp.toNumber()).format("Do MMM, YYYY / hh:mm a"),
                    address: greeter
                };

                // Store new greeting to display it
                const lastMsgStored = greetingsDisplayed[0];
                if (greetingsDisplayed.length === 0 || lastMsgStored?.id !== newGreeting?.id) { // If the greeting display array is empty, or if greeting is indeed new
                    if (import.meta.env.DEV) {
                        console.log("NEW GREETING", newGreeting);
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
            console.log("Greetings changed", greetingsDisplayed);
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