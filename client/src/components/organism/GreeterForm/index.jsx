import { useCallback, useState } from "react";
import { useConnect } from "../../../hooks/useConnect";
import Button from "../../atoms/Button";
import "./styles.scss";

export default function GreeterForm() {
    const { signer, signerAddress } = useConnect(true);
    const [greeting, setGreeting] = useState("");
    const [sending, setSending] = useState(false);

    // Function to handle form submission
    const handleFormSubmit = useCallback((e) => {
        e.preventDefault();

        if (!!signer) {
            setSending(true);



            setSending(false);
        }
    }, [setGreeting, signer, setSending])

    return (
        <main id="main-container">

            <h1 id="main-container__title">Greet Me 👋</h1>

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
                    You must be connected to send me a message! 🙋
                </p>
            }
        </main>
    )
}