import { useConnect } from "./useConnect";
import moment from "moment";
import swal from '@sweetalert/with-react';
import { useCallback, useEffect, useState } from "react";

export const useGreeting = (maxGreetingsDisplayedLimit = 10) => {

    const [greetingsDisplayed, setGreetingsDisplayed] = useState([]); // [{message, timestamp, address}]
    const [initialGreetingsLoaded, setInitialGreetingsLoaded] = useState(false); // State to track if initial message loading is done
    const [sending, setSending] = useState(false);
    const { signer, greetMeContract } = useConnect(true);

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

    // Get last 6 messages to display them
    useEffect(async () => {
        if (!!greetMeContract) {
            const [ids, messages, addresses, timestamps] = await greetMeContract.getGreetings(maxGreetingsDisplayedLimit);
            const greetingsStored = messages.map((message, i) => ({
                id: ids[i].toNumber(),
                message: message,
                timestamp: moment.unix(timestamps[i].toNumber()).format("Do MMM, YYYY / hh:mm a"),
                address: addresses[i]
            }));
            setGreetingsDisplayed(greetingsStored);
            setInitialGreetingsLoaded(true);
        }
    }, [greetMeContract])

    // Add new messages when the Greeting event is fired by contract
    useEffect(() => {
        if (!!greetMeContract && initialGreetingsLoaded) {
            greetMeContract.on("Greet", (id, greeter, greeting, timestamp) => {

                // Construct new message
                const convertedTimestamp = moment.unix(timestamp.toNumber()).format("Do MMM, YYYY / hh:mm a");
                const newGreeting = {
                    id: id.toNumber(),
                    message: greeting,
                    timestamp: convertedTimestamp,
                    address: greeter
                };

                // Store new greeting to display it
                const lastMsgStored = greetingsDisplayed[greetingsDisplayed.length - 1];
                if (greetingsDisplayed.length === 0 || lastMsgStored.id !== newGreeting.id) { // If greeting is indeed new
                    if (import.meta.env.DEV) {
                        console.log("NEW GREETING", newGreeting);
                    }
                    // Add new greeting to display arr
                    setGreetingsDisplayed((prevGreetings) => {
                        let newGreetings = [...prevGreetings.slice(greetingsDisplayed.length === maxGreetingsDisplayedLimit ? 1 : 0), newGreeting]; // If max num of display greetings is shown, add new greeting and remove the oldest one, else just add new one
                        return newGreetings;
                    });
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
        greetingsDisplayed
    }
}