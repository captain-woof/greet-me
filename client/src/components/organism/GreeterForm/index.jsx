import { useCallback, useEffect, useState } from "react";
import swal from '@sweetalert/with-react';
import { useConnect } from "../../../hooks/useConnect";
import Button from "../../atoms/Button";
import "./styles.scss";
import moment from "moment";

export default function GreeterForm() {
    const { signer, signerAddress, greetMeContract } = useConnect(true);
    const [greeting, setGreeting] = useState("");
    const [sending, setSending] = useState(false);
    const [greetingsDisplayed, setGreetingsDisplayed] = useState([]); // [{message, timestamp, address}]
    const [initialGreetingsLoaded, setInitialGreetingsLoaded] = useState(false); // State to track if initial message loading is done

    // Function to handle form submission
    const handleFormSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (!!signer) {
            try {
                setSending(true);
                await greetMeContract.greet(greeting);
                setGreeting("");
                swal({
                    icon: "success",
                    title: "Greeting sent!",
                    content: (
                        <>
                            <p>Thanks! I'll be sure to read it!<br />Let's connect! Follow me on twitter <a href="https://twitter.com/realCaptainWoof">@realCaptainWoof</a>.</p>
                        </>
                    )
                });
            } catch (e) {
                swal({ icon: "error", title: "Error", text: e.message });
            } finally {
                setSending(false);
            }
        }
    }, [signer, setSending, greetMeContract, greeting, setGreeting])

    // Get last 6 messages to display them
    useEffect(async () => {
        if (!!greetMeContract) {
            const [messages, addresses, timestamps] = await greetMeContract.getGreetings(6);

            const greetingsStored = messages.map((message, i) => ({
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
            // Function to add new greeting, and remove the oldest one
            function addNewGreetingToBeDisplayed(newGreeting) {
                setGreetingsDisplayed((prevGreetings) => {
                    const newGreetings = [...prevGreetings.slice(1), newGreeting];
                    return newGreetings;
                });
            }

            greetMeContract.on("Greet", (greeter, greeting, timestamp) => {
                // Construct new message
                const convertedTimestamp = moment.unix(timestamp.toNumber()).format("Do MMM, YYYY / hh:mm a");
                const newGreeting = {
                    message: greeting,
                    timestamp: convertedTimestamp,
                    address: greeter
                };

                // Store new greeting to display it
                if (greetingsDisplayed.length === 0) { // Implies that this is the first greeting
                    addNewGreetingToBeDisplayed(newGreeting);
                } else { // Implies that this is NOT the first greeting
                    const lastMsgStored = greetingsDisplayed[greetingsDisplayed.length - 1];
                    if (!(lastMsgStored.message === greeting && lastMsgStored.timestamp === convertedTimestamp && lastMsgStored.address === greeter)) { // Check if event was fired by existing message. If yes, don't proceed
                        addNewGreetingToBeDisplayed(newGreeting);
                    }
                }
            });
        }
    }, [greetMeContract, initialGreetingsLoaded])

    return (
        <main id="main-container">

            <h1 id="main-container__title">Greet Me 👋</h1>

            {/* Form to send greeting */}
            <form id="main-container__greeter-form" onSubmit={handleFormSubmit}>
                <h2 id="main-container__greeter-form__title">
                    Hey visitor!
                </h2>

                <p id="main-container__greeter-form__description">
                    I'm Sohail. This is my first Web3 project!<br />
                    Send me a hello, and I will store it on the blockchain forever!
                </p>

                <label htmlFor="main-container__greeter-form__greeting" id="main-container__greeter-form__greeting-label">
                    Message
                </label>
                <textarea id="main-container__greeter-form__greeting" value={greeting} onChange={(e) => { setGreeting(e.target.value); }} placeholder="Type your message here..." rows={4} disabled={!signerAddress} />

                <div id="main-container__greeter-form__action-btns-container">
                    <Button type="submit" loading={sending} id="main-container__greeter-form__action-btns-container__send-btn" disabled={!signerAddress || sending}>
                        Send
                    </Button>
                </div>
            </form>

            {!signerAddress &&
                <p id="main-container__not-connected-warning">
                    You must be connected to <b>Rinkeby</b> to send me a message! 🙋
                </p>
            }

            {/* Messages stored */}

        </main>
    )
}