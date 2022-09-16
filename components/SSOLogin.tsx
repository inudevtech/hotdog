import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGoogle,
  faTwitter,
  faGithub,
} from "@fortawesome/free-brands-svg-icons";
import { Dispatch, FC, SetStateAction } from "react";
import { login } from "../util/firebase/auth";

const loginComponent: FC<{ setErrMsg: Dispatch<SetStateAction<string>> }> = ({
  setErrMsg,
}) => (
  <>
    <div
      className="login-button"
      onClick={async () => {
        login(1)
          .then(() => window.location.reload())
          .catch(() =>
            setErrMsg(
              "ログインできませんでした。\n既に使用されているメールアドレスで登録をしようとしている可能性があります。"
            )
          );
      }}
      aria-hidden
    >
      <FontAwesomeIcon icon={faGoogle} size="xl" />
      <p>Login with Google</p>
    </div>
    { // TODO: Twitterを本番環境に対応させる
    /* <div
      className="login-button"
      onClick={async () => {
        login(2)
          .then(() => window.location.reload())
          .catch(() =>
            setErrMsg(
              "ログインできませんでした。\nしばらくしてから再度お試しください。"
            )
          );
      }}
      aria-hidden
    >
      <FontAwesomeIcon icon={faTwitter} size="xl" />
      <p>Login with Twitter</p>
    </div> */}
    <div
      className="login-button"
      onClick={async () => {
        login(3)
          .then(() => window.location.reload())
          .catch(() =>
            setErrMsg(
              "ログインできませんでした。\n既に使用されているメールアドレスで登録をしようとしている可能性があります。"
            )
          );
      }}
      aria-hidden
    >
      <FontAwesomeIcon icon={faGithub} size="xl" />
      <p>Login with Github</p>
    </div>
  </>
);

export default loginComponent;
