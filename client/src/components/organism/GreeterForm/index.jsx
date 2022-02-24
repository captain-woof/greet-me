import { useState } from "react";
import { useConnect } from "../../../hooks/useConnect";
import { useGreeting } from "../../../hooks/useGreeting";
import Button from "../../atoms/Button";
import "./styles.scss";
import swal from '@sweetalert/with-react';

export default function GreeterForm() {
    const { signerAddress } = useConnect(true);
    const [greeting, setGreeting] = useState("");
    const { greetingsDisplayed, sendGreeting, sending } = useGreeting();

    return (
        <main id="main-container">

            <h1 id="main-container__title">Greet Me 👋</h1>

            {/* Form to send greeting */}
            <form id="main-container__greeter-form" onSubmit={async (e) => {
                e.preventDefault();
                try {
                    await sendGreeting(greeting);
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
                } catch (e) { /* NO HANDLING NEEDED HERE */}
            }}>
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