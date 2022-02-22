import Button from "../../atoms/Button";
import "./styles.scss";
import { useConnect } from "../../../hooks/useConnect";

export default function Header() {

    const { handleConnect, loading, signerAddress } = useConnect(true);

    return (
        <header id="main-header">
            <h2 id="main-header__sitename">Greet Me</h2>
            <Button id="main-header__connect-btn" onClick={handleConnect} loading={loading}>
                {!signerAddress ? (loading ? "Connecting" : "Connect") : `Connected: ${signerAddress?.slice(0, 6)}...`}
            </Button>
        </header>
    )
}