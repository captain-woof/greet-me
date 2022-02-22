import "./styles.scss";
import cx from "classnames";
import { BiLoaderAlt as LoadingIcon } from "react-icons/bi";

export default function Button(props) {
    return (
        <button {...props} loading={null} className={cx("button", props?.className)}>
            {props?.children}
            {props?.loading && <LoadingIcon className="button__loading-icon" />}
        </button>
    )
}