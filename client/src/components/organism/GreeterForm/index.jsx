import { useEffect, useState } from "react";
import { useConnect } from "../../../hooks/useConnect";
import { useGreeting } from "../../../hooks/useGreeting";
import Button from "../../atoms/Button";
import "./styles.scss";
import swal from '@sweetalert/with-react';
import { motion } from "framer-motion";
import { useInView } from 'react-intersection-observer';

export default function GreeterForm() {
    const { signerAddress } = useConnect(true);
    const [greeting, setGreeting] = useState("");
    const { greetingsDisplayed, sendGreeting, sending, loadMoreGreetings, noMoreGreetingsToLoad, totalGreetings } = useGreeting(3);
    const { ref: sentinelRef, inView: sentinelInView } = useInView();

    // Trigger fetching next page of messages when sentinel is in view
    useEffect(() => {
        if (sentinelInView) {
            loadMoreGreetings();
        }
    }, [sentinelInView])

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
                } catch (e) { /* NO HANDLING NEEDED HERE */ }
            }}>
                <h2 id="main-container__greeter-form__title">
                    Hey visitor!
                </h2>

                <p id="main-container__greeter-form__description">
                    I'm <a href="https://twitter.com/realCaptainWoof" target="_blank">Sohail</a>. This is my first Web3 project!<br />
                    Send me a hello, and I will store it on the blockchain forever!<br /><br />
                    Also, <b>stand a chance to win some ether</b> if you send me a greeting! 😏
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
            {greetingsDisplayed.length !== 0 &&
                <>
                    {/* Message num stats */}
                    <h2 id="main-container__greetings-stat">
                        {totalGreetings === 0 ?
                            "No greetings yet! Be the first to greet me!" :
                            `Received ${totalGreetings} messages so far!`
                        }
                    </h2>

                    {/* Message cards */}
                    <motion.section id="main-container__greetings" initial="initial" animate="animate" variants={greetingCardContainerVariants}>
                        {greetingsDisplayed.map(({ id, greeting, timestamp, greeter }) => (
                            <motion.article className="main-container__greetings__greeting-card" key={id} layout layoutId={id} variants={greetingCardVariants}>
                                <h1 className="main-container__greetings__greeting-card__address">
                                    {`${greeter.slice(0, 8)}...${greeter.slice(greeter.length - 3)}`}
                                </h1>
                                <p className="main-container__greetings__greeting-card__message">
                                    {greeting}
                                </p>
                                <p className="main-container__greetings__greeting-card__timestamp">
                                    {timestamp}
                                </p>
                            </motion.article>
                        ))}
                        <div id="main-container__greetings__sentinel" ref={sentinelRef}>
                            {noMoreGreetingsToLoad ?
                                "No more greetings 🥺" :
                                "Loading more 💬"
                            }
                        </div>
                    </motion.section>
                </>
            }

        </main>
    )
}

// Animation variants
const greetingCardContainerVariants = {
    animate: {
        transition: {
            staggerChildren: 0.2
        }
    }
}

const greetingCardVariants = {
    initial: {
        x: "-60%",
        opacity: 0
    },
    animate: {
        x: "0%",
        opacity: 1,
        transition: {
            duration: 0.8
        }
    }
}
